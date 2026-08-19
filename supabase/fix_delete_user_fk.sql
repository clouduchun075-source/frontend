-- Fixes: deleting a customer from the Admin panel fails with a 500 error
-- (Postgres foreign key violation) whenever that customer has placed at
-- least one order.
--
-- Root cause: orders.user_id references auth.users(id) with no ON DELETE
-- behavior specified (orders_customers_fix.sql), so it defaults to
-- NO ACTION/RESTRICT. Deleting the auth user then fails because their
-- orders still point at them.
--
-- Fix: switch to ON DELETE SET NULL so past orders are kept (for
-- accounting/order-history purposes) but their user_id is cleared once the
-- account is deleted, instead of blocking the deletion entirely.

alter table orders drop constraint if exists orders_user_id_fkey;
alter table orders add constraint orders_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete set null;
