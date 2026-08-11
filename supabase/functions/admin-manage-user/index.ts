// Ban / unban / delete a user from the Admin panel. Uses the service role
// key server-side only. NOTE: the Admin panel itself only has a hardcoded
// password gate (not real Supabase Auth), so anyone who discovers this
// function's URL could technically call it -- same trust model already
// used elsewhere in this project's early build. Add a real check (e.g.
// verifying a Supabase Auth admin session) before shipping to production.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, userId } = await req.json();
    if (!action || !userId) return json({ error: 'Missing action or userId' }, 400);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    if (action === 'ban') {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: '876000h' }); // ~100 years
      if (error) return json({ error: error.message }, 500);
    } else if (action === 'unban') {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
      if (error) return json({ error: error.message }, 500);
    } else if (action === 'delete') {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) return json({ error: error.message }, 500);
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
    } else {
      return json({ error: 'Unknown action' }, 400);
    }

    return json({ ok: true });
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
