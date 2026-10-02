-- ============================================================
-- JUNGRAI TACT — per-variant stock (color + size)
-- stock_by_variant: { "Black__One size": 5, "RED__One size": 3 }
-- ถ้าว่าง = ใช้ stock_by_color / stock แบบเดิม
-- stock = ยอดรวมทั้งหมด (app คำนวณให้)
-- ============================================================
alter table public.products add column if not exists stock_by_variant jsonb default '{}'::jsonb;
