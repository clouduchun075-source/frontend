-- Storage bucket for product photos uploaded from the Admin panel.
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Anyone can view product photos (they're shown on the public storefront).
drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

-- NOTE: same temporary trust model as the rest of the Admin panel (see
-- schema.sql) -- Admin has no real Supabase Auth session yet, only a
-- hardcoded password gate, so uploads/deletes are left open on the anon
-- key for now. Tighten this once Admin has real auth.
drop policy if exists "Public upload product images" on storage.objects;
create policy "Public upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images');

drop policy if exists "Public update product images" on storage.objects;
create policy "Public update product images" on storage.objects
  for update using (bucket_id = 'product-images');

drop policy if exists "Public delete product images" on storage.objects;
create policy "Public delete product images" on storage.objects
  for delete using (bucket_id = 'product-images');
