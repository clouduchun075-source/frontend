-- Links real checkout orders to the signed-in user, and lets the Admin
-- panel see every registered account (not just ones who've ordered).

alter table orders add column if not exists user_id uuid references auth.users(id);

-- Admin's "Customers" tab needs to read every profile. Admin itself has no
-- real Supabase Auth session (it's a hardcoded password gate), so it reads
-- via the anon key -- matching the same "temporarily open" pattern already
-- used on products/orders/transactions in schema.sql. Tighten this once
-- Admin has real Supabase Auth.
drop policy if exists "Public read profiles" on profiles;
create policy "Public read profiles" on profiles
  for select using (true);
