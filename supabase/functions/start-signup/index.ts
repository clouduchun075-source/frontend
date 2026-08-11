// Step 1+2 of signup/sign-in: user has entered their name and phone number.
//
// If this phone number was already verified via Telegram before (it's in
// telegram_links), we already know their chat -- so we send the 6-digit
// code straight there immediately and tell the frontend it doesn't need
// to open Telegram at all.
//
// Otherwise, we create a pending_signups row and hand back a Telegram deep
// link (t.me/<bot>?start=<sessionId>) that the frontend opens in a new tab,
// where the user will be asked to share their phone number to verify it.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const BOT_USERNAME = Deno.env.get('TELEGRAM_BOT_USERNAME') || 'saywayuz_bot';
const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { full_name, phone } = await req.json();

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return json({ error: 'Please enter your full name' }, 400);
    }
    const cleanPhone = String(phone || '').replace(/[^\d+]/g, '');
    if (!/^\+?\d{9,15}$/.test(cleanPhone)) {
      return json({ error: 'Please enter a valid phone number' }, 400);
    }
    const normalizedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data, error } = await supabaseAdmin
      .from('pending_signups')
      .insert({ full_name: full_name.trim(), phone: normalizedPhone })
      .select('id')
      .single();

    if (error) return json({ error: error.message }, 500);

    // Already verified this phone via Telegram before? Skip the "open the
    // bot" step entirely and send the code straight to their known chat.
    const { data: link } = await supabaseAdmin
      .from('telegram_links')
      .select('chat_id')
      .eq('phone', normalizedPhone)
      .maybeSingle();

    if (link?.chat_id) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      await supabaseAdmin
        .from('pending_signups')
        .update({ code, expires_at: expiresAt, telegram_chat_id: link.chat_id })
        .eq('id', data.id);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: link.chat_id,
          parse_mode: 'Markdown',
          text: `Your SAYWAY sign-in code is:\n\n*${code}*\n\nEnter it in the app. It expires in 5 minutes.`,
        }),
      });

      return json({ sessionId: data.id, sentDirectly: true });
    }

    return json({
      sessionId: data.id,
      sentDirectly: false,
      botLink: `https://t.me/${BOT_USERNAME}?start=${data.id}`,
    });
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
