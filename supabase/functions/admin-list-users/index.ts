// Returns every registered user (email, phone, full name, ban status) for
// the Admin panel's Customers tab. Uses the service role key server-side
// only -- the browser never sees it.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (error) return json({ error: error.message }, 500);

    const users = data.users.map((u) => ({
      id: u.id,
      email: u.email || null,
      phone: u.phone ? `+${u.phone}` : null,
      full_name: (u.user_metadata?.full_name as string) || null,
      created_at: u.created_at,
      banned: !!u.banned_until && new Date(u.banned_until) > new Date(),
    }));

    return json({ users });
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
