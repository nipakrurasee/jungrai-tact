-- ============================================================
-- JUNGRAI TACT — migration Roles v2 (4 ระดับ)
-- owner / shop_admin / member / guest(anon)
-- วิธีใช้: รัน schema.sql + seed.sql ก่อน แล้วค่อยรันไฟล์นี้ใน SQL Editor
-- ============================================================

-- ---------- 1. profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('owner','shop_admin','member')),
  display_name text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- auto-create profile ตอน signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, coalesce(new.email,''), 'member')
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- 2. orders: ผูก user_id ----------
alter table public.orders add column if not exists user_id uuid references auth.users(id);
alter table public.orders add column if not exists customer_email text default '';
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_email on public.orders(customer_email);

-- backfill email จาก json เก่า (รันครั้งเดียว)
update public.orders set customer_email = lower(customer->>'email')
where (customer_email is null or customer_email = '') and customer->>'email' is not null;

-- ---------- 3. helper functions ----------
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'guest');
$$;
create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select public.my_role() = 'owner';
$$;
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.my_role() in ('owner','shop_admin');
$$;

-- กัน shop_admin แอบแก้ราคา: อนุญาตให้เปลี่ยนได้แค่ stock/low/status (+updated_at)
create or replace function public.check_product_edit()
returns trigger language plpgsql as $$
declare r text;
begin
  -- SQL Editor / ต่อ DB ตรง (ไม่มี JWT): ปล่อยผ่าน ถือว่ามี DB password แล้ว
  if current_setting('request.jwt.claims', true) is null then return new; end if;
  r := public.my_role();
  if r = 'owner' then return new; end if;
  if r = 'shop_admin' then
    if new.price is distinct from old.price
      or new.compare_at is distinct from old.compare_at
      or new.cost is distinct from old.cost
      or new.name is distinct from old.name
      or new.sku is distinct from old.sku
      or new.category is distinct from old.category
      or new.collection is distinct from old.collection
      or new.featured is distinct from old.featured
      or new.colors is distinct from old.colors
      or new.sizes is distinct from old.sizes then
      raise exception 'shop_admin แก้ได้เฉพาะ stock / low_threshold / status เท่านั้น';
    end if;
    return new;
  end if;
  raise exception 'no permission';
end $$;
drop trigger if exists trg_product_role_guard on public.products;
create trigger trg_product_role_guard before update on public.products
for each row execute function public.check_product_edit();

-- role เปลี่ยนได้เฉพาะ owner (กันแอบอัปสิทธิ์ตัวเอง)
create or replace function public.check_profile_role()
returns trigger language plpgsql as $$
begin
  -- SQL Editor / ต่อ DB ตรง (ไม่มี JWT): ปล่อยผ่าน ถือว่ามี DB password แล้ว
  if current_setting('request.jwt.claims', true) is null then return new; end if;
  -- bootstrap: ถ้ายังไม่มี owner เลย อนุญาตให้ตั้งคนแรกได้
  if not exists (select 1 from public.profiles where role = 'owner') then return new; end if;
  if new.role is distinct from old.role and public.my_role() <> 'owner' then
    raise exception 'เปลี่ยน role ได้เฉพาะ owner';
  end if;
  return new;
end $$;
drop trigger if exists trg_profile_role_guard on public.profiles;
create trigger trg_profile_role_guard before update on public.profiles
for each row execute function public.check_profile_role();

-- ---------- 4. RLS ใหม่: profiles ----------
drop policy if exists "own read profile" on public.profiles;
create policy "own read profile" on public.profiles for select to authenticated using (id = auth.uid() or public.is_staff());
drop policy if exists "own update profile" on public.profiles;
create policy "own update profile" on public.profiles for update to authenticated using (id = auth.uid() or public.is_owner()) with check (true);
drop policy if exists "owner insert profile" on public.profiles;
create policy "owner insert profile" on public.profiles for insert to authenticated with check (public.is_owner());

-- ---------- 5. RLS ใหม่: products ----------
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products for select using (true);
drop policy if exists "auth write products" on public.products;
-- insert/delete: owner เท่านั้น
drop policy if exists "owner insert products" on public.products;
create policy "owner insert products" on public.products for insert to authenticated with check (public.is_owner());
drop policy if exists "owner delete products" on public.products;
create policy "owner delete products" on public.products for delete to authenticated using (public.is_owner());
-- update: staff (owner ทุกคอลัมน์ / shop_admin โดน trigger กันราคาไว้)
drop policy if exists "staff update products" on public.products;
create policy "staff update products" on public.products for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- 6. slides / site_configs / discount_codes: owner เขียน ----------
drop policy if exists "auth write slides" on public.slides;
create policy "owner write slides" on public.slides for all to authenticated using (public.is_owner()) with check (public.is_owner());
drop policy if exists "auth write site_configs" on public.site_configs;
create policy "owner write site_configs" on public.site_configs for all to authenticated using (public.is_owner()) with check (public.is_owner());
drop policy if exists "auth write discount_codes" on public.discount_codes;
create policy "owner write discount_codes" on public.discount_codes for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- ---------- 7. orders ----------
drop policy if exists "anon insert orders" on public.orders;
create policy "guest insert orders" on public.orders for insert with check (true);
drop policy if exists "auth read orders" on public.orders;
drop policy if exists "auth update orders" on public.orders;
-- staff อ่าน/อัปเดตทั้งหมด
create policy "staff read orders" on public.orders for select to authenticated using (public.is_staff());
create policy "staff update orders" on public.orders for update to authenticated using (public.is_staff()) with check (public.is_staff());
-- member อ่านเฉพาะของตัวเอง
create policy "member read own orders" on public.orders for select to authenticated using (user_id = auth.uid());

-- ---------- 8. customers ----------
drop policy if exists "auth all customers" on public.customers;
create policy "staff all customers" on public.customers for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- ---------- 9. activity_log: staff เขียน / owner อ่าน ----------
drop policy if exists "auth all activity" on public.activity_log;
create policy "owner read activity" on public.activity_log for select to authenticated using (public.is_owner());
create policy "staff insert activity" on public.activity_log for insert to authenticated with check (public.is_staff());

-- ---------- 10. Storage ----------
drop policy if exists "auth write product-images" on storage.objects;
create policy "staff write product-images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images' and public.is_staff());
drop policy if exists "auth update product-images" on storage.objects;
create policy "staff update product-images" on storage.objects for update to authenticated using (bucket_id = 'product-images' and public.is_staff());
drop policy if exists "auth delete product-images" on storage.objects;
create policy "staff delete product-images" on storage.objects for delete to authenticated using (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "auth write slide-images" on storage.objects;
create policy "owner write slide-images" on storage.objects for insert to authenticated with check (bucket_id = 'slide-images' and public.is_owner());
drop policy if exists "auth update slide-images" on storage.objects;
create policy "owner update slide-images" on storage.objects for update to authenticated using (bucket_id = 'slide-images' and public.is_owner());
drop policy if exists "auth delete slide-images" on storage.objects;
create policy "owner delete slide-images" on storage.objects for delete to authenticated using (bucket_id = 'slide-images' and public.is_owner());

-- ---------- 11. ตั้ง owner คนแรก (แก้ email แล้วรันบรรทัดนี้) ----------
-- update public.profiles set role = 'owner' where email = 'owner@jungrai.com';
