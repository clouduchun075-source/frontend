-- Once a phone number has been verified via the "Share My Phone Number"
-- button, we remember which Telegram chat it belongs to. Future sign-ins
-- for that same phone number can then have their code sent straight to
-- that chat, without the user needing to open the bot / press Start again.
create table if not exists telegram_links (
  phone text primary key,
  chat_id bigint not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table telegram_links enable row level security;
-- No policies: only Edge Functions (service role key) touch this table.
