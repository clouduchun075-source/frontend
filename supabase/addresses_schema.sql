-- Saved delivery addresses, so returning customers don't have to
-- re-type everything at checkout every time.
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text,
  phone text not null,
  city text not null,
  district text not null,
  neighborhood text not null,
  house_number text not null,
  postal_code text,
  created_at timestamptz not null default now()
);

alter table addresses enable row level security;

-- Each signed-in user can only see and manage their own saved addresses.
-- This works because checkout happens through a real Supabase Auth
-- session (auth.uid() is the signed-in user's id), unlike the
-- Admin panel which has no real session.
create policy "Users manage own addresses" on addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
