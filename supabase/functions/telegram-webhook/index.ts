// Telegram calls this whenever someone messages the bot.
//
// Flow:
// 1a. User opens t.me/<bot>?start=<sessionId> from the website (mid-signup)
//     -> Telegram sends "/start <sessionId>". We link this chat to that
//     pending signup and ask them to share their phone number.
// 1b. User opens the bot directly / presses plain "/start" (e.g. ahead of
//     time, before ever visiting the website -- useful for a future
//     Telegram Mini App) -> we still ask them to share their phone number,
//     just without a specific pending signup attached yet.
// 2. User taps "Share My Phone Number" -> Telegram sends a message with a
//    `contact` payload containing their account's real phone number.
//    - If it matches an in-progress website signup for this chat, we
//      verify it, generate the code, and send it.
//    - Either way, we save phone <-> chat_id in telegram_links, so future
//      sign-ins (or a Mini App) can find this chat straight away.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

const shareContactKeyboard = {
  reply_markup: {
    keyboard: [[{ text: '📱 Share My Phone Number', request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  },
};

Deno.serve(async (req) => {
  try {
    const update = await req.json();
    const message = update?.message;
    const chatId = message?.chat?.id;
    if (!chatId) return new Response('ok');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const text: string | undefined = message?.text;
    const startWithSession = text?.match(/^\/start\s+([0-9a-fA-F-]{36})/);
    const isPlainStart = text?.trim() === '/start';

    // ---- Case 1a: deep link opened from the website mid-signup ----
    if (startWithSession) {
      const sessionId = startWithSession[1];
      const { data: pending } = await supabaseAdmin
        .from('pending_signups')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!pending) {
        await sendMessage(chatId, 'This verification link is invalid or has expired. Please try again in the app.');
        return new Response('ok');
      }

      await supabaseAdmin
        .from('pending_signups')
        .update({ telegram_chat_id: chatId })
        .eq('id', sessionId);

      await sendMessage(
        chatId,
        `Hi ${pending.full_name || ''}! To verify this is really your number, please share your phone number using the button below.`,
        shareContactKeyboard
      );
      return new Response('ok');
    }

    // ---- Case 1b: plain "Start" pressed directly in the bot ----
    if (isPlainStart) {
      await sendMessage(
        chatId,
        "Welcome to SAYWAY! Share your phone number now and you'll be able to sign in instantly on the website (or a future Telegram mini app) without coming back here.",
        shareContactKeyboard
      );
      return new Response('ok');
    }

    // ---- Case 2: user tapped "Share My Phone Number" ----
    const contact = message?.contact;
    if (contact?.phone_number) {
      const normalize = (p: string) => p.replace(/\D/g, '').slice(-9); // compare local subscriber number
      const sharedPhone = `+${contact.phone_number.replace(/\D/g, '')}`;

      // Is there an in-progress website signup waiting on this exact chat?
      const { data: pending } = await supabaseAdmin
        .from('pending_signups')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .is('code', null)
        .eq('verified', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (pending) {
        if (normalize(contact.phone_number) !== normalize(pending.phone)) {
          await sendMessage(
            chatId,
            "This Telegram account's phone number doesn't match the number you entered on the website. Please open the bot from the Telegram account registered to that number.",
            { reply_markup: { remove_keyboard: true } }
          );
          return new Response('ok');
        }

        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await supabaseAdmin
          .from('pending_signups')
          .update({ code, expires_at: expiresAt })
          .eq('id', pending.id);

        await supabaseAdmin
          .from('telegram_links')
          .upsert({ phone: pending.phone, chat_id: chatId, full_name: pending.full_name });

        await sendMessage(
          chatId,
          `Verified! Your code is:\n\n*${code}*\n\nEnter it in the app to finish. It expires in 5 minutes.`,
          { reply_markup: { remove_keyboard: true } }
        );
        return new Response('ok');
      }

      // No pending website session -- this is a pre-link (plain Start, or a
      // future Mini App flow). Just remember the phone <-> chat mapping so
      // the website can find it immediately once they enter this number.
      await supabaseAdmin
        .from('telegram_links')
        .upsert({ phone: sharedPhone, chat_id: chatId });

      await sendMessage(
        chatId,
        `You're all set! ${sharedPhone} is now linked to this chat -- enter that number on the SAYWAY website and your sign-in code will come straight here.`,
        { reply_markup: { remove_keyboard: true } }
      );
      return new Response('ok');
    }

    // ---- Anything else ----
    await sendMessage(chatId, 'Press Start and share your phone number to link your Telegram account.');
    return new Response('ok');
  } catch (e) {
    console.error(e);
    return new Response('ok'); // Always 200 so Telegram doesn't retry forever
  }
});

async function sendMessage(chatId: number, text: string, extra: Record<string, unknown> = {}) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown', ...extra }),
  });
}
