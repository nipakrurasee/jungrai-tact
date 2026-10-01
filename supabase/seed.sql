-- ============================================================
-- JUNGRAI TACT — seed data (สินค้า 8 ตัว + หน้าเว็บเริ่มต้น)
-- รันหลัง schema.sql
-- ============================================================

-- products (ตรงกับไฟล์ jungrai-tact-v7-clean.html)
insert into public.products (id,name,sku,category,collection,price,compare_at,cost,stock,low_threshold,status,featured,colors,sizes,description) values
('fs-01','FS-01 Field Shell Jacket','FS-01','Apparel','Field Series',4290,4990,1900,24,5,'active',1,'{Olive Drab,Sand,Black}','{S,M,L,XL}','Water-repellent ripstop shell with low-profile zip pockets and a hidden map sleeve.'),
('fs-02','FS-02 Urban Utility Pant','FS-02','Apparel','Field Series',3190,0,1300,18,5,'active',0,'{Black,Concrete,Olive Drab}','{S,M,L,XL}','Stretch ripstop pant with articulated knees and six working pockets.'),
('fs-03','FS-03 Base Layer Crew','FS-03','Apparel','Core',1290,0,480,3,5,'active',0,'{Black,Sand}','{S,M,L,XL}','Fast-drying base layer, flat seams, no tag.'),
('gr-01','GR-01 Daypack 24L','GR-01','Field Gear','Field Series',3890,0,1600,12,5,'active',1,'{Olive Drab,Black}','{One size}','Rain-ready pack with laser-cut webbing and a flat internal organizer.'),
('gr-02','GR-02 Admin Pouch','GR-02','Field Gear','Core',890,0,320,40,5,'active',0,'{Olive Drab,Sand,Black}','{One size}','Slim pouch for documents, cards and cables.'),
('ac-01','AC-01 Rigger Belt','AC-01','Accessories','Core',1190,0,420,0,5,'active',0,'{Black,Sand}','{M,L}','Low-profile belt with a quick-release buckle.'),
('ac-02','AC-02 Low-profile Cap','AC-02','Accessories','Core',690,0,210,30,5,'active',0,'{Black,Olive Drab}','{One size}','Unstructured six-panel cap with a hook-and-loop patch panel.'),
('pt-01','PT-01 Thai Flag Patch','PT-01','Patches','Core',290,0,60,120,5,'active',0,'{Olive Drab,Black}','{One size}','Woven patch with hook backing.')
on conflict (id) do update set
  name=excluded.name, price=excluded.price, stock=excluded.stock, updated_at=now();

-- slides
insert into public.slides (id,headline,subheadline,btn1_text,btn1_link,btn2_text,btn2_link,position) values
('s1','Built for the field.','Tactical apparel & field equipment','Shop collection','#/shop','Explore field','#/shop',0)
on conflict (id) do nothing;

-- site_configs: home
insert into public.site_configs (key,value) values
('home','{"secs":7,"logo":1,"wm":1}')
on conflict (key) do update set value=excluded.value;

-- site_configs: page (sections + codes + shipping) ตรงกับไฟล์เดิม
insert into public.site_configs (key,value) values
('page','{
  "show":{"cats":1,"brand":1,"featured":1,"stories":1,"drop":0,"news":1},
  "cats":[
    {"t":"Apparel","l":"#/shop?cat=Apparel"},
    {"t":"Field Gear","l":"#/shop?cat=Field Gear"},
    {"t":"Accessories","l":"#/shop?cat=Accessories"},
    {"t":"Patches","l":"#/shop?cat=Patches"}
  ],
  "brand":{"h":"Built for the field.","p":"JUNGRAI TACT —เสื้อผ้าและอุปกรณ์ภาคสนาม ทน พร้อมใช้จริง"},
  "stories":[
    {"k":"Story 01","t":"Night patrol","l":"#/shop"},
    {"k":"Story 02","t":"Urban carry","l":"#/shop"},
    {"k":"Story 03","t":"Jungle ready","l":"#/shop"},
    {"k":"Story 04","t":"Range day","l":"#/shop"},
    {"k":"Story 05","t":"Base camp","l":"#/shop"}
  ],
  "drop":{"on":0,"label":"Limited","h":"Drop 001","p":"Coming soon","at":"","b":"Notify me","l":"#/shop"},
  "news":{"h":"Join the field list","p":"ข่าวดรอปใหม่และส่วนลด"},
  "codes":[
    {"c":"FIELD10","t":"pct","v":10},
    {"c":"WELCOME100","t":"fixed","v":100},
    {"c":"FREESHIP","t":"ship","v":0}
  ],
  "ship":{"rate":60,"free":2000}
}')
on conflict (key) do update set value=excluded.value;

-- site_configs: store (settings)
insert into public.site_configs (key,value) values
('store','{"name":"JUNGRAI TACT","currency":"THB","ship":60,"free":2000,"promptpay":true,"card":false,"bank":true,"email":"","phone":"","address":"","title":"JUNGRAI TACT | Tactical Gear & Apparel","desc":"","maint":false,"msg":"Site maintenance in progress."}')
on conflict (key) do update set value=excluded.value;

-- discount_codes (mirror จาก page.codes เพื่อ query ง่าย)
insert into public.discount_codes (code,type,value) values
('FIELD10','pct',10),
('WELCOME100','fixed',100),
('FREESHIP','ship',0)
on conflict (code) do update set type=excluded.type, value=excluded.value;
