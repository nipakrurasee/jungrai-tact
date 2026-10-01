-- ============================================================
-- JUNGRAI TACT — Supabase schema v1
-- วิธีใช้: Supabase Dashboard > SQL Editor > New query > วางไฟล์นี้ทั้งหมด > Run
-- ============================================================

-- ---------- 1. products ----------
create table if not exists public.products (
  id text primary key,                       -- เช่น 'fs-01'
  name text not null,
  sku text not null,
  barcode text default '',
  category text not null default 'Apparel',  -- Apparel | Field Gear | Accessories | Patches
  collection text default 'Core',
  price int not null default 0,              -- THB
  compare_at int default 0,
  cost int default 0,
  stock int not null default 0,
  low_threshold int default 5,
  status text default 'active',              -- active | draft | archived
  featured int default 0,                    -- 0/1 (เก็บเป็น int ให้ตรงไฟล์เดิม)
  colors text[] default '{Black}',
  sizes text[] default '{One size}',
  tags text default '',
  description text default '',
  spec text default '',
  material text default '',
  dims text default '',
  notes text default '',
  image_urls text[] default '{}',            -- URL จาก Storage bucket (สูงสุด 4)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- 2. homepage slides ----------
create table if not exists public.slides (
  id text primary key,                       -- เช่น 's1'
  headline text default '',
  subheadline text default '',
  btn1_text text default '',
  btn1_link text default '#/shop',
  btn2_text text default '',
  btn2_link text default '#/shop',
  image_url text default '',
  position int default 0,
  created_at timestamptz default now()
);

-- ---------- 3. site_configs (home/page/settings รวมที่เดียว) ----------
create table if not exists public.site_configs (
  key text primary key,                      -- 'home' | 'page' | 'store'
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- ---------- 4. discount_codes ----------
create table if not exists public.discount_codes (
  code text primary key,                     -- เก็บตัวพิมพ์ใหญ่ เช่น 'FIELD10'
  type text not null default 'pct',          -- pct | fixed | ship
  value numeric default 0,
  created_at timestamptz default now()
);

-- ---------- 5. customers (สรุปจาก orders, sync ผ่าน app) ----------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  name text default '',
  phone text default '',
  province text default '',
  total_spent int default 0,
  orders_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- 6. orders ----------
create table if not exists public.orders (
  order_no text primary key,                 -- เช่น 'JT-XXXXXX' ตรงกับไฟล์เดิม
  created_at timestamptz default now(),
  customer jsonb default '{}'::jsonb,        -- {email,name,phone}
  address jsonb default '{}'::jsonb,         -- {line,sub,dist,prov,zip}
  items jsonb default '[]'::jsonb,           -- [{id,name,sku,c,s,qty,price}]
  subtotal int default 0,
  discount int default 0,
  shipping int default 0,
  total int default 0,
  discount_code text default '',
  payment_method text default 'promptpay',   -- promptpay | card | bank
  status text default 'new',                 -- new|paid|processing|packed|shipped|delivered|cancelled|refunded
  tracking text default '',
  note text default '',
  stock_deducted int default 0,
  log jsonb default '[]'::jsonb              -- [{t,s}]
);

-- ---------- 7. activity_log (admin) ----------
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  actor text default 'admin',
  action text default '',
  detail text default ''
);

-- ---------- updated_at trigger ----------
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
for each row execute function public.handle_updated_at();

drop trigger if exists trg_customers_updated on public.customers;
create trigger trg_customers_updated before update on public.customers
for each row execute function public.handle_updated_at();

-- ---------- RLS ----------
alter table public.products enable row level security;
alter table public.slides enable row level security;
alter table public.site_configs enable row level security;
alter table public.discount_codes enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.activity_log enable row level security;

-- อ่านได้สาธารณะ (หน้าร้านต้องอ่านได้โดยไม่ login)
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);

drop policy if exists "public read slides" on public.slides;
create policy "public read slides" on public.slides for select using (true);

drop policy if exists "public read site_configs" on public.site_configs;
create policy "public read site_configs" on public.site_configs for select using (true);

drop policy if exists "public read discount_codes" on public.discount_codes;
create policy "public read discount_codes" on public.discount_codes for select using (true);

-- orders: ลูกค้าสร้างออเดอร์ได้ (insert), อ่านเฉพาะ authenticated (admin)
drop policy if exists "anon insert orders" on public.orders;
create policy "anon insert orders" on public.orders for insert with check (true);

drop policy if exists "auth read orders" on public.orders;
create policy "auth read orders" on public.orders for select to authenticated using (true);

drop policy if exists "auth update orders" on public.orders;
create policy "auth update orders" on public.orders for update to authenticated using (true) with check (true);

-- customers / activity: admin (authenticated) อย่างเดียว
drop policy if exists "auth all customers" on public.customers;
create policy "auth all customers" on public.customers for all to authenticated using (true) with check (true);

drop policy if exists "auth all activity" on public.activity_log;
create policy "auth all activity" on public.activity_log for all to authenticated using (true) with check (true);

-- products/slides/configs/codes: เขียนได้เฉพาะ authenticated (admin login ใน Supabase Auth)
drop policy if exists "auth write products" on public.products;
create policy "auth write products" on public.products for all to authenticated using (true) with check (true);

drop policy if exists "auth write slides" on public.slides;
create policy "auth write slides" on public.slides for all to authenticated using (true) with check (true);

drop policy if exists "auth write site_configs" on public.site_configs;
create policy "auth write site_configs" on public.site_configs for all to authenticated using (true) with check (true);

drop policy if exists "auth write discount_codes" on public.discount_codes;
create policy "auth write discount_codes" on public.discount_codes for all to authenticated using (true) with check (true);

-- ---------- Storage buckets (รันใน SQL ได้เลย) ----------
insert into storage.buckets (id, name, public)
values ('product-images','product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('slide-images','slide-images', true)
on conflict (id) do nothing;

-- policy storage: อ่าน public, เขียน authenticated
drop policy if exists "public read product-images" on storage.objects;
create policy "public read product-images" on storage.objects for select using (bucket_id = 'product-images');

drop policy if exists "auth write product-images" on storage.objects;
create policy "auth write product-images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "auth update product-images" on storage.objects;
create policy "auth update product-images" on storage.objects for update to authenticated using (bucket_id = 'product-images');

drop policy if exists "auth delete product-images" on storage.objects;
create policy "auth delete product-images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');

drop policy if exists "public read slide-images" on storage.objects;
create policy "public read slide-images" on storage.objects for select using (bucket_id = 'slide-images');

drop policy if exists "auth write slide-images" on storage.objects;
create policy "auth write slide-images" on storage.objects for insert to authenticated with check (bucket_id = 'slide-images');

drop policy if exists "auth update slide-images" on storage.objects;
create policy "auth update slide-images" on storage.objects for update to authenticated using (bucket_id = 'slide-images');

drop policy if exists "auth delete slide-images" on storage.objects;
create policy "auth delete slide-images" on storage.objects for delete to authenticated using (bucket_id = 'slide-images');
