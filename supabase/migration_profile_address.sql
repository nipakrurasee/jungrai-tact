-- ============================================================
-- JUNGRAI TACT — member address on profile
-- จำที่อยู่ในบัญชี เพื่อดึงมากรอก checkout อัตโนมัติ
-- ============================================================
alter table public.profiles add column if not exists full_name text default '';
alter table public.profiles add column if not exists phone text default '';
alter table public.profiles add column if not exists address jsonb default '{}'::jsonb;
-- RLS เดิม (own read / own update) ครอบคลุมคอลัมน์ใหม่โดยอัตโนมัติ
