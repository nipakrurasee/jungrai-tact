-- ============================================================
-- JUNGRAI TACT — migration v14 (wishlist + reviews + media)
-- รันหลัง schema.sql + seed.sql + migration_roles.sql
-- ============================================================

-- ---------- 1. reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text default '',
  rating int not null default 5 check (rating between 1 and 5),
  text text default '',
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);
create index if not exists idx_reviews_product on public.reviews(product_id, status);
alter table public.reviews enable row level security;

-- ลูกค้าทั่วไปอ่านเฉพาะที่อนุมัติแล้ว
drop policy if exists "public read approved reviews" on public.reviews;
create policy "public read approved reviews" on public.reviews
  for select using (status = 'approved');
-- staff อ่านทั้งหมด (รวม pending เพื่อตรวจสอบ)
drop policy if exists "staff read all reviews" on public.reviews;
create policy "staff read all reviews" on public.reviews
  for select to authenticated using (public.is_staff());
-- member รีวิวได้ (ผูก user ตัวเอง)
drop policy if exists "member insert review" on public.reviews;
create policy "member insert review" on public.reviews
  for insert to authenticated with check (user_id = auth.uid());
-- อนุมัติ/ลบ: staff เท่านั้น
drop policy if exists "staff update reviews" on public.reviews;
create policy "staff update reviews" on public.reviews
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "staff delete reviews" on public.reviews;
create policy "staff delete reviews" on public.reviews
  for delete to authenticated using (public.is_staff());

-- ---------- 2. wishlists (ของ member, sync กับ localStorage) ----------
create table if not exists public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, product_id)
);
alter table public.wishlists enable row level security;

drop policy if exists "own wishlist" on public.wishlists;
create policy "own wishlist" on public.wishlists
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- 3. media library ----------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  path text default '',              -- path ใน bucket (ไว้ลบไฟล์)
  name text default '',
  folder text default 'General',
  size int default 0,
  created_at timestamptz default now()
);
create index if not exists idx_media_folder on public.media(folder);
alter table public.media enable row level security;

drop policy if exists "public read media" on public.media;
create policy "public read media" on public.media for select using (true);

drop policy if exists "staff write media" on public.media;
create policy "staff write media" on public.media
  for insert to authenticated with check (public.is_staff());

drop policy if exists "staff delete media" on public.media;
create policy "staff delete media" on public.media
  for delete to authenticated using (public.is_staff());

insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

drop policy if exists "public read media bucket" on storage.objects;
create policy "public read media bucket" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "staff write media bucket" on storage.objects;
create policy "staff write media bucket" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_staff());

drop policy if exists "staff update media bucket" on storage.objects;
create policy "staff update media bucket" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_staff());

drop policy if exists "staff delete media bucket" on storage.objects;
create policy "staff delete media bucket" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_staff());
