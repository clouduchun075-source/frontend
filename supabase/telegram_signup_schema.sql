-- Table used by the Telegram-based signup flow.
-- Only accessed by Edge Functions using the service role key, never
-- directly by the browser/anon key, so RLS stays fully locked down.

create table if not exists pending_signups (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  code text,
  telegram_chat_id bigint,
  verified boolean not null default false,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table pending_signups enable row level security;
-- No policies created on purpose: anon/authenticated roles get zero access.
-- Edge Functions use the service role key, which bypasses RLS entirely.
