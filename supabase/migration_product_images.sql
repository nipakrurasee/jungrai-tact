-- ============================================================
-- JUNGRAI TACT — product placeholder images
-- ผูกภาพประจำสินค้า (ไฟล์ img/products/*.svg ใน repo)
-- เฉพาะสินค้าที่ยังไม่มีรูปเท่านั้น (ไม่ทับรูปที่อัปโหลดแล้ว)
-- ============================================================
update public.products set image_urls = array['img/products/fs-01.svg'] where id = 'fs-01' and (image_urls is null or image_urls = '{}');
update public.products set image_urls = array['img/products/fs-02.svg'] where id = 'fs-02' and (image_urls is null or image_urls = '{}');
update public.products set image_urls = array['img/products/fs-03.svg'] where id = 'fs-03' and (image_urls is null or image_urls = '{}');
update public.products set image_urls = array['img/products/gr-01.svg'] where id = 'gr-01' and (image_urls is null or image_urls = '{}');
update public.products set image_urls = array['img/products/gr-02.svg'] where id = 'gr-02' and (image_urls is null or image_urls = '{}');
update public.products set image_urls = array['img/products/ac-01.svg'] where id = 'ac-01' and (image_urls is null or image_urls = '{}');
update public.products set image_urls = array['img/products/ac-02.svg'] where id = 'ac-02' and (image_urls is null or image_urls = '{}');
update public.products set image_urls = array['img/products/pt-01.svg'] where id = 'pt-01' and (image_urls is null or image_urls = '{}');
