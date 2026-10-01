-- ============================================================
-- JUNGRAI TACT — fix: customers auto-sync + claim guest orders
-- ปัญหา: (1) ตาราง customers ไม่เคยถูกเขียน (2) guest สั่งซื้อก่อน login
--         แล้วออเดอร์ไม่ผูกกับเจ้าของ
-- รันใน SQL Editor ครั้งเดียว
-- ============================================================

-- ---------- 1. เติม customer_email ที่ตกหล่น ----------
update public.orders
set customer_email = lower(customer->>'email')
where (customer_email is null or customer_email = '')
  and customer->>'email' is not null and customer->>'email' <> '';

-- ---------- 2. trigger: ทุกออเดอร์ใหม่ sync เข้า customers อัตโนมัติ ----------
create or replace function public.sync_customer_from_order()
returns trigger language plpgsql security definer set search_path = public as $$
declare em text; nm text; ph text;
begin
  em := lower(coalesce(new.customer_email, new.customer->>'email', ''));
  if em is null or em = '' then return new; end if;
  nm := coalesce(new.customer->>'name', '');
  ph := coalesce(new.customer->>'phone', '');
  insert into public.customers (email, name, phone, total_spent, orders_count)
  values (em, nm, ph, coalesce(new.total, 0), 1)
  on conflict (email) do update set
    name = excluded.name,
    phone = excluded.phone,
    total_spent = public.customers.total_spent + excluded.total_spent,
    orders_count = public.customers.orders_count + 1,
    updated_at = now();
  return new;
end $$;

drop trigger if exists trg_sync_customer on public.orders;
create trigger trg_sync_customer after insert on public.orders
for each row execute function public.sync_customer_from_order();

-- ---------- 3. backfill customers จากออเดอร์เดิม ----------
insert into public.customers (email, name, phone, total_spent, orders_count)
select lower(customer->>'email'),
       max(customer->>'name'), max(customer->>'phone'),
       sum(coalesce(total, 0)), count(*)
from public.orders
where customer->>'email' is not null and customer->>'email' <> ''
group by lower(customer->>'email')
on conflict (email) do update set
  total_spent = excluded.total_spent,
  orders_count = excluded.orders_count,
  updated_at = now();

-- ---------- 4. RLS: member เคลมออเดอร์ guest ของตัวเองได้ ----------
-- (สั่งตอนยังไม่ login แล้ว login ทีหลังด้วยอีเมลเดียวกัน)
drop policy if exists "member claim own guest orders" on public.orders;
create policy "member claim own guest orders" on public.orders
  for update to authenticated
  using (user_id is null and lower(customer_email) = lower((auth.jwt()->>'email')))
  with check (user_id = auth.uid());
