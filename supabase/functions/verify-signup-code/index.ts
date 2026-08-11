// Step 3 of signup: user typed the code they received from the Telegram
// bot back into the app. We check it, then create (or sign back into) a
// real Supabase Auth user for their phone number, with a one-time random
// password that the frontend immediately uses to establish a session.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { sessionId, code } = await req.json();
    if (!sessionId || !code) return json({ error: 'Missing sessionId or code' }, 400);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: pending, error } = await supabaseAdmin
      .from('pending_signups')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !pending) return json({ error: 'Signup session not found. Please start again.' }, 404);
    if (pending.verified) return json({ error: 'This code was already used. Please sign in.' }, 400);
    if (!pending.code) return json({ error: 'No code sent yet. Open the Telegram bot link first.' }, 400);
    if (pending.expires_at && new Date(pending.expires_at) < new Date()) {
      return json({ error: 'Code expired. Please start signup again.' }, 400);
    }
    if (String(code).trim() !== pending.code) {
      return json({ error: 'Incorrect code' }, 400);
    }

    const tempPassword = crypto.randomUUID();
    const phone = pending.phone;

    // Try to create a new user for this phone number.
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      phone,
      password: tempPassword,
      phone_confirm: true,
      user_metadata: { full_name: pending.full_name },
    });

    if (createErr) {
      // Most likely this phone already has an account (returning user).
      // Find it and reset its password to our fresh one-time password.
      const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
      const existing = list?.users?.find((u) => u.phone === phone.replace('+', ''));
      if (listErr || !existing) {
        return json({ error: createErr.message }, 500);
      }
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password: tempPassword,
      });
      if (updateErr) return json({ error: updateErr.message }, 500);
    } else if (created?.user) {
      await supabaseAdmin.from('profiles').upsert({
        id: created.user.id,
        full_name: pending.full_name,
        email: null,
      });
    }

    await supabaseAdmin
      .from('pending_signups')
      .update({ verified: true })
      .eq('id', sessionId);

    return json({ phone, password: tempPassword });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
