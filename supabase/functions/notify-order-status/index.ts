// Admin panel calls this when the operator clicks the "Send" (Telegram)
// icon next to an order. It looks up the customer's linked Telegram chat
// and sends them a message about their order's current status.
//
// Every account on this site was created *through* the Telegram
// share-contact flow (that's the only signup method), so the account's own
// phone number (auth.users.phone) is always already in telegram_links --
// we don't need to rely on whatever phone number happened to be typed into
// the checkout delivery form (that could be a different contact number, or
// missing entirely for older orders). We try the account phone first and
// only fall back to the shipping address phone for guest checkouts.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { orderId } = await req.json();
    if (!orderId) return json({ error: 'Missing orderId' }, 400);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: order, error: orderErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) return json({ error: 'Order not found' }, 404);

    // Prefer the verified account phone number over the checkout form's
    // (possibly different) delivery contact phone.
    let phone: string | undefined;
    if (order.user_id) {
      const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(order.user_id);
      phone = userRes?.user?.phone ? `+${userRes.user.phone.replace(/\D/g, '')}` : undefined;
    }
    if (!phone) phone = order.shipping_address?.phone;
    if (!phone) return json({ error: 'This order has no phone number on file.' }, 400);

    // Match on the last 9 digits (local subscriber number) so formatting
    // differences (+998 vs 998, spaces, etc.) don't block the match.
    const last9 = phone.replace(/\D/g, '').slice(-9);
    const { data: link } = await supabaseAdmin
      .from('telegram_links')
      .select('chat_id')
      .like('phone', `%${last9}`)
      .maybeSingle();

    if (!link?.chat_id) {
      return json({ error: "This customer hasn't linked Telegram yet, so we can't message them." }, 404);
    }

    const itemsLines = (order.items || [])
      .map((i: { name: string; quantity: number }) => `• ${i.name} ×${i.quantity}`)
      .join('\n');

    const text = [
      `📦 *Order ${order.id}*`,
      '',
      `Status: *${order.status}*`,
      itemsLines ? `\n${itemsLines}` : '',
      `\nTotal: *$${Number(order.total ?? 0).toLocaleString('en-US')}*`,
      '\nThank you for shopping with SAYWAY!',
    ].filter(Boolean).join('\n');

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: link.chat_id, text, parse_mode: 'Markdown' }),
    });
    const tgData = await tgRes.json();
    if (!tgData.ok) return json({ error: tgData.description || 'Telegram send failed' }, 500);

    return json({ success: true });
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
