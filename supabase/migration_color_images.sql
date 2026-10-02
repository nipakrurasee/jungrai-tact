-- ============================================================
-- JUNGRAI TACT — per-color product images
-- รูปแยกตามสี: { "Black": ["url", ...], ... }
-- สีที่ไม่มีรูปเฉพาะ ใช้รูปกลาง (image_urls) แทน
-- ============================================================
alter table public.products add column if not exists color_images jsonb default '{}'::jsonb;
