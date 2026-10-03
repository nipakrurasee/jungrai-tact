-- JUNGRAI TACT — explicit cover image (รูปปกหน้าร้าน)
alter table public.products add column if not exists cover_url text default '';
