-- SAYWAY database schema for Supabase (Postgres)
-- Run this once in Supabase Dashboard -> SQL Editor -> New query -> Run

-- ==================== PRODUCTS ====================
create table if not exists products (
  id text primary key,
  name text not null,
  price numeric not null default 0,
  price_label text,
  category text,
  brand text,
  color text,
  size text[] default '{}',
  tag text,
  subtitle text,
  image text,
  description text,
  material text,
  weight text,
  stock int not null default 0,
  images text[] default '{}',
  discount numeric,
  rating numeric,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Anyone (including anonymous visitors) can read products
create policy "Public read products" on products
  for select using (true);

-- NOTE: this allows anyone with the anon key to write products too.
-- The app's Admin page only has a hardcoded password check (not real
-- Supabase auth), so we temporarily allow anon write access. Tighten
-- this once real Supabase Auth is wired into the Admin page.
create policy "Public write products" on products
  for insert with check (true);
create policy "Public update products" on products
  for update using (true);
create policy "Public delete products" on products
  for delete using (true);

-- ==================== ORDERS ====================
create table if not exists orders (
  id text primary key,
  customer_name text,
  customer_email text,
  items jsonb not null default '[]',
  total numeric not null default 0,
  status text not null default 'PENDING',
  payment_method text,
  created_at timestamptz not null default now()
);

alter table orders enable row level security;

create policy "Public read orders" on orders
  for select using (true);
create policy "Public write orders" on orders
  for insert with check (true);
create policy "Public update orders" on orders
  for update using (true);

-- ==================== TRANSACTIONS ====================
create table if not exists transactions (
  id text primary key,
  type text not null,
  amount numeric not null default 0,
  description text,
  category text,
  created_at timestamptz not null default now()
);

alter table transactions enable row level security;

create policy "Public read transactions" on transactions
  for select using (true);
create policy "Public write transactions" on transactions
  for insert with check (true);

-- ==================== SEED DATA ====================
-- Starter catalog so the storefront isn't empty on first load.
insert into products (id,name,price,category,brand,color,size,tag,subtitle,image,description,material,weight,stock,discount,rating) values
('c1','Structural Wool Coat',1250,'Outerwear','SAYWAY BLACK LABEL','black',array['S','M','L'],'NEW ARRIVAL','Carbon Black','https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=600','Crafted from premium architectural-grade wool.','100% Virgin Wool','680 GSM',15,null,4.8),
('c2','Architectural Knit',890,'Knitwear','SAYWAY CORE','white',array['M','L','XL'],null,'Bone White','https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600','A structural knit piece.','80% Merino Wool, 20% Cashmere','420 GSM',0,null,4.2),
('c3','Pleated Trousers',540,'Outerwear','SAYWAY BLACK LABEL','lightgray',array['XS','S','M'],null,'Slate Gray','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600','Precision-cut pleated trousers.','97% Organic Cotton, 3% Elastane','320 GSM',25,20,4.5),
('c4','Technical Shell',920,'Outerwear','SAYWAY BLACK LABEL','darkgray',array['S','M','XL'],'LIMITED EDITION','Midnight','https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600','High-performance technical shell jacket.','100% Nylon Ripstop','280 GSM',8,15,4.9),
('c5','Essential Heavyweight Tee',180,'Accessories','SAYWAY CORE','white',array['XS','S','M','L','XL'],null,'Optic White','https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600','The foundation of any premium wardrobe.','100% Organic Cotton','300 GSM',100,null,4.6),
('c6','Minimalist Leather Tote',2100,'Accessories','SAYWAY BLACK LABEL','black',array['M'],null,'Matte Black','https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600','Handcrafted from Italian full-grain leather.','Full-Grain Italian Leather','N/A',5,null,5.0),
('c7','Monolith Blazer',680,'Outerwear','SAYWAY BLACK LABEL','black',array['S','M','L'],null,'Onyx Black','https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600','A structured blazer with architectural shoulders.','95% Wool, 5% Elastane','380 GSM',0,10,4.4),
('c8','Premium Oversize Hoodie',120,'Knitwear','SAYWAY CORE','black',array['XS','S','M','L','XL','XXL'],'NEW ARRIVAL','Carbon Black','https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600','Crafted from architectural-grade heavyweight cotton.','100% Organic Cotton','450 GSM',45,null,4.7),
('c9','Geometric Tote',315,'Accessories','SAYWAY BLACK LABEL','black',array['OS'],'LIMITED','Matte Black','https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600','Geometric-structured tote.','Vegan Leather','N/A',3,25,4.3),
('c10','Pleated Technical Pant',195,'Outerwear','SAYWAY CORE','lightgray',array['S','M','L'],null,'Stone Grey','https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=600','Technical pleated pant.','95% Nylon, 5% Elastane','240 GSM',12,null,4.1),
('c11','Linear Turtle Neck',210,'Knitwear','SAYWAY CORE','white',array['XS','S','M'],null,'Pristine White','https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=600','A refined turtleneck.','70% Merino Wool, 30% Silk','280 GSM',0,null,4.5),
('c12','Cashmere Overcoat',520,'Outerwear','SAYWAY BLACK LABEL','black',array['S','M','L','XL'],'POPULAR','Deep Black','https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800','Luxurious cashmere overcoat.','100% Mongolian Cashmere','550 GSM',18,null,4.9)
on conflict (id) do nothing;
