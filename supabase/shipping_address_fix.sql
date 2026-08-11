-- Stores full delivery details collected at checkout, so Admin can see
-- exactly who to hand the order to a courier/operator for.
alter table orders add column if not exists shipping_address jsonb;

-- Shape of shipping_address (documented here, not enforced -- keeps it
-- flexible to extend later without another migration):
-- {
--   "first_name": "...",
--   "last_name": "...",
--   "phone": "...",          -- extra contact number, separate from the account phone
--   "city": "...",
--   "district": "...",       -- tuman
--   "neighborhood": "...",   -- mahalla
--   "house_number": "...",   -- uy raqami / to'liq manzil
--   "postal_code": "..."
-- }
