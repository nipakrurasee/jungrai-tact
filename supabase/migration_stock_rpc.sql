-- ============================================================
-- JUNGRAI TACT — atomic stock deduct/restore per order
-- ตัดสต็อกทันทีตอนสั่งซื้อ (กันแย่งกันสั่ง/เลขเพี้ยน)
-- deduct_for_order: ใครก็เรียกได้ แต่ตัดให้เฉพาะออเดอร์จริง
--   ครั้งเดียว (เช็กของพอแบบ lock แถว, ไม่พอ = ตีกลับ + cancel)
-- restore_for_order: staff เท่านั้น (ยกเลิกออเดอร์แล้วคืนของ)
-- หมายเหตุ: trigger กันราคา (check_product_edit) ต้องปล่อยผ่าน
--   งานเขียนภายในของ RPC นี้ (flag app.stock_rpc)
-- ============================================================

-- ---------- 0. เปิดทางให้ RPC เขียน products ได้ ----------
create or replace function public.check_product_edit()
returns trigger language plpgsql as $$
declare r text;
begin
  -- งานภายในของ stock RPC: ปล่อยผ่าน
  if current_setting('app.stock_rpc', true) = '1' then return new; end if;
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

-- ---------- deduct ----------
create or replace function public.deduct_for_order(p_no text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  o record; it jsonb;
  pid text; cc text; ss text; q int; k text;
  st int; cs jsonb; vs jsonb; avail int;
  kk text; cc2 text; vv int; tot int;
begin
  perform set_config('app.stock_rpc', '1', true);
  select * into o from public.orders where order_no = p_no for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if coalesce(o.stock_deducted, 0) = 1 then
    return jsonb_build_object('ok', true, 'already', true);
  end if;

  -- pass 1: lock สินค้าทุกตัว + เช็กว่าพอ (ไม่พอแม้แต่ชิ้นเดียว = ยกเลิกทั้งออเดอร์)
  for it in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) loop
    pid := it->>'id'; cc := coalesce(it->>'c', ''); ss := coalesce(it->>'s', '');
    q := coalesce(nullif(it->>'qty', '')::int, 0);
    perform 1 from public.products where id = pid for update;
    if not found then
      update public.orders set status = 'cancelled',
        log = coalesce(log, '[]'::jsonb) || jsonb_build_object('t', now(), 's', 'Auto-cancelled: product missing')::jsonb
        where order_no = p_no;
      return jsonb_build_object('ok', false, 'id', pid, 'reason', 'not_found');
    end if;
    select stock, stock_by_color, stock_by_variant into st, cs, vs from public.products where id = pid;
    cs := coalesce(cs, '{}'::jsonb); vs := coalesce(vs, '{}'::jsonb);
    if vs <> '{}'::jsonb then
      avail := coalesce((vs->>(cc||'__'||ss))::int, 0);
    elsif cs <> '{}'::jsonb then
      avail := coalesce((cs->>cc)::int, 0);
    else
      avail := coalesce(st, 0);
    end if;
    if avail < q then
      update public.orders set status = 'cancelled',
        log = coalesce(log, '[]'::jsonb) || jsonb_build_object('t', now(), 's', 'Auto-cancelled: insufficient stock')::jsonb
        where order_no = p_no;
      return jsonb_build_object('ok', false, 'id', pid, 'reason', 'insufficient', 'have', avail, 'want', q);
    end if;
  end loop;

  -- pass 2: ตัดจริง + รวมยอดใหม่
  for it in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) loop
    pid := it->>'id'; cc := coalesce(it->>'c', ''); ss := coalesce(it->>'s', '');
    q := coalesce(nullif(it->>'qty', '')::int, 0);
    select stock_by_color, stock_by_variant into cs, vs from public.products where id = pid;
    cs := coalesce(cs, '{}'::jsonb); vs := coalesce(vs, '{}'::jsonb);
    if vs <> '{}'::jsonb then
      k := cc||'__'||ss;
      vs := vs || jsonb_build_object(k, greatest(0, coalesce((vs->>k)::int, 0) - q));
      cs := '{}'::jsonb;
      for kk in select * from jsonb_object_keys(vs) loop
        cc2 := split_part(kk, '__', 1);
        vv := coalesce((vs->>kk)::int, 0);
        cs := cs || jsonb_build_object(cc2, coalesce((cs->>cc2)::int, 0) + vv);
      end loop;
      select coalesce(sum((value)::int), 0) into tot from jsonb_each_text(cs);
      update public.products set stock_by_variant = vs, stock_by_color = cs, stock = tot, updated_at = now() where id = pid;
    elsif cs <> '{}'::jsonb then
      cs := cs || jsonb_build_object(cc, greatest(0, coalesce((cs->>cc)::int, 0) - q));
      select coalesce(sum((value)::int), 0) into tot from jsonb_each_text(cs);
      update public.products set stock_by_color = cs, stock = tot, updated_at = now() where id = pid;
    else
      update public.products set stock = greatest(0, coalesce(stock, 0) - q), updated_at = now() where id = pid;
    end if;
  end loop;

  update public.orders set stock_deducted = 1 where order_no = p_no;
  return jsonb_build_object('ok', true);
end $$;

-- ---------- restore (staff only) ----------
create or replace function public.restore_for_order(p_no text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  o record; it jsonb;
  pid text; cc text; ss text; q int; k text;
  cs jsonb; vs jsonb; kk text; cc2 text; vv int; tot int;
begin
  perform set_config('app.stock_rpc', '1', true);
  if not public.is_staff() then
    raise exception 'staff only';
  end if;
  select * into o from public.orders where order_no = p_no for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'not_found');
  end if;
  if coalesce(o.stock_deducted, 0) <> 1 then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  for it in select * from jsonb_array_elements(coalesce(o.items, '[]'::jsonb)) loop
    pid := it->>'id'; cc := coalesce(it->>'c', ''); ss := coalesce(it->>'s', '');
    q := coalesce(nullif(it->>'qty', '')::int, 0);
    perform 1 from public.products where id = pid for update;
    if not found then continue; end if;
    select stock_by_color, stock_by_variant into cs, vs from public.products where id = pid;
    cs := coalesce(cs, '{}'::jsonb); vs := coalesce(vs, '{}'::jsonb);
    if vs <> '{}'::jsonb then
      k := cc||'__'||ss;
      vs := vs || jsonb_build_object(k, coalesce((vs->>k)::int, 0) + q);
      cs := '{}'::jsonb;
      for kk in select * from jsonb_object_keys(vs) loop
        cc2 := split_part(kk, '__', 1);
        vv := coalesce((vs->>kk)::int, 0);
        cs := cs || jsonb_build_object(cc2, coalesce((cs->>cc2)::int, 0) + vv);
      end loop;
      select coalesce(sum((value)::int), 0) into tot from jsonb_each_text(cs);
      update public.products set stock_by_variant = vs, stock_by_color = cs, stock = tot, updated_at = now() where id = pid;
    elsif cs <> '{}'::jsonb then
      cs := cs || jsonb_build_object(cc, coalesce((cs->>cc)::int, 0) + q);
      select coalesce(sum((value)::int), 0) into tot from jsonb_each_text(cs);
      update public.products set stock_by_color = cs, stock = tot, updated_at = now() where id = pid;
    else
      update public.products set stock = coalesce(stock, 0) + q, updated_at = now() where id = pid;
    end if;
  end loop;
  update public.orders set stock_deducted = 0 where order_no = p_no;
  return jsonb_build_object('ok', true);
end $$;

-- ---------- grants ----------
grant execute on function public.deduct_for_order(text) to anon, authenticated;
grant execute on function public.restore_for_order(text) to authenticated;
