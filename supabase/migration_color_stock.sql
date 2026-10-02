-- ============================================================
-- JUNGRAI TACT — per-color stock
-- stock_by_color: { "Black": 10, "Olive Drab": 5 }
-- ถ้าว่าง = ใช้สต็อกรวม (stock) แบบเดิม
-- stock = ยอดรวมทุกสี (app คำนวณให้ตอนบันทึก/ตัดสต็อก)
-- ============================================================
alter table public.products add column if not exists stock_by_color jsonb default '{}'::jsonb;
