-- ============================================================
-- JUNGRAI TACT — stock ledger (สมุดบัญชีสต็อก)
-- ทุกการเปลี่ยนสต็อกถูกบันทึก: ครั้งแรก/นำเข้า/ขาย/คืน/ปรับมือ
-- trigger อ่าน reason + order_no ที่ RPC ฝากไว้ (app.stock_reason/order)
-- ถ้าไม่มี = งานแก้ผ่านแอดมิน/SQL (adjust)
-- ============================================================

create table if not exists public.stock_moves (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  product_id text not null references public.products(id) on delete cascade,
  variant_key text default '',   -- '' = กองรวม, 'Black' = รายสี, 'Black__M' = รายชุด
  before_qty int,
  after_qty int not null default 0,
  change_qty int not null default 0,
  reason text default 'adjust',  -- opening|import|sale|restore|adjust
  order_no text default '',
  actor text default 'system'
);
create index if not exists idx_moves_product on public.stock_moves(product_id, created_at desc);
alter table public.stock_moves enable row level security;

drop policy if exists "staff read moves" on public.stock_moves;
create policy "staff read moves" on public.stock_moves
  for select to authenticated using (public.is_staff());
-- insert ผ่าน trigger (security definer) เท่านั้น ไม่เปิด policy เขียนตรง

create or replace function public.log_stock_moves()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  reason text; ono text; actor text;
  k text; ob int; nb int;
  use_vs boolean; use_cs boolean;
begin
  if tg_op <> 'UPDATE' then return new; end if;
  reason := coalesce(current_setting('app.stock_reason', true), 'adjust');
  ono := coalesce(current_setting('app.stock_order', true), '');
  actor := coalesce((auth.jwt()->>'email'), 'system');
  use_vs := coalesce(new.stock_by_variant, '{}'::jsonb) <> '{}'::jsonb
         or coalesce(old.stock_by_variant, '{}'::jsonb) <> '{}'::jsonb;
  use_cs := coalesce(new.stock_by_color, '{}'::jsonb) <> '{}'::jsonb
         or coalesce(old.stock_by_color, '{}'::jsonb) <> '{}'::jsonb;
  if use_vs then
    for k in select * from jsonb_object_keys(coalesce(old.stock_by_variant, '{}'::jsonb) || coalesce(new.stock_by_variant, '{}'::jsonb)) loop
      ob := coalesce((old.stock_by_variant->>k)::int, 0);
      nb := coalesce((new.stock_by_variant->>k)::int, 0);
      if ob is distinct from nb then
        insert into public.stock_moves (product_id, variant_key, before_qty, after_qty, change_qty, reason, order_no, actor)
        values (new.id, k, ob, nb, nb - ob, reason, ono, actor);
      end if;
    end loop;
  elsif use_cs then
    for k in select * from jsonb_object_keys(coalesce(old.stock_by_color, '{}'::jsonb) || coalesce(new.stock_by_color, '{}'::jsonb)) loop
      ob := coalesce((old.stock_by_color->>k)::int, 0);
      nb := coalesce((new.stock_by_color->>k)::int, 0);
      if ob is distinct from nb then
        insert into public.stock_moves (product_id, variant_key, before_qty, after_qty, change_qty, reason, order_no, actor)
        values (new.id, k, ob, nb, nb - ob, reason, ono, actor);
      end if;
    end loop;
  else
    if coalesce(old.stock, 0) is distinct from coalesce(new.stock, 0) then
      insert into public.stock_moves (product_id, variant_key, before_qty, after_qty, change_qty, reason, order_no, actor)
      values (new.id, '', coalesce(old.stock, 0), coalesce(new.stock, 0), coalesce(new.stock, 0) - coalesce(old.stock, 0), reason, ono, actor);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_log_stock_moves on public.products;
create trigger trg_log_stock_moves after update on public.products
for each row execute function public.log_stock_moves();

-- ---------- backfill: ยอดยกมาตอนติดตั้ง ----------
insert into public.stock_moves (product_id, variant_key, before_qty, after_qty, change_qty, reason, actor)
select id, '', null, stock, stock, 'opening', 'system' from public.products
where not exists (select 1 from public.stock_moves sm where sm.product_id = public.products.id and sm.reason = 'opening') and (stock_by_variant is null or stock_by_variant = '{}')
  and (stock_by_color is null or stock_by_color = '{}');
insert into public.stock_moves (product_id, variant_key, before_qty, after_qty, change_qty, reason, actor)
select id, k, null, (value)::int, (value)::int, 'opening', 'system'
from public.products, jsonb_each_text(stock_by_color)
where not exists (select 1 from public.stock_moves sm where sm.product_id = public.products.id and sm.reason = 'opening') and stock_by_color is not null and stock_by_color <> '{}'
  and (stock_by_variant is null or stock_by_variant = '{}');
insert into public.stock_moves (product_id, variant_key, before_qty, after_qty, change_qty, reason, actor)
select id, k, null, (value)::int, (value)::int, 'opening', 'system'
from public.products, jsonb_each_text(stock_by_variant)
where not exists (select 1 from public.stock_moves sm where sm.product_id = public.products.id and sm.reason = 'opening') and stock_by_variant is not null and stock_by_variant <> '{}';
