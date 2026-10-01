# JUNGRAI TACT — Shop + Admin (Supabase + Github)

แปลงจากไฟล์ `jungrai-tact-v7-clean.html` (ไฟล์เดียว localStorage) มาเป็นโครงมาตรฐาน
**Supabase เป็นฐานข้อมูล + deploy ผ่าน Github → Vercel / Netlify**

## โครงไฟล์

```
index.html                  # หน้าเว็บหลัก (เหมือนไฟล์เดิมทุกอย่าง)
css/style.css               # สไตล์เดิม แยกออกมาแล้ว
js/config.js                # URL + anon key (gitignore, ก็อปจาก config.example.js)
js/config.example.js
js/supabase-client.js       # ต่อ Supabase, fallback local ถ้ายังไม่ตั้งค่า
js/app.js                   # ร้าน + แอดมินทั้งหมด (Supabase-first)
supabase/schema.sql         # ตาราง + RLS + Storage buckets
supabase/migration_roles.sql  # สิทธิ์ 4 ระดับ owner/shop_admin/member/guest
supabase/migration_v14.sql    # wishlist + reviews + media library (port จากไฟล์ v14)
supabase/seed.sql           # สินค้า 8 ตัว + หน้าเว็บเริ่มต้น
vercel.json / netlify.toml  # รองรับ SPA routing
.github/workflows/check.yml # CI เช็กไฟล์
```

ไฟล์เดิม `jungrai-tact-v7-clean.html` เก็บไว้เป็นต้นฉบับอ้างอิง ไม่ได้ใช้รันแล้ว

## 1) สร้าง Supabase (5 นาที)

1. สมัคร https://supabase.com → New project → จำ DB password ไว้
2. เมนู **SQL Editor → New query** → ก็อป `supabase/schema.sql` ทั้งหมด → **Run**
3. New query อีกอัน → ก็อป `supabase/seed.sql` → **Run**
4. New query อีกอัน → ก็อป `supabase/migration_roles.sql` → **Run** (ระบบสิทธิ์ owner/shop_admin/member/guest)
5. New query อีกอัน → ก็อป `supabase/migration_v14.sql` → **Run** (wishlist + reviews + media library)
6. New query อีกอัน → ก็อป `supabase/migration_customer_fix.sql` → **Run** (customers auto-sync + เคลมออเดอร์ guest)
5. เมนู **Storage** → ตรวจว่ามี bucket `product-images` + `slide-images` (สร้างจาก SQL แล้ว, เป็น public)
6. เมนู **Project Settings → API** → ก็อป `Project URL` + `anon public key`
7. เมนู **Authentication → Users → Add user** → เพิ่มอีเมล owner + shop_admin + ทดสอบ member
8. ตั้ง owner คนแรกใน SQL Editor:
```sql
update public.profiles set role = 'owner' where email = 'owner@jungrai.com';
update public.profiles set role = 'shop_admin' where email = 'staff@jungrai.com';
```

สิทธิ์: owner ทุกอย่าง · shop_admin เติมสต็อก+ออเดอร์ (แก้ราคา/ลบ/แก้เว็บไม่ได้, กันด้วย trigger) · member ดู `#/account/orders` ของตัวเอง · guest สั่งซื้อได้อย่างเดียว เปลี่ยน role ที่ `#/admin/system/staff` (owner เท่านั้น)

ตารางที่สร้าง: `products, slides, site_configs, discount_codes, customers, orders, activity_log`

## 2) รัน local

```bash
# วิธีง่าย: VS Code Live Server หรือ
npx serve .
# เปิด http://localhost:3000
```

ครั้งแรกจะขึ้น **local mode** (ใช้ seed + localStorage) → ไปที่ `#/admin/system/supabase`
กรอก URL + anon key → Save & connect → กด Send magic link → กลับมา login

หรือสร้าง `js/config.js` (ก็อปจาก `config.example.js`) กรอกค่าตายตัว:

```js
window.JT_CONFIG = { SUPABASE_URL: "https://...", SUPABASE_ANON_KEY: "eyJ..." };
```

## 3) ขึ้น Github + ต่อ Vercel / Netlify

```bash
git init
git add .
git commit -m "jungrai tact supabase v1"
git branch -M main
git remote add origin https://github.com/<user>/jungrai-tact.git
git push -u origin main
```

**Vercel:** vercel.com → Add New Project → Import repo → Framework: Other → Deploy (ไม่ต้อง build)
**Netlify:** app.netlify.com → Add new site → Import → Build command ว่าง, Publish dir `.`

ไม่ต้องตั้ง env บน Vercel/Netlify ก็ได้ — ตั้งค่าผ่านหน้าเว็บ Admin ได้เลย
(เก็บใน localStorage `jt_supabase` ของเบราว์เซอร์แอดมิน)

## 4) การใช้งาน

- หน้าร้าน: `#/` Home, `#/shop` กรอง cat/size/color/sort, `#/p/:id` สินค้า, `#/cart`, `#/checkout` (validate ไทย), `#/done/:no`
- แอดมิน: `#/admin/dashboard` ยอดขาย, `#/admin/products` CRUD + อัปโหลดรูป (เข้า Storage), `#/admin/inventory`, `#/admin/orders` (mark paid ตัดสต็อก), `#/admin/customers`, `#/admin/website/homepage`, `#/admin/website/sections`, `#/admin/settings/*`, `#/admin/system/supabase`
- ส่วนลดเริ่มต้น: `FIELD10` (-10%), `WELCOME100` (-100฿), `FREESHIP`
- ค่าส่ง: 60฿ ฟรีเมื่อเกิน 2000฿ (แก้ที่ Sections หรือ Settings)

## 5) ย้ายรูปเดิม (base64 ในไฟล์เก่า)

ไฟล์เก่าเก็บรูปเป็น base64 ใน localStorage/`shop/img-*` ซึ่งใหญ่เกิน Supabase row แนะนำ:
1. เปิดไฟล์เก่า → Products → Edit → ดาวน์โหลดรูป
2. เปิดเว็บใหม่ → Products → Edit → Upload images (เข้า bucket `product-images` อัตโนมัติ)
3. Homepage slides เหมือนกัน (เข้า bucket `slide-images`)

## Troubleshooting

- **ยังขึ้น local mode:** URL/key ผิด หรือโดน adblock บล็อก supabase CDN
- **เขียนไม่ได้ (401/RLS):** ต้อง login admin ก่อน (magic link) เพราะ policy เขียนต้อง `authenticated`
- **รูปไม่ขึ้น:** bucket ต้องเป็น public + มี policy ตาม schema.sql
- **Vercel 404 ตอน refresh:** มี `vercel.json` rewrites แล้ว, Netlify ใช้ `netlify.toml`
