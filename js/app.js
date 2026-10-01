/* JUNGRAI TACT — storefront + admin, Supabase-first with localStorage fallback
   โครงตาม jungrai-tact-v7-clean.html */
var CM = { 'Olive Drab': '#5a5d3a', 'Sand': '#c2b28f', 'Black': '#1d1d1b', 'Concrete': '#8a8b86' };
var CAT = ['Apparel', 'Field Gear', 'Accessories', 'Patches'];
function mk(id, n, cat, col, pr, cp, cost, st, cl, sz, ft, d) {
  return { id: id, name: n, sku: id.toUpperCase(), barcode: '', cat: cat, coll: col, price: pr, compare: cp, cost: cost, stock: st, low: 5, status: 'active', featured: ft, colors: cl, sizes: sz, tags: '', desc: d, material: '', dims: '', spec: '', notes: '' };
}
var A = ['Olive Drab', 'Sand', 'Black'], S = ['S', 'M', 'L', 'XL'];
var SEED_PRODUCTS = [
  mk('fs-01', 'FS-01 Field Shell Jacket', 'Apparel', 'Field Series', 4290, 4990, 1900, 24, A, S, 1, 'Water-repellent ripstop shell with low-profile zip pockets and a hidden map sleeve.'),
  mk('fs-02', 'FS-02 Urban Utility Pant', 'Apparel', 'Field Series', 3190, 0, 1300, 18, ['Black', 'Concrete', 'Olive Drab'], S, 0, 'Stretch ripstop pant with articulated knees and six working pockets.'),
  mk('fs-03', 'FS-03 Base Layer Crew', 'Apparel', 'Core', 1290, 0, 480, 3, ['Black', 'Sand'], S, 0, 'Fast-drying base layer, flat seams, no tag.'),
  mk('gr-01', 'GR-01 Daypack 24L', 'Field Gear', 'Field Series', 3890, 0, 1600, 12, ['Olive Drab', 'Black'], ['One size'], 1, 'Rain-ready pack with laser-cut webbing and a flat internal organizer.'),
  mk('gr-02', 'GR-02 Admin Pouch', 'Field Gear', 'Core', 890, 0, 320, 40, ['Olive Drab', 'Sand', 'Black'], ['One size'], 0, 'Slim pouch for documents, cards and cables.'),
  mk('ac-01', 'AC-01 Rigger Belt', 'Accessories', 'Core', 1190, 0, 420, 0, ['Black', 'Sand'], ['M', 'L'], 0, 'Low-profile belt with a quick-release buckle.'),
  mk('ac-02', 'AC-02 Low-profile Cap', 'Accessories', 'Core', 690, 0, 210, 30, ['Black', 'Olive Drab'], ['One size'], 0, 'Unstructured six-panel cap with a hook-and-loop patch panel.'),
  mk('pt-01', 'PT-01 Thai Flag Patch', 'Patches', 'Core', 290, 0, 60, 120, ['Olive Drab', 'Black'], ['One size'], 0, 'Woven patch with hook backing.')
];
var SEED_SLIDES = [{ id: 's1', h: 'Built for the field.', sub: 'Tactical apparel & field equipment', b1: 'Shop collection', l1: '#/shop', b2: 'Explore field', l2: '#/shop', img: '' }];
var DEFAULT_PAGE = {
  show: { cats: 1, brand: 1, featured: 1, stories: 1, drop: 0, news: 1 },
  cats: [{ t: 'Apparel', l: '#/shop?cat=Apparel' }, { t: 'Field Gear', l: '#/shop?cat=Field Gear' }, { t: 'Accessories', l: '#/shop?cat=Accessories' }, { t: 'Patches', l: '#/shop?cat=Patches' }],
  brand: { h: 'Built for the field.', p: 'JUNGRAI TACT — เสื้อผ้าและอุปกรณ์ภาคสนาม ทน พร้อมใช้จริง' },
  stories: [{ k: 'Story 01', t: 'Night patrol', l: '#/shop' }, { k: 'Story 02', t: 'Urban carry', l: '#/shop' }, { k: 'Story 03', t: 'Jungle ready', l: '#/shop' }, { k: 'Story 04', t: 'Range day', l: '#/shop' }, { k: 'Story 05', t: 'Base camp', l: '#/shop' }],
  drop: { on: 0, label: 'Limited', h: 'Drop 001', p: 'Coming soon', at: '', b: 'Notify me', l: '#/shop' },
  news: { h: 'Join the field list', p: 'ข่าวดรอปใหม่และส่วนลด' },
  codes: [{ c: 'FIELD10', t: 'pct', v: 10 }, { c: 'WELCOME100', t: 'fixed', v: 100 }, { c: 'FREESHIP', t: 'ship', v: 0 }],
  ship: { rate: 60, free: 2000 }
};

var P = JSON.parse(JSON.stringify(SEED_PRODUCTS));
var IM = {}; // id -> [imageUrl,...] (http หรือ dataURL)
var H = { slides: JSON.parse(JSON.stringify(SEED_SLIDES)), secs: 7, logo: 1, wm: 1 };
var PG = JSON.parse(JSON.stringify(DEFAULT_PAGE));
var CART = [], DC = '', ORDS = {}, CUR = 'THB', OO = '';
var LANG = 'TH'; // TH | EN
try { LANG = localStorage.getItem('jt_lang') || 'TH'; } catch (e) {}
function t(th, en) { return LANG === 'TH' ? th : en; }
function tlang() { LANG = LANG === 'TH' ? 'EN' : 'TH'; try { localStorage.setItem('jt_lang', LANG); } catch (e) {} applyHeader(); go(); }
function applyHeader() {
  try { document.documentElement.lang = LANG === 'TH' ? 'th' : 'en'; } catch (e) {}
  var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
  set('nh', t('หน้าแรก', 'HOME')); set('ns', t('ร้านค้า', 'SHOP')); set('nct', t('ตะกร้า', 'CART')); set('lng', LANG === 'TH' ? 'EN' : 'TH');
  var lg = document.getElementById('lg');
  if (lg) {
    if (!sb() || !SB_USER) { lg.textContent = t('เข้าสู่ระบบ', 'LOGIN'); lg.href = '#/admin/system/supabase'; }
    else if (isStaff()) { lg.textContent = t('หลังร้าน', 'ADMIN'); lg.href = '#/admin/dashboard'; }
    else { lg.textContent = t('บัญชีของฉัน', 'ACCOUNT'); lg.href = '#/account/orders'; }
  }
}
var STS = ['new', 'paid', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];
var F = { cat: '', size: '', color: '', av: '', sort: 'featured' };
var Q = 1, SEL = {}, E = null, EI = [], HS = null, PGS = null, HT = null, HT2 = null, HK = 0;
var SB_USER = null;
var SB_ROLE = 'guest'; // guest | member | shop_admin | owner
var SB_PROFILES = [];

/* ---------- roles ---------- */
function myRole() { return sb() ? SB_ROLE : 'owner'; } // local mode = เจ้าของเครื่องทำได้หมด
function isOwner() { return myRole() === 'owner'; }
function isStaff() { return myRole() === 'owner' || myRole() === 'shop_admin'; }
function isMember() { return myRole() === 'member' || isStaff(); }
function roleLabel() { return { guest: 'Guest', member: 'Member', shop_admin: 'Shop admin', owner: 'Owner' }[myRole()] || myRole(); }
async function loadRole() {
  var c = sb(); if (!c || !SB_USER) { SB_ROLE = c ? (SB_USER ? 'member' : 'guest') : 'owner'; return; }
  try {
    var r = await c.from('profiles').select('role').eq('id', SB_USER.id).single();
    SB_ROLE = (r.data && r.data.role) || 'member';
  } catch (e) { SB_ROLE = 'member'; }
}
var PROV = 'กรุงเทพมหานคร,กระบี่,กาญจนบุรี,กาฬสินธุ์,กำแพงเพชร,ขอนแก่น,จันทบุรี,ฉะเชิงเทรา,ชลบุรี,ชัยนาท,ชัยภูมิ,ชุมพร,เชียงราย,เชียงใหม่,ตรัง,ตราด,ตาก,นครนายก,นครปฐม,นครพนม,นครราชสีมา,นครศรีธรรมราช,นครสวรรค์,นนทบุรี,นราธิวาส,น่าน,บึงกาฬ,บุรีรัมย์,ปทุมธานี,ประจวบคีรีขันธ์,ปราจีนบุรี,ปัตตานี,พระนครศรีอยุธยา,พะเยา,พังงา,พัทลุง,พิจิตร,พิษณุโลก,เพชรบุรี,เพชรบูรณ์,แพร่,ภูเก็ต,มหาสารคาม,มุกดาหาร,แม่ฮ่องสอน,ยโสธร,ยะลา,ร้อยเอ็ด,ระนอง,ระยอง,ราชบุรี,ลพบุรี,ลำปาง,ลำพูน,เลย,ศรีสะเกษ,สกลนคร,สงขลา,สตูล,สมุทรปราการ,สมุทรสงคราม,สมุทรสาคร,สระแก้ว,สระบุรี,สิงห์บุรี,สุโขทัย,สุพรรณบุรี,สุราษฎร์ธานี,สุรินทร์,หนองคาย,หนองบัวลำภู,อ่างทอง,อำนาจเจริญ,อุดรธานี,อุตรดิตถ์,อุทัยธานี,อุบลราชธานี'.split(',');

/* ---------- helpers ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function $(s) { return document.querySelector(s); }
function T(m) { var t = $('#toast'); if (!t) return; t.textContent = m; t.classList.add('s'); clearTimeout(T.i); T.i = setTimeout(function () { t.classList.remove('s'); }, 2200); }
function thb(n) { return CUR == 'USD' ? '$' + Math.round(n / 35).toLocaleString('en-US') : '฿' + Number(n).toLocaleString('en-US'); }
function bt(n) { return '฿' + Number(n).toLocaleString('en-US'); }
function sb() { return (window.SB && SB.configured && SB.client) ? SB.client : null; }
function av(p) { return p.stock <= 0 ? ['so', 'Sold out'] : p.stock <= p.low ? ['lo', 'Low stock — ' + p.stock + ' left'] : ['', 'In stock']; }
function art(p, c) {
  var h = CM[c || p.colors[0]] || '#5a5d3a', s = '';
  if (p.cat == 'Apparel') s = '<path d="M140 70l-70 40-40 120 40 10 20-60v250h220V180l20 60 40-10-40-120-70-40c-10 25-30 38-60 38s-50-13-60-38z"/><path d="M200 108v312" fill="none"/>';
  else if (p.cat == 'Field Gear') s = '<rect x="110" y="90" width="180" height="300" rx="26"/><path d="M110 200h180M150 90V60h100v30" fill="none"/>';
  else if (p.cat == 'Accessories') s = '<path d="M60 300c0-90 60-150 140-150s140 60 140 150z"/><path d="M60 300h280l40 20H20z"/>';
  else s = '<rect x="120" y="150" width="160" height="180" rx="10"/><path d="M120 240h160" fill="none"/>';
  return '<svg viewBox="0 0 400 480" aria-hidden="true" fill="' + h + '" stroke="#0a0a09" stroke-width="2">' + s + '</svg>';
}
function pic(p, i, c) {
  var m = IM[p.id], u = m && m[i];
  if (u && (/^https?:\/\//.test(u) || /^data:image\//.test(u))) return '<img src="' + u + '" alt="' + esc(p.name) + '" loading="lazy">';
  return art(p, c);
}
function gal(p) { var n = (IM[p.id] || []).length || 3, h = ''; for (var i = 0; i < n; i++) h += '<div class="pn">' + pic(p, i, SEL.c) + '</div>'; return '<div class="gl">' + h + '</div>'; }
function list() { return P.filter(function (p) { return p.status == 'active'; }); }
function gp(id) { return P.filter(function (p) { return p.id == id; })[0]; }
function cnt() { var n = 0; CART.forEach(function (l) { n += l.qty; }); var e = $('#cc'); if (e) e.textContent = n; }

/* ---------- load / save ---------- */
function loadLocal() {
  try { var L = JSON.parse(localStorage.getItem('jg_cat')); if (L && L.length) P = L; } catch (e) {}
  try { var LI = JSON.parse(localStorage.getItem('jg_img')); if (LI) IM = LI; } catch (e) {}
  try { var LH = JSON.parse(localStorage.getItem('jg_home')); if (LH && LH.slides && LH.slides.length) H = LH; } catch (e) {}
  try { var LP = JSON.parse(localStorage.getItem('jg_page')); if (LP && LP.show) PG = LP; } catch (e) {}
  try { CART = JSON.parse(localStorage.getItem('jg_cart')) || []; } catch (e) { CART = []; }
  try { ORDS = JSON.parse(localStorage.getItem('jg_orders')) || {}; } catch (e) { ORDS = {}; }
  try { CUR = localStorage.getItem('jg_cur') || 'THB'; } catch (e) {}
  if (H.logo == null) H.logo = 1; if (H.wm == null) H.wm = 1;
  fixPG();
}
function fixPG() {
  if (!PG.codes) PG.codes = [{ c: 'FIELD10', t: 'pct', v: 10 }, { c: 'WELCOME100', t: 'fixed', v: 100 }, { c: 'FREESHIP', t: 'ship', v: 0 }];
  if (!PG.ship) PG.ship = { rate: 60, free: 2000 };
}
function saveLocal() {
  try { localStorage.setItem('jg_cat', JSON.stringify(P)); } catch (e) {}
  try { localStorage.setItem('jg_img', JSON.stringify(IM)); } catch (e) { T('Images are too large to keep in this browser'); }
  try { localStorage.setItem('jg_cart', JSON.stringify(CART)); } catch (e) {}
  try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
}
async function loadSupabase() {
  var c = sb(); if (!c) return false;
  try {
    var pr = await c.from('products').select('*').order('created_at');
    if (pr.data && pr.data.length) {
      P = pr.data.map(function (r) {
        return { id: r.id, name: r.name, sku: r.sku, barcode: r.barcode || '', cat: r.category, coll: r.collection, price: r.price, compare: r.compare_at, cost: r.cost, stock: r.stock, low: r.low_threshold, status: r.status, featured: r.featured, colors: r.colors || ['Black'], sizes: r.sizes || ['One size'], tags: r.tags || '', desc: r.description || '', spec: r.spec || '', material: r.material || '', dims: r.dims || '', notes: r.notes || '' };
      });
      IM = {}; pr.data.forEach(function (r) { if (r.image_urls && r.image_urls.length) IM[r.id] = r.image_urls; });
    }
    var sl = await c.from('slides').select('*').order('position');
    if (sl.data && sl.data.length) {
      H.slides = sl.data.map(function (r) { return { id: r.id, h: r.headline, sub: r.subheadline, b1: r.btn1_text, l1: r.btn1_link, b2: r.btn2_text, l2: r.btn2_link, img: r.image_url || '' }; });
    }
    var cf = await c.from('site_configs').select('*');
    if (cf.data) cf.data.forEach(function (r) { if (r.key == 'home') { H.secs = r.value.secs || 7; H.logo = r.value.logo == 0 ? 0 : 1; H.wm = r.value.wm == 0 ? 0 : 1; } if (r.key == 'page') { PG = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PAGE)), r.value); } });
    var se = await c.auth.getSession(); SB_USER = se.data.session ? se.data.session.user : null;
    await loadRole();
    var od;
    if (!SB_USER) od = { data: [] };
    else if (isStaff()) od = await c.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
    else od = await c.from('orders').select('*').eq('user_id', SB_USER.id).order('created_at', { ascending: false }).limit(200);
    if (od.data) od.data.forEach(function (r) {
      ORDS[r.order_no] = { no: r.order_no, at: r.created_at, cust: r.customer, addr: r.address, items: r.items, sub: r.subtotal, d: r.discount, ship: r.shipping, total: r.total, code: r.discount_code, pay: r.payment_method, status: r.status, track: r.tracking, note: r.note, stockDone: r.stock_deducted, log: r.log || [] };
    });
    fixPG(); return true;
  } catch (e) { console.warn('supabase load failed', e); return false; }
}
async function dbUpsertProduct(o) {
  var c = sb(); if (!c) return;
  await c.from('products').upsert({ id: o.id, name: o.name, sku: o.sku, barcode: o.barcode, category: o.cat, collection: o.coll, price: o.price, compare_at: o.compare, cost: o.cost, stock: o.stock, low_threshold: o.low, status: o.status, featured: o.featured ? 1 : 0, colors: o.colors, sizes: o.sizes, tags: o.tags, description: o.desc, spec: o.spec, material: o.material, dims: o.dims, notes: o.notes, image_urls: IM[o.id] || [] }, { onConflict: 'id' });
}
async function dbDeleteProduct(id) { var c = sb(); if (!c) return; await c.from('products').delete().eq('id', id); }
async function dbSaveOrder(o) {
  var c = sb(); if (!c) return;
  await c.from('orders').insert({ order_no: o.no, customer: o.cust, address: o.addr, items: o.items, subtotal: o.sub, discount: o.d, shipping: o.ship, total: o.total, discount_code: o.code, payment_method: o.pay, status: o.status, tracking: o.track, note: o.note, stock_deducted: o.stockDone, log: o.log, user_id: (SB_USER && SB_USER.id) || null, customer_email: ((o.cust && o.cust.email) || '').toLowerCase() });
}
async function dbUpdateOrder(no, patch) { var c = sb(); if (!c) return; await c.from('orders').update(patch).eq('order_no', no); }
async function dbSavePage() {
  var c = sb(); if (!c) return;
  await c.from('site_configs').upsert({ key: 'page', value: PG }, { onConflict: 'key' });
  await c.from('site_configs').upsert({ key: 'home', value: { secs: H.secs, logo: H.logo, wm: H.wm } }, { onConflict: 'key' });
  for (var i = 0; i < H.slides.length; i++) { var s = H.slides[i]; await c.from('slides').upsert({ id: s.id, headline: s.h, subheadline: s.sub, btn1_text: s.b1, btn1_link: s.l1, btn2_text: s.b2, btn2_link: s.l2, image_url: s.img || '', position: i }, { onConflict: 'id' }); }
}

/* ---------- shop ---------- */
function shop() {
  var sizes = {}, cols = {}; list().forEach(function (p) { p.sizes.forEach(function (x) { sizes[x] = 1; }); p.colors.forEach(function (x) { cols[x] = 1; }); });
  var r = list().filter(function (p) { return (!F.cat || p.cat == F.cat) && (!F.size || p.sizes.indexOf(F.size) > -1) && (!F.color || p.colors.indexOf(F.color) > -1) && (!F.av || (F.av == 'in' ? p.stock > 0 : p.stock <= 0)); });
  if (F.sort == 'lo') r.sort(function (a, b) { return a.price - b.price; }); else if (F.sort == 'hi') r.sort(function (a, b) { return b.price - a.price; }); else if (F.sort == 'new') r.reverse(); else r.sort(function (a, b) { return b.featured - a.featured; });
  function sel(k, l, o) { return '<label><span class="sm">' + l + '</span><select onchange="F.' + k + '=this.value;go()"><option value="">' + t('ทั้งหมด', 'All') + '</option>' + o.map(function (x) { return '<option' + (F[k] == x[0] ? ' selected' : '') + ' value="' + esc(x[0]) + '">' + esc(x[1]) + '</option>'; }).join('') + '</select></label>'; }
  return '<div class="top"><h1>' + t('คอลเลกชัน', 'Collection') + '</h1><span class="sm">' + r.length + ' ' + t('สินค้า', 'products') + (sb() ? ' · live' : ' · local') + '</span></div><div class="fl">' +
    sel('cat', t('หมวด', 'Category'), CAT.map(function (x) { return [x, x]; })) + sel('size', t('ไซส์', 'Size'), Object.keys(sizes).map(function (x) { return [x, x]; })) + sel('color', t('สี', 'Color'), Object.keys(cols).map(function (x) { return [x, x]; })) +
    sel('av', t('สถานะ', 'Availability'), [['in', t('มีของ', 'In stock')], ['out', t('หมด', 'Sold out')]]) + '<label><span class="sm">' + t('เรียง', 'Sort') + '</span><select onchange="F.sort=this.value;go()">' + [['featured', t('แนะนำ', 'Featured')], ['new', t('ใหม่สุด', 'Newest')], ['lo', t('ถูก→แพง', 'Price low-high')], ['hi', t('แพง→ถูก', 'Price high-low')]].map(function (x) { return '<option value="' + x[0] + '"' + (F.sort == x[0] ? ' selected' : '') + '>' + x[1] + '</option>'; }).join('') + '</select></label></div>' +
    (r.length ? '<div class="gr">' + r.map(function (p) { var a = av(p); return '<div class="cd"><a href="#/p/' + esc(p.id) + '" class="pn">' + pic(p, 0) + '</a><div class="in"><h3>' + esc(p.name) + '</h3><div class="row"><span>' + thb(p.price) + (p.compare > p.price ? ' <s style="color:var(--cn)">' + thb(p.compare) + '</s>' : '') + '</span><span class="dots">' + p.colors.map(function (c) { return '<i title="' + esc(c) + '" style="background:' + (CM[c] || '#555') + '"></i>'; }).join('') + '</span></div><div class="row"><span class="av ' + a[0] + '"><b></b>' + a[1] + '</span>' + (p.stock > 0 ? '<button class="btn s" onclick="qadd(\'' + esc(p.id) + '\')">' + t('หยิบใส่ตะกร้า', 'Quick add') + '</button>' : '') + '</div></div></div>'; }).join('') + '</div>' : '<p>' + t('ไม่พบสินค้าตามเงื่อนไข', 'No products match these filters.') + '</p>');
}
var n = 0;
function qadd(id) { var p = gp(id); cadd(id, p.colors[0], p.sizes[0], 1); }

/* ---------- product ---------- */
function prod(id) {
  var p = P.filter(function (x) { return x.id == id; })[0];
  if (!p || p.status != 'active') return '<p>' + t('สินค้านี้ไม่พร้อมขาย', 'This product is not available.') + ' <a href="#/shop" style="text-decoration:underline">' + t('กลับไปดูสินค้า', 'Back to collection') + '</a></p>';
  SEL.c = SEL.c && p.colors.indexOf(SEL.c) > -1 ? SEL.c : p.colors[0]; SEL.s = SEL.s && p.sizes.indexOf(SEL.s) > -1 ? SEL.s : p.sizes[0]; var a = av(p);
  function dt(t, x, d) { return '<details><summary>' + t + '</summary><p>' + esc(x || d || 'Details will be added soon.') + '</p></details>'; }
  return '<p class="sm" style="margin-bottom:20px"><a href="#/shop">Collection</a> / ' + esc(p.cat) + '</p><div class="pp">' + gal(p) +
    '<div class="pi"><span class="sm">' + esc(p.coll) + '</span><h1>' + esc(p.name) + '</h1><div class="price">' + thb(p.price) + (p.compare > p.price ? '<s>' + thb(p.compare) + '</s>' : '') + '</div><p style="color:#b9b8ae">' + esc(p.desc) + '</p>' +
    '<div><span class="sm">' + t('สี', 'Color') + ' — ' + esc(SEL.c) + '</span><div class="opt">' + p.colors.map(function (c) { return '<button class="sw" aria-label="' + esc(c) + '" aria-pressed="' + (c == SEL.c) + '" onclick="SEL.c=\'' + esc(c) + '\';go()"><i style="background:' + (CM[c] || '#555') + '"></i></button>'; }).join('') + '</div></div>' +
    '<div><span class="sm">' + t('ไซส์', 'Size') + '</span><div class="opt">' + p.sizes.map(function (s) { return '<button aria-pressed="' + (s == SEL.s) + '" onclick="SEL.s=\'' + esc(s) + '\';go()">' + esc(s) + '</button>'; }).join('') + '</div></div>' +
    '<div class="av ' + a[0] + '"><b></b>' + a[1] + '</div><div class="qty"><button aria-label="Less" onclick="Q=Math.max(1,Q-1);go()">–</button><span>' + Q + '</span><button aria-label="More" onclick="Q++;go()">+</button></div>' +
    (p.stock > 0 ? '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn p" onclick="cadd(\'' + esc(p.id) + '\',SEL.c,SEL.s,' + Q + ')">' + t('หยิบใส่ตะกร้า', 'Add to cart') + '</button><button class="btn" onclick="cadd(\'' + esc(p.id) + '\',SEL.c,SEL.s,' + Q + ',1);location.hash=\'#/checkout\'">' + t('ซื้อเลย', 'Buy now') + '</button></div>' : '<button class="btn" disabled style="opacity:.5">' + t('หมด', 'Sold out') + '</button>') +
    '<div style="margin-top:12px">' + dt('Description', p.desc) + dt('Specifications', p.spec) + dt('Material', p.material) + dt('Dimensions', p.dims) + dt('Field notes', p.notes) + dt('Care', 'Machine wash cold, hang dry. Do not bleach.') + dt('Shipping', 'Ships within 1–2 business days across Thailand.') + dt('Returns', 'Unused items can be returned within 14 days.') + '</div></div></div>';
}

/* ---------- cart / checkout ---------- */
function csave() { try { localStorage.setItem('jg_cart', JSON.stringify(CART)); } catch (e) {} cnt(); }
function cadd(id, c, s, q, quiet) {
  var p = gp(id), mx = p ? p.stock : 0, f = CART.filter(function (x) { return x.id == id && x.c == c && x.s == s; })[0];
  if (mx < 1) { T('Sold out'); return; }
  if (f) f.qty = Math.min(mx, f.qty + q); else CART.push({ id: id, c: c, s: s, qty: Math.min(mx, q) });
  csave(); if (!quiet) T('Added to cart');
}
function cq(i, d) { var l = CART[i], p = gp(l.id); l.qty = Math.max(1, Math.min(p ? p.stock : 1, l.qty + d)); csave(); go(); }
function crm(i) { CART.splice(i, 1); csave(); go(); }
function calc() {
  var sub = 0; CART.forEach(function (l) { var p = gp(l.id); if (p) sub += p.price * l.qty; });
  var d = 0, fs = 0, c = DC && PG.codes.filter(function (x) { return String(x.c).toUpperCase() == DC; })[0];
  if (c) { var v = +c.v || 0; if (c.t == 'pct') d = Math.round(sub * Math.min(100, v) / 100); else if (c.t == 'fixed') d = Math.min(sub, v); else fs = 1; }
  var ship = (sub == 0 || fs || sub - d >= (+PG.ship.free || 0)) ? 0 : (+PG.ship.rate || 0);
  return { sub: sub, d: d, ship: ship, total: sub - d + ship, code: c };
}
function dapply() { var v = ($('#dc').value || '').trim().toUpperCase(); DC = ''; if (v) { if (PG.codes.some(function (x) { return String(x.c).toUpperCase() == v; })) { DC = v; T('Code applied'); } else T('Code not found'); } go(); }
function ln(l, v, b) { return '<div class="row"' + (b ? ' style="font:700 24px var(--hd);letter-spacing:.04em;border-top:1px solid var(--ln);padding-top:10px"' : '') + '><span>' + l + '</span><span>' + v + '</span></div>'; }
function sumbox(r, cart) {
  return '<div style="display:grid;gap:10px;' + (cart ? 'max-width:420px;margin:32px 0 0 auto' : '') + '">' + (cart ? '<div style="display:flex;gap:8px"><input id="dc" placeholder="' + t('โค้ดส่วนลด', 'Discount code') + '" value="' + esc(DC) + '" style="flex:1"><button class="btn s" onclick="dapply()">' + t('ใช้', 'Apply') + '</button></div>' : '') + ln(t('ยอดรวมย่อย', 'Subtotal'), thb(r.sub)) + (r.d ? ln(t('ส่วนลด', 'Discount') + (DC ? ' (' + esc(DC) + ')' : ''), '– ' + thb(r.d)) : '') + (DC && r.code && r.code.t == 'ship' ? ln(t('ส่วนลด', 'Discount') + ' (' + esc(DC) + ')', t('ส่งฟรี', 'Free shipping')) : '') + ln(t('ค่าส่ง', 'Shipping'), r.ship ? thb(r.ship) : t('ฟรี', 'Free')) + ln(t('ยอดรวม', 'Total'), thb(r.total), 1) + (cart ? '<a class="btn p" style="text-align:center" href="#/checkout">' + t('ชำระเงิน', 'Checkout') + '</a>' : '') + '</div>';
}
function cartView() {
  var t0 = '<div class="top"><h1>' + t('ตะกร้า', 'Cart') + '</h1></div>';
  if (!CART.length) return t0 + '<p>' + t('ตะกร้าว่าง', 'Your cart is empty.') + ' <a href="#/shop" style="text-decoration:underline">' + t('ดูสินค้า', 'Browse the collection') + '</a></p>';
  var rows = CART.map(function (l, i) { var p = gp(l.id); if (!p) return ''; return '<tr><td><a href="#/p/' + esc(p.id) + '">' + esc(p.name) + '</a></td><td>' + esc(l.c) + ' / ' + esc(l.s) + '</td><td><div class="qty"><button onclick="cq(' + i + ',-1)">–</button><span>' + l.qty + '</span><button onclick="cq(' + i + ',1)">+</button></div></td><td>' + thb(p.price) + '</td><td>' + thb(p.price * l.qty) + '</td><td><button class="btn s d" onclick="crm(' + i + ')">' + t('ลบ', 'Remove') + '</button></td></tr>'; }).join('');
  return t0 + '<div class="sc"><table class="tb"><tr><th>' + t('สินค้า', 'Product') + '</th><th>' + t('แบบ', 'Variant') + '</th><th>' + t('จำนวน', 'Quantity') + '</th><th>' + t('ราคา', 'Price') + '</th><th>' + t('รวม', 'Subtotal') + '</th><th></th></tr>' + rows + '</table></div>' + sumbox(calc(), 1);
}
function checkoutView() {
  if (!CART.length) return '<div class="top"><h1>' + t('ชำระเงิน', 'Checkout') + '</h1></div><p>' + t('ตะกร้าว่าง', 'Your cart is empty.') + '</p>';
  function f(id, l, ph, c, t, ac) { return '<label class="' + (c || '') + '">' + l + '<input id="' + id + '" type="' + (t || 'text') + '" placeholder="' + ph + '" autocomplete="' + (ac || 'off') + '"></label>'; }
  var pays = [['promptpay', 'PromptPay', 'Scan QR จากแอปธนาคารหลังสั่งซื้อ'], ['card', 'Credit / debit card', 'จ่ายผ่าน payment provider'], ['bank', 'Bank transfer', 'โอนแล้วแนบสลิป']];
  var items = CART.map(function (l) { var p = gp(l.id); return p ? '<div class="row"><span>' + esc(p.name) + ' <span class="sm">' + esc(l.c) + ' / ' + esc(l.s) + ' × ' + l.qty + '</span></span><span>' + thb(p.price * l.qty) + '</span></div>' : ''; }).join('');
  return '<div class="top"><h1>' + t('ชำระเงิน', 'Checkout') + '</h1><a class="sm" href="#/cart">' + t('กลับไปตะกร้า', 'Back to cart') + '</a></div><div class="ck"><div><div class="fm" style="grid-template-columns:1fr 1fr">' + f('em', 'Email', 'name@example.com', 'w2', 'email', 'email') + f('nm', t('ชื่อ-นามสกุล', 'Full name'), 'ชื่อ-นามสกุล', 'w2') + f('ph', t('โทรศัพท์', 'Phone'), '081 234 5678', 'w2', 'tel', 'tel') + f('ad', t('ที่อยู่', 'Address'), 'บ้านเลขที่ หมู่ ซอย ถนน', 'w2', 'text', 'street-address') + f('sd', t('แขวง/ตำบล', 'Subdistrict'), '', '', 'text') + f('ds', t('เขต/อำเภอ', 'District'), '', '', 'text') +
    '<label>' + t('จังหวัด', 'Province') + '<input id="pv" list="pvl" placeholder="' + t('เลือกหรือพิมพ์จังหวัด', 'Select province') + '"></label><datalist id="pvl">' + PROV.map(function (p) { return '<option value="' + p + '">'; }).join('') + '</datalist>' + f('zp', t('รหัสไปรษณีย์', 'Postcode'), '10110', '', 'text', 'postal-code') + '</div>' +
    '<h3 style="font-size:28px;margin:28px 0 12px">' + t('ชำระเงิน', 'Payment') + '</h3><div style="display:grid;gap:10px">' + pays.map(function (a, i) { return '<label class="pay"><input type="radio" name="pay" value="' + a[0] + '"' + (i ? '' : ' checked') + '><span><b>' + a[1] + '</b><br>' + a[2] + '</span></label>'; }).join('') + '</div></div>' +
    '<div class="fm" style="grid-template-columns:1fr;position:sticky;top:80px"><h3 style="font-size:28px">' + t('สรุปคำสั่งซื้อ', 'Order summary') + '</h3>' + items + sumbox(calc(), 0) + '<button class="btn p" onclick="place()">' + t('สั่งซื้อ', 'Place order') + '</button></div></div>';
}
function place() {
  var g = function (i) { return (document.getElementById(i).value || '').trim(); }, em = g('em'), ph = g('ph').replace(/[\s-]/g, '').replace(/^\+66/, '0'), zp = g('zp'), err = null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) err = 'Enter a valid email address';
  else if (!g('nm')) err = 'Enter your full name';
  else if (!/^0\d{8,9}$/.test(ph)) err = 'Enter a Thai phone number, e.g. 081 234 5678';
  else if (!g('ad') || !g('sd') || !g('ds') || !g('pv')) err = 'Complete the address';
  else if (!/^\d{5}$/.test(zp)) err = 'Postcode must be 5 digits';
  if (err) { T(err); return; }
  var items = [], bad = 0;
  CART.forEach(function (l) { var p = gp(l.id); if (!p || p.stock < l.qty) { bad = 1; return; } items.push({ id: p.id, name: p.name, sku: p.sku, c: l.c, s: l.s, qty: l.qty, price: p.price }); });
  if (bad || !items.length) { T('Some items are no longer available.'); return; }
  var r = calc(), now = new Date().toISOString();
  var o = { no: 'JT-' + Date.now().toString(36).toUpperCase(), at: now, cust: { email: em, name: g('nm'), phone: ph }, addr: { line: g('ad'), sub: g('sd'), dist: g('ds'), prov: g('pv'), zip: zp }, items: items, sub: r.sub, d: r.d, ship: r.ship, total: r.total, code: DC, pay: document.querySelector('input[name=pay]:checked').value, status: 'new', track: '', note: '', stockDone: 0, log: [{ t: now, s: 'Order placed' }] };
  ORDS[o.no] = o; try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
  dbSaveOrder(o); CART = []; DC = ''; csave(); location.hash = '#/done/' + o.no;
}
function doneView(no) {
  var o = ORDS[no]; if (!o) return '<div class="top"><h1>Order not found</h1></div>';
  var m = { promptpay: 'Pay ' + bt(o.total) + ' with PromptPay. QR จะแสดงหลังต่อ payment provider', card: 'Card payment ยังไม่ต่อ provider — ยังไม่ตัดเงิน', bank: 'โอนแล้วแจ้งสลิปพร้อมเลข ' + esc(o.no) }[o.pay];
  return '<div class="top"><h1>Order placed</h1></div><p>Order <b>' + esc(o.no) + '</b></p><div class="fm" style="grid-template-columns:1fr;max-width:640px;margin-top:24px"><h3 style="font-size:28px">Next: payment</h3><p>' + m + '</p></div><a class="btn" href="#/shop">Continue shopping</a>';
}

/* ---------- home ---------- */
function safe(u) { return /^(#\/|https:\/\/)/.test(u || '') ? u : '#/shop'; }
function simg(u) { return /^https?:\/\//.test(u || '') || /^data:image\//.test(u || '') ? u : ''; }
function card(p) { var a = av(p); return '<div class="cd"><a href="#/p/' + esc(p.id) + '" class="pn">' + pic(p, 0) + '</a><div class="in"><h3>' + esc(p.name) + '</h3><div class="row"><span>' + thb(p.price) + '</span><span class="av ' + a[0] + '"><b></b>' + a[1] + '</span></div></div></div>'; }
function homeView() {
  var sl = H.slides, sh = PG.show, CC = ['#2f3123', '#3a352a', '#2a2b2a', '#4a4d33'], SC = ['#2d2f22', '#232420', '#2d2a21', '#1b1c19', '#35382a'];
  var h = '<div class="hero">' + sl.map(function (s, i) { var u = simg(s.img); return '<div class="sl' + (i ? '' : ' on') + '">' + (u ? '<img src="' + u + '" alt="">' : '') + '<div class="tx"><h1>' + esc(s.h) + '</h1>' + (s.sub ? '<p>' + esc(s.sub) + '</p>' : '') + (s.b1 ? '<a class="btn p" href="' + esc(safe(s.l1)) + '">' + esc(s.b1) + '</a>' : '') + (s.b2 ? '<a class="btn" href="' + esc(safe(s.l2)) + '">' + esc(s.b2) + '</a>' : '') + '</div></div>'; }).join('') + (sl.length > 1 ? '<div class="hd">' + sl.map(function (s, i) { return '<button aria-label="Slide ' + (i + 1) + '" class="' + (i ? '' : 'on') + '" onclick="hshow(' + i + ',1)"></button>'; }).join('') + '</div>' : '') + '</div>';
  if (sh.cats) h += '<section class="sec"><div class="w"><div class="top"><h2 style="font-size:clamp(40px,6vw,88px)">Collection</h2><a class="sm" href="#/shop">View all</a></div><div class="cats">' + PG.cats.map(function (c, i) { return '<a class="cat pn" href="' + esc(safe(c.l)) + '" style="background:linear-gradient(160deg,' + CC[i % 4] + ',#12130f)"><h3>' + esc(c.t) + '</h3></a>'; }).join('') + '</div></div></section>';
  if (sh.brand) h += '<section class="sec st"><div class="w"><h2>' + esc(PG.brand.h) + '</h2><p>' + esc(PG.brand.p) + '</p></div></section>';
  var fp = list().filter(function (p) { return p.featured; })[0];
  if (sh.featured && fp) { var a = av(fp); h += '<div class="fp"><div class="pn">' + pic(fp, 0) + '</div><div class="in2"><span class="sm">' + esc(fp.coll) + '</span><h2>' + esc(fp.name) + '</h2><div class="price" style="font:700 32px var(--hd)">' + thb(fp.price) + '</div><p style="color:#b9b8ae;max-width:46ch">' + esc(fp.desc) + '</p><div class="av ' + a[0] + '"><b></b>' + a[1] + '</div><div><a class="btn p" href="#/p/' + esc(fp.id) + '">View product</a></div></div></div>'; }
  if (sh.stories) h += '<section class="sec"><div class="w"><div class="top"><h2 style="font-size:clamp(40px,6vw,88px)">Field stories</h2></div><div class="sg">' + PG.stories.map(function (c, i) { return '<a class="sc pn" href="' + esc(safe(c.l)) + '" style="background:linear-gradient(180deg,' + SC[i % 5] + ',#0e0e0b)"><span class="sm">' + esc(c.k) + '</span><h3>' + esc(c.t) + '</h3></a>'; }).join('') + '</div></div></section>';
  var d = PG.drop; if (sh.drop && d.on) h += '<div class="drop"><div class="w"><div><span class="sm">' + esc(d.label) + '</span><h2>' + esc(d.h) + '</h2></div><div><div class="cdn"><div><b id="dd">00</b><span class="sm">Days</span></div><div><b id="dh">00</b><span class="sm">Hours</span></div><div><b id="dm">00</b><span class="sm">Min</span></div><div><b id="ds">00</b><span class="sm">Sec</span></div></div><p style="margin-bottom:20px">' + esc(d.p) + '</p>' + (d.b ? '<a class="btn" href="' + esc(safe(d.l)) + '">' + esc(d.b) + '</a>' : '') + '</div></div></div>';
  if (sh.news) h += '<section class="sec nl"><div class="w"><h2 style="font-size:clamp(40px,7vw,100px)">' + esc(PG.news.h) + '</h2>' + (PG.news.p ? '<p style="color:#b9b8ae;margin-top:12px">' + esc(PG.news.p) + '</p>' : '') + '<form onsubmit="nsub(event)"><input type="email" required placeholder="email@example.com"><button type="submit">Subscribe</button></form></div></section>';
  return h;
}
function hshow(i, m) { var l = document.querySelectorAll('.sl'), d = document.querySelectorAll('.hd button'); if (!l.length) return; HK = i % l.length; l.forEach(function (e, j) { e.classList.toggle('on', j == HK); }); d.forEach(function (e, j) { e.classList.toggle('on', j == HK); }); if (m) heroInit(1); }
function heroInit(k) { clearInterval(HT); if (!k) HK = 0; if (H.slides.length < 2) return; HT = setInterval(function () { hshow(HK + 1); }, Math.max(3, H.secs || 7) * 1000); }
function nsub(e) { e.preventDefault(); T('Subscribed. See you in the field.'); e.target.reset(); }
function dropInit() {
  clearInterval(HT2); if (!document.getElementById('dd')) return;
  function t() { var d = new Date((PG.drop.at || '') + ':00+07:00').getTime() - Date.now(); d = isNaN(d) ? 0 : Math.max(0, d); var p = function (x) { return String(x).padStart(2, '0'); }, set = function (i, v) { var e = document.getElementById(i); if (e) e.textContent = v; }; set('dd', p(Math.floor(d / 864e5))); set('dh', p(Math.floor(d / 36e5) % 24)); set('dm', p(Math.floor(d / 6e4) % 60)); set('ds', p(Math.floor(d / 1e3) % 60)); }
  t(); HT2 = setInterval(t, 1000);
}

/* ---------- admin: products ---------- */
function fld(k, l, t, c) { var v = E[k]; if (Array.isArray(v)) v = v.join(', '); return '<label class="' + (c || '') + '">' + l + (t == 'ta' ? '<textarea data-k="' + k + '">' + esc(v) + '</textarea>' : '<input data-k="' + k + '" type="' + (t || 'text') + '" value="' + esc(v) + '">') + '</label>'; }
function admin() {
  var h = '<div class="top"><h1>Products</h1>' + (isOwner() ? '<button class="btn p" onclick="edit(-1)">New product</button>' : '<span class="sm">' + esc(roleLabel()) + (myRole() === 'shop_admin' ? ' · แก้ได้เฉพาะสต็อก' : '') + '</span>') + '</div>' + (sb() ? (SB_USER ? '<p class="sm">Supabase · ' + esc(SB_USER.email) + ' · ' + esc(roleLabel()) + ' · <a href="#" onclick="sbLogout();return false" style="text-decoration:underline">logout</a></p>' : '<p class="sm">Supabase connected · <a href="#/admin/system/supabase" style="text-decoration:underline">login เพื่อเขียนข้อมูล</a></p>') : '<div class="note">Local mode — ต่อ Supabase ที่เมนู SYSTEM › Supabase</div>');
  if (E) h += form();
  h += '<div class="sc"><table class="tb"><tr><th>Product</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>' + P.map(function (p, i) { return '<tr><td>' + esc(p.name) + (p.featured ? ' <span class="sm">★</span>' : '') + '</td><td>' + esc(p.sku) + '</td><td>' + thb(p.price) + '</td><td' + (p.stock <= p.low ? ' style="color:var(--sd)"' : '') + '>' + p.stock + '</td><td><span class="bd ' + p.status + '">' + p.status + '</span></td><td><button class="btn s" onclick="edit(' + i + ')">' + (myRole() === 'shop_admin' ? 'Stock' : 'Edit') + '</button>' + (isStaff() ? ' <button class="btn s" onclick="arch(' + i + ')">' + (p.status == 'archived' ? 'Restore' : 'Archive') + '</button>' : '') + (isOwner() ? ' <button class="btn s d" onclick="del(' + i + ')">Delete</button>' : '') + '</td></tr>'; }).join('') + '</table></div>'; return h;
}
function form() {
  var ro = myRole() === 'shop_admin' ? '<div class="note w4">Shop admin: แก้ได้เฉพาะ Stock / Low threshold / Status — ช่องอื่นจะถูกคงค่าเดิมตอนบันทึก</div>' : '';
  return '<div class="fm" id="fm">' + ro + fld('name', 'Name', '', 'w2') + fld('sku', 'SKU') + fld('barcode', 'Barcode') +
    '<label>Category<select data-k="cat">' + CAT.map(function (c) { return '<option' + (E.cat == c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>' + fld('coll', 'Collection') +
    '<label>Status<select data-k="status">' + ['active', 'draft', 'archived'].map(function (c) { return '<option' + (E.status == c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>' +
    '<label>Featured<select data-k="featured"><option value="0">No</option><option value="1"' + (E.featured ? ' selected' : '') + '>Yes</option></select></label>' +
    fld('price', 'Price (THB)', 'number') + fld('compare', 'Compare-at', 'number') + fld('cost', 'Cost', 'number') + fld('stock', 'Stock', 'number') + fld('low', 'Low threshold', 'number') +
    fld('colors', 'Colors (comma)', '', 'w2') + fld('sizes', 'Sizes (comma)', '', 'w2') + fld('tags', 'Tags', '', 'w4') + fld('desc', 'Short description', 'ta', 'w4') + fld('spec', 'Specifications', 'ta', 'w2') + fld('material', 'Material', 'ta', 'w2') + fld('dims', 'Dimensions', 'ta', 'w2') + fld('notes', 'Field notes', 'ta', 'w2') + imgui() + '<div class="w4" style="display:flex;gap:10px"><button class="btn p" onclick="commit()">Save product</button><button class="btn" onclick="E=null;go()">Cancel</button></div></div>';
}
function edit(i) { E = i < 0 ? mk('new-' + Date.now().toString(36), '', 'Apparel', 'Core', 0, 0, 0, 0, ['Black'], ['One size'], 0, '') : JSON.parse(JSON.stringify(P[i])); E._i = i; EI = (IM[E.id] || []).slice(); if (i < 0) { E.status = 'draft'; E.sku = ''; } go(); var f = $('#fm'); f && f.scrollIntoView({ behavior: 'smooth' }); }
async function commit() {
  if (!isStaff()) { T('ต้อง login เป็น staff'); return; }
  if (!isOwner() && myRole() === 'shop_admin' && arguments.length === 0) { /* stock-only enforced below */ }
  var o = JSON.parse(JSON.stringify(E)), i = o._i; delete o._i;
  document.querySelectorAll('#fm [data-k]').forEach(function (e) { var k = e.dataset.k, v = e.value; if (['price', 'compare', 'cost', 'stock', 'low'].indexOf(k) > -1) v = Math.max(0, parseInt(v, 10) || 0); else if (k == 'colors' || k == 'sizes') v = v.split(',').map(function (x) { return x.trim(); }).filter(Boolean); else if (k == 'featured') v = v == '1' ? 1 : 0; o[k] = v; });
  if (!o.name.trim()) { T('Enter a product name'); return; }
  if (!o.colors.length) o.colors = ['Black']; if (!o.sizes.length) o.sizes = ['One size'];
  if (o._new !== false && i < 0) o.id = 'p-' + Date.now().toString(36);
  if (!o.sku.trim()) o.sku = o.id.toUpperCase();
  if (myRole() === 'shop_admin' && i >= 0) {
    // shop_admin แก้ได้เฉพาะ stock/low/status — คงค่าอื่นจากของเดิม
    var keep = P[i]; ['name', 'sku', 'barcode', 'cat', 'coll', 'price', 'compare', 'cost', 'featured', 'colors', 'sizes', 'tags', 'desc', 'spec', 'material', 'dims', 'notes'].forEach(function (k) { o[k] = keep[k]; });
  }
  if (i < 0 && myRole() === 'shop_admin') { T('สร้างสินค้าได้เฉพาะ owner'); return; }
  if (i < 0) P.push(o); else { o.id = P[i].id; P[i] = o; }
  IM[o.id] = EI.slice(0, 4);
  saveLocal(); await dbUpsertProduct(o);
  E = null; T('Saved'); go();
}
async function arch(i) { if (!isStaff()) { T('ต้อง login เป็น staff'); return; } P[i].status = P[i].status == 'archived' ? 'draft' : 'archived'; saveLocal(); await dbUpsertProduct(P[i]); go(); }
async function del(i) { if (!isOwner()) { T('ลบสินค้าได้เฉพาะ owner'); return; } if (!confirm('Delete "' + P[i].name + '"?')) return; var id = P[i].id; P.splice(i, 1); delete IM[id]; saveLocal(); await dbDeleteProduct(id); go(); }

/* ---------- images (Storage-first) ---------- */
function sync() { document.querySelectorAll('#fm [data-k]').forEach(function (e) { var k = e.dataset.k; E[k] = k == 'featured' ? (e.value == '1' ? 1 : 0) : e.value; }); }
function redraw() { var y = scrollY; go(); scrollTo(0, y); }
function imgui() {
  return '<div class="w4"><span>Product images (' + EI.length + '/4)' + (sb() ? ' · Supabase Storage' : ' · local') + '</span><div class="im" style="margin-top:8px">' + EI.map(function (s, i) { return '<div><div class="pn"><img src="' + s + '" alt=""></div><div style="display:flex;gap:6px"><button class="btn s" onclick="imv(' + i + ')"' + (i ? '' : ' disabled') + '>Make first</button><button class="btn s d" onclick="irm(' + i + ')">Remove</button></div></div>'; }).join('') + '</div>' + (EI.length < 4 ? '<button class="btn s" style="margin-top:10px" onclick="document.getElementById(\'fi\').click()">Upload images</button><input id="fi" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onchange="iup(this.files)">' : '') + '<p style="font-size:12px">JPG/PNG/WebP สูงสุด 4 รูป รูปแรกคือปก ย่อเหลือ 1000px อัตโนมัติ' + (sb() ? ' อัปโหลดเข้า Storage bucket product-images' : '') + '</p></div>';
}
function imv(i) { sync(); EI.unshift(EI.splice(i, 1)[0]); redraw(); }
function irm(i) { sync(); EI.splice(i, 1); redraw(); }
function rsBlob(f, m) {
  m = m || 1000;
  return new Promise(function (res) {
    var im = new Image(), u = URL.createObjectURL(f);
    im.onload = function () { var k = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); var x = c.getContext('2d'); x.fillStyle = '#1a1b19'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(function (b) { c.toDataURL && 0; res({ blob: b, dataUrl: c.toDataURL('image/jpeg', .72) }); }, 'image/jpeg', .72); };
    im.onerror = function () { URL.revokeObjectURL(u); T('Could not read ' + f.name); res(null); }; im.src = u;
  });
}
async function iup(fs) {
  sync(); var ok = ['image/jpeg', 'image/png', 'image/webp'], all = [].slice.call(fs), l = all.slice(0, 4 - EI.length);
  if (all.length > l.length) T('Only 4 images per product');
  for (var j = 0; j < l.length; j++) {
    var f = l[j];
    if (ok.indexOf(f.type) < 0 || f.size > 15e6) { T('Skipped ' + f.name); continue; }
    var r = await rsBlob(f); if (!r) continue;
    var c = sb();
    if (c && E && E.id) {
      var path = E.id + '/' + Date.now().toString(36) + '-' + j + '.jpg';
      var up = await c.storage.from('product-images').upload(path, r.blob, { contentType: 'image/jpeg', upsert: true });
      if (up.error) { T('Upload failed, kept locally'); EI.push(r.dataUrl); }
      else { var pub = c.storage.from('product-images').getPublicUrl(path); EI.push(pub.data.publicUrl); }
    } else EI.push(r.dataUrl);
  }
  redraw();
}

/* ---------- admin: homepage / sections ---------- */
function adminHome() {
  if (!HS) HS = JSON.parse(JSON.stringify(H)); var s = HS.slides;
  function inp(i, k, l, ph, c) { return '<label class="' + (c || '') + '">' + l + '<input value="' + esc(HS.slides[i][k]) + '" placeholder="' + (ph || '') + '" oninput="hset(' + i + ',\'' + k + '\',this.value)"></label>'; }
  function hck(k, l) { return '<label style="flex-direction:row;align-items:center;gap:10px;text-transform:none;letter-spacing:0;font-size:14px;color:var(--ow)"><input type="checkbox"' + (HS[k] ? ' checked' : '') + ' onchange="HS.' + k + '=this.checked?1:0" style="width:18px;height:18px;min-width:0">' + l + '</label>'; }
  return '<div class="top"><h1>Homepage</h1><button class="btn p" onclick="hsave()">Save homepage</button></div>' + (sb() ? '' : '<div class="note">Local mode</div>') +
    '<div class="fm" style="grid-template-columns:1fr">' + hck('logo', 'Show brand logo') + hck('wm', 'Show watermark') + '<label>Seconds per slide<input type="number" min="3" max="30" value="' + HS.secs + '" oninput="HS.secs=Math.min(30,Math.max(3,+this.value||7))"></label></div>' +
    s.map(function (x, i) { var u = simg(x.img); return '<div class="fm" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))"><div style="display:grid;gap:8px;align-content:start"><div class="pn" style="aspect-ratio:16/9">' + (u ? '<img src="' + u + '" alt="">' : '<span style="position:absolute;inset:0;display:grid;place-items:center;z-index:1;font-size:12px">No image</span>') + '</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn s" onclick="document.getElementById(\'hf' + i + '\').click()">' + (u ? 'Replace' : 'Upload') + '</button>' + (u ? '<button class="btn s d" onclick="hset(' + i + ',\'img\',\'\',1)">Remove</button>' : '') + '<input id="hf' + i + '" type="file" accept="image/jpeg,image/png,image/webp" hidden onchange="hup(' + i + ',this.files)"></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' + inp(i, 'h', 'Headline', '', 'w2') + inp(i, 'sub', 'Subheadline', '', 'w2') + inp(i, 'b1', 'Button 1') + inp(i, 'l1', 'Link 1', '#/shop') + inp(i, 'b2', 'Button 2') + inp(i, 'l2', 'Link 2', '#/shop') +
      '<div class="w2" style="display:flex;gap:8px"><button class="btn s" onclick="hmv(' + i + ',-1)"' + (i ? '' : ' disabled') + '>Up</button><button class="btn s" onclick="hmv(' + i + ',1)"' + (i < s.length - 1 ? '' : ' disabled') + '>Down</button><button class="btn s d" onclick="hdel(' + i + ')"' + (s.length > 1 ? '' : ' disabled') + '>Delete</button></div></div></div>'; }).join('') + (s.length < 6 ? '<button class="btn" onclick="hadd()">Add slide</button>' : '');
}
function hset(i, k, v, r) { HS.slides[i][k] = v; if (r) redraw(); }
function hmv(i, d) { var a = HS.slides; a.splice(i + d, 0, a.splice(i, 1)[0]); redraw(); }
function hdel(i) { if (HS.slides.length > 1) { HS.slides.splice(i, 1); redraw(); } }
function hadd() { HS.slides.push({ id: 's' + Date.now().toString(36), h: 'New headline', sub: '', b1: 'Shop collection', l1: '#/shop', b2: '', l2: '#/shop', img: '' }); redraw(); }
async function hup(i, fs) {
  var f = fs[0]; if (!f) return;
  var r = await rsBlob(f, 1600); if (!r) return;
  var c = sb();
  if (c) { var path = 'slides/' + HS.slides[i].id + '-' + Date.now().toString(36) + '.jpg'; var up = await c.storage.from('slide-images').upload(path, r.blob, { contentType: 'image/jpeg', upsert: true }); if (!up.error) { var pub = c.storage.from('slide-images').getPublicUrl(path); HS.slides[i].img = pub.data.publicUrl; redraw(); return; } }
  HS.slides[i].img = r.dataUrl; redraw();
}
async function hsave() {
  if (!isOwner()) { T('แก้หน้าเว็บได้เฉพาะ owner'); return; }
  H = JSON.parse(JSON.stringify(HS));
  try { localStorage.setItem('jg_home', JSON.stringify(H)); } catch (e) {}
  await dbSavePage(); T('Homepage saved');
}
function pget(o, p) { return p.split('.').reduce(function (a, k) { return a && a[k]; }, o); }
function pset(p, v) { var a = p.split('.'), o = PGS; for (var i = 0; i < a.length - 1; i++) o = o[a[i]]; o[a[a.length - 1]] = v; }
function pin(p, l, t, c) { var v = pget(PGS, p); return '<label class="' + (c || '') + '">' + l + (t == 'ta' ? '<textarea oninput="pset(\'' + p + '\',this.value)">' + esc(v) + '</textarea>' : '<input value="' + esc(v) + '" oninput="pset(\'' + p + '\',this.value)">') + '</label>'; }
function pck(p, l, c) { return '<label class="' + (c || '') + '" style="flex-direction:row;align-items:center;gap:10px;text-transform:none;letter-spacing:0;font-size:14px"><input type="checkbox"' + (pget(PGS, p) ? ' checked' : '') + ' onchange="pset(\'' + p + '\',this.checked?1:0)" style="width:18px;height:18px">' + l + '</label>'; }
function psel(p, l, o, c) { var v = pget(PGS, p); return '<label class="' + (c || '') + '">' + l + '<select onchange="pset(\'' + p + '\',this.value)">' + o.map(function (a) { return '<option value="' + a[0] + '"' + (v == a[0] ? ' selected' : '') + '>' + a[1] + '</option>'; }).join('') + '</select></label>'; }
function adminSec() {
  if (!PGS) PGS = JSON.parse(JSON.stringify(PG));
  var h3 = function (t) { return '<h3 class="w4" style="font-size:28px">' + t + '</h3>'; }, x = '';
  x += '<div class="fm">' + h3('Show/hide') + [['cats', 'Collection'], ['brand', 'Brand'], ['featured', 'Featured'], ['stories', 'Stories'], ['drop', 'Drop'], ['news', 'Newsletter']].map(function (a) { return pck('show.' + a[0], a[1]); }).join('') + '</div>';
  x += '<div class="fm">' + h3('Collection cards') + [0, 1, 2, 3].map(function (i) { return pin('cats.' + i + '.t', 'Card ' + (i + 1), '', 'w2') + pin('cats.' + i + '.l', 'Link', '', 'w2'); }).join('') + '</div>';
  x += '<div class="fm">' + h3('Brand') + pin('brand.h', 'Headline', '', 'w4') + pin('brand.p', 'Paragraph', 'ta', 'w4') + '</div>';
  x += '<div class="fm">' + h3('Stories') + [0, 1, 2, 3, 4].map(function (i) { return pin('stories.' + i + '.k', 'Label') + pin('stories.' + i + '.t', 'Title', '', 'w2') + pin('stories.' + i + '.l', 'Link'); }).join('') + '</div>';
  x += '<div class="fm">' + h3('Drop') + pck('drop.on', 'Show drop', 'w4') + pin('drop.label', 'Label', '', 'w2') + pin('drop.h', 'Headline', '', 'w2') + pin('drop.p', 'Desc', 'ta', 'w4') + pin('drop.at', 'Release (GMT+7) datetime-local', 'datetime-local', 'w2') + pin('drop.b', 'Button') + pin('drop.l', 'Link') + '</div>';
  x += '<div class="fm">' + h3('Newsletter') + pin('news.h', 'Headline', '', 'w2') + pin('news.p', 'Text', '', 'w2') + '</div>';
  x += '<div class="fm">' + h3('Discount codes') + [0, 1, 2].map(function (i) { return pin('codes.' + i + '.c', 'Code') + psel('codes.' + i + '.t', 'Type', [['pct', 'Percent'], ['fixed', 'Fixed THB'], ['ship', 'Free ship']]) + pin('codes.' + i + '.v', 'Value', 'number') + '<span></span>'; }).join('') + '</div>';
  x += '<div class="fm">' + h3('Shipping') + pin('ship.rate', 'Flat rate', 'number', 'w2') + pin('ship.free', 'Free above', 'number', 'w2') + '</div>';
  return '<div class="top"><h1>Sections</h1><button class="btn p" onclick="psave()">Save sections</button></div>' + x;
}
async function psave() { if (!isOwner()) { T('แก้ sections ได้เฉพาะ owner'); return; } PG = JSON.parse(JSON.stringify(PGS)); try { localStorage.setItem('jg_page', JSON.stringify(PG)); } catch (e) {} await dbSavePage(); T('Sections saved'); }

/* ---------- admin: orders / customers / dashboard ---------- */
function adminOrd() {
  var L = Object.keys(ORDS).map(function (k) { return ORDS[k]; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; });
  var h = '<div class="top"><h1>Orders</h1><span class="sm">' + L.length + ' orders' + (sb() ? ' · Supabase' : ' · local') + '</span></div>';
  if (!L.length) return h + '<p>No orders yet.</p>';
  h += '<div class="sc"><table class="tb"><tr><th>Order</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr>';
  L.forEach(function (o) {
    var q = o.items.reduce(function (a, l) { return a + l.qty; }, 0), open = OO == o.no;
    h += '<tr style="cursor:pointer" onclick="OO=OO==\'' + o.no + '\'?\'\':\'' + o.no + '\';go()"><td>' + esc(o.no) + '</td><td>' + new Date(o.at).toLocaleDateString('en-GB') + '</td><td>' + esc(o.cust.name) + '</td><td>' + q + '</td><td>' + bt(o.total) + '</td><td>' + esc(o.pay) + '</td><td style="text-align:right"><span class="bd">' + o.status + '</span></td></tr>';
    if (open) h += '<tr><td colspan="7" style="text-align:left"><div class="fm" style="margin:0;border:0"><div class="w2"><b>Customer</b><br>' + esc(o.cust.name) + '<br>' + esc(o.cust.email) + '<br>' + esc(o.cust.phone) + '</div><div class="w2"><b>Ship to</b><br>' + esc(o.addr.line) + '<br>' + esc(o.addr.sub) + ', ' + esc(o.addr.dist) + '<br>' + esc(o.addr.prov) + ' ' + esc(o.addr.zip) + '</div><div class="w4">' + o.items.map(function (l) { return esc(l.name) + ' — ' + esc(l.c) + ' / ' + esc(l.s) + ' × ' + l.qty; }).join('<br>') + '<br><br><b>Total ' + bt(o.total) + '</b></div>' +
      '<label>Status<select onchange="ost(\'' + o.no + '\',this.value)">' + STS.map(function (x) { return '<option' + (o.status == x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label><label class="w2">Tracking<input value="' + esc(o.track) + '" onchange="oset(\'' + o.no + '\',\'track\',this.value)"></label><label class="w4">Note<textarea onchange="oset(\'' + o.no + '\',\'note\',this.value)">' + esc(o.note) + '</textarea></label></div></td></tr>';
  });
  return h + '</table></div><p class="sm">Stock ตัดเมื่อ mark paid</p>';
}
async function ost(no, v) {
  if (!isStaff()) { T('ต้อง login เป็น staff'); return; }
  var o = ORDS[no]; o.status = v; o.log.push({ t: new Date().toISOString(), s: 'Status → ' + v + ' by ' + myRole() });
  if (v == 'paid' && !o.stockDone) { o.items.forEach(function (l) { var p = gp(l.id); if (p) p.stock = Math.max(0, p.stock - l.qty); }); o.stockDone = 1; P.forEach(function (p) { dbUpsertProduct(p); }); saveLocal(); }
  try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
  await dbUpdateOrder(no, { status: v, tracking: o.track, note: o.note, log: o.log, stock_deducted: o.stockDone ? 1 : 0 });
  go();
}
async function oset(no, k, v) { if (!isStaff()) { T('ต้อง login เป็น staff'); return; } ORDS[no][k] = v; try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {} var patch = {}; patch[k == 'track' ? 'tracking' : k] = v; await dbUpdateOrder(no, patch); T('Saved'); }

/* ---------- admin shell ---------- */
function jtNav(active) {
  var store = [['Home', '#/'], ['Shop', '#/shop'], ['Product', '#/product'], ['Cart', '#/cart'], ['Checkout', '#/checkout'], ['Order Complete', '#/order-complete']];
  if (SB_USER) store.push(['My Orders', '#/account/orders']);
  var groups = [['STORE', store]];
  if (isStaff()) groups.push(['ADMIN', [['Dashboard', '#/admin/dashboard'], ['Products', '#/admin/products'], ['Inventory', '#/admin/inventory'], ['Orders', '#/admin/orders'], ['Customers', '#/admin/customers']]]);
  if (isOwner()) {
    groups.push(['WEBSITE', [['Homepage', '#/admin/website/homepage'], ['Sections', '#/admin/website/sections']]]);
    groups.push(['SETTINGS', [['General', '#/admin/settings/general'], ['Shipping', '#/admin/settings/shipping'], ['Payment', '#/admin/settings/payment'], ['Contact', '#/admin/settings/contact'], ['SEO', '#/admin/settings/seo'], ['Maintenance', '#/admin/settings/maintenance']]]);
  }
  var sys = [['Supabase', '#/admin/system/supabase']];
  if (isStaff()) sys.push(['Staff & Roles', '#/admin/system/staff']);
  if (isOwner()) sys.push(['Activity Log', '#/admin/system/activity']);
  groups.push(['SYSTEM', sys]);
  var h = '<aside class="jt-side"><div class="jt-brand"><a href="#/" style="font-weight:800">JUNGRAI TACT</a><div class="jgt-muted">' + (sb() ? '● Supabase · ' + esc(roleLabel()) : '○ local · owner') + '</div></div>';
  groups.forEach(function (g) { h += '<div class="jt-group">' + g[0] + '</div>'; g[1].forEach(function (x) { h += '<a href="' + x[1] + '" class="' + (active === x[1] ? 'active' : '') + '">' + x[0] + '</a>'; }); });
  return h + '</aside>';
}
function jtShell(title, active, body) { return '<div class="jt-admin"><div>' + jtNav(active) + '</div><main class="jt-main"><div class="jt-head"><h1>' + esc(title) + '</h1></div>' + body + '</main></div>'; }
function jtSettings(section) {
  var c = JSON.parse(localStorage.getItem('jt_settings') || '{}'), defaults = { name: 'JUNGRAI TACT', currency: 'THB', ship: 60, free: 2000, promptpay: false, card: false, bank: false, email: '', phone: '', address: '', title: 'JUNGRAI TACT', desc: '', maint: false, msg: 'Maintenance.' };
  c = Object.assign(defaults, c);
  var label = { general: 'General', shipping: 'Shipping', payment: 'Payment', contact: 'Contact', seo: 'SEO', maintenance: 'Maintenance' }[section] || section, fields = '';
  if (section === 'general') fields = '<label>Store name<input id="jt_name" value="' + esc(c.name) + '"></label><label>Currency<select id="jt_currency"><option ' + (c.currency === 'THB' ? 'selected' : '') + '>THB</option><option ' + (c.currency === 'USD' ? 'selected' : '') + '>USD</option></select></label>';
  if (section === 'shipping') fields = '<label>Shipping<input id="jt_ship" type="number" value="' + Number(c.ship || 0) + '"></label><label>Free threshold<input id="jt_free" type="number" value="' + Number(c.free || 0) + '"></label>';
  if (section === 'payment') fields = '<label><input id="jt_prompt" type="checkbox" ' + (c.promptpay ? 'checked' : '') + '> PromptPay</label><label><input id="jt_card" type="checkbox" ' + (c.card ? 'checked' : '') + '> Card</label><label><input id="jt_bank" type="checkbox" ' + (c.bank ? 'checked' : '') + '> Bank</label>';
  if (section === 'contact') fields = '<label>Email<input id="jt_email" value="' + esc(c.email) + '"></label><label>Phone<input id="jt_phone" value="' + esc(c.phone) + '"></label><label class="full">Address<textarea id="jt_address">' + esc(c.address) + '</textarea></label>';
  if (section === 'seo') fields = '<label class="full">Title<input id="jt_title" value="' + esc(c.title) + '"></label><label class="full">Desc<textarea id="jt_desc">' + esc(c.desc) + '</textarea></label>';
  if (section === 'maintenance') fields = '<label><input id="jt_maint" type="checkbox" ' + (c.maint ? 'checked' : '') + '> Maintenance</label><label class="full">Message<textarea id="jt_msg">' + esc(c.msg) + '</textarea></label>';
  return jtShell(label, '#/admin/settings/' + section, '<div class="jt-panel"><div class="jt-form">' + fields + '</div><button class="btn p" onclick="jtSaveSettings(\'' + section + '\')">Save</button></div>');
}
window.jtSaveSettings = function (section) {
  var c = JSON.parse(localStorage.getItem('jt_settings') || '{}'), v = function (id) { var x = document.getElementById(id); return x ? x.value : ''; }, b = function (id) { var x = document.getElementById(id); return !!(x && x.checked); };
  if (section === 'general') { c.name = v('jt_name'); c.currency = v('jt_currency'); } else if (section === 'shipping') { c.ship = Number(v('jt_ship') || 0); c.free = Number(v('jt_free') || 0); } else if (section === 'payment') { c.promptpay = b('jt_prompt'); c.card = b('jt_card'); c.bank = b('jt_bank'); } else if (section === 'contact') { c.email = v('jt_email'); c.phone = v('jt_phone'); c.address = v('jt_address'); } else if (section === 'seo') { c.title = v('jt_title'); c.desc = v('jt_desc'); } else if (section === 'maintenance') { c.maint = b('jt_maint'); c.msg = v('jt_msg'); }
  localStorage.setItem('jt_settings', JSON.stringify(c)); T('Saved'); go();
};
function jtDashboard() {
  var os = Object.keys(ORDS).map(function (k) { return ORDS[k]; }), sales = os.filter(function (o) { return !['cancelled', 'refunded'].includes(o.status); }).reduce(function (a, o) { return a + Number(o.total || 0); }, 0), pending = os.filter(function (o) { return ['new'].includes(o.status); }).length;
  return jtShell('Dashboard', '#/admin/dashboard', '<div class="jt-grid"><div class="jt-kpi"><span>Products</span><b>' + P.length + '</b></div><div class="jt-kpi"><span>Orders</span><b>' + os.length + '</b></div><div class="jt-kpi"><span>Sales</span><b>' + bt(sales) + '</b></div><div class="jt-kpi"><span>Role</span><b style="font-size:20px">' + esc(roleLabel()) + '</b></div></div><div class="jt-panel"><span class="jgt-kpi">Mode</span><p>' + (sb() ? 'Supabase live: ' + esc(SB.url) + ' · ' + esc(SB_USER ? SB_USER.email : 'guest') : 'Local mode — ตั้งค่า Supabase ที่ SYSTEM › Supabase') + '</p></div>');
}
function jtInventory() { return jtShell('Inventory', '#/admin/inventory', '<div class="jt-panel"><table class="tb"><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Status</th></tr>' + P.map(function (p) { var n2 = Number(p.stock || 0); return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.sku) + '</td><td>' + n2 + '</td><td>' + (n2 <= 0 ? 'OUT' : n2 <= Number(p.low || 5) ? 'LOW' : 'IN') + '</td></tr>'; }).join('') + '</table></div>'); }
function jtCustomers() {
  var map = {}; Object.keys(ORDS).forEach(function (k) { var o = ORDS[k], c = o.cust || {}; var key = String(c.email || 'guest:' + o.no).toLowerCase(); if (!map[key]) map[key] = { name: c.name || 'Guest', email: c.email || '', phone: c.phone || '', orders: 0, total: 0 }; map[key].orders++; map[key].total += Number(o.total || 0); });
  return jtShell('Customers', '#/admin/customers', '<div class="jt-panel"><table class="tb"><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total</th></tr>' + Object.keys(map).map(function (k) { var c = map[k]; return '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.email) + '</td><td>' + esc(c.phone) + '</td><td>' + c.orders + '</td><td>' + bt(c.total) + '</td></tr>'; }).join('') + '</table></div>');
}
function jtStaff() {
  var rows = SB_PROFILES.map(function (u) { return '<tr><td>' + esc(u.email) + '</td><td><span class="bd">' + esc(u.role) + '</span></td><td style="text-align:right">' + (isOwner() && SB_USER && u.id !== SB_USER.id ? '<select onchange="sbSetRole(\'' + u.id + '\',this.value)">' + ['member', 'shop_admin', 'owner'].map(function (r) { return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>' : '<span class="sm">you</span>') + '</td></tr>'; }).join('');
  return jtShell('Staff & Roles', '#/admin/system/staff', '<div class="jt-panel"><p class="sm">Owner ทำได้ทุกอย่าง · Shop admin เติมสต็อก+จัดการออเดอร์ (แก้ราคา/ลบ/แก้เว็บไม่ได้) · Member ดูออเดอร์ตัวเอง · Guest สั่งซื้อได้อย่างเดียว</p><div style="margin:12px 0"><button class="btn s" onclick="sbLoadProfiles()">Reload users</button></div><table class="tb"><tr><th>Email</th><th>Role</th><th></th></tr>' + (rows || '<tr><td colspan="3">ยังไม่มีข้อมูล — กด Reload (ต้องรัน migration_roles.sql + login เป็น owner)</td></tr>') + '</table><p class="jgt-muted">เปลี่ยน role ได้เฉพาะ owner · user ใหม่สมัครมาจะเป็น member อัตโนมัติ · ตั้ง owner คนแรกด้วย SQL: update profiles set role=\'owner\' where email=\'...\'</p></div>');
}
window.sbSetRole = async function (id, role) {
  if (!isOwner()) { T('เปลี่ยน role ได้เฉพาะ owner'); return; }
  var c = sb(); var r = await c.from('profiles').update({ role: role }).eq('id', id);
  if (r.error) T(r.error.message); else { T('Updated to ' + role); sbLoadProfiles(); }
};
window.sbLoadProfiles = async function () {
  var c = sb(); if (!c || !isStaff()) { T('ต้อง login เป็น staff'); return; }
  var r = await c.from('profiles').select('id,email,role').order('created_at');
  if (!r.error && r.data) { SB_PROFILES = r.data; go(); } else T((r.error && r.error.message) || 'load failed');
};
function jtActivity() { return jtShell('Activity Log', '#/admin/system/activity', '<div class="jt-panel"><p>ต้องมี backend จริง — ตอนนี้ดู log ใน Supabase › Table Editor › activity_log</p></div>'); }
function jtSupabase() {
  var ls = {}; try { ls = JSON.parse(localStorage.getItem('jt_supabase') || '{}'); } catch (e) {}
  return jtShell('Supabase', '#/admin/system/supabase', '<div class="jt-panel"><div class="jt-form"><label class="full">Supabase URL<input id="sb_url" value="' + esc(ls.url || ((window.JT_CONFIG && JT_CONFIG.SUPABASE_URL) || '')) + '" placeholder="https://xyz.supabase.co"></label><label class="full">Anon key<input id="sb_key" value="' + esc(ls.key || ((window.JT_CONFIG && JT_CONFIG.SUPABASE_ANON_KEY) || '')) + '" placeholder="eyJ..."></label><label class="full">Admin email (สำหรับ login เขียนข้อมูล)<input id="sb_email" placeholder="owner@jungrai.com"></label></div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn p" onclick="sbSave()">Save & connect</button><button class="btn" onclick="sbLogin()">Send magic link</button><button class="btn" onclick="sbLogout()">Logout</button>' + (sb() ? '<button class="btn d" onclick="SBClear()">Disconnect</button>' : '') + '</div><p class="jgt-muted" style="margin-top:12px">สถานะ: ' + (sb() ? 'connected → ' + esc(SB.url) + (SB_USER ? ' · ' + esc(SB_USER.email) + ' · ' + esc(roleLabel()) : ' · guest (สั่งซื้อได้อย่างเดียว)') : 'ยังไม่ต่อ — local = สิทธิ์ owner') + '</p><p class="jgt-muted">รัน supabase/schema.sql + seed.sql + migration_roles.sql → Authentication › Add user → SQL: update profiles set role=\'owner\' where email=\'...\' → login ด้วย email นี้</p></div>');
}
window.sbSave = function () { var u = document.getElementById('sb_url').value.trim(), k = document.getElementById('sb_key').value.trim(); if (!u || !k) { T('กรอก URL + key'); return; } SB.saveConn(u, k); };
window.SBClear = function () { SB.clearConn(); };
window.sbLogin = async function () {
  var c = sb(); if (!c) { T('ต่อ Supabase ก่อน'); return; }
  var em = (document.getElementById('sb_email') || {}).value || prompt('Admin email:'); if (!em) return;
  var r = await c.auth.signInWithOtp({ email: em.trim() });
  if (r.error) T(r.error.message); else T('ส่งลิงก์ login ไปที่ ' + em + ' แล้ว');
};
window.sbLogout = async function () { var c = sb(); if (c) await c.auth.signOut(); SB_USER = null; SB_ROLE = 'guest'; SB_PROFILES = []; T('Logged out'); go(); };

/* ---------- misc views ---------- */
function tcur() { CUR = CUR == 'THB' ? 'USD' : 'THB'; try { localStorage.setItem('jg_cur', CUR); } catch (e) {} go(); }
function applyLogo() { cnt(); var cu = document.getElementById('cur'); if (cu) cu.textContent = CUR; applyHeader(); }
function hc() { var m = (location.hash || '').match(/^#\/shop\?cat=(.+)$/); if (m) F.cat = decodeURIComponent(m[1]); }

/* ---------- account: my orders (member) ---------- */
function myOrdersView() {
  if (!SB_USER) return jtShell('My Orders', '#/account/orders', '<div class="jt-panel"><p>Login ก่อนเพื่อดูออเดอร์ของตัวเอง</p><a class="btn p" href="#/admin/system/supabase">Login</a></div>');
  var L = Object.keys(ORDS).map(function (k) { return ORDS[k]; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; });
  if (!L.length) return jtShell('My Orders', '#/account/orders', '<div class="jt-panel"><p>ยังไม่มีออเดอร์</p><a class="btn p" href="#/shop">Shop now</a></div>');
  return jtShell('My Orders', '#/account/orders', '<div class="jt-panel"><table class="tb"><tr><th>Order</th><th>Date</th><th>Total</th><th>Status</th></tr>' + L.map(function (o) { return '<tr><td>' + esc(o.no) + '</td><td>' + new Date(o.at).toLocaleDateString('en-GB') + '</td><td>' + bt(o.total) + '</td><td>' + esc(o.status) + '</td></tr>'; }).join('') + '</table></div>');
}
function deny(page) { return jtShell(page, location.hash, '<div class="jt-panel"><p>สิทธิ์ไม่ถึง (' + esc(roleLabel()) + ') — หน้านี้ต้องเป็น ' + esc(page === 'Owner only' ? 'owner' : 'staff') + '</p><a class="btn p" href="#/admin/system/supabase">Login / เปลี่ยน user</a></div>'); }

/* ---------- router ---------- */
function go() {
  clearInterval(HT); clearInterval(HT2); fixPG();
  var h = location.hash || '#/', m = h.match(/^#\/p\/(.+)$/), m2 = h.match(/^#\/done\/(.+)$/), a = $('#app'), isH = h == '#/' || h == '#';
  document.querySelector('main').className = isH ? 'h' : '';
  var v;
  if (h === '#/account/orders') v = myOrdersView();
  else if (h === '#/admin' || h === '#/admin/dashboard') v = isStaff() ? jtDashboard() : deny('Staff only');
  else if (h === '#/admin/products') v = isStaff() ? jtShell('Products', '#/admin/products', admin()) : deny('Staff only');
  else if (h === '#/admin/inventory') v = isStaff() ? jtInventory() : deny('Staff only');
  else if (h === '#/admin/orders') v = isStaff() ? jtShell('Orders', '#/admin/orders', adminOrd()) : deny('Staff only');
  else if (h === '#/admin/customers') v = isStaff() ? jtCustomers() : deny('Staff only');
  else if (h === '#/admin/website/homepage') v = isOwner() ? jtShell('Homepage', '#/admin/website/homepage', adminHome()) : deny('Owner only');
  else if (h === '#/admin/website/sections') v = isOwner() ? jtShell('Sections', '#/admin/website/sections', adminSec()) : deny('Owner only');
  else if (/^#\/admin\/settings\//.test(h)) v = isOwner() ? jtSettings(h.split('/')[3]) : deny('Owner only');
  else if (h === '#/admin/system/supabase') v = jtSupabase();
  else if (h === '#/admin/system/staff') v = isStaff() ? jtStaff() : deny('Staff only');
  else if (h === '#/admin/system/activity') v = isOwner() ? jtActivity() : deny('Owner only');
  else if (h === '#/product') v = jtShell('Product', '#/product', '<div class="jt-panel"><p>เลือกสินค้าจาก Shop</p><a class="btn p" href="#/shop">Go to Shop</a></div>');
  else if (h === '#/order-complete' || m2) { var no = m2 ? decodeURIComponent(m2[1]) : null; v = no ? doneView(no) : jtShell('Order Complete', '#/order-complete', '<div class="jt-panel"><p>Done</p></div>'); }
  else if (m) v = prod(decodeURIComponent(m[1]));
  else if (h.indexOf('#/cart') === 0) v = cartView();
  else if (h.indexOf('#/checkout') === 0) v = checkoutView();
  else if (isH) v = homeView();
  else v = shop();
  a.innerHTML = isH ? v : '<div class="w">' + v + '</div>';
  if (isH) { heroInit(); dropInit(); }
  applyLogo();
}
window.addEventListener('hashchange', function () { Q = 1; SEL = {}; E = null; HS = null; PGS = null; hc(); go(); scrollTo(0, 0); });

/* ---------- boot ---------- */
loadLocal(); hc(); go();
(async function () {
  var ok = await loadSupabase();
  if (isStaff()) await sbLoadProfilesSilent();
  if (ok) go();
  var c = sb();
  if (c) c.auth.onAuthStateChange(function (ev, session) {
    SB_USER = session ? session.user : null;
    loadRole().then(function () {
      if (isStaff() && sb()) sbLoadProfilesSilent();
      go();
    });
  });
})();
async function sbLoadProfilesSilent() {
  try { var c = sb(); if (!c || !isStaff()) return; var r = await c.from('profiles').select('id,email,role').order('created_at'); if (!r.error && r.data) SB_PROFILES = r.data; } catch (e) {}
}
