/* JUNGRAI TACT — storefront + admin, Supabase-first with localStorage fallback
   โครงตาม jungrai-tact-v7-clean.html */
var CM = { 'Olive Drab': '#5a5d3a', 'Sand': '#c2b28f', 'Black': '#1d1d1b', 'Concrete': '#8a8b86' };
var CAT = ['Apparel', 'Field Gear', 'Accessories', 'Patches'];
function mk(id, n, cat, col, pr, cp, cost, st, cl, sz, ft, d) {
  return { id: id, name: n, sku: id.toUpperCase(), barcode: '', cat: cat, coll: col, price: pr, compare: cp, cost: cost, stock: st, cstock: {}, vstock: {}, cover: '', low: 5, status: 'active', featured: ft, colors: cl, sizes: sz, tags: '', desc: d, material: '', dims: '', spec: '', notes: '' };
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
var DEFAULT_LOGO = 'https://bsvckqhrdoxuacofpozr.supabase.co/storage/v1/object/public/media/lib/mus44b1r-0.jpg';
var H = { slides: JSON.parse(JSON.stringify(SEED_SLIDES)), secs: 7, logo: 1, wm: 1, logoUrl: DEFAULT_LOGO, wmUrl: DEFAULT_LOGO };
var PG = JSON.parse(JSON.stringify(DEFAULT_PAGE));
var CART = [], DC = '', ORDS = {}, CUR = 'THB', OO = '';
var WL = [], RV = {}, MD = []; // wishlist ids, reviews by product, media rows
var CIM = {}; // product id -> {color: [urls]} รูปแยกตามสี
var CUSTS = []; // customers table (staff only)
var RPC_OK = true; // false = ยังไม่รัน migration_stock_rpc.sql
var LANG = 'TH'; // TH | EN
try { LANG = localStorage.getItem('jt_lang') || 'TH'; } catch (e) {}
function t(th, en) { return LANG === 'TH' ? th : en; }
function tlang() { LANG = LANG === 'TH' ? 'EN' : 'TH'; try { localStorage.setItem('jt_lang', LANG); } catch (e) {} applyHeader(); go(); }
function applyHeader() {
  try { document.documentElement.lang = LANG === 'TH' ? 'th' : 'en'; } catch (e) {}
  var set = function (id, v) { var e = document.getElementById(id); if (e) e.textContent = v; };
  set('nh', t('หน้าแรก', 'HOME')); set('ns', t('ร้านค้า', 'SHOP')); set('nct', t('ตะกร้า', 'CART')); set('lng', LANG === 'TH' ? 'EN' : 'TH');
  set('ftag', t('เกิดมาเพื่อสนาม', 'Built for the field.')); set('fby', t('เกิดมาเพื่อสนาม', 'Built for the field.'));
  set('fh1', t('ร้านค้า', 'Shop')); set('fh2', t('บริการลูกค้า', 'Customer service')); set('fh3', t('บริษัท', 'Company'));
  set('fl1', t('จัดส่ง', 'Shipping')); set('fl2', t('คืนสินค้า', 'Returns')); set('fl3', t('ไกด์ไซส์', 'Size guide')); set('fl4', t('ติดต่อ', 'Contact'));
  set('fl5', t('เกี่ยวกับเรา', 'About')); set('fl8', t('นโยบาย', 'Privacy')); set('fl9', t('เงื่อนไข', 'Terms'));
  var lg = document.getElementById('lg');
  if (lg) {
    if (!sb() || !SB_USER) { lg.textContent = t('เข้าสู่ระบบ', 'LOGIN'); lg.href = '#/admin/system/supabase'; }
    else if (isStaff()) { lg.textContent = t('หลังร้าน', 'ADMIN'); lg.href = '#/admin/dashboard'; }
    else { lg.textContent = t('บัญชีของฉัน', 'ACCOUNT'); lg.href = '#/account'; }
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
var SB_PROFILE = null;
async function loadRole() {
  var c = sb(); SB_PROFILE = null;
  if (!c || !SB_USER) { SB_ROLE = c ? (SB_USER ? 'member' : 'guest') : 'owner'; return; }
  try {
    var r = await c.from('profiles').select('*').eq('id', SB_USER.id).single();
    if (r.data) { SB_PROFILE = r.data; SB_ROLE = r.data.role || 'member'; }
    else SB_ROLE = 'member';
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
function av(p) { return p.stock <= 0 ? ['so', t('หมด', 'Sold out')] : p.stock <= p.low ? ['lo', t('เหลือน้อย — เหลือ ', 'Low stock — ') + p.stock + t(' ชิ้น', ' left')] : ['', t('มีของ', 'In stock')]; }
/* สต็อกแยกสี: มี key = ใช้รายสี, ว่าง = สต็อกรวมเดิม */
function hasCS(p) { return !!(p.cstock && Object.keys(p.cstock).length); }
function cstockOf(p, c) { if (!hasCS(p)) return p.stock; return Math.max(0, parseInt(p.cstock[c], 10) || 0); }
function cstockSum(cs) { return Object.keys(cs || {}).reduce(function (a, k) { return a + Math.max(0, parseInt(cs[k], 10) || 0); }, 0); }
function csText(p) { if (!hasCS(p)) return ''; return Object.keys(p.cstock).map(function (k) { return k + ': ' + p.cstock[k]; }).join(', '); }
/* สต็อกแยกสี+ไซส์: key "Color__Size" มี = ใช้ราย variant, ว่าง = fallback รายสี/รวม */
function vsKey(c, s) { return c + '__' + s; }
function hasVS(p) { return !!(p.vstock && Object.keys(p.vstock).length); }
function vstockOf(p, c, s) { if (!hasVS(p)) return cstockOf(p, c); return Math.max(0, parseInt(p.vstock[vsKey(c, s)], 10) || 0); }
function vsText(p) { if (!hasVS(p)) return ''; return Object.keys(p.vstock).map(function (k) { var a = k.split('__'); return (a[0] || k) + '/' + (a[1] || '-') + ': ' + p.vstock[k]; }).join(', '); }
function vsSync(p) { // รวมยอด variant -> รายสี + ยอดรวม
  if (!hasVS(p)) return;
  var cs = {}; Object.keys(p.vstock).forEach(function (k) { var cc = k.split('__')[0]; cs[cc] = (cs[cc] || 0) + Math.max(0, parseInt(p.vstock[k], 10) || 0); });
  p.cstock = cs; p.stock = cstockSum(cs);
}
function swatch(c) {
  if (CM[c]) return CM[c];
  var h = 0; String(c || '').split('').forEach(function (x) { h = (h * 31 + x.charCodeAt(0)) % 360; });
  return 'hsl(' + h + ',30%,40%)';
}
function art(p, c) {
  var h = swatch(c || p.colors[0]), s = '';
  if (p.cat == 'Apparel') s = '<path d="M140 70l-70 40-40 120 40 10 20-60v250h220V180l20 60 40-10-40-120-70-40c-10 25-30 38-60 38s-50-13-60-38z"/><path d="M200 108v312" fill="none"/>';
  else if (p.cat == 'Field Gear') s = '<rect x="110" y="90" width="180" height="300" rx="26"/><path d="M110 200h180M150 90V60h100v30" fill="none"/>';
  else if (p.cat == 'Accessories') s = '<path d="M60 300c0-90 60-150 140-150s140 60 140 150z"/><path d="M60 300h280l40 20H20z"/>';
  else s = '<rect x="120" y="150" width="160" height="180" rx="10"/><path d="M120 240h160" fill="none"/>';
  return '<svg viewBox="0 0 400 480" aria-hidden="true" fill="' + h + '" stroke="#0a0a09" stroke-width="2">' + s + '</svg>';
}
function pic(p, i, c) {
  var m = allImgs(p.id);
  if (p.cover && m.indexOf(p.cover) > 0) { m = [p.cover].concat(m.filter(function (u) { return u !== p.cover; })); }
  var u = m && m[i];
  if (u && (/^(https?:|data:image|\.\/|img\/|\/)/.test(u) || /\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(u))) return '<img src="' + u + '" alt="' + esc(p.name) + '" loading="lazy">';
  return art(p, c);
}
/* รูปของสีที่เลือกก่อน ถ้าไม่มีใช้รูปกลาง ถ้าไม่มีเลยใช้รูปแรกที่มี */
function allImgs(pid) {
  var out = (IM[pid] || []).slice();
  Object.keys(CIM[pid] || {}).forEach(function (k) { (CIM[pid][k] || []).forEach(function (u) { if (out.indexOf(u) < 0) out.push(u); }); });
  return out;
}
function galImgs(p) {
  var m = CIM[p.id] || {}, l = m[SEL.c];
  if (l && l.length) return l;
  if (IM[p.id] && IM[p.id].length) return IM[p.id];
  return allImgs(p.id);
}
function gal(p) {
  var imgs = galImgs(p); GIMGS = imgs.slice(); var n = imgs.length;
  if (!n) return '<div class="gl"><div class="pn">' + art(p, SEL.c) + '</div></div>';
  if (GIDX[p.id] == null || GIDX[p.id] >= n) GIDX[p.id] = 0;
  var i = GIDX[p.id];
  var dots = imgs.map(function (_, j) { return '<button aria-label="Image ' + (j + 1) + '" class="gs-dot' + (j === i ? ' on' : '') + '" onclick="ggo(\'' + esc(p.id) + '\',' + j + ')"></button>'; }).join('');
  var ths = imgs.map(function (u, j) { return '<button class="gs-th' + (j === i ? ' on' : '') + '" onclick="ggo(\'' + esc(p.id) + '\',' + j + ')"><img src="' + u + '" alt="" loading="lazy"></button>'; }).join('');
  return '<div class="gsl"><div class="pn gs-main"><img id="gs-img" src="' + imgs[i] + '" alt="' + esc(p.name) + '"></div>' +
    (n > 1 ? '<button class="gs-arrow l" aria-label="Prev" onclick="gnav(\'' + esc(p.id) + '\',-1)">‹</button><button class="gs-arrow r" aria-label="Next" onclick="gnav(\'' + esc(p.id) + '\',1)">›</button><div class="gs-dots">' + dots + '</div>' : '') +
    (n > 1 ? '<div class="gs-ths">' + ths + '</div>' : '') + '</div>';
}
var GIDX = {};
var GIMGS = [];
function gpaint(pid) {
  var imgs = GIMGS.length ? GIMGS : (IM[pid] || []); if (!imgs.length) return;
  var i = ((GIDX[pid] || 0) + imgs.length) % imgs.length; GIDX[pid] = i;
  var im = document.getElementById('gs-img'); if (im) im.src = imgs[i];
  var d = document.querySelectorAll('.gs-dot'), th = document.querySelectorAll('.gs-th');
  d.forEach(function (e, j) { e.classList.toggle('on', j === i); });
  th.forEach(function (e, j) { e.classList.toggle('on', j === i); });
}
function gnav(pid, d) { var n = (GIMGS.length ? GIMGS.length : (IM[pid] || []).length) || 1; GIDX[pid] = (((GIDX[pid] || 0) + d) % n + n) % n; gpaint(pid); }
function ggo(pid, i) { GIDX[pid] = i; gpaint(pid); }
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
  try { WL = JSON.parse(localStorage.getItem('jt_wishlist')) || []; } catch (e) { WL = []; }
  try { CIM = JSON.parse(localStorage.getItem('jg_cimg')) || {}; } catch (e) { CIM = {}; }
  try { ORDS = JSON.parse(localStorage.getItem('jg_orders')) || {}; } catch (e) { ORDS = {}; }
  try { CUR = localStorage.getItem('jg_cur') || 'THB'; } catch (e) {}
  if (H.logo == null) H.logo = 1; if (H.wm == null) H.wm = 1;
  if (!H.logoUrl) H.logoUrl = DEFAULT_LOGO; if (!H.wmUrl) H.wmUrl = DEFAULT_LOGO;
  fixPG(); imgFallback();
}
function fixPG() {
  if (!PG.codes) PG.codes = [{ c: 'FIELD10', t: 'pct', v: 10 }, { c: 'WELCOME100', t: 'fixed', v: 100 }, { c: 'FREESHIP', t: 'ship', v: 0 }];
  if (!PG.ship) PG.ship = { rate: 60, free: 2000 };
}
/* รูปประจำสินค้า (ไฟล์ใน repo) สำหรับตัวที่ยังไม่มีรูปอัปโหลด */
function imgFallback() {
  (P || []).forEach(function (p) {
    var hasShared = IM[p.id] && IM[p.id].length, hasColor = CIM[p.id] && Object.keys(CIM[p.id]).some(function (k) { return (CIM[p.id][k] || []).length; });
    if (!hasShared && !hasColor) IM[p.id] = ['img/products/' + p.id + '.svg'];
    if (!p.cover) { var a = allImgs(p.id); if (a.length) p.cover = a[0]; }
  });
}
function saveLocal() {
  try { localStorage.setItem('jg_cat', JSON.stringify(P)); } catch (e) {}
  try { localStorage.setItem('jg_img', JSON.stringify(IM)); } catch (e) { T(t('รูปใหญ่เกินเก็บในเบราว์เซอร์นี้', 'Images are too large to keep in this browser')); }
  try { localStorage.setItem('jg_cimg', JSON.stringify(CIM)); } catch (e) {}
  try { localStorage.setItem('jg_cart', JSON.stringify(CART)); } catch (e) {}
  try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
}
async function loadSupabase() {
  var c = sb(); if (!c) return false;
  try {
    var pr = await c.from('products').select('*').order('created_at');
    if (pr.data && pr.data.length) {
      P = pr.data.map(function (r) {
        return { id: r.id, name: r.name, sku: r.sku, barcode: r.barcode || '', cat: r.category, coll: r.collection, price: r.price, compare: r.compare_at, cost: r.cost, stock: r.stock, cstock: r.stock_by_color || {}, vstock: r.stock_by_variant || {}, cover: r.cover_url || '', low: r.low_threshold, status: r.status, featured: r.featured, colors: r.colors || ['Black'], sizes: r.sizes || ['One size'], tags: r.tags || '', desc: r.description || '', spec: r.spec || '', material: r.material || '', dims: r.dims || '', notes: r.notes || '' };
      });
      IM = {}; CIM = {}; pr.data.forEach(function (r) { if (r.image_urls && r.image_urls.length) IM[r.id] = r.image_urls; if (r.color_images && Object.keys(r.color_images).length) CIM[r.id] = r.color_images; });
      imgFallback();
    }
    var sl = await c.from('slides').select('*').order('position');
    if (sl.data && sl.data.length) {
      H.slides = sl.data.map(function (r) { return { id: r.id, h: r.headline, sub: r.subheadline, b1: r.btn1_text, l1: r.btn1_link, b2: r.btn2_text, l2: r.btn2_link, img: r.image_url || '' }; });
    }
    var cf = await c.from('site_configs').select('*');
    if (cf.data) cf.data.forEach(function (r) { if (r.key == 'home') { H.secs = r.value.secs || 7; H.logo = r.value.logo == 0 ? 0 : 1; H.wm = r.value.wm == 0 ? 0 : 1; H.logoUrl = r.value.logoUrl || DEFAULT_LOGO; H.wmUrl = r.value.wmUrl || DEFAULT_LOGO; } if (r.key == 'page') { PG = Object.assign(JSON.parse(JSON.stringify(DEFAULT_PAGE)), r.value); } });
    var se = await c.auth.getSession(); SB_USER = se.data.session ? se.data.session.user : null;
    await loadRole();
    try { var ping = await c.rpc('deduct_for_order', { p_no: '___ping___' }); RPC_OK = !ping.error; }
    catch (e) { RPC_OK = false; }
    // กันเห็นออเดอร์ข้าม user: login แล้วใช้ข้อมูล server ของตัวเองเท่านั้น
    if (SB_USER) { ORDS = {}; CUSTS = []; await claimGuestOrders(); await applyPendingProfile(); }
    var od;
    if (!SB_USER) od = { data: [] };
    else if (isStaff()) od = await c.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
    else od = await c.from('orders').select('*').eq('user_id', SB_USER.id).order('created_at', { ascending: false }).limit(200);
    if (od.data) od.data.forEach(function (r) {
      ORDS[r.order_no] = { no: r.order_no, at: r.created_at, cust: r.customer, addr: r.address, items: r.items, sub: r.subtotal, d: r.discount, ship: r.shipping, total: r.total, code: r.discount_code, pay: r.payment_method, status: r.status, track: r.tracking, note: r.note, stockDone: r.stock_deducted, log: r.log || [] };
    });
    try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
    if (SB_USER && isStaff()) {
      try {
        var cu = await c.from('customers').select('*').order('total_spent', { ascending: false }).limit(200);
        if (cu.data) CUSTS = cu.data;
      } catch (e) {}
    }
    // v14: wishlist (merge local + server), approved reviews, media
    try {
      var wq = SB_USER ? await c.from('wishlists').select('product_id').eq('user_id', SB_USER.id) : { data: [] };
      var remote = (wq.data || []).map(function (r) { return r.product_id; });
      WL = Array.from(new Set((WL || []).concat(remote)));
      try { localStorage.setItem('jt_wishlist', JSON.stringify(WL)); } catch (e) {}
      if (SB_USER) WL.filter(function (id) { return remote.indexOf(id) < 0; }).forEach(function (id) { c.from('wishlists').upsert({ user_id: SB_USER.id, product_id: id }, { onConflict: 'user_id,product_id' }); });
    } catch (e) {}
    try {
      var rvq = await c.from('reviews').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(300);
      RV = {}; (rvq.data || []).forEach(function (r) { (RV[r.product_id] = RV[r.product_id] || []).push(r); });
    } catch (e) {}
    try {
      var mdq = await c.from('media').select('*').order('created_at', { ascending: false }).limit(200);
      if (mdq.data) MD = mdq.data;
    } catch (e) {}
    fixPG(); return true;
  } catch (e) { console.warn('supabase load failed', e); return false; }
}
async function dbUpsertProduct(o) {
  var c = sb(); if (!c) return;
  await c.from('products').upsert({ id: o.id, name: o.name, sku: o.sku, barcode: o.barcode, category: o.cat, collection: o.coll, price: o.price, compare_at: o.compare, cost: o.cost, stock: o.stock, stock_by_color: o.cstock || {}, stock_by_variant: o.vstock || {}, cover_url: o.cover || '', low_threshold: o.low, status: o.status, featured: o.featured ? 1 : 0, colors: o.colors, sizes: o.sizes, tags: o.tags, description: o.desc, spec: o.spec, material: o.material, dims: o.dims, notes: o.notes, image_urls: IM[o.id] || [], color_images: CIM[o.id] || {} }, { onConflict: 'id' });
}
async function dbDeleteProduct(id) { var c = sb(); if (!c) return; await c.from('products').delete().eq('id', id); }
async function dbSaveOrder(o) {
  var c = sb(); if (!c) return;
  await c.from('orders').insert({ order_no: o.no, customer: o.cust, address: o.addr, items: o.items, subtotal: o.sub, discount: o.d, shipping: o.ship, total: o.total, discount_code: o.code, payment_method: o.pay, status: o.status, tracking: o.track, note: o.note, stock_deducted: o.stockDone, log: o.log, user_id: (SB_USER && SB_USER.id) || null, customer_email: ((o.cust && o.cust.email) || '').toLowerCase() });
}
async function dbUpdateOrder(no, patch) { var c = sb(); if (!c) return; await c.from('orders').update(patch).eq('order_no', no); }
/* เอารายละเอียดที่กรอกตอนสมัคร (ค้างกรณีต้องยืนยันอีเมลก่อน) เข้าบัญชีหลัง login ครั้งแรก */
async function applyPendingProfile() {
  var c = sb(); if (!c || !SB_USER) return;
  var pend = null;
  try { pend = JSON.parse(localStorage.getItem('jt_pending_profile') || 'null'); } catch (e) {}
  if (!pend || (pend.email && pend.email !== String(SB_USER.email || '').toLowerCase())) return;
  try {
    var cur = SB_PROFILE || {};
    var patch = {};
    if (!cur.full_name && pend.det.full_name) patch.full_name = pend.det.full_name;
    if (!cur.phone && pend.det.phone) patch.phone = pend.det.phone;
    var ca = cur.address || {};
    if (!ca.line && pend.det.address && pend.det.address.line) patch.address = pend.det.address;
    if (Object.keys(patch).length) { await c.from('profiles').update(patch).eq('id', SB_USER.id); await loadRole(); }
    try { localStorage.removeItem('jt_pending_profile'); } catch (e) {}
  } catch (e) {}
}
async function claimGuestOrders() {
  var c = sb(); if (!c || !SB_USER || !SB_USER.email) return;
  try { await c.from('orders').update({ user_id: SB_USER.id }).is('user_id', null).eq('customer_email', String(SB_USER.email).toLowerCase()); } catch (e) {}
}
async function dbSavePage() {
  var c = sb(); if (!c) return;
  await c.from('site_configs').upsert({ key: 'page', value: PG }, { onConflict: 'key' });
  await c.from('site_configs').upsert({ key: 'home', value: { secs: H.secs, logo: H.logo, wm: H.wm, logoUrl: H.logoUrl || '', wmUrl: H.wmUrl || '' } }, { onConflict: 'key' });
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
    (r.length ? '<div class="gr">' + r.map(function (p) { var a = av(p); return '<div class="cd"><a href="#/p/' + esc(p.id) + '" class="pn">' + pic(p, 0) + '</a><div class="in"><h3>' + esc(p.name) + '</h3><div class="row"><span>' + thb(p.price) + (p.compare > p.price ? ' <s style="color:var(--cn)">' + thb(p.compare) + '</s>' : '') + '</span><span class="dots">' + p.colors.map(function (c) { return '<i title="' + esc(c) + '" style="background:' + swatch(c) + '"></i>'; }).join('') + '</span></div><div class="row"><span class="av ' + a[0] + '"><b></b>' + a[1] + '</span><span style="display:inline-flex;gap:6px">' + wishBtn(p.id) + (p.stock > 0 ? '<button class="btn s" onclick="qadd(\'' + esc(p.id) + '\')">' + t('หยิบใส่ตะกร้า', 'Quick add') + '</button>' : '') + '</span></div></div></div>'; }).join('') + '</div>' : '<p>' + t('ไม่พบสินค้าตามเงื่อนไข', 'No products match these filters.') + '</p>');
}
var n = 0;
function qadd(id) { var p = gp(id); cadd(id, p.colors[0], p.sizes[0], 1); }

/* ---------- wishlist (v14) ---------- */
function wishHas(id) { return (WL || []).indexOf(id) > -1; }
function wsave() { try { localStorage.setItem('jt_wishlist', JSON.stringify(WL)); } catch (e) {} }
async function toggleWish(id) {
  var i = WL.indexOf(id);
  if (i > -1) WL.splice(i, 1); else WL.push(id);
  wsave(); go();
  var c = sb(); if (c && SB_USER) {
    if (i > -1) await c.from('wishlists').delete().eq('user_id', SB_USER.id).eq('product_id', id);
    else await c.from('wishlists').upsert({ user_id: SB_USER.id, product_id: id }, { onConflict: 'user_id,product_id' });
  }
  T(i > -1 ? t('เอาออกจากวิชลิสต์', 'Removed from wishlist') : t('เก็บเข้าวิชลิสต์แล้ว', 'Saved to wishlist'));
}
function wishBtn(id) { return '<button class="btn s" aria-pressed="' + wishHas(id) + '" onclick="toggleWish(\'' + esc(id) + '\')">' + (wishHas(id) ? '♥' : '♡') + '</button>'; }
function wishView() {
  var ps = WL.map(gp).filter(Boolean);
  return '<div class="top"><h1>' + t('วิชลิสต์', 'Wishlist') + '</h1><span class="sm">' + ps.length + ' ' + t('ชิ้น', 'saved') + '</span></div>' + (ps.length ? '<div class="gr">' + ps.map(function (p) { var a = av(p); return '<div class="cd"><a href="#/p/' + esc(p.id) + '" class="pn">' + pic(p, 0) + '</a><div class="in"><h3>' + esc(p.name) + '</h3><div class="row"><span>' + thb(p.price) + '</span><span class="av ' + a[0] + '"><b></b>' + a[1] + '</span></div><div class="row">' + wishBtn(p.id) + (p.stock > 0 ? '<button class="btn s" onclick="qadd(\'' + esc(p.id) + '\')">' + t('หยิบใส่ตะกร้า', 'Quick add') + '</button>' : '') + '</div></div></div>'; }).join('') + '</div>' : '<p>' + t('ยังไม่มีของที่เก็บไว้', 'Your wishlist is empty.') + ' <a href="#/shop" style="text-decoration:underline">' + t('ดูสินค้า', 'Browse the collection') + '</a></p>');
}

/* ---------- product ---------- */
function prod(id) {
  var p = P.filter(function (x) { return x.id == id; })[0];
  if (!p || p.status != 'active') return '<p>' + t('สินค้านี้ไม่พร้อมขาย', 'This product is not available.') + ' <a href="#/shop" style="text-decoration:underline">' + t('กลับไปดูสินค้า', 'Back to collection') + '</a></p>';
  SEL.c = SEL.c && p.colors.indexOf(SEL.c) > -1 ? SEL.c : p.colors[0]; SEL.s = SEL.s && p.sizes.indexOf(SEL.s) > -1 ? SEL.s : p.sizes[0]; var a = av(p);
  var csN = hasVS(p) || hasCS(p) ? vstockOf(p, SEL.c, SEL.s) : p.stock;
  if (Q > Math.max(1, csN)) Q = Math.max(1, csN);
  var csMsg = '<div class="sm" id="pd-left" style="margin-top:6px">' + ((hasVS(p) || hasCS(p)) ? t('ชุดนี้เหลือ ', 'This variant: ') + csN + t(' ชิ้น · ทั้งหมด ', ' pcs · total ') + p.stock + t(' ชิ้น', ' pcs') : t('คงเหลือ ', 'Remaining ') + p.stock + t(' ชิ้น', ' pcs')) + '</div>';
  function dt(t, x, d) { return '<details><summary>' + t + '</summary><p>' + esc(x || d || 'Details will be added soon.') + '</p></details>'; }
  return '<p class="sm" style="margin-bottom:20px"><a href="#/shop">Collection</a> / ' + esc(p.cat) + '</p><div class="pp">' + gal(p) +
    '<div class="pi"><span class="sm">' + esc(p.coll) + '</span><div class="row"><h1 style="flex:1">' + esc(p.name) + '</h1>' + wishBtn(p.id) + '</div><div class="price">' + thb(p.price) + (p.compare > p.price ? '<s>' + thb(p.compare) + '</s>' : '') + '</div><p style="color:#b9b8ae">' + esc(p.desc) + '</p>' +
    '<div><span class="sm">' + t('สี', 'Color') + ' — ' + esc(SEL.c) + '</span><div class="opt">' + p.colors.map(function (c) { return '<button class="sw" aria-label="' + esc(c) + '" aria-pressed="' + (c == SEL.c) + '" onclick="SEL.c=\'' + esc(c) + '\';GIDX[\'' + esc(p.id) + '\']=0;go()"><i style="background:' + swatch(c) + '"></i></button>'; }).join('') + '</div></div>' +
    '<div><span class="sm">' + t('ไซส์', 'Size') + '</span><div class="opt">' + p.sizes.map(function (s) { return '<button aria-pressed="' + (s == SEL.s) + '" onclick="SEL.s=\'' + esc(s) + '\';go()">' + esc(s) + '</button>'; }).join('') + '</div></div>' +
    '<div class="av ' + (csN <= 0 ? 'so' : a[0]) + '"><b></b>' + (csN <= 0 ? t('สีนี้หมด', 'Out in this color') : a[1]) + '</div>' + csMsg + '<div class="qty"><button aria-label="Less" onclick="Q=Math.max(1,Q-1);go()">–</button><span>' + Q + '</span><button aria-label="More" onclick="Q=Math.min(' + Math.max(1, csN) + ',Q+1);go()">+</button></div>' +
    (csN > 0 ? '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn p" onclick="cadd(\'' + esc(p.id) + '\',SEL.c,SEL.s,' + Q + ')">' + t('หยิบใส่ตะกร้า', 'Add to cart') + '</button><button class="btn" onclick="cadd(\'' + esc(p.id) + '\',SEL.c,SEL.s,' + Q + ',1);location.hash=\'#/checkout\'">' + t('ซื้อเลย', 'Buy now') + '</button></div>' : '<button class="btn" disabled style="opacity:.5">' + t('หมด', 'Sold out') + '</button>') +
    '<div style="margin-top:12px">' + dt(t('รายละเอียด', 'Description'), p.desc) + dt(t('สเปก', 'Specifications'), p.spec) + dt(t('วัสดุ', 'Material'), p.material) + dt(t('ขนาด', 'Dimensions'), p.dims) + dt(t('โน้ตภาคสนาม', 'Field notes'), p.notes) + dt(t('การดูแล', 'Care'), t('ซักน้ำเย็น ตากแห้ง ห้ามฟอกขาว', 'Machine wash cold, hang dry. Do not bleach.')) + dt(t('จัดส่ง', 'Shipping'), t('ส่งใน 1–2 วันทำการทั่วไทย', 'Ships within 1–2 business days across Thailand.')) + dt(t('คืนสินค้า', 'Returns'), t('ของไม่ใช้แล้วคืนได้ใน 14 วัน', 'Unused items can be returned within 14 days.')) + '</div></div></div>' + reviewBlock(p.id);
}

/* ---------- reviews (v14) ---------- */
function reviewBlock(pid) {
  var list = RV[pid] || [], avg = list.length ? (list.reduce(function (a, r) { return a + (+r.rating || 0); }, 0) / list.length) : 0;
  var h = '<div style="margin-top:40px"><h2 style="font-size:clamp(28px,4vw,48px)">' + t('รีวิว', 'Reviews') + (list.length ? ' (' + list.length + ' · ★' + avg.toFixed(1) + ')' : '') + '</h2>';
  h += list.length ? list.map(function (r) { return '<div class="jt-panel" style="margin-top:10px"><b>' + esc(r.name || 'member') + '</b> <span class="sm">' + '★'.repeat(+r.rating || 5) + ' · ' + new Date(r.created_at).toLocaleDateString('en-GB') + '</span><p style="margin-top:6px">' + esc(r.text) + '</p></div>'; }).join('') : '<p class="sm" style="margin-top:8px">' + t('ยังไม่มีรีวิว เป็นคนแรกเลย', 'No reviews yet — be the first.') + '</p>';
  if (SB_USER) h += '<div class="fm" style="margin-top:12px;grid-template-columns:1fr"><label>' + t('คะแนน', 'Rating') + '<select id="rv-rating"><option value="5">★★★★★</option><option value="4">★★★★</option><option value="3">★★★</option><option value="2">★★</option><option value="1">★</option></select></label><label class="full">' + t('รีวิวของคุณ', 'Your review') + '<textarea id="rv-text"></textarea></label><div><button class="btn p" onclick="rvSubmit(\'' + esc(pid) + '\',this)">' + t('ส่งรีวิว', 'Submit review') + '</button></div></div>';
  else h += '<p style="margin-top:12px"><a class="btn" href="#/admin/system/supabase">Login ' + t('เพื่อรีวิว', 'to review') + '</a></p>';
  return h + '</div>';
}
window.rvSubmit = async function (pid, btn) {
  var c = sb(); if (!c || !SB_USER) { location.hash = '#/admin/system/supabase'; return; }
  var rating = +((document.getElementById('rv-rating') || {}).value || 5);
  var text = ((document.getElementById('rv-text') || {}).value || '').trim();
  if (!text) { T(t('เขียนรีวิวก่อน', 'Write your review first')); return; }
  lockBtn(btn, true);
  var r = await c.from('reviews').insert({ product_id: pid, user_id: SB_USER.id, name: (SB_USER.email || '').split('@')[0], rating: rating, text: text, status: 'pending' });
  lockBtn(btn, false);
  if (r.error) { T(authErr(r.error.message)); return; }
  T(t('ส่งรีวิวแล้ว รอตรวจสอบ', 'Review submitted — pending approval')); go();
};
function jtReviews() {
  return jtShell(t('รีวิว', 'Reviews'), '#/admin/reviews', '<div class="jt-panel"><div style="margin-bottom:12px"><button class="btn s" onclick="rvLoad(true)">' + t('โหลดทั้งหมด (รวมรอตรวจ)', 'Load all incl. pending') + '</button></div><div id="rv-admin">' + rvAdminRows() + '</div></div>');
}
function rvAdminRows() {
  var all = []; Object.keys(RV).forEach(function (pid) { (RV[pid] || []).forEach(function (r) { r._pid = pid; all.push(r); }); });
  all.sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; });
  if (!all.length) return '<p class="sm">' + t('ยังไม่มีรีวิว', 'No reviews yet.') + '</p>';
  return '<table class="tb"><tr><th>' + t('สินค้า', 'Product') + '</th><th>' + t('ชื่อ', 'Name') + '</th><th>★</th><th>' + t('ข้อความ', 'Text') + '</th><th>' + t('สถานะ', 'Status') + '</th><th></th></tr>' + all.map(function (r) { return '<tr><td>' + esc((gp(r._pid) || {}).name || r._pid) + '</td><td>' + esc(r.name) + '</td><td>' + r.rating + '</td><td>' + esc(r.text) + '</td><td><span class="bd">' + r.status + '</span></td><td style="text-align:right;white-space:nowrap">' + (r.status !== 'approved' ? '<button class="btn s" onclick="rvSet(\'' + r.id + '\',\'approved\')">✓</button> ' : '') + (r.status !== 'rejected' ? '<button class="btn s" onclick="rvSet(\'' + r.id + '\',\'rejected\')">✕</button> ' : '') + '<button class="btn s d" onclick="rvDel(\'' + r.id + '\')">' + t('ลบ', 'Delete') + '</button></td></tr>'; }).join('') + '</table>';
}
window.rvLoad = async function (all) {
  var c = sb(); if (!c || !isStaff()) return;
  var q = c.from('reviews').select('*').order('created_at', { ascending: false }).limit(300);
  if (!all) q = q.eq('status', 'approved');
  var r = await q; if (r.error) { T(r.error.message); return; }
  RV = {}; (r.data || []).forEach(function (x) { (RV[x.product_id] = RV[x.product_id] || []).push(x); }); go();
};
window.rvSet = async function (id, st) {
  var c = sb(); if (!c || !isStaff()) return;
  var r = await c.from('reviews').update({ status: st }).eq('id', id);
  if (r.error) T(r.error.message); else { T(t('บันทึกแล้ว', 'Saved')); rvLoad(true); }
};
window.rvDel = async function (id) {
  var c = sb(); if (!c || !isStaff()) return;
  if (!confirm(t('ลบรีวิวนี้?', 'Delete this review?'))) return;
  var r = await c.from('reviews').delete().eq('id', id);
  if (r.error) T(r.error.message); else { T(t('ลบแล้ว', 'Deleted')); rvLoad(true); }
};

/* ---------- cart / checkout ---------- */
function csave() { try { localStorage.setItem('jg_cart', JSON.stringify(CART)); } catch (e) {} cnt(); }
function cadd(id, c, s, q, quiet) {
  var p = gp(id), mx = p ? vstockOf(p, c, s) : 0, f = CART.filter(function (x) { return x.id == id && x.c == c && x.s == s; })[0];
  if (mx < 1) { T(t('ชุดนี้หมด', 'Out in this variant')); return; }
  if (f) f.qty = Math.min(mx, f.qty + q); else CART.push({ id: id, c: c, s: s, qty: Math.min(mx, q) });
  csave(); if (!quiet) T(t('หยิบใส่ตะกร้าแล้ว', 'Added to cart'));
}
function cq(i, d) { var l = CART[i], p = gp(l.id), mx = p ? vstockOf(p, l.c, l.s) : 1; l.qty = Math.max(1, Math.min(mx, l.qty + d)); csave(); go(); }
function crm(i) { CART.splice(i, 1); csave(); go(); }
function calc() {
  var sub = 0; CART.forEach(function (l) { var p = gp(l.id); if (p) sub += p.price * l.qty; });
  var d = 0, fs = 0, c = DC && PG.codes.filter(function (x) { return String(x.c).toUpperCase() == DC; })[0];
  if (c) { var v = +c.v || 0; if (c.t == 'pct') d = Math.round(sub * Math.min(100, v) / 100); else if (c.t == 'fixed') d = Math.min(sub, v); else fs = 1; }
  var ship = (sub == 0 || fs || sub - d >= (+PG.ship.free || 0)) ? 0 : (+PG.ship.rate || 0);
  return { sub: sub, d: d, ship: ship, total: sub - d + ship, code: c };
}
function dapply() { var v = ($('#dc').value || '').trim().toUpperCase(); DC = ''; if (v) { if (PG.codes.some(function (x) { return String(x.c).toUpperCase() == v; })) { DC = v; T(t('ใช้โค้ดแล้ว', 'Code applied')); } else T(t('ไม่พบโค้ด', 'Code not found')); } go(); }
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
  function f(id, l, ph, c, t, ac, v) { return '<label class="' + (c || '') + '">' + l + '<input id="' + id + '" type="' + (t || 'text') + '" placeholder="' + ph + '" value="' + esc(v || '') + '" autocomplete="' + (ac || 'off') + '"></label>'; }
  var ad0 = (SB_USER ? myAddr() : { name: '', phone: '', line: '', sub: '', dist: '', prov: '', zip: '' });
  var lastA = lastOrderAddr();
  if (lastA && lastA.line) ad0 = lastA; // ออเดอร์ล่าสุดก่อนที่อยู่บัญชี
  var st = checkoutStash() || {};
  ['name', 'phone', 'line', 'sub', 'dist', 'prov', 'zip'].forEach(function (k, ix) { var v = [st.nm, st.ph, st.ad, st.sd, st.ds, st.pv, st.zp][ix]; if (v != null) ad0[k] = v; });
  var stEm = st.em != null ? st.em : (SB_USER ? SB_USER.email : '');
  var fromLast = !!(lastA && lastA.line);
  var pays = [['promptpay', 'PromptPay', 'Scan QR จากแอปธนาคารหลังสั่งซื้อ'], ['card', 'Credit / debit card', 'จ่ายผ่าน payment provider'], ['bank', 'Bank transfer', 'โอนแล้วแนบสลิป']];
  var items = CART.map(function (l) { var p = gp(l.id); return p ? '<div class="row"><span>' + esc(p.name) + ' <span class="sm">' + esc(l.c) + ' / ' + esc(l.s) + ' × ' + l.qty + '</span></span><span>' + thb(p.price * l.qty) + '</span></div>' : ''; }).join('');
  return '<div class="top"><h1>' + t('ชำระเงิน', 'Checkout') + '</h1><a class="sm" href="#/cart">' + t('กลับไปตะกร้า', 'Back to cart') + '</a></div>' + (SB_USER && ad0.line ? '<p class="sm">' + (fromLast ? t('ดึงที่อยู่จากออเดอร์ล่าสุดให้แล้ว', 'Address filled from your latest order') + ' (' + esc(lastA.no) + ')' : t('ดึงที่อยู่จากบัญชีให้แล้ว', 'Address filled from your account')) + t(' — แก้ได้ตรงนี้', ' — editable here') + '</p>' : '') + '<div class="ck"><div><div class="fm" style="grid-template-columns:1fr 1fr">' + f('em', 'Email', 'name@example.com', 'w2', 'email', 'email', stEm) + f('nm', t('ชื่อ-นามสกุล', 'Full name'), 'ชื่อ-นามสกุล', 'w2', 'text', '', ad0.name) + f('ph', t('โทรศัพท์', 'Phone'), '081 234 5678', 'w2', 'tel', 'tel', ad0.phone) + f('ad', t('ที่อยู่', 'Address'), 'บ้านเลขที่ หมู่ ซอย ถนน', 'w2', 'text', 'street-address', ad0.line) + f('sd', t('แขวง/ตำบล', 'Subdistrict'), '', '', 'text', '', ad0.sub) + f('ds', t('เขต/อำเภอ', 'District'), '', '', 'text', '', ad0.dist) +
    '<label>' + t('จังหวัด', 'Province') + '<input id="pv" list="pvl" placeholder="' + t('เลือกหรือพิมพ์จังหวัด', 'Select province') + '" value="' + esc(ad0.prov) + '"></label><datalist id="pvl">' + PROV.map(function (p) { return '<option value="' + p + '">'; }).join('') + '</datalist>' + f('zp', t('รหัสไปรษณีย์', 'Postcode'), '10110', '', 'text', 'postal-code', ad0.zip) + '</div>' +
    '<h3 style="font-size:28px;margin:28px 0 12px">' + t('ชำระเงิน', 'Payment') + '</h3><div style="display:grid;gap:10px">' + pays.map(function (a, i) { var ck = st.pay ? (st.pay === a[0]) : !i; return '<label class="pay"><input type="radio" name="pay" value="' + a[0] + '"' + (ck ? ' checked' : '') + '><span><b>' + a[1] + '</b><br>' + a[2] + '</span></label>'; }).join('') + '</div></div>' +
    '<div class="fm" style="grid-template-columns:1fr;position:sticky;top:80px"><h3 style="font-size:28px">' + t('สรุปคำสั่งซื้อ', 'Order summary') + '</h3>' + items + sumbox(calc(), 0) + '<button class="btn p" onclick="place()">' + t('สั่งซื้อ', 'Place order') + '</button></div></div>';
}
async function place() {
  if (window._placing) return;
  var done = function () { window._placing = false; };
  window._placing = true;
  var g = function (i) { return (document.getElementById(i).value || '').trim(); }, em = g('em'), ph = g('ph').replace(/[\s-]/g, '').replace(/^\+66/, '0'), zp = g('zp'), err = null;
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) err = t('กรอกอีเมลให้ถูกต้อง', 'Enter a valid email address');
  else if (!g('nm')) err = t('กรอกชื่อ-นามสกุล', 'Enter your full name');
  else if (!/^0\d{8,9}$/.test(ph)) err = t('กรอกเบอร์ไทย เช่น 081 234 5678', 'Enter a Thai phone number, e.g. 081 234 5678');
  else if (!g('ad') || !g('sd') || !g('ds') || !g('pv')) err = t('กรอกที่อยู่ให้ครบ', 'Complete the address');
  else if (!/^\d{5}$/.test(zp)) err = t('รหัสไปรษณีย์ต้อง 5 หลัก', 'Postcode must be 5 digits');
  if (err) { T(err); done(); return; }
  var items = [], bad = 0;
  CART.forEach(function (l) { var p = gp(l.id); var ok = p ? vstockOf(p, l.c, l.s) : 0; if (!p || ok < l.qty) { bad = 1; return; } items.push({ id: p.id, name: p.name, sku: p.sku, c: l.c, s: l.s, qty: l.qty, price: p.price }); });
  if (bad || !items.length) { T(t('บางชิ้นหมดแล้ว ปรับตะกร้าใหม่', 'Some items are no longer available.')); done(); return; }
  var r = calc(), now = new Date().toISOString();
  var o = { no: 'JT-' + Date.now().toString(36).toUpperCase(), at: now, cust: { email: em, name: g('nm'), phone: ph }, addr: { line: g('ad'), sub: g('sd'), dist: g('ds'), prov: g('pv'), zip: zp }, items: items, sub: r.sub, d: r.d, ship: r.ship, total: r.total, code: DC, pay: document.querySelector('input[name=pay]:checked').value, status: 'new', track: '', note: '', stockDone: 0, log: [{ t: now, s: 'Order placed' }] };
  ORDS[o.no] = o; try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
  var c = sb();
  if (c) {
    // บันทึกออเดอร์ก่อน (ยังไม่ตัดสต็อก — ตัดตอน mark paid)
    var ins = await c.from('orders').insert({ order_no: o.no, customer: o.cust, address: o.addr, items: o.items, subtotal: o.sub, discount: o.d, shipping: o.ship, total: o.total, discount_code: o.code, payment_method: o.pay, status: o.status, tracking: o.track, note: o.note, stock_deducted: 0, log: o.log, user_id: (SB_USER && SB_USER.id) || null, customer_email: em.toLowerCase() });
    if (ins.error) { delete ORDS[o.no]; T(t('สั่งไม่สำเร็จ: ', 'Order failed: ') + ins.error.message); done(); return; }
  } else {
    // local mode: ยังไม่ตัดตอนสั่ง รอ mark paid เหมือนกัน
    try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
    saveLocal();
  }
  // จำที่อยู่เข้าบัญชี (ครั้งแรกสั่งแล้วครั้งต่อไปดึงมาเอง)
  if (SB_USER && sb()) {
    try { await sb().from('profiles').update({ full_name: g('nm'), phone: ph, address: { line: g('ad'), sub: g('sd'), dist: g('ds'), prov: g('pv'), zip: zp } }).eq('id', SB_USER.id); } catch (e) {}
    try { if (SB_PROFILE) { SB_PROFILE.full_name = g('nm'); SB_PROFILE.phone = ph; SB_PROFILE.address = { line: g('ad'), sub: g('sd'), dist: g('ds'), prov: g('pv'), zip: zp }; } } catch (e) {}
  }
  CART = []; DC = ''; csave(); try { localStorage.removeItem('jg_checkout'); } catch (e) {} done(); location.hash = '#/done/' + o.no;
}
function doneView(no) {
  var o = ORDS[no]; if (!o) return '<div class="top"><h1>' + t('ไม่พบคำสั่งซื้อ', 'Order not found') + '</h1></div>';
  var m = { promptpay: t('จ่าย ', 'Pay ') + bt(o.total) + t(' ด้วย PromptPay QR จะแสดงหลังต่อ payment provider', ' with PromptPay. QR shows after connecting a provider'), card: t('จ่ายบัตรผ่าน provider — ยังไม่ต่อ ยังไม่ตัดเงิน', 'Card payment not connected yet — no charge'), bank: t('โอนแล้วแจ้งสลิปพร้อมเลข ', 'Transfer then send slip with order ') + esc(o.no) }[o.pay];
  return '<div class="top"><h1>' + t('สั่งซื้อสำเร็จ', 'Order placed') + '</h1></div><p>' + t('เลขคำสั่งซื้อ ', 'Order ') + '<b>' + esc(o.no) + '</b></p><div class="fm" style="grid-template-columns:1fr;max-width:640px;margin-top:24px"><h3 style="font-size:28px">' + t('ขั้นตอนถัดไป: ชำระเงิน', 'Next: payment') + '</h3><p>' + m + '</p></div><a class="btn" href="#/shop">' + t('ช้อปต่อ', 'Continue shopping') + '</a>';
}

/* ---------- home ---------- */
function safe(u) { return /^(#\/|https:\/\/)/.test(u || '') ? u : '#/shop'; }
function simg(u) { return /^(https?:|data:image|\.\/|img\/|\/)/.test(u || '') || /\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(u || '') ? u : ''; }
function card(p) { var a = av(p); return '<div class="cd"><a href="#/p/' + esc(p.id) + '" class="pn">' + pic(p, 0) + '</a><div class="in"><h3>' + esc(p.name) + '</h3><div class="row"><span>' + thb(p.price) + '</span><span class="av ' + a[0] + '"><b></b>' + a[1] + '</span></div></div></div>'; }
function homeView() {
  var sl = H.slides, sh = PG.show, CC = ['#2f3123', '#3a352a', '#2a2b2a', '#4a4d33'], SC = ['#2d2f22', '#232420', '#2d2a21', '#1b1c19', '#35382a'];
  var h = '<div class="hero">' + sl.map(function (s, i) { var u = simg(s.img); return '<div class="sl' + (i ? '' : ' on') + '">' + (u ? '<img src="' + u + '" alt="">' : '') + '<div class="tx"><h1>' + esc(s.h) + '</h1>' + (s.sub ? '<p>' + esc(s.sub) + '</p>' : '') + (s.b1 ? '<a class="btn p" href="' + esc(safe(s.l1)) + '">' + esc(s.b1) + '</a>' : '') + (s.b2 ? '<a class="btn" href="' + esc(safe(s.l2)) + '">' + esc(s.b2) + '</a>' : '') + '</div></div>'; }).join('') + (H.wm && H.wmUrl ? '<img class="wm" src="' + H.wmUrl + '" alt="">' : '') + (sl.length > 1 ? '<div class="hd">' + sl.map(function (s, i) { return '<button aria-label="Slide ' + (i + 1) + '" class="' + (i ? '' : 'on') + '" onclick="hshow(' + i + ',1)"></button>'; }).join('') + '</div>' : '') + '</div>';
  if (sh.cats) h += '<section class="sec"><div class="w"><div class="top"><h2 style="font-size:clamp(40px,6vw,88px)">' + t('คอลเลกชัน', 'Collection') + '</h2><a class="sm" href="#/shop">' + t('ดูทั้งหมด', 'View all') + '</a></div><div class="cats">' + PG.cats.map(function (c, i) { return '<a class="cat pn" href="' + esc(safe(c.l)) + '" style="background:linear-gradient(160deg,' + CC[i % 4] + ',#12130f)"><h3>' + esc(c.t) + '</h3></a>'; }).join('') + '</div></div></section>';
  if (sh.brand) h += '<section class="sec st"><div class="w"><h2>' + esc(PG.brand.h) + '</h2><p>' + esc(PG.brand.p) + '</p></div></section>';
  var fp = list().filter(function (p) { return p.featured; })[0];
  if (sh.featured && fp) { var a = av(fp); h += '<div class="fp"><div class="pn">' + pic(fp, 0) + '</div><div class="in2"><span class="sm">' + esc(fp.coll) + '</span><h2>' + esc(fp.name) + '</h2><div class="price" style="font:700 32px var(--hd)">' + thb(fp.price) + '</div><p style="color:#b9b8ae;max-width:46ch">' + esc(fp.desc) + '</p><div class="av ' + a[0] + '"><b></b>' + a[1] + '</div><div><a class="btn p" href="#/p/' + esc(fp.id) + '">' + t('ดูสินค้า', 'View product') + '</a></div></div></div>'; }
  if (sh.stories) h += '<section class="sec"><div class="w"><div class="top"><h2 style="font-size:clamp(40px,6vw,88px)">' + t('เรื่องจากภาคสนาม', 'Field stories') + '</h2></div><div class="sg">' + PG.stories.map(function (c, i) { return '<a class="sc pn" href="' + esc(safe(c.l)) + '" style="background:linear-gradient(180deg,' + SC[i % 5] + ',#0e0e0b)"><span class="sm">' + esc(c.k) + '</span><h3>' + esc(c.t) + '</h3></a>'; }).join('') + '</div></div></section>';
  var d = PG.drop; if (sh.drop && d.on) h += '<div class="drop"><div class="w"><div><span class="sm">' + esc(d.label) + '</span><h2>' + esc(d.h) + '</h2></div><div><div class="cdn"><div><b id="dd">00</b><span class="sm">' + t('วัน', 'Days') + '</span></div><div><b id="dh">00</b><span class="sm">' + t('ชม.', 'Hours') + '</span></div><div><b id="dm">00</b><span class="sm">' + t('นาที', 'Min') + '</span></div><div><b id="ds">00</b><span class="sm">' + t('วิ', 'Sec') + '</span></div></div><p style="margin-bottom:20px">' + esc(d.p) + '</p>' + (d.b ? '<a class="btn" href="' + esc(safe(d.l)) + '">' + esc(d.b) + '</a>' : '') + '</div></div></div>';
  if (sh.news) h += '<section class="sec nl"><div class="w"><h2 style="font-size:clamp(40px,7vw,100px)">' + esc(PG.news.h) + '</h2>' + (PG.news.p ? '<p style="color:#b9b8ae;margin-top:12px">' + esc(PG.news.p) + '</p>' : '') + '<form onsubmit="nsub(event)"><input type="email" required placeholder="email@example.com"><button type="submit">' + t('สมัคร', 'Subscribe') + '</button></form></div></section>';
  return h;
}
function hshow(i, m) { var l = document.querySelectorAll('.sl'), d = document.querySelectorAll('.hd button'); if (!l.length) return; HK = i % l.length; l.forEach(function (e, j) { e.classList.toggle('on', j == HK); }); d.forEach(function (e, j) { e.classList.toggle('on', j == HK); }); if (m) heroInit(1); }
function heroInit(k) { clearInterval(HT); if (!k) HK = 0; if (H.slides.length < 2) return; HT = setInterval(function () { hshow(HK + 1); }, Math.max(3, H.secs || 7) * 1000); }
function nsub(e) { e.preventDefault(); T(t('สมัครแล้ว เจอกันในสนาม', 'Subscribed. See you in the field.')); e.target.reset(); }
function dropInit() {
  clearInterval(HT2); if (!document.getElementById('dd')) return;
  function t() { var d = new Date((PG.drop.at || '') + ':00+07:00').getTime() - Date.now(); d = isNaN(d) ? 0 : Math.max(0, d); var p = function (x) { return String(x).padStart(2, '0'); }, set = function (i, v) { var e = document.getElementById(i); if (e) e.textContent = v; }; set('dd', p(Math.floor(d / 864e5))); set('dh', p(Math.floor(d / 36e5) % 24)); set('dm', p(Math.floor(d / 6e4) % 60)); set('ds', p(Math.floor(d / 1e3) % 60)); }
  t(); HT2 = setInterval(t, 1000);
}

/* ---------- admin: products ---------- */
var PO = '';
function fld(k, l, t, c) { var v = E[k]; if (Array.isArray(v)) v = v.join(', '); return '<label class="' + (c || '') + '">' + l + (t == 'ta' ? '<textarea data-k="' + k + '">' + esc(v) + '</textarea>' : '<input data-k="' + k + '" type="' + (t || 'text') + '" value="' + esc(v) + '">') + '</label>'; }
function admin() {
  var h = '<div class="top"><h1>' + t('สินค้า', 'Products') + '</h1>' + (isOwner() ? '<button class="btn p" onclick="goNew()">' + t('เพิ่มสินค้า', 'New product') + '</button>' : '<span class="sm">' + esc(roleLabel()) + (myRole() === 'shop_admin' ? t(' · แก้ได้เฉพาะสต็อก', ' · stock only') : '') + '</span>') + '</div>' + (sb() ? (SB_USER ? '<p class="sm">Supabase · ' + esc(SB_USER.email) + ' · ' + esc(roleLabel()) + ' · <a href="#" onclick="sbLogout();return false" style="text-decoration:underline">logout</a></p>' : '<p class="sm">Supabase connected · <a href="#/admin/system/supabase" style="text-decoration:underline">' + t('login เพื่อเขียนข้อมูล', 'login to edit') + '</a></p>') : '<div class="note">' + t('Local mode — ต่อ Supabase ที่เมนู SYSTEM › Supabase', 'Local mode — connect Supabase under SYSTEM › Supabase') + '</div>');
  h += '<div class="sc"><table class="tb"><tr><th>' + t('สินค้า', 'Product') + '</th><th>SKU</th><th>' + t('ราคา', 'Price') + '</th><th>' + t('สต็อก', 'Stock') + '</th><th>' + t('สถานะ', 'Status') + '</th><th></th></tr>';
  P.forEach(function (p, i) {
    var open = PO === p.id;
    h += '<tr style="cursor:pointer" onclick="PO=PO===\'' + p.id + '\'?\'\':\'' + p.id + '\';go()"><td>' + esc(p.name) + (p.featured ? ' <span class="sm">★</span>' : '') + '</td><td>' + esc(p.sku) + '</td><td>' + thb(p.price) + '</td><td' + (p.stock <= p.low ? ' style="color:var(--sd)"' : '') + '>' + p.stock + '</td><td><span class="bd ' + p.status + '">' + p.status + '</span></td><td style="text-align:right;white-space:nowrap"><button class="btn s" onclick="event.stopPropagation();goEdit(\'' + esc(p.id) + '\')">' + (myRole() === 'shop_admin' ? t('สต็อก', 'Stock') : t('แก้', 'Edit')) + '</button>' + (isStaff() ? ' <button class="btn s" onclick="event.stopPropagation();arch(' + i + ')">' + (p.status == 'archived' ? t('กู้คืน', 'Restore') : t('เก็บ', 'Archive')) + '</button>' : '') + (isOwner() ? ' <button class="btn s d" onclick="event.stopPropagation();del(' + i + ')">' + t('ลบ', 'Delete') + '</button>' : '') + '</td></tr>';
    if (open) {
      var allImgs = (IM[p.id] || []).map(function (u) { return { u: u, c: '' }; });
      Object.keys(CIM[p.id] || {}).forEach(function (col) { (CIM[p.id][col] || []).forEach(function (u) { allImgs.push({ u: u, c: col }); }); });
      var imgs = allImgs.map(function (e) { return '<a href="' + e.u + '" target="_blank" style="width:72px;height:90px;display:inline-block;border:1px solid var(--ln);overflow:hidden;position:relative"><img src="' + e.u + '" alt="" style="width:100%;height:100%;object-fit:cover">' + (e.c ? '<span class="sm" style="position:absolute;left:0;right:0;bottom:0;background:rgba(0,0,0,.65);text-align:center">' + esc(e.c) + '</span>' : '') + '</a>'; }).join('');
      var kv = function (k, v) { return (v === '' || v == null || (Array.isArray(v) && !v.length)) ? '' : '<div><b>' + k + '</b><br>' + esc(Array.isArray(v) ? v.join(', ') : v) + '</div>'; };
      h += '<tr><td colspan="6" style="text-align:left"><div class="fm" style="margin:0;border:0;padding:8px 0;grid-template-columns:repeat(4,1fr)">' + (imgs ? '<div class="w4" style="display:flex;gap:8px;flex-wrap:wrap">' + imgs + '</div>' : '') +
        '<div class="w4" style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn s" href="#/p/' + esc(p.id) + '">' + t('ดูหน้าร้าน', 'View storefront') + '</a></div>' +
        kv('ID', p.id) + kv('Barcode', p.barcode) + kv(t('หมวด', 'Category'), p.cat) + kv(t('คอลเลกชัน', 'Collection'), p.coll) +
        kv(t('ราคา', 'Price'), bt(p.price)) + kv(t('เทียบราคา', 'Compare-at'), p.compare ? bt(p.compare) : '') + kv(t('ต้นทุน', 'Cost'), p.cost ? bt(p.cost) : '') + kv(t('กำไร/ชิ้น', 'Margin'), (p.price - (p.cost || 0)) ? bt(p.price - (p.cost || 0)) : '') +
        kv(t('สต็อก', 'Stock'), p.stock + ' (' + t('เตือนที่ ', 'low at ') + p.low + ')' + (csText(p) ? ' — ' + csText(p) : '') + (vsText(p) ? ' — ' + vsText(p) : '')) + kv(t('สี', 'Colors'), p.colors) + kv(t('ไซส์', 'Sizes'), p.sizes) + kv('Tags', p.tags) +
        '<div class="w4">' + kv(t('อธิบาย', 'Description'), p.desc) + kv('Spec', p.spec) + kv(t('วัสดุ', 'Material'), p.material) + kv(t('ขนาด', 'Dimensions'), p.dims) + kv(t('โน้ต', 'Notes'), p.notes) + '</div><div class="w4"><button class="btn s" onclick="stHist(\'' + esc(p.id) + '\')">' + t('ประวัติสต็อก', 'Stock history') + '</button><div id="stm-' + esc(p.id) + '" style="margin-top:8px">' + stmRows(p.id) + '</div></div></div></td></tr>';
    }
  });
  return h + '</table></div>';
}
function form() {
  var ro = myRole() === 'shop_admin' ? '<div class="note w4">Shop admin: แก้ได้เฉพาะ Stock / Low threshold / Status — ช่องอื่นจะถูกคงค่าเดิมตอนบันทึก</div>' : '';
  var sec = function (n, t) { return '<h3 class="w4 row" style="font-size:24px;margin-top:8px;justify-content:flex-start"><span class="bd">' + n + '</span><span style="flex:1">' + t + '</span><button class="btn s p" onclick="commit()">' + t('บันทึก', 'Save') + '</button></h3>'; };
  return '<div class="fm" id="fm">' + ro +
    sec('1', t('ข้อมูลหลัก', 'Basic info')) +
    fld('name', t('ชื่อสินค้า *', 'Product name *'), '', 'w2') + fld('sku', 'SKU') + fld('barcode', 'Barcode') +
    '<label>' + t('หมวด', 'Category') + '<select data-k="cat">' + CAT.map(function (c) { return '<option' + (E.cat == c ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label>' + fld('coll', t('คอลเลกชัน', 'Collection')) +
    '<label>' + t('สถานะขาย', 'Status') + '<select data-k="status">' + [['active', t('ขาย', 'Active')], ['draft', t('ฉบับร่าง', 'Draft')], ['archived', t('เก็บ', 'Archived')]].map(function (c) { return '<option value="' + c[0] + '"' + (E.status == c[0] ? ' selected' : '') + '>' + c[1] + '</option>'; }).join('') + '</select></label>' +
    '<label>' + t('แนะนำหน้าแรก', 'Featured') + '<select data-k="featured"><option value="0">' + t('ไม่', 'No') + '</option><option value="1"' + (E.featured ? ' selected' : '') + '>' + t('ใช่', 'Yes') + '</option></select></label>' +
    sec('2', t('ราคา', 'Pricing')) +
    fld('price', t('ราคาขาย (฿) *', 'Price (THB) *'), 'number') + fld('compare', t('ราคาขีดฆ่า', 'Compare-at'), 'number') + fld('cost', t('ต้นทุน', 'Cost'), 'number') + '<div class="w4 sm" style="align-self:end">' + t('กำไร/ชิ้น = ราคาขาย − ต้นทุน', 'Margin = price − cost') + '</div>' +
    sec('3', t('ตัวเลือก + สต็อก', 'Options + stock')) +
    optChips() +
    fld('stock', t('สต็อกรวม', 'Total stock'), 'number') + fld('low', t('เตือนเมื่อเหลือ', 'Low threshold'), 'number') +
    '<div class="w4 sm">' + t('กรอกสต็อกแยกชุดด้านล่าง ยอดรวมคำนวณเอง (เว้นว่าง = ข้าม)', 'Fill per-variant stock below, total auto-calculated (blank = skip)') + '</div>' + vsui() + fld('tags', 'Tags', '', 'w4') +
    sec('4', t('รายละเอียด', 'Details')) +
    fld('desc', t('คำโปรยสั้น', 'Short description'), 'ta', 'w4') + fld('spec', t('สเปก', 'Specifications'), 'ta', 'w2') + fld('material', t('วัสดุ', 'Material'), 'ta', 'w2') + fld('dims', t('ขนาด', 'Dimensions'), 'ta', 'w2') + fld('notes', t('โน้ตภาคสนาม', 'Field notes'), 'ta', 'w2') +
    sec('5', t('รูปภาพ (สูงสุด 4)', 'Images (max 4)')) + imgui() +
    '<div class="w4" style="display:flex;gap:10px"><button class="btn p" onclick="commit()">' + t('บันทึกสินค้า', 'Save product') + '</button><button class="btn" onclick="cancelEdit()">' + t('ยกเลิก', 'Cancel') + '</button></div></div>';
}
function loadEdit(i) { E = i < 0 ? mk('new-' + Date.now().toString(36), '', 'Apparel', 'Core', 0, 0, 0, 0, ['Black'], ['One size'], 0, '') : JSON.parse(JSON.stringify(P[i])); E._i = i; E._id = i < 0 ? E.id : P[i].id; EI = (IM[E.id] || []).map(function (u) { return { u: u, c: '' }; }); Object.keys(CIM[E.id] || {}).forEach(function (col) { (CIM[E.id][col] || []).forEach(function (u) { EI.push({ u: u, c: col }); }); }); if (i < 0) { E.status = 'draft'; E.sku = ''; } }
function edit(i) { loadEdit(i); go(); var f = $('#fm'); f && f.scrollIntoView({ behavior: 'smooth' }); }
function goNew() { if (!isOwner()) { T(t('เพิ่มสินค้าได้เฉพาะ owner', 'Owner only')); return; } loadEdit(-1); location.hash = '#/admin/products/new'; }
function goEdit(id) { var i = P.findIndex(function (x) { return x.id === id; }); if (i < 0) { T(t('ไม่พบสินค้า', 'Product not found')); return; } loadEdit(i); location.hash = '#/admin/products/edit/' + encodeURIComponent(id); }
function adminEditView(isNew) {
  return '<div class="top"><h1>' + (isNew ? t('เพิ่มสินค้า', 'New product') : t('แก้ไขสินค้า', 'Edit product')) + '</h1><a class="sm" href="#/admin/products">' + t('กลับไปรายการ', 'Back to list') + '</a></div>' + form();
}
async function commit() {
  if (!isStaff()) { T('ต้อง login เป็น staff'); return; }
  if (!isOwner() && myRole() === 'shop_admin' && arguments.length === 0) { /* stock-only enforced below */ }
  var o = JSON.parse(JSON.stringify(E)), i = o._i; delete o._i;
  var eid = o._id; delete o._id;
  if (eid && i >= 0) { var ri = P.findIndex(function (x) { return x.id === eid; }); if (ri > -1) i = ri; }
  if (i >= 0 && (!P[i] || P[i].id !== eid)) i = -1; // สินค้าถูกลบระหว่างดราฟ -> บันทึกเป็นตัวใหม่
  document.querySelectorAll('#fm [data-k]').forEach(function (e) { var k = e.dataset.k, v = e.value; if (k == 'colors' || k == 'sizes') return; if (['price', 'compare', 'cost', 'stock', 'low'].indexOf(k) > -1) v = Math.max(0, parseInt(v, 10) || 0); else if (k == 'featured') v = v == '1' ? 1 : 0; o[k] = v; });
  if (!Array.isArray(o.colors)) o.colors = []; if (!Array.isArray(o.sizes)) o.sizes = [];
  var vsInputs = document.querySelectorAll('#fm [data-vs]');
  var vsm = {}; vsInputs.forEach(function (e) { var v = parseInt(e.value, 10); if (!isNaN(v) && v >= 0) vsm[e.getAttribute('data-vs')] = v; });
  if (vsInputs.length && !Object.keys(vsm).length) { T(t('กรุณากรอกสต็อกแยกชุดอย่างน้อย 1 ช่อง (ยอดรวมคำนวณเอง)', 'Fill at least one variant stock — total is auto-calculated')); return; }
  o.vstock = vsm;
  // ตัดคีย์เก่าที่สี/ไซส์ไม่อยู่ในรายการแล้ว (กันคีย์ค้างทำให้ซื้อไม่ได้)
  var okCols = {}, okVs = {};
  (o.colors || []).forEach(function (c) { okCols[c] = 1; });
  (o.sizes || []).forEach(function (s) { okVs[s] = 1; });
  Object.keys(o.vstock || {}).forEach(function (k) { var a = k.split('__'); if (!okCols[a[0]] || !okVs[a[1]]) delete o.vstock[k]; });
  if (Object.keys(o.vstock).length) { vsSync(o); } // variant -> รายสี + ยอดรวม
  else if (vsInputs.length) { o.vstock = {}; o.cstock = {}; } // ล้าง matrix หมด = กลับใช้ยอดรวม
  else { o.cstock = (E.cstock && Object.keys(E.cstock).length) ? E.cstock : {}; } // ไม่มี matrix: คงรายสีเดิมไว้
  if (!o.name.trim()) { T(t('กรอกชื่อสินค้า', 'Enter a product name')); return; }
  if (!o.colors.length) o.colors = ['Black']; if (!o.sizes.length) o.sizes = ['One size'];
  if (o._new !== false && i < 0) o.id = 'p-' + Date.now().toString(36);
  if (!o.sku.trim()) o.sku = o.id.toUpperCase();
  if (myRole() === 'shop_admin' && i >= 0) {
    // shop_admin แก้ได้เฉพาะ stock/low/status (+ สต็อกรายสี) — คงค่าอื่นจากของเดิม
    var keep = P[i]; ['name', 'sku', 'barcode', 'cat', 'coll', 'price', 'compare', 'cost', 'featured', 'colors', 'sizes', 'tags', 'desc', 'spec', 'material', 'dims', 'notes'].forEach(function (k) { o[k] = keep[k]; });
    if (Object.keys(o.vstock || {}).length) vsSync(o);
    else if (Object.keys(o.cstock || {}).length) o.stock = cstockSum(o.cstock);
  }
  if (i < 0 && myRole() === 'shop_admin') { T('สร้างสินค้าได้เฉพาะ owner'); return; }
  if (i < 0) P.push(o); else { o.id = P[i].id; P[i] = o; }
  o.cover = (EI[0] && EI[0].u) || ''; // รูปแรก = ปกหน้าร้านเสมอ
  IM[o.id] = EI.filter(function (e) { return !e.c; }).map(function (e) { return e.u; }).slice(0, 4);
  CIM[o.id] = {}; EI.filter(function (e) { return e.c; }).forEach(function (e) { (CIM[o.id][e.c] = CIM[o.id][e.c] || []).push(e.u); });
  if (!Object.keys(CIM[o.id]).length) delete CIM[o.id];
  saveLocal(); await dbUpsertProduct(o);
  E = null; EI = []; clearDraft(); T(t('บันทึกแล้ว', 'Saved')); location.hash = '#/admin/products';
}
async function arch(i) { if (!isStaff()) { T('ต้อง login เป็น staff'); return; } P[i].status = P[i].status == 'archived' ? 'draft' : 'archived'; saveLocal(); await dbUpsertProduct(P[i]); go(); }
async function del(i) { if (!isOwner()) { T('ลบสินค้าได้เฉพาะ owner'); return; } if (!confirm(t('ลบ "', 'Delete "') + P[i].name + '"?')) return;   var id = P[i].id; P.splice(i, 1); delete IM[id]; delete CIM[id]; saveLocal(); await dbDeleteProduct(id); go(); }

/* ---------- images (Storage-first) ---------- */
function sync() {
  var f = document.getElementById('fm'); if (!f || !E) return;
  f.querySelectorAll('[data-k]').forEach(function (e) { var k = e.dataset.k; if (k == 'colors' || k == 'sizes') return; E[k] = k == 'featured' ? (e.value == '1' ? 1 : 0) : e.value; });
  var vsInputs = f.querySelectorAll('[data-vs]');
  if (vsInputs.length) { var vsm = {}; vsInputs.forEach(function (e) { var v = parseInt(e.value, 10); if (!isNaN(v) && v >= 0) vsm[e.getAttribute('data-vs')] = v; }); E.vstock = vsm; }
  try { localStorage.setItem('jg_draft', JSON.stringify({ E: E, EI: EI })); } catch (e) {}
}
function clearDraft() { try { localStorage.removeItem('jg_draft'); } catch (e) {} }
function loadDraft() {
  try {
    var d = JSON.parse(localStorage.getItem('jg_draft') || 'null');
    if (d && d.E && (d.E._id || d.E._i != null)) { E = d.E; EI = d.EI || []; return true; }
  } catch (e) {}
  return false;
}
function cancelEdit() { E = null; EI = []; clearDraft(); location.hash = '#/admin/products'; }
function colorSuggest() {
  var seen = {}, out = [];
  (P || []).forEach(function (p) { (p.colors || []).forEach(function (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } }); });
  ['Black', 'Olive Drab', 'Sand', 'Concrete', 'White', 'Navy', 'Gray', 'Brown', 'Green', 'RED', 'Yellow', 'Blue', 'Camouflage'].forEach(function (c) { if (!seen[c]) { seen[c] = 1; out.push(c); } });
  return out.filter(function (c) { return (E.colors || []).indexOf(c) < 0; });
}
function sizeSuggest() {
  var seen = {}, out = [];
  (P || []).forEach(function (p) { (p.sizes || []).forEach(function (s) { if (!seen[s]) { seen[s] = 1; out.push(s); } }); });
  ['One size', 'S', 'M', 'L', 'XL', 'XXL'].forEach(function (s) { if (!seen[s]) { seen[s] = 1; out.push(s); } });
  return out.filter(function (s) { return (E.sizes || []).indexOf(s) < 0; });
}
function optChips() {
  function chips(arr, del) { return arr.map(function (x) { return '<span class="bd" style="display:inline-flex;gap:6px;align-items:center;padding:4px 6px 4px 10px">' + esc(x) + ' <button class="btn s" style="padding:2px 8px" onclick="' + del + '(\'' + esc(x).replace(/'/g, "\\'") + '\')">✕</button></span>'; }).join(''); }
  return '<div class="w2"><span>' + t('สี', 'Colors') + ' (' + (E.colors || []).length + ')</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0">' + chips(E.colors || [], 'colDel') + '</div><div style="display:flex;gap:6px"><select id="col-add" onchange="colAdd(this.value);this.value=\'\'"><option value="">+ ' + t('เลือกสี', 'Pick color') + '</option>' + colorSuggest().map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select><input id="col-custom" placeholder="' + t('หรือพิมพ์สีใหม่', 'or type new') + '"><button class="btn s" onclick="colCustom()">+</button></div></div>' +
    '<div class="w2"><span>' + t('ไซส์', 'Sizes') + ' (' + (E.sizes || []).length + ')</span><div style="display:flex;gap:6px;flex-wrap:wrap;margin:6px 0">' + chips(E.sizes || [], 'sizeDel') + '</div><div style="display:flex;gap:6px"><select id="sz-add" onchange="sizeAdd(this.value);this.value=\'\'"><option value="">+ ' + t('เลือกไซส์', 'Pick size') + '</option>' + sizeSuggest().map(function (s) { return '<option>' + esc(s) + '</option>'; }).join('') + '</select><input id="sz-custom" placeholder="' + t('หรือพิมพ์ไซส์ใหม่', 'or type new') + '"><button class="btn s" onclick="sizeCustom()">+</button></div></div>';
}
function colAdd(v) { v = (v || '').trim(); if (!v) return; sync(); if (E.colors.indexOf(v) < 0) E.colors.push(v); redraw(); }
function colCustom() { var el = document.getElementById('col-custom'); colAdd(el ? el.value : ''); }
function colDel(c) { sync(); E.colors = E.colors.filter(function (x) { return x !== c; }); if (E.cstock) delete E.cstock[c]; redraw(); }
function sizeAdd(v) { v = (v || '').trim(); if (!v) return; sync(); if (E.sizes.indexOf(v) < 0) E.sizes.push(v); redraw(); }
function sizeCustom() { var el = document.getElementById('sz-custom'); sizeAdd(el ? el.value : ''); }
function sizeDel(s) { sync(); E.sizes = E.sizes.filter(function (x) { return x !== s; }); redraw(); }
function redraw() { var y = scrollY; go(); scrollTo(0, y); }
function ecols() {
  var v = E.colors;
  if (Array.isArray(v)) return v.filter(Boolean);
  return String(v || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
}
function esizes() {
  var v = E.sizes;
  if (Array.isArray(v)) return v.filter(Boolean);
  return String(v || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
}
function vsui() {
  var cols = ecols(), szs = esizes();
  if (!cols.length || !szs.length || (szs.length < 2 && cols.length < 2)) return '';
  var cur = E.vstock || {};
  return '<div class="w4"><span>' + t('สต็อกแยกสี×ไซส์ (เว้นว่าง = ข้าม)', 'Stock per color×size (blank = skip)') + '</span><div class="sc" style="margin-top:6px"><table class="tb"><tr><th></th>' + szs.map(function (s) { return '<th>' + esc(s) + '</th>'; }).join('') + '</tr>' + cols.map(function (c) { return '<tr><td><b>' + esc(c) + '</b></td>' + szs.map(function (s) { return '<td><input data-vs="' + esc(c) + '__' + esc(s) + '" type="number" min="0" style="width:80px" value="' + (cur[vsKey(c, s)] != null ? cur[vsKey(c, s)] : '') + '"></td>'; }).join('') + '</tr>'; }).join('') + '</table></div></div>';
}
function eiset(i, v) { sync(); EI[i].c = v; redraw(); }
function imgui() {
  var cols = ecols();
  function cosel(s, i) { return '<select onchange="eiset(' + i + ',this.value)" style="margin-top:6px;width:100%"><option value="">' + t('ทุกสี', 'All colors') + '</option>' + cols.map(function (c) { return '<option value="' + esc(c) + '"' + (s.c === c ? ' selected' : '') + '>' + esc(c) + '</option>'; }).join('') + '</select>'; }
  return '<div class="w4"><span>' + t('รูปสินค้า', 'Product images') + ' (' + EI.length + '/4)' + (sb() ? ' · Supabase Storage' : ' · local') + '</span><div class="im" style="margin-top:8px">' + EI.map(function (s, i) { return '<div><div class="pn"><img src="' + s.u + '" alt=""></div>' + cosel(s, i) + '<div style="display:flex;gap:6px;margin-top:6px"><button class="btn s" onclick="imv(' + i + ')"' + (i ? '' : ' disabled') + '>' + t('ตั้งเป็นปก', 'Make first') + '</button><button class="btn s d" onclick="irm(' + i + ')">' + t('ลบ', 'Remove') + '</button></div></div>'; }).join('') + '</div>' + (EI.length < 4 ? '<button class="btn s" style="margin-top:10px" onclick="document.getElementById(\'fi\').click()">' + t('อัปโหลดรูป', 'Upload images') + '</button> <button class="btn s" style="margin-top:10px" onclick="pickProductImg()">' + t('จากคลัง', 'Library') + '</button><input id="fi" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onchange="iup(this.files)">' : '') + '<p style="font-size:12px">' + t('เลือกรูปแล้วระบุสีของรูปนั้น ถ้าเลือก "ทุกสี" รูปจะโชว์ทุกสี', 'Tag each image with its color, or All colors to show for every color') + '</p></div>';
}
function imv(i) { sync(); EI.unshift(EI.splice(i, 1)[0]); redraw(); }
function irm(i) { sync(); EI.splice(i, 1); redraw(); }
function rsBlob(f, m) {
  m = m || 1000;
  return new Promise(function (res) {
    var im = new Image(), u = URL.createObjectURL(f);
    im.onload = function () { var k = Math.min(1, m / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); var x = c.getContext('2d'); x.fillStyle = '#1a1b19'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(function (b) { c.toDataURL && 0; res({ blob: b, dataUrl: c.toDataURL('image/jpeg', .72) }); }, 'image/jpeg', .72); };
    im.onerror = function () { URL.revokeObjectURL(u); T(t('อ่านไฟล์ไม่ได้ ', 'Could not read ') + f.name); res(null); }; im.src = u;
  });
}
async function iup(fs) {
  sync(); var ok = ['image/jpeg', 'image/png', 'image/webp'], all = [].slice.call(fs), l = all.slice(0, 4 - EI.length);
  if (all.length > l.length) T(t('ได้สูงสุด 4 รูปต่อสินค้า', 'Only 4 images per product'));
  for (var j = 0; j < l.length; j++) {
    var f = l[j];
    if (ok.indexOf(f.type) < 0 || f.size > 15e6) { T(t('ข้าม ', 'Skipped ') + f.name); continue; }
    var r = await rsBlob(f); if (!r) continue;
    var c = sb();
    if (c && E && E.id) {
      var path = E.id + '/' + Date.now().toString(36) + '-' + j + '.jpg';
      var up = await c.storage.from('product-images').upload(path, r.blob, { contentType: 'image/jpeg', upsert: true });
      if (up.error) { T(t('อัปโหลดไม่สำเร็จ เก็บแบบ local', 'Upload failed, kept locally')); EI.push({u:r.dataUrl,c:''}); }
      else { var pub = c.storage.from('product-images').getPublicUrl(path); EI.push({u:pub.data.publicUrl,c:''}); }
    } else EI.push({u:r.dataUrl,c:''});
  }
  redraw();
}

/* ---------- media library (v14) ---------- */
var mediaCb = null;
function jtMediaPage() {
  var folders = Array.from(new Set(MD.map(function (m) { return m.folder || 'General'; })));
  return jtShell(t('คลังรูป', 'Media'), '#/admin/website/media', '<div class="jt-panel"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="btn p" onclick="document.getElementById(\'md-file\').click()">' + t('อัปโหลดรูป', 'Upload') + '</button><input id="md-file" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onchange="mdUpload(this.files);this.value=\'\'"><span class="sm" style="align-self:center">' + MD.length + ' ' + t('ไฟล์', 'files') + '</span></div>' + (MD.length ? '<div class="im" style="grid-template-columns:repeat(4,1fr)">' + MD.map(function (m) { return '<div><div class="pn" style="aspect-ratio:1"><img src="' + m.url + '" alt="" loading="lazy"></div><div class="sm" style="margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(m.name) + '</div><div style="display:flex;gap:6px;margin-top:4px"><button class="btn s" onclick="mdCopy(\'' + m.id + '\')">URL</button><button class="btn s d" onclick="mdDel(\'' + m.id + '\')">' + t('ลบ', 'Delete') + '</button></div></div>'; }).join('') + '</div>' : '<p class="sm">' + t('ยังไม่มีรูป — อัปโหลดเพื่อใช้ซ้ำทั้งเว็บ', 'No media yet — upload once, reuse everywhere.') + '</p>') + (folders.length ? '<p class="jgt-muted" style="margin-top:8px">Folders: ' + folders.map(esc).join(', ') + '</p>' : '') + '</div>');
}
window.mdUpload = async function (fs) {
  var c = sb(); if (!c || !isOwner()) { T(t('อัปโหลดได้เฉพาะ owner', 'Owner only')); return; }
  var files = Array.prototype.slice.call(fs || []).filter(function (f) { return ['image/jpeg', 'image/png', 'image/webp'].indexOf(f.type) > -1 && f.size <= 15e6; });
  if (!files.length) { T(t('ใช้ JPG/PNG/WebP ไม่เกิน 15MB', 'JPG/PNG/WebP under 15MB only')); return; }
  for (var i = 0; i < files.length; i++) {
    var r = await rsBlob(files[i], 1600); if (!r || !r.blob) continue;
    var path = 'lib/' + Date.now().toString(36) + '-' + i + '.jpg';
    var up = await c.storage.from('media').upload(path, r.blob, { contentType: 'image/jpeg', upsert: true });
    if (up.error) { T(up.error.message); continue; }
    var pub = c.storage.from('media').getPublicUrl(path);
    await c.from('media').insert({ url: pub.data.publicUrl, path: path, name: files[i].name, folder: 'General', size: files[i].size });
  }
  var mdq = await c.from('media').select('*').order('created_at', { ascending: false }).limit(200);
  if (!mdq.error) MD = mdq.data || MD;
  T(t('อัปโหลดแล้ว', 'Uploaded')); go();
};
window.mdCopy = function (id) {
  var m = MD.filter(function (x) { return x.id === id; })[0]; if (!m) return;
  var done = function () { T('URL copied'); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m.url).then(done, function () { prompt('Copy URL:', m.url); });
  else prompt('Copy URL:', m.url);
};
window.mdDel = async function (id) {
  var c = sb(); if (!c || !isOwner()) return;
  if (!confirm(t('ลบไฟล์นี้?', 'Delete this file?'))) return;
  var m = MD.filter(function (x) { return x.id === id; })[0];
  if (m && m.path) await c.storage.from('media').remove([m.path]);
  var r = await c.from('media').delete().eq('id', id);
  if (r.error) T(r.error.message); else { MD = MD.filter(function (x) { return x.id !== id; }); T(t('ลบแล้ว', 'Deleted')); go(); }
};
/* picker modal: เลือกรูปจากคลังไปใช้ */
function openMediaPicker(cb) {
  mediaCb = cb;
  var ov = document.createElement('div');
  ov.id = 'md-picker'; ov.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.7);display:grid;place-items:center;padding:20px';
  ov.innerHTML = '<div style="background:#11120f;border:1px solid var(--ln);max-width:860px;width:100%;max-height:84vh;overflow:auto;padding:18px"><div class="row" style="margin-bottom:12px"><h3 style="font-size:24px">' + t('เลือกจากคลัง', 'Pick from library') + '</h3><button class="btn s" onclick="closeMediaPicker()">✕</button></div>' + (MD.length ? '<div class="im" style="grid-template-columns:repeat(4,1fr)">' + MD.map(function (m, i) { return '<div><div class="pn" style="aspect-ratio:1;cursor:pointer" onclick="pickMedia(' + i + ')"><img src="' + m.url + '" alt="" loading="lazy"></div><div class="sm" style="margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(m.name) + '</div></div>'; }).join('') + '</div>' : '<p class="sm">' + t('คลังว่าง — อัปโหลดที่หน้า Media ก่อน', 'Library is empty — upload in Media first.') + '</p>') + '</div>';
  ov.addEventListener('click', function (e) { if (e.target === ov) closeMediaPicker(); });
  document.body.appendChild(ov);
}
function closeMediaPicker() { mediaCb = null; var ov = document.getElementById('md-picker'); if (ov) ov.remove(); }
function pickMedia(i) { var m = MD[i]; if (m && mediaCb) { var cb = mediaCb; closeMediaPicker(); cb(m.url); } }
function pickProductImg() { sync(); if (EI.length >= 4) { T(t('ได้สูงสุด 4 รูป', 'Max 4 images')); return; } openMediaPicker(function (url) { EI.push({u:url,c:''}); redraw(); }); }
function pickSlideImg(i) { openMediaPicker(function (url) { HS.slides[i].img = url; redraw(); }); }
function pickLogoImg() { openMediaPicker(function (url) { HS.logoUrl = url; redraw(); }); }
function pickWmImg() { openMediaPicker(function (url) { HS.wmUrl = url; redraw(); }); }

/* ---------- stock history (ledger) ---------- */
var STM = {};
function rsnLabel(r) { return { opening: t('ยอดยกมา', 'Opening'), import: t('นำเข้า', 'Import'), sale: t('ขาย', 'Sale'), restore: t('คืนของ', 'Restored'), adjust: t('ปรับมือ', 'Adjust') }[r] || r; }
function stmRows(pid) {
  var rows = STM[pid];
  if (!rows) return '<span class="sm">' + t('กดปุ่มเพื่อดู', 'Press the button') + '</span>';
  if (!rows.length) return '<span class="sm">' + t('ยังไม่มีประวัติ', 'No history') + '</span>';
  return '<table class="tb"><tr><th>' + t('วัน', 'Date') + '</th><th>' + t('ที่มา', 'Reason') + '</th><th>' + t('ชุด', 'Variant') + '</th><th>' + t('ก่อน', 'Before') + '</th><th>' + t('หลัง', 'After') + '</th><th>±</th></tr>' + rows.map(function (m) { return '<tr><td>' + new Date(m.created_at).toLocaleString('en-GB') + '</td><td>' + esc(rsnLabel(m.reason)) + (m.order_no ? ' ' + esc(m.order_no) : '') + '</td><td>' + esc(m.variant_key ? m.variant_key.split('__').join('/') : '-') + '</td><td>' + (m.before_qty == null ? '-' : m.before_qty) + '</td><td>' + m.after_qty + '</td><td>' + (m.change_qty > 0 ? '+' : '') + m.change_qty + '</td></tr>'; }).join('') + '</table>';
}
window.stHist = async function (pid) {
  var c = sb(); if (!c || !isStaff()) { T(t('ต้อง login เป็น staff', 'Staff only')); return; }
  var r = await c.from('stock_moves').select('*').eq('product_id', pid).order('created_at', { ascending: false }).limit(50);
  if (r.error) { T(r.error.message); return; }
  STM[pid] = r.data || []; go();
};
function adminHome() {
  if (!HS) HS = JSON.parse(JSON.stringify(H)); var s = HS.slides;
  function inp(i, k, l, ph, c) { return '<label class="' + (c || '') + '">' + l + '<input value="' + esc(HS.slides[i][k]) + '" placeholder="' + (ph || '') + '" oninput="hset(' + i + ',\'' + k + '\',this.value)"></label>'; }
  function hck(k, l) { return '<label style="flex-direction:row;align-items:center;gap:10px;text-transform:none;letter-spacing:0;font-size:14px;color:var(--ow)"><input type="checkbox"' + (HS[k] ? ' checked' : '') + ' onchange="HS.' + k + '=this.checked?1:0" style="width:18px;height:18px;min-width:0">' + l + '</label>'; }
  return '<div class="top"><h1>' + t('หน้าแรก', 'Homepage') + '</h1><button class="btn p" onclick="hsave()">' + t('บันทึกหน้าแรก', 'Save homepage') + '</button></div>' + (sb() ? '' : '<div class="note">Local mode</div>') +
    '<div class="fm" style="grid-template-columns:1fr">' + hck('logo', t('โชว์โลโก้', 'Show brand logo')) + hck('wm', t('โชว์ลายน้ำ', 'Show watermark')) + '<label>' + t('วินาทีต่อสไลด์', 'Seconds per slide') + '<input type="number" min="3" max="30" value="' + HS.secs + '" oninput="HS.secs=Math.min(30,Math.max(3,+this.value||7))"></label><label>' + t('รูปโลโก้', 'Logo image') + '<input value="' + esc(HS.logoUrl || '') + '" oninput="HS.logoUrl=this.value"></label><div style="display:flex;gap:6px"><button class="btn s" onclick="pickLogoImg()">' + t('จากคลัง', 'Library') + '</button></div><label>' + t('รูปลายน้ำ', 'Watermark image') + '<input value="' + esc(HS.wmUrl || '') + '" oninput="HS.wmUrl=this.value"></label><div style="display:flex;gap:6px"><button class="btn s" onclick="pickWmImg()">' + t('จากคลัง', 'Library') + '</button></div></div>' +
    s.map(function (x, i) { var u = simg(x.img); return '<div class="fm" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))"><div style="display:grid;gap:8px;align-content:start"><div class="pn" style="aspect-ratio:16/9">' + (u ? '<img src="' + u + '" alt="">' : '<span style="position:absolute;inset:0;display:grid;place-items:center;z-index:1;font-size:12px">' + t('ไม่มีรูป', 'No image') + '</span>') + '</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn s" onclick="document.getElementById(\'hf' + i + '\').click()">' + (u ? t('เปลี่ยน', 'Replace') : t('อัปโหลด', 'Upload')) + '</button><button class="btn s" onclick="pickSlideImg(' + i + ')">' + t('จากคลัง', 'Library') + '</button>' + (u ? '<button class="btn s d" onclick="hset(' + i + ',\'img\',\'\',1)">' + t('ลบ', 'Remove') + '</button>' : '') + '<input id="hf' + i + '" type="file" accept="image/jpeg,image/png,image/webp" hidden onchange="hup(' + i + ',this.files)"></div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' + inp(i, 'h', t('หัวข้อ', 'Headline'), '', 'w2') + inp(i, 'sub', t('หัวข้อรอง', 'Subheadline'), '', 'w2') + inp(i, 'b1', t('ปุ่ม 1', 'Button 1')) + inp(i, 'l1', t('ลิงก์ 1', 'Link 1'), '#/shop') + inp(i, 'b2', t('ปุ่ม 2', 'Button 2')) + inp(i, 'l2', t('ลิงก์ 2', 'Link 2'), '#/shop') +
      '<div class="w2" style="display:flex;gap:8px"><button class="btn s" onclick="hmv(' + i + ',-1)"' + (i ? '' : ' disabled') + '>' + t('ขึ้น', 'Up') + '</button><button class="btn s" onclick="hmv(' + i + ',1)"' + (i < s.length - 1 ? '' : ' disabled') + '>' + t('ลง', 'Down') + '</button><button class="btn s d" onclick="hdel(' + i + ')"' + (s.length > 1 ? '' : ' disabled') + '>' + t('ลบ', 'Delete') + '</button></div></div></div>'; }).join('') + (s.length < 6 ? '<button class="btn" onclick="hadd()">' + t('เพิ่มสไลด์', 'Add slide') + '</button>' : '');
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
  await dbSavePage(); T(t('บันทึกหน้าแรกแล้ว', 'Homepage saved'));
}
function pget(o, p) { return p.split('.').reduce(function (a, k) { return a && a[k]; }, o); }
function pset(p, v) { var a = p.split('.'), o = PGS; for (var i = 0; i < a.length - 1; i++) o = o[a[i]]; o[a[a.length - 1]] = v; }
function pin(p, l, t, c) { var v = pget(PGS, p); return '<label class="' + (c || '') + '">' + l + (t == 'ta' ? '<textarea oninput="pset(\'' + p + '\',this.value)">' + esc(v) + '</textarea>' : '<input value="' + esc(v) + '" oninput="pset(\'' + p + '\',this.value)">') + '</label>'; }
function pck(p, l, c) { return '<label class="' + (c || '') + '" style="flex-direction:row;align-items:center;gap:10px;text-transform:none;letter-spacing:0;font-size:14px"><input type="checkbox"' + (pget(PGS, p) ? ' checked' : '') + ' onchange="pset(\'' + p + '\',this.checked?1:0)" style="width:18px;height:18px">' + l + '</label>'; }
function psel(p, l, o, c) { var v = pget(PGS, p); return '<label class="' + (c || '') + '">' + l + '<select onchange="pset(\'' + p + '\',this.value)">' + o.map(function (a) { return '<option value="' + a[0] + '"' + (v == a[0] ? ' selected' : '') + '>' + a[1] + '</option>'; }).join('') + '</select></label>'; }
function adminSec() {
  if (!PGS) PGS = JSON.parse(JSON.stringify(PG));
  var h3 = function (t) { return '<h3 class="w4" style="font-size:28px">' + t + '</h3>'; }, x = '';
  x += '<div class="fm">' + h3(t('เปิด/ปิดส่วน', 'Show/hide')) + [['cats', t('คอลเลกชัน', 'Collection')], ['brand', t('แบรนด์', 'Brand')], ['featured', t('แนะนำ', 'Featured')], ['stories', t('สตอรี', 'Stories')], ['drop', 'Drop'], ['news', t('ข่าวสาร', 'Newsletter')]].map(function (a) { return pck('show.' + a[0], a[1]); }).join('') + '</div>';
  x += '<div class="fm">' + h3(t('การ์ดคอลเลกชัน', 'Collection cards')) + [0, 1, 2, 3].map(function (i) { return pin('cats.' + i + '.t', t('การ์ด ', 'Card ') + (i + 1), '', 'w2') + pin('cats.' + i + '.l', t('ลิงก์', 'Link'), '', 'w2'); }).join('') + '</div>';
  x += '<div class="fm">' + h3(t('แบรนด์', 'Brand')) + pin('brand.h', t('หัวข้อ', 'Headline'), '', 'w4') + pin('brand.p', t('เนื้อความ', 'Paragraph'), 'ta', 'w4') + '</div>';
  x += '<div class="fm">' + h3(t('สตอรี', 'Stories')) + [0, 1, 2, 3, 4].map(function (i) { return pin('stories.' + i + '.k', t('ป้าย', 'Label')) + pin('stories.' + i + '.t', t('หัวข้อ', 'Title'), '', 'w2') + pin('stories.' + i + '.l', t('ลิงก์', 'Link')); }).join('') + '</div>';
  x += '<div class="fm">' + h3('Drop') + pck('drop.on', t('โชว์ดรอป', 'Show drop'), 'w4') + pin('drop.label', t('ป้าย', 'Label'), '', 'w2') + pin('drop.h', t('หัวข้อ', 'Headline'), '', 'w2') + pin('drop.p', t('คำอธิบาย', 'Desc'), 'ta', 'w4') + pin('drop.at', t('วันวางขาย', 'Release'), 'datetime-local', 'w2') + pin('drop.b', t('ปุ่ม', 'Button')) + pin('drop.l', t('ลิงก์', 'Link')) + '</div>';
  x += '<div class="fm">' + h3(t('ข่าวสาร', 'Newsletter')) + pin('news.h', t('หัวข้อ', 'Headline'), '', 'w2') + pin('news.p', t('ข้อความ', 'Text'), '', 'w2') + '</div>';
  x += '<div class="fm">' + h3(t('โค้ดส่วนลด', 'Discount codes')) + [0, 1, 2].map(function (i) { return pin('codes.' + i + '.c', t('โค้ด', 'Code')) + psel('codes.' + i + '.t', t('ประเภท', 'Type'), [['pct', t('เปอร์เซ็นต์', 'Percent')], ['fixed', t('บาท', 'Fixed THB')], ['ship', t('ส่งฟรี', 'Free ship')]]) + pin('codes.' + i + '.v', t('มูลค่า', 'Value'), 'number') + '<span></span>'; }).join('') + '</div>';
  x += '<div class="fm">' + h3(t('จัดส่ง', 'Shipping')) + pin('ship.rate', t('ค่าส่ง', 'Flat rate'), 'number', 'w2') + pin('ship.free', t('ฟรีเมื่อเกิน', 'Free above'), 'number', 'w2') + '</div>';
  return '<div class="top"><h1>' + t('ส่วนต่างๆ', 'Sections') + '</h1><button class="btn p" onclick="psave()">' + t('บันทึก', 'Save sections') + '</button></div>' + x;
}
async function psave() { if (!isOwner()) { T('แก้ sections ได้เฉพาะ owner'); return; } PG = JSON.parse(JSON.stringify(PGS)); try { localStorage.setItem('jg_page', JSON.stringify(PG)); } catch (e) {} await dbSavePage(); T(t('บันทึกแล้ว', 'Sections saved')); }

/* ---------- admin: orders / customers / dashboard ---------- */
function adminOrd() {
  var L = Object.keys(ORDS).map(function (k) { return ORDS[k]; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; });
  var h = '<div class="top"><h1>' + t('คำสั่งซื้อ', 'Orders') + '</h1><span class="sm">' + L.length + ' ' + t('ออเดอร์', 'orders') + (sb() ? ' · Supabase' : ' · local') + '</span></div>';
  if (!L.length) return h + '<p>' + t('ยังไม่มีออเดอร์', 'No orders yet.') + '</p>';
  h += '<div class="sc"><table class="tb"><tr><th>' + t('ออเดอร์', 'Order') + '</th><th>' + t('วันที่', 'Date') + '</th><th>' + t('ลูกค้า', 'Customer') + '</th><th>' + t('ชิ้น', 'Items') + '</th><th>' + t('ยอด', 'Total') + '</th><th>' + t('จ่าย', 'Payment') + '</th><th>' + t('สถานะ', 'Status') + '</th></tr>';
  L.forEach(function (o) {
    var q = o.items.reduce(function (a, l) { return a + l.qty; }, 0), open = OO == o.no;
    h += '<tr style="cursor:pointer" onclick="OO=OO==\'' + o.no + '\'?\'\':\'' + o.no + '\';go()"><td>' + esc(o.no) + '</td><td>' + new Date(o.at).toLocaleDateString('en-GB') + '</td><td>' + esc(o.cust.name) + '</td><td>' + q + '</td><td>' + bt(o.total) + '</td><td>' + esc(o.pay) + '</td><td style="text-align:right"><span class="bd">' + o.status + '</span></td></tr>';
    if (open) h += '<tr><td colspan="7" style="text-align:left"><div class="fm" style="margin:0;border:0"><div class="w2"><b>' + t('ลูกค้า', 'Customer') + '</b><br>' + esc(o.cust.name) + '<br>' + esc(o.cust.email) + '<br>' + esc(o.cust.phone) + '</div><div class="w2"><b>' + t('ส่งไปที่', 'Ship to') + '</b><br>' + esc(o.addr.line) + '<br>' + esc(o.addr.sub) + ', ' + esc(o.addr.dist) + '<br>' + esc(o.addr.prov) + ' ' + esc(o.addr.zip) + '</div><div class="w4">' + o.items.map(function (l) { return esc(l.name) + ' — ' + esc(l.c) + ' / ' + esc(l.s) + ' × ' + l.qty; }).join('<br>') + '<br><br><b>' + t('ยอดรวม ', 'Total ') + bt(o.total) + '</b></div>' +
      '<label>' + t('สถานะ', 'Status') + '<select onchange="ost(\'' + o.no + '\',this.value)">' + STS.map(function (x) { return '<option' + (o.status == x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label><label class="w2">Tracking<input value="' + esc(o.track) + '" onchange="oset(\'' + o.no + '\',\'track\',this.value)"></label><label class="w4">' + t('โน้ต', 'Note') + '<textarea onchange="oset(\'' + o.no + '\',\'note\',this.value)">' + esc(o.note) + '</textarea></label></div></td></tr>';
  });
  return h + '</table></div><p class="sm">' + t('สต็อกตัดเมื่อ mark paid', 'Stock is deducted when marked paid') + '</p>';
}
async function ost(no, v) {
  if (!isStaff()) { T('ต้อง login เป็น staff'); return; }
  var o = ORDS[no], prev = o.status;
  var wasOut = (prev === 'cancelled' || prev === 'refunded');
  o.status = v; o.log.push({ t: new Date().toISOString(), s: 'Status → ' + v + ' by ' + myRole() });
  var c = sb(), resync = false;
  if (v == 'paid' && !o.stockDone) {
    // ตัดสต็อกตอนชำระเงินแล้ว (atomic ผูกออเดอร์ กันตัดซ้ำ)
    if (c) {
      var dd = await c.rpc('deduct_for_order', { p_no: no });
      if (dd.error || !dd.data || !dd.data.ok) {
        var hv = (dd.data && dd.data.have) != null ? dd.data.have : null;
        T(t('ตัดสต็อกไม่สำเร็จ', 'Deduct failed') + (hv != null ? ' (' + t('เหลือ ', 'left ') + hv + ')' : '') + t(' — ของอาจไม่พอ สถานะไม่เปลี่ยน', ' — possibly insufficient, status unchanged'));
        o.status = prev; o.log.push({ t: new Date().toISOString(), s: 'Paid reverted: deduct failed' });
        try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
        await dbUpdateOrder(no, { status: prev, tracking: o.track, note: o.note, log: o.log, stock_deducted: 0 });
        go(); return;
      }
      o.stockDone = 1; resync = true;
    } else {
      o.items.forEach(function (l) {
        var p = gp(l.id); if (!p) return;
        if (hasVS(p)) { var k = vsKey(l.c, l.s); p.vstock[k] = Math.max(0, (parseInt(p.vstock[k], 10) || 0) - l.qty); vsSync(p); }
        else if (hasCS(p)) { p.cstock[l.c] = Math.max(0, (parseInt(p.cstock[l.c], 10) || 0) - l.qty); p.stock = cstockSum(p.cstock); }
        else p.stock = Math.max(0, p.stock - l.qty);
      });
      o.stockDone = 1; saveLocal();
    }
  }
  if ((v == 'cancelled' || v == 'refunded') && o.stockDone && !wasOut) {
    // ยกเลิก = คืนสต็อก
    if (c) {
      var rs = await c.rpc('restore_for_order', { p_no: no });
      if (!rs.error && rs.data && rs.data.ok) { o.stockDone = 0; resync = true; }
    } else {
      o.items.forEach(function (l) {
        var p = gp(l.id); if (!p) return;
        if (hasVS(p)) { var k2 = vsKey(l.c, l.s); p.vstock[k2] = (parseInt(p.vstock[k2], 10) || 0) + l.qty; vsSync(p); }
        else if (hasCS(p)) { p.cstock[l.c] = (parseInt(p.cstock[l.c], 10) || 0) + l.qty; p.stock = cstockSum(p.cstock); }
        else p.stock = p.stock + l.qty;
      });
      o.stockDone = 0; saveLocal();
    }
  }
  try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {}
  await dbUpdateOrder(no, { status: v, tracking: o.track, note: o.note, log: o.log, stock_deducted: o.stockDone ? 1 : 0 });
  if (resync) await loadSupabase();
  go();
}
async function oset(no, k, v) { if (!isStaff()) { T('ต้อง login เป็น staff'); return; } ORDS[no][k] = v; try { localStorage.setItem('jg_orders', JSON.stringify(ORDS)); } catch (e) {} var patch = {}; patch[k == 'track' ? 'tracking' : k] = v; await dbUpdateOrder(no, patch); T(t('บันทึกแล้ว', 'Saved')); }

/* ---------- admin shell ---------- */
function jtNav(active) {
  var store = [[t('หน้าแรก', 'Home'), '#/'], [t('ร้านค้า', 'Shop'), '#/shop'], [t('สินค้า', 'Product'), '#/product'], [t('ตะกร้า', 'Cart'), '#/cart'], [t('ชำระเงิน', 'Checkout'), '#/checkout'], [t('วิชลิสต์', 'Wishlist'), '#/wishlist'], [t('สำเร็จ', 'Order Complete'), '#/order-complete']];
  if (SB_USER) store.push([t('บัญชีของฉัน', 'My Account'), '#/account']);
  if (SB_USER) store.push([t('ออเดอร์ของฉัน', 'My Orders'), '#/account/orders']);
  else store.push([t('สมัครสมาชิก', 'Sign up'), '#/signup']);
  var groups = [[t('ร้าน', 'STORE'), store]];
  if (isStaff()) groups.push([t('จัดการร้าน', 'ADMIN'), [[t('แดชบอร์ด', 'Dashboard'), '#/admin/dashboard'], [t('สินค้า', 'Products'), '#/admin/products'], [t('สต็อก', 'Inventory'), '#/admin/inventory'], [t('คำสั่งซื้อ', 'Orders'), '#/admin/orders'], [t('ลูกค้า', 'Customers'), '#/admin/customers'], [t('รีวิว', 'Reviews'), '#/admin/reviews']]]);
  if (isOwner()) {
    groups.push([t('เว็บ', 'WEBSITE'), [[t('หน้าแรก', 'Homepage'), '#/admin/website/homepage'], [t('ส่วนต่างๆ', 'Sections'), '#/admin/website/sections'], [t('คลังรูป', 'Media'), '#/admin/website/media']]]);
    groups.push([t('ตั้งค่า', 'SETTINGS'), [[t('ทั่วไป', 'General'), '#/admin/settings/general'], [t('จัดส่ง', 'Shipping'), '#/admin/settings/shipping'], [t('จ่ายเงิน', 'Payment'), '#/admin/settings/payment'], [t('ติดต่อ', 'Contact'), '#/admin/settings/contact'], ['SEO', '#/admin/settings/seo'], [t('ปิดปรับปรุง', 'Maintenance'), '#/admin/settings/maintenance']]]);
  }
  var sys = [[t('เชื่อมต่อ', 'Supabase'), '#/admin/system/supabase']];
  if (isStaff()) sys.push([t('ทีมงาน', 'Staff & Roles'), '#/admin/system/staff']);
  if (isOwner()) sys.push([t('บันทึกกิจกรรม', 'Activity Log'), '#/admin/system/activity']);
  groups.push([t('ระบบ', 'SYSTEM'), sys]);
  var sts = isStaff() ? '<div class="jgt-muted">' + (sb() ? '● Supabase · ' + esc(roleLabel()) : '○ local · owner') + '</div>' : '';
  var h = '<aside class="jt-side"><div class="jt-brand"><a href="#/" style="font-weight:800">JUNGRAI TACT</a>' + sts + '</div>';
  groups.forEach(function (g) { h += '<div class="jt-group">' + g[0] + '</div>'; g[1].forEach(function (x) { h += '<a href="' + x[1] + '" class="' + (active === x[1] ? 'active' : '') + '">' + x[0] + '</a>'; }); });
  return h + '</aside>';
}
function jtShell(title, active, body) { return '<div class="jt-admin"><div>' + jtNav(active) + '</div><main class="jt-main"><div class="jt-head"><h1>' + esc(title) + '</h1></div>' + body + '</main></div>'; }
function jtSettings(section) {
  var c = JSON.parse(localStorage.getItem('jt_settings') || '{}'), defaults = { name: 'JUNGRAI TACT', currency: 'THB', ship: 60, free: 2000, promptpay: false, card: false, bank: false, email: '', phone: '', address: '', title: 'JUNGRAI TACT', desc: '', maint: false, msg: 'Maintenance.' };
  c = Object.assign(defaults, c);
  var label = { general: t('ทั่วไป', 'General'), shipping: t('จัดส่ง', 'Shipping'), payment: t('จ่ายเงิน', 'Payment'), contact: t('ติดต่อ', 'Contact'), seo: 'SEO', maintenance: t('ปิดปรับปรุง', 'Maintenance') }[section] || section, fields = '';
  if (section === 'general') fields = '<label>' + t('ชื่อร้าน', 'Store name') + '<input id="jt_name" value="' + esc(c.name) + '"></label><label>' + t('สกุลเงิน', 'Currency') + '<select id="jt_currency"><option ' + (c.currency === 'THB' ? 'selected' : '') + '>THB</option><option ' + (c.currency === 'USD' ? 'selected' : '') + '>USD</option></select></label>';
  if (section === 'shipping') fields = '<label>' + t('ค่าส่ง', 'Shipping') + '<input id="jt_ship" type="number" value="' + Number(c.ship || 0) + '"></label><label>' + t('ฟรีเมื่อเกิน', 'Free threshold') + '<input id="jt_free" type="number" value="' + Number(c.free || 0) + '"></label>';
  if (section === 'payment') fields = '<label><input id="jt_prompt" type="checkbox" ' + (c.promptpay ? 'checked' : '') + '> PromptPay</label><label><input id="jt_card" type="checkbox" ' + (c.card ? 'checked' : '') + '> Card</label><label><input id="jt_bank" type="checkbox" ' + (c.bank ? 'checked' : '') + '> Bank</label>';
  if (section === 'contact') fields = '<label>Email<input id="jt_email" value="' + esc(c.email) + '"></label><label>' + t('โทร', 'Phone') + '<input id="jt_phone" value="' + esc(c.phone) + '"></label><label class="full">' + t('ที่อยู่', 'Address') + '<textarea id="jt_address">' + esc(c.address) + '</textarea></label>';
  if (section === 'seo') fields = '<label class="full">Title<input id="jt_title" value="' + esc(c.title) + '"></label><label class="full">Desc<textarea id="jt_desc">' + esc(c.desc) + '</textarea></label>';
  if (section === 'maintenance') fields = '<label><input id="jt_maint" type="checkbox" ' + (c.maint ? 'checked' : '') + '> Maintenance</label><label class="full">Message<textarea id="jt_msg">' + esc(c.msg) + '</textarea></label>';
  return jtShell(label, '#/admin/settings/' + section, '<div class="jt-panel"><div class="jt-form">' + fields + '</div><button class="btn p" onclick="jtSaveSettings(\'' + section + '\')">' + t('บันทึก', 'Save') + '</button></div>');
}
window.jtSaveSettings = function (section) {
  var c = JSON.parse(localStorage.getItem('jt_settings') || '{}'), v = function (id) { var x = document.getElementById(id); return x ? x.value : ''; }, b = function (id) { var x = document.getElementById(id); return !!(x && x.checked); };
  if (section === 'general') { c.name = v('jt_name'); c.currency = v('jt_currency'); } else if (section === 'shipping') { c.ship = Number(v('jt_ship') || 0); c.free = Number(v('jt_free') || 0); } else if (section === 'payment') { c.promptpay = b('jt_prompt'); c.card = b('jt_card'); c.bank = b('jt_bank'); } else if (section === 'contact') { c.email = v('jt_email'); c.phone = v('jt_phone'); c.address = v('jt_address'); } else if (section === 'seo') { c.title = v('jt_title'); c.desc = v('jt_desc'); } else if (section === 'maintenance') { c.maint = b('jt_maint'); c.msg = v('jt_msg'); }
  localStorage.setItem('jt_settings', JSON.stringify(c)); T(t('บันทึกแล้ว', 'Saved')); go();
};
function jtDashboard() {
  var os = Object.keys(ORDS).map(function (k) { return ORDS[k]; }), sales = os.filter(function (o) { return !['cancelled', 'refunded'].includes(o.status); }).reduce(function (a, o) { return a + Number(o.total || 0); }, 0), pending = os.filter(function (o) { return ['new'].includes(o.status); }).length;
  return jtShell(t('แดชบอร์ด', 'Dashboard'), '#/admin/dashboard', '<div class="jt-grid"><div class="jt-kpi"><span>' + t('สินค้า', 'Products') + '</span><b>' + P.length + '</b></div><div class="jt-kpi"><span>' + t('ออเดอร์', 'Orders') + '</span><b>' + os.length + '</b></div><div class="jt-kpi"><span>' + t('ยอดขาย', 'Sales') + '</span><b>' + bt(sales) + '</b></div><div class="jt-kpi"><span>' + t('บทบาท', 'Role') + '</span><b style="font-size:20px">' + esc(roleLabel()) + '</b></div></div>' + (RPC_OK ? '' : '<div class="note" style="border-color:var(--rd);color:var(--rd)">' + t('ระบบตัดสต็อกยังไม่พร้อม — รัน supabase/migration_stock_rpc.sql ใน SQL Editor', 'Stock RPC missing — run supabase/migration_stock_rpc.sql') + '</div>') + '<div class="jt-panel"><span class="jgt-kpi">Mode</span><p>' + (sb() ? 'Supabase live: ' + esc(SB.url) + ' · ' + esc(SB_USER ? SB_USER.email : 'guest') : t('Local mode — ตั้งค่า Supabase ที่ SYSTEM › Supabase', 'Local mode — connect Supabase under SYSTEM › Supabase')) + '</p></div>');
}
function jtInventory() { return jtShell(t('สต็อก', 'Inventory'), '#/admin/inventory', '<div class="jt-panel"><div style="margin-bottom:12px"><button class="btn s" onclick="stockRefresh(true)">' + t('รีเฟรชยอดล่าสุด', 'Refresh') + '</button></div><table class="tb"><tr><th>' + t('สินค้า', 'Product') + '</th><th>SKU</th><th>' + t('คงเหลือ', 'Remaining') + '</th><th>' + t('แยกสี', 'By color') + '</th><th>' + t('สถานะ', 'Status') + '</th></tr>' + P.map(function (p) { var n2 = Number(p.stock || 0); return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.sku) + '</td><td><b>' + n2 + '</b></td><td>' + esc(csText(p) || '-') + (vsText(p) ? '<br><span class="sm">' + esc(vsText(p)) + '</span>' : '') + '</td><td>' + (n2 <= 0 ? t('หมด', 'OUT') : n2 <= Number(p.low || 5) ? t('น้อย', 'LOW') + ' (' + t('เตือนที่ ', 'low at ') + p.low + ')' : t('ปกติ', 'IN')) + '</td></tr>'; }).join('') + '</table></div>'); }
function jtCustomers() {
  if (CUSTS.length) return jtShell(t('ลูกค้า', 'Customers'), '#/admin/customers', '<div class="jt-panel"><table class="tb"><tr><th>' + t('ชื่อ', 'Name') + '</th><th>Email</th><th>' + t('โทร', 'Phone') + '</th><th>' + t('ออเดอร์', 'Orders') + '</th><th>' + t('ยอดรวม', 'Total') + '</th></tr>' + CUSTS.map(function (c) { return '<tr><td>' + esc(c.name || '-') + '</td><td>' + esc(c.email) + '</td><td>' + esc(c.phone || '-') + '</td><td>' + (c.orders_count || 0) + '</td><td>' + bt(c.total_spent || 0) + '</td></tr>'; }).join('') + '</table></div>');
  var map = {}; Object.keys(ORDS).forEach(function (k) { var o = ORDS[k], c = o.cust || {}; var key = String(c.email || 'guest:' + o.no).toLowerCase(); if (!map[key]) map[key] = { name: c.name || 'Guest', email: c.email || '', phone: c.phone || '', orders: 0, total: 0 }; map[key].orders++; map[key].total += Number(o.total || 0); });
  return jtShell(t('ลูกค้า', 'Customers'), '#/admin/customers', '<div class="jt-panel"><table class="tb"><tr><th>' + t('ชื่อ', 'Name') + '</th><th>Email</th><th>' + t('โทร', 'Phone') + '</th><th>' + t('ออเดอร์', 'Orders') + '</th><th>' + t('ยอดรวม', 'Total') + '</th></tr>' + Object.keys(map).map(function (k) { var c = map[k]; return '<tr><td>' + esc(c.name) + '</td><td>' + esc(c.email) + '</td><td>' + esc(c.phone) + '</td><td>' + c.orders + '</td><td>' + bt(c.total) + '</td></tr>'; }).join('') + '</table></div>');
}
function jtStaff() {
  var rows = SB_PROFILES.map(function (u) { return '<tr><td>' + esc(u.email) + '</td><td><span class="bd">' + esc(u.role) + '</span></td><td style="text-align:right">' + (isOwner() && SB_USER && u.id !== SB_USER.id ? '<select onchange="sbSetRole(\'' + u.id + '\',this.value)">' + ['member', 'shop_admin', 'owner'].map(function (r) { return '<option value="' + r + '"' + (u.role === r ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select>' : '<span class="sm">you</span>') + '</td></tr>'; }).join('');
  return jtShell(t('ทีมงาน', 'Staff & Roles'), '#/admin/system/staff', '<div class="jt-panel"><p class="sm">' + t('Owner ทำได้ทุกอย่าง · Shop admin เติมสต็อก+จัดการออเดอร์ · Member ดูออเดอร์ตัวเอง · Guest สั่งซื้อได้อย่างเดียว', 'Owner: everything · Shop admin: stock + orders · Member: own orders · Guest: order only') + '</p>' + (isOwner() ? '<div class="jt-form" style="margin-top:12px"><label class="full">Email<input id="nu_email" type="email" placeholder="staff@jungrai.com"></label><label>' + t('รหัสชั่วคราว (≥6 ตัว)', 'Temp password (min 6)') + '<input id="nu_pass" type="text"></label><label>' + t('บทบาท', 'Role') + '<select id="nu_role"><option value="member">member</option><option value="shop_admin">shop_admin</option><option value="owner">owner</option></select></label></div><div style="margin-top:8px"><button class="btn p" onclick="sbCreateMember(this)">' + t('เพิ่มสมาชิก', 'Add member') + '</button></div>' : '') + '<div style="margin:12px 0"><button class="btn s" onclick="sbLoadProfiles()">' + t('โหลดรายชื่อ', 'Reload users') + '</button></div><table class="tb"><tr><th>Email</th><th>' + t('บทบาท', 'Role') + '</th><th></th></tr>' + (rows || '<tr><td colspan="3">' + t('ยังไม่มีข้อมูล — กด Reload', 'No data — press Reload') + '</td></tr>') + '</table><p class="jgt-muted">' + t('เปลี่ยน role ได้เฉพาะ owner · ตั้ง owner คนแรกด้วย SQL: update profiles set role=\'owner\' where email=\'...\'', 'Only owner can change roles · set first owner via SQL') + '</p></div>');
}
window.sbCreateMember = async function (btn) {
  if (!isOwner()) { T(t('เพิ่มสมาชิกได้เฉพาะ owner', 'Only owner can add members')); return; }
  var c = sb();
  var em = ((document.getElementById('nu_email') || {}).value || '').trim();
  var pw = ((document.getElementById('nu_pass') || {}).value || '');
  var role = ((document.getElementById('nu_role') || {}).value || 'member');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { T(t('กรอกอีเมลให้ถูกต้อง', 'Enter a valid email')); return; }
  if (pw.length < 6) { T(t('รหัสผ่านอย่างน้อย 6 ตัว', 'Password min 6 chars')); return; }
  var myId = SB_USER.id;
  lockBtn(btn, true);
  var r = await c.auth.signUp({ email: em, password: pw });
  lockBtn(btn, false);
  if (r.error) { T(authErr(r.error.message)); return; }
  if (r.data.session && r.data.session.user.id !== myId) {
    // instance ไม่ต้องยืนยันอีเมล: session ถูกสลับเป็น user ใหม่ → ออกแล้วให้ owner login กลับ
    await c.auth.signOut(); SB_USER = null; SB_ROLE = 'guest'; SB_PROFILES = [];
    T(t('สร้าง ', 'Created ') + em + t(' แล้ว (เริ่มเป็น member — ปรับ role ได้ที่ตารางหลังเขา login ครั้งแรก) กรุณา login กลับเป็น owner', ' as member — adjust role here after their first login. Please log back in as owner'));
    location.hash = '#/admin/system/supabase'; go(); return;
  }
  // ต้องยืนยันอีเมลก่อน: session ยังเป็น owner → ตั้ง role ให้ได้เลย
  var pr = await c.from('profiles').select('id').eq('email', em.toLowerCase()).single();
  if (pr.data && role !== 'member') await c.from('profiles').update({ role: role }).eq('id', pr.data.id);
  T(t('เพิ่ม ', 'Added ') + em + ' (' + role + ')' + t(' — ส่งรหัสชั่วคราวให้เขา login แล้วเปลี่ยนรหัสเองที่หน้า Account', ' — send them the temp password; they can change it under Account'));
  sbLoadProfiles();
};
window.sbSetRole = async function (id, role) {
  if (!isOwner()) { T('เปลี่ยน role ได้เฉพาะ owner'); return; }
  var c = sb(); var r = await c.from('profiles').update({ role: role }).eq('id', id);
  if (r.error) T(r.error.message); else { T(t('เปลี่ยนเป็น ', 'Updated to ') + role); sbLoadProfiles(); }
};
window.sbLoadProfiles = async function () {
  var c = sb(); if (!c || !isStaff()) { T('ต้อง login เป็น staff'); return; }
  var r = await c.from('profiles').select('id,email,role').order('created_at');
  if (!r.error && r.data) { SB_PROFILES = r.data; go(); } else T((r.error && r.error.message) || t('โหลดไม่สำเร็จ', 'load failed'));
};
function jtActivity() { return jtShell(t('บันทึกกิจกรรม', 'Activity Log'), '#/admin/system/activity', '<div class="jt-panel"><p>' + t('ดู log ใน Supabase › Table Editor › activity_log', 'See logs in Supabase › Table Editor › activity_log') + '</p></div>'); }
function jtSupabase() {
  var ls = {}; try { ls = JSON.parse(localStorage.getItem('jt_supabase') || '{}'); } catch (e) {}
  // ยังไม่ต่อ: หน้า setup (เห็นเฉพาะตอน local mode)
  if (!sb()) return jtShell('Supabase', '#/admin/system/supabase', '<div class="jt-panel"><div class="jt-form"><label class="full">Supabase URL<input id="sb_url" value="' + esc(ls.url || ((window.JT_CONFIG && JT_CONFIG.SUPABASE_URL) || '')) + '" placeholder="https://xyz.supabase.co"></label><label class="full">Anon key (public — ปลอดภัยที่จะอยู่ในเว็บ)<input id="sb_key" value="' + esc(ls.key || ((window.JT_CONFIG && JT_CONFIG.SUPABASE_ANON_KEY) || '')) + '" placeholder="eyJ..."></label></div><div style="margin-top:12px"><button class="btn p" onclick="sbSave()">Save & connect</button></div><p class="jgt-muted" style="margin-top:12px">รัน supabase/schema.sql + seed.sql + migration_roles.sql ก่อน แล้วค่อย Save & connect</p></div>');
  // ต่อแล้วแต่ยังไม่ login: ฟอร์ม email+password เข้าเลย (magic link เป็นทางเลือก)
  if (!SB_USER) return jtShell(t('เข้าสู่ระบบ', 'Login'), '#/admin/system/supabase', '<div class="jt-panel"><div class="jt-form"><label class="full">Email<input id="sb_email" type="email" placeholder="owner@jungrai.com" onkeydown="if(event.key===\'Enter\')sbLoginPass()"></label><label class="full">' + t('รหัสผ่าน', 'Password') + '<input id="sb_pass" type="password" placeholder="' + t('รหัสผ่าน', 'Password') + '" onkeydown="if(event.key===\'Enter\')sbLoginPass()"></label></div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn p" onclick="sbLoginPass(this)">Login</button><button class="btn" onclick="sbLogin(this)">' + t('ส่ง magic link แทน', 'Send magic link instead') + '</button></div><p class="jgt-muted" style="margin-top:12px">' + t('กรอก email + password ที่ owner สร้างให้ แล้วเข้าได้เลย', 'Enter the email + password from your owner to log in directly') + ' · ' + t('ยังไม่มีบัญชี?', 'No account?') + ' <a href="#/signup" style="text-decoration:underline">' + t('สมัครสมาชิก', 'Sign up') + '</a></p></div>');
  // login แล้ว: ข้อมูลบัญชี + สถิติ + เปลี่ยนรหัส, ช่อง URL/key เฉพาะ owner
  var myEm = (SB_USER.email || '').toLowerCase();
  var mine = Object.keys(ORDS).map(function (k) { return ORDS[k]; }).filter(function (o) { return ((o.cust && o.cust.email) || '').toLowerCase() === myEm; });
  var spent = mine.reduce(function (a, o) { return a + Number(o.total || 0); }, 0);
  var since = SB_PROFILE && SB_PROFILE.created_at ? new Date(SB_PROFILE.created_at).toLocaleDateString('en-GB') : '-';
  var acc = '<div class="jt-panel"><h3 style="font-size:24px">' + t('ข้อมูลส่วนตัว', 'My details') + '</h3><div class="jt-form" style="margin-top:8px"><label class="full">' + t('ชื่อที่แสดง', 'Display name') + '<input id="pf_name" value="' + esc((SB_PROFILE && SB_PROFILE.display_name) || '') + '" placeholder="' + esc((SB_USER.email || '').split('@')[0]) + '"></label><label class="full">' + t('ชื่อ-นามสกุล', 'Full name') + '<input id="pf_full" value="' + esc((SB_PROFILE && SB_PROFILE.full_name) || '') + '"></label><label class="full">' + t('โทรศัพท์', 'Phone') + '<input id="pf_ph" value="' + esc((SB_PROFILE && SB_PROFILE.phone) || '') + '"></label><label class="full">Email<input value="' + esc(SB_USER.email) + '" disabled></label><label>' + t('บทบาท', 'Role') + '<input value="' + esc(roleLabel()) + '" disabled></label><label>' + t('สมาชิกตั้งแต่', 'Member since') + '<input value="' + since + '" disabled></label></div><div style="margin-top:8px"><button class="btn s" onclick="sbSaveProfile()">' + t('บันทึกข้อมูล', 'Save details') + '</button></div><div class="jt-grid" style="margin-top:12px;grid-template-columns:repeat(3,1fr)"><div class="jt-kpi"><span>' + t('ออเดอร์ของฉัน', 'My orders') + '</span><b>' + mine.length + '</b></div><div class="jt-kpi"><span>' + t('ยอดซื้อสะสม', 'Total spent') + '</span><b>' + bt(spent) + '</b></div><div class="jt-kpi"><span>' + t('วิชลิสต์', 'Wishlist') + '</span><b>' + WL.length + '</b></div></div><div style="margin-top:8px"><a class="btn s" href="#/account/orders">' + t('ดูออเดอร์', 'View orders') + '</a> <a class="btn s" href="#/wishlist">' + t('วิชลิสต์', 'Wishlist') + '</a></div></div>';
  var ad = myAddr();
  var adbox = '<div class="jt-panel"><h3 style="font-size:24px">' + t('ที่อยู่จัดส่งของฉัน', 'My shipping address') + '</h3><p class="sm">' + t('บันทึกไว้ครั้งเดียว checkout ครั้งต่อไปดึงมาให้เอง', 'Saved once — auto-filled at checkout') + '</p><div class="jt-form" style="margin-top:8px"><label class="full">' + t('ที่อยู่', 'Address') + '<input id="ad_ad" value="' + esc(ad.line) + '"></label><label>' + t('แขวง/ตำบล', 'Subdistrict') + '<input id="ad_sd" value="' + esc(ad.sub) + '"></label><label>' + t('เขต/อำเภอ', 'District') + '<input id="ad_ds" value="' + esc(ad.dist) + '"></label><label>' + t('จังหวัด', 'Province') + '<input id="ad_pv" list="adpvl" value="' + esc(ad.prov) + '"></label><datalist id="adpvl">' + PROV.map(function (p) { return '<option value="' + p + '">'; }).join('') + '</datalist><label>' + t('รหัสไปรษณีย์', 'Postcode') + '<input id="ad_zp" value="' + esc(ad.zip) + '"></label></div><div style="margin-top:8px"><button class="btn s" onclick="sbSaveAddress()">' + t('บันทึกที่อยู่', 'Save address') + '</button></div></div>';
  var pwbox = '<div class="jt-panel"><div class="jt-form"><label class="full">' + t('รหัสผ่านใหม่ (≥6 ตัว)', 'New password (min 6)') + '<input id="np_pass" type="password"></label></div><div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn s" onclick="sbChangePass()">' + t('เปลี่ยนรหัสผ่าน', 'Change password') + '</button><button class="btn" onclick="sbLogout()">Logout</button></div></div>';
  var conn = isOwner() ? '<div class="jt-panel"><div class="jt-form"><label class="full">Supabase URL<input id="sb_url" value="' + esc(SB.url) + '"></label><label class="full">Anon key<input id="sb_key" value="' + esc((window.JT_CONFIG && JT_CONFIG.SUPABASE_ANON_KEY) || ls.key || '') + '"></label></div><div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn p" onclick="sbSave()">Save & connect</button><button class="btn d" onclick="SBClear()">Disconnect</button></div></div>' : '';
  return jtShell(t('บัญชี', 'Account'), '#/admin/system/supabase', acc + adbox + pwbox + conn);
}
function myAddr() {
  var a = (SB_PROFILE && SB_PROFILE.address) || {};
  return { name: (SB_PROFILE && SB_PROFILE.full_name) || '', phone: (SB_PROFILE && SB_PROFILE.phone) || '', line: a.line || '', sub: a.sub || '', dist: a.dist || '', prov: a.prov || '', zip: a.zip || '' };
}
/* ที่อยู่ออเดอร์ล่าสุดของตัวเอง (มีก่อนที่อยู่บัญชี) */
function lastOrderAddr() {
  if (!SB_USER) return null;
  var myEm = (SB_USER.email || '').toLowerCase();
  var L = Object.keys(ORDS).map(function (k) { return ORDS[k]; })
    .filter(function (o) { return ((o.cust && o.cust.email) || '').toLowerCase() === myEm; })
    .sort(function (a, b) { return a.at < b.at ? 1 : -1; });
  if (!L.length) return null;
  var o = L[0];
  return { name: (o.cust && o.cust.name) || '', phone: (o.cust && o.cust.phone) || '', line: (o.addr && o.addr.line) || '', sub: (o.addr && o.addr.sub) || '', dist: (o.addr && o.addr.dist) || '', prov: (o.addr && o.addr.prov) || '', zip: (o.addr && o.addr.zip) || '', no: o.no };
}
window.sbSaveAddress = async function () {
  var c = sb(); if (!c) { T(t('ยังไม่ต่อ Supabase', 'Not connected')); return; }
  if (!SB_USER) { T(t('กรุณา login ก่อน', 'Please log in first')); return; }
  var v = function (id) { return ((document.getElementById(id) || {}).value || '').trim(); };
  var addr = { line: v('ad_ad'), sub: v('ad_sd'), dist: v('ad_ds'), prov: v('ad_pv'), zip: v('ad_zp') };
  try {
    var r = await c.from('profiles').update({ address: addr }).eq('id', SB_USER.id);
    if (r.error) throw new Error(r.error.message);
    if (SB_PROFILE) SB_PROFILE.address = addr;
    T(t('บันทึกที่อยู่แล้ว', 'Address saved')); go();
  } catch (e) { T(t('บันทึกไม่สำเร็จ: ', 'Save failed: ') + (e.message || e)); }
};
window.sbSaveProfile = async function () {
  var c = sb(); if (!c) { T(t('ยังไม่ต่อ Supabase', 'Not connected')); return; }
  if (!SB_USER) { T(t('กรุณา login ก่อน', 'Please log in first')); return; }
  var v = function (id) { return ((document.getElementById(id) || {}).value || '').trim(); };
  try {
    var r = await c.from('profiles').update({ display_name: v('pf_name'), full_name: v('pf_full'), phone: v('pf_ph') }).eq('id', SB_USER.id);
    if (r.error) throw new Error(r.error.message);
    if (SB_PROFILE) { SB_PROFILE.display_name = v('pf_name'); SB_PROFILE.full_name = v('pf_full'); SB_PROFILE.phone = v('pf_ph'); }
    T(t('บันทึกแล้ว', 'Saved')); go();
  } catch (e) { T(t('บันทึกไม่สำเร็จ: ', 'Save failed: ') + (e.message || e)); }
};
window.sbChangePass = async function () {
  var c = sb(); if (!c) { T(t('ยังไม่ต่อ Supabase', 'Not connected')); return; }
  var pw = ((document.getElementById('np_pass') || {}).value || '');
  if (pw.length < 6) { T(t('รหัสผ่านอย่างน้อย 6 ตัว', 'Password min 6 chars')); return; }
  try {
    var r = await c.auth.updateUser({ password: pw });
    if (r.error) throw new Error(r.error.message);
    T(t('เปลี่ยนรหัสผ่านแล้ว', 'Password changed'));
  } catch (e) { T(t('เปลี่ยนไม่สำเร็จ: ', 'Change failed: ') + (e.message || e)); }
};
window.sbSave = function () { var u = document.getElementById('sb_url').value.trim(), k = document.getElementById('sb_key').value.trim(); if (!u || !k) { T('กรอก URL + key'); return; } SB.saveConn(u, k); };
window.SBClear = function () { SB.clearConn(); };
window.sbLoginPass = async function (btn) {
  var c = sb(); if (!c) { T('ต่อ Supabase ก่อน'); return; }
  var em = ((document.getElementById('sb_email') || {}).value || '').trim();
  var pw = ((document.getElementById('sb_pass') || {}).value || '');
  if (!em || !pw) { T('กรอก email + password'); return; }
  lockBtn(btn, true);
  var r = await c.auth.signInWithPassword({ email: em, password: pw });
  lockBtn(btn, false);
  if (r.error) { T(authErr(r.error.message)); return; }
  SB_USER = r.data.user; await loadRole();
  if (isStaff()) await sbLoadProfilesSilent();
  T('ยินดีต้อนรับ ' + em);
  location.hash = isStaff() ? '#/admin/dashboard' : '#/account'; go();
};
window.sbLogin = async function (btn) {
  var c = sb(); if (!c) { T('ต่อ Supabase ก่อน'); return; }
  var em = (document.getElementById('sb_email') || {}).value || prompt('Admin email:'); if (!em) return;
  lockBtn(btn, true);
  var r = await c.auth.signInWithOtp({ email: em.trim(), options: { emailRedirectTo: location.origin + '/' } });
  lockBtn(btn, false);
  if (r.error) T(authErr(r.error.message)); else T('ส่งลิงก์ login ไปที่ ' + em + ' แล้ว — กดลิงก์ล่าสุดในเบราว์เซอร์นี้ภายใน 1 ชม.');
};
/* อ่าน error จาก magic-link redirect (เช่น otp_expired) แล้วแจ้งเป็นภาษาคน */
function handleAuthRedirect() {
  var h = location.hash || '';
  if (!/error=|error_code=/.test(h)) return;
  var get = function (k) { var m = h.match(new RegExp(k + '=([^&]+)')); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; };
  var code = get('error_code'), desc = get('error_description');
  if (code === 'otp_expired') T('ลิงก์หมดอายุ/ถูกใช้ไปแล้ว — กด Send magic link ใหม่ แล้วกดลิงก์ล่าสุดในเบราว์เซอร์เดิม');
  else if (desc) T(desc);
  try { history.replaceState(null, '', location.pathname + '#/admin/system/supabase'); } catch (e) { location.hash = '#/admin/system/supabase'; }
}
window.sbLogout = async function () { var c = sb(); if (c) await c.auth.signOut(); SB_USER = null; SB_ROLE = 'guest'; SB_PROFILES = []; SB_PROFILE = null; ORDS = {}; CUSTS = []; try { localStorage.removeItem('jg_orders'); } catch (e) {} T(t('ออกจากระบบแล้ว', 'Logged out')); go(); };

/* ---------- misc views ---------- */
function tcur() { CUR = CUR == 'THB' ? 'USD' : 'THB'; try { localStorage.setItem('jg_cur', CUR); } catch (e) {} go(); }
function applyLogo() {
  cnt(); var cu = document.getElementById('cur'); if (cu) cu.textContent = CUR;
  var hl = document.getElementById('hlogo');
  if (hl) { if (H.logo && H.logoUrl) { hl.src = H.logoUrl; hl.hidden = false; } else hl.hidden = true; }
  applyHeader();
}
function hc() { var m = (location.hash || '').match(/^#\/shop\?cat=(.+)$/); if (m) F.cat = decodeURIComponent(m[1]); }

/* แปล error ฝั่ง Auth + ล็อกปุ่มกันกดซ้ำ */
function authErr(m) {
  m = String(m || '');
  if (/rate limit|over_email|too many|429/i.test(m)) return t('ส่งอีเมลถี่เกินไป — รอ ~1 ชม. แล้วลองใหม่ (ใช้ password login ไม่ติด limit นี้)', 'Email rate limit — wait ~1 hour, or use password login');
  if (/already registered|already exists|already been registered/i.test(m)) return t('อีเมลนี้สมัครแล้ว ไป Login', 'Email already registered — please log in');
  if (/Invalid login credentials/i.test(m)) return t('อีเมลหรือรหัสผ่านไม่ถูก', 'Invalid email or password');
  if (/weak|short/i.test(m) && /password/i.test(m)) return t('รหัสผ่านสั้นไป (อย่างน้อย 6 ตัว)', 'Password too weak (min 6 chars)');
  return m;
}
function lockBtn(b, lock) { try { if (b) { b.disabled = !!lock; } } catch (e) {} }

/* ---------- public signup (member) ---------- */
function signupView() {
  if (SB_USER) { location.hash = isStaff() ? '#/admin/dashboard' : '#/account/orders'; return '<p>...</p>'; }
  return '<div class="jt-panel" style="max-width:520px;margin:24px auto"><h1 style="font-size:40px">' + t('สมัครสมาชิก', 'Sign up') + '</h1><div class="jt-form"><label class="full">Email<input id="su_email" type="email" placeholder="you@example.com"></label><label class="full">' + t('รหัสผ่าน (อย่างน้อย 6 ตัว)', 'Password (min 6 chars)') + '<input id="su_pass" type="password"></label><label class="full">' + t('ยืนยันรหัสผ่าน', 'Confirm password') + '<input id="su_pass2" type="password"></label><label class="full">' + t('ชื่อ-นามสกุล', 'Full name') + '<input id="su_nm"></label><label class="full">' + t('โทรศัพท์', 'Phone') + '<input id="su_ph" placeholder="081 234 5678"></label><label class="full">' + t('ที่อยู่จัดส่ง', 'Shipping address') + '<input id="su_ad" placeholder="' + t('บ้านเลขที่ หมู่ ซอย ถนน', 'Street') + '"></label><label>' + t('แขวง/ตำบล', 'Subdistrict') + '<input id="su_sd"></label><label>' + t('เขต/อำเภอ', 'District') + '<input id="su_ds"></label><label>' + t('จังหวัด', 'Province') + '<input id="su_pv" list="su_pvl"></label><datalist id="su_pvl">' + PROV.map(function (p) { return '<option value="' + p + '">'; }).join('') + '</datalist><label>' + t('รหัสไปรษณีย์', 'Postcode') + '<input id="su_zp" onkeydown="if(event.key===\'Enter\')sbSignup()"></label></div><div style="margin-top:12px"><button class="btn p" onclick="sbSignup(this)">' + t('สมัครสมาชิก', 'Sign up') + '</button></div><p class="jgt-muted" style="margin-top:12px">' + t('มีบัญชีแล้ว?', 'Have an account?') + ' <a href="#/admin/system/supabase" style="text-decoration:underline">Login</a></p></div>';
}
window.sbSignup = async function (btn) {
  var c = sb(); if (!c) { T(t('ยังไม่ต่อ Supabase', 'Not connected')); return; }
  var em = ((document.getElementById('su_email') || {}).value || '').trim();
  var p1 = ((document.getElementById('su_pass') || {}).value || ''), p2 = ((document.getElementById('su_pass2') || {}).value || '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { T(t('กรอกอีเมลให้ถูกต้อง', 'Enter a valid email')); return; }
  if (p1.length < 6) { T(t('รหัสผ่านอย่างน้อย 6 ตัว', 'Password min 6 chars')); return; }
  if (p1 !== p2) { T(t('รหัสผ่านไม่ตรงกัน', 'Passwords do not match')); return; }
  lockBtn(btn, true);
  var r = await c.auth.signUp({ email: em, password: p1 });
  lockBtn(btn, false);
  if (r.error) { T(authErr(r.error.message)); return; }
  var det = { full_name: ((document.getElementById('su_nm') || {}).value || '').trim(), phone: ((document.getElementById('su_ph') || {}).value || '').trim(), address: { line: ((document.getElementById('su_ad') || {}).value || '').trim(), sub: ((document.getElementById('su_sd') || {}).value || '').trim(), dist: ((document.getElementById('su_ds') || {}).value || '').trim(), prov: ((document.getElementById('su_pv') || {}).value || '').trim(), zip: ((document.getElementById('su_zp') || {}).value || '').trim() } };
  if (r.data.session) {
    SB_USER = r.data.session.user; await loadRole();
    try { await c.from('profiles').update(det).eq('id', SB_USER.id); await loadRole(); } catch (e) {}
    T(t('สมัครสำเร็จ ยินดีต้อนรับ', 'Welcome! Signed up'));
    location.hash = '#/account'; go();
  } else {
    try { localStorage.setItem('jt_pending_profile', JSON.stringify({ email: em.toLowerCase(), det: det })); } catch (e) {}
    T(t('สมัครแล้ว — เช็กอีเมลเพื่อยืนยัน รายละเอียดที่อยู่จะเข้าบัญชีหลัง login ครั้งแรก', 'Signed up — confirm via email; your address will attach on first login'));
  }
};

/* ---------- account: my orders (member) ---------- */
var MO = ''; // opened order no
function myOrdersView() {
  if (!SB_USER) return jtShell(t('ออเดอร์ของฉัน', 'My Orders'), '#/account/orders', '<div class="jt-panel"><p>' + t('Login ก่อนเพื่อดูออเดอร์ของตัวเอง', 'Log in to see your orders') + '</p><a class="btn p" href="#/admin/system/supabase">Login</a></div>');
  var L = Object.keys(ORDS).map(function (k) { return ORDS[k]; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; });
  if (!L.length) return jtShell(t('ออเดอร์ของฉัน', 'My Orders'), '#/account/orders', '<div class="jt-panel"><p>' + t('ยังไม่มีออเดอร์', 'No orders yet') + '</p><a class="btn p" href="#/shop">' + t('ช้อปเลย', 'Shop now') + '</a></div>');
  var h = jtShell(t('ออเดอร์ของฉัน', 'My Orders'), '#/account/orders', '<div class="jt-panel"><table class="tb"><tr><th>' + t('ออเดอร์', 'Order') + '</th><th>' + t('วันที่', 'Date') + '</th><th>' + t('ยอด', 'Total') + '</th><th>' + t('สถานะ', 'Status') + '</th></tr>');
  L.forEach(function (o) {
    h += '<tr style="cursor:pointer" onclick="MO=MO===\'' + o.no + '\'?\'\':\'' + o.no + '\';go()"><td>' + esc(o.no) + '</td><td>' + new Date(o.at).toLocaleDateString('en-GB') + '</td><td>' + bt(o.total) + '</td><td><span class="bd">' + esc(o.status) + '</span></td></tr>';
    if (MO === o.no) h += '<tr><td colspan="4" style="text-align:left"><div class="fm" style="margin:0;border:0;padding:8px 0"><div class="w4"><b>' + t('สินค้า', 'Items') + '</b><br>' + o.items.map(function (l) { return esc(l.name) + ' — ' + esc(l.c) + ' / ' + esc(l.s) + ' × ' + l.qty + ' — ' + bt(l.price * l.qty); }).join('<br>') + '<br><br>' + t('ยอดรวมย่อย', 'Subtotal') + ' ' + bt(o.sub) + (o.d ? ' · ' + t('ส่วนลด', 'Discount') + ' –' + bt(o.d) : '') + ' · ' + t('ค่าส่ง', 'Shipping') + ' ' + bt(o.ship) + ' · <b>' + t('ยอดรวม', 'Total') + ' ' + bt(o.total) + '</b></div><div class="w2"><b>' + t('ส่งไปที่', 'Ship to') + '</b><br>' + esc(o.addr.line) + '<br>' + esc(o.addr.sub) + ', ' + esc(o.addr.dist) + '<br>' + esc(o.addr.prov) + ' ' + esc(o.addr.zip) + '</div><div class="w2"><b>' + t('ชำระเงิน', 'Payment') + '</b><br>' + esc(o.pay) + (o.track ? '<br><b>Tracking</b><br>' + esc(o.track) : '') + '</div><div class="w4"><b>' + t('ติดตามสถานะ', 'Timeline') + '</b><br>' + (o.log || []).map(function (e) { return new Date(e.t).toLocaleString('en-GB') + ' — ' + esc(e.s); }).join('<br>') + '</div></div></td></tr>';
  });
  return h + '</table></div>';
}
function deny(page) { var needOwner = page === 'Owner only'; return jtShell(needOwner ? t('เฉพาะ owner', 'Owner only') : t('เฉพาะทีมงาน', 'Staff only'), location.hash, '<div class="jt-panel"><p>' + t('สิทธิ์ไม่ถึง', 'No permission') + ' (' + esc(roleLabel()) + ')</p><a class="btn p" href="#/admin/system/supabase">Login / ' + t('เปลี่ยน user', 'switch user') + '</a></div>'); }

/* ---------- router ---------- */
function go() {
  clearInterval(HT); clearInterval(HT2); fixPG();
  var h = location.hash || '#/', m = h.match(/^#\/p\/(.+)$/), m2 = h.match(/^#\/done\/(.+)$/), mEdit = null, a = $('#app'), isH = h == '#/' || h == '#';
  document.querySelector('main').className = isH ? 'h' : '';
  var v;
  if (h === '#/account/orders') v = myOrdersView();
  else if (h === '#/account') v = jtSupabase();
  else if (h === '#/signup') v = signupView();
  else if (h === '#/admin' || h === '#/admin/dashboard') v = isStaff() ? jtDashboard() : deny('Staff only');
  else if (h === '#/admin/products') v = isStaff() ? jtShell(t('สินค้า', 'Products'), '#/admin/products', admin()) : deny('Staff only');
  else if (h === '#/admin/products/new') { if (!E || E._i >= 0) loadEdit(-1); v = isOwner() ? jtShell(t('เพิ่มสินค้า', 'New product'), '#/admin/products', adminEditView(true)) : deny('Owner only'); }
  else if ((mEdit = h.match(/^#\/admin\/products\/edit\/(.+)$/))) {
    var eid = decodeURIComponent(mEdit[1]);
    if (!E || E._id !== eid) { var eii = P.findIndex(function (x) { return x.id === eid; }); if (eii > -1) loadEdit(eii); }
    v = (isStaff() && E) ? jtShell(t('แก้ไขสินค้า', 'Edit product'), '#/admin/products', adminEditView(false)) : deny('Staff only');
  }
  else if (h === '#/admin/inventory') v = isStaff() ? jtInventory() : deny('Staff only');
  else if (h === '#/admin/orders') v = isStaff() ? jtShell(t('คำสั่งซื้อ', 'Orders'), '#/admin/orders', adminOrd()) : deny('Staff only');
  else if (h === '#/admin/customers') v = isStaff() ? jtCustomers() : deny('Staff only');
  else if (h === '#/admin/reviews') v = isStaff() ? jtReviews() : deny('Staff only');
  else if (h === '#/admin/website/homepage') v = isOwner() ? jtShell(t('หน้าแรก', 'Homepage'), '#/admin/website/homepage', adminHome()) : deny('Owner only');
  else if (h === '#/admin/website/media') v = isOwner() ? jtMediaPage() : deny('Owner only');
  else if (h === '#/admin/website/sections') v = isOwner() ? jtShell(t('ส่วนต่างๆ', 'Sections'), '#/admin/website/sections', adminSec()) : deny('Owner only');
  else if (/^#\/admin\/settings\//.test(h)) v = isOwner() ? jtSettings(h.split('/')[3]) : deny('Owner only');
  else if (h === '#/admin/system/supabase') v = jtSupabase();
  else if (h === '#/admin/system/staff') v = isStaff() ? jtStaff() : deny('Staff only');
  else if (h === '#/admin/system/activity') v = isOwner() ? jtActivity() : deny('Owner only');
  else if (h === '#/product') v = jtShell(t('สินค้า', 'Product'), '#/product', '<div class="jt-panel"><p>' + t('เลือกสินค้าจาก Shop', 'Pick a product from Shop') + '</p><a class="btn p" href="#/shop">' + t('ไปดูสินค้า', 'Go to Shop') + '</a></div>');
  else if (h === '#/order-complete' || m2) { var no = m2 ? decodeURIComponent(m2[1]) : null; v = no ? doneView(no) : jtShell('Order Complete', '#/order-complete', '<div class="jt-panel"><p>Done</p></div>'); }
  else if (m) v = prod(decodeURIComponent(m[1]));
  else if (h.indexOf('#/cart') === 0) v = cartView();
  else if (h.indexOf('#/checkout') === 0) v = checkoutView();
  else if (h === '#/wishlist') v = wishView();
  else if (isH) v = homeView();
  else v = shop();
  a.innerHTML = isH ? v : '<div class="w">' + v + '</div>';
  if (isH) { heroInit(); dropInit(); }
  applyLogo();
  // หน้าสินค้า/ร้าน/สต็อก: ดึงเลขล่าสุดจาก server ทุกครั้งที่ "เปิดเข้า" (กันเลขค้าง)
  if (m || h.indexOf('#/shop') === 0 || h === '#/admin/inventory') {
    if (stockRefresh._h !== h) { stockRefresh._h = h; stockRefresh(false, h); }
  } else stockRefresh._h = null;
}
/* ดึงสต็อกล่าสุดจาก server; เปลี่ยนค่อย render ใหม่ */
function stockSig() { return JSON.stringify(P.map(function (p) { return [p.id, p.stock, p.cstock, p.vstock]; })); }
async function stockRefresh(manual, h) {
  var c = sb(); if (!c) { if (manual) T(t('ยังไม่ต่อ Supabase', 'Not connected')); return; }
  var before = stockSig(), hh = h || location.hash;
  try {
    var pr = await c.from('products').select('*').order('created_at');
    if (!pr.data) return;
    P = pr.data.map(function (r) {
      return { id: r.id, name: r.name, sku: r.sku, barcode: r.barcode || '', cat: r.category, coll: r.collection, price: r.price, compare: r.compare_at, cost: r.cost, stock: r.stock, cstock: r.stock_by_color || {}, vstock: r.stock_by_variant || {}, low: r.low_threshold, status: r.status, featured: r.featured, colors: r.colors || ['Black'], sizes: r.sizes || ['One size'], tags: r.tags || '', desc: r.description || '', spec: r.spec || '', material: r.material || '', dims: r.dims || '', notes: r.notes || '' };
    });
    IM = {}; CIM = {}; pr.data.forEach(function (r) { if (r.image_urls && r.image_urls.length) IM[r.id] = r.image_urls; if (r.color_images && Object.keys(r.color_images).length) CIM[r.id] = r.color_images; });
    imgFallback(); saveLocal();
    if (stockSig() !== before) { if (location.hash === hh) go(); }
    else if (manual) T(t('ข้อมูลล่าสุดแล้ว', 'Already up to date'));
  } catch (e) { if (manual) T(String(e.message || e)); }
}
/* จำดราฟที่กรอกค้างไว้ก่อนสลับหน้า (ไม่กดเซฟก็ไม่หาย) */
function preserveDrafts() {
  try {
    if (document.getElementById('fm')) sync();
    try {
      if (HS) localStorage.setItem('jg_draft_home', JSON.stringify(HS));
      if (PGS) localStorage.setItem('jg_draft_page', JSON.stringify(PGS));
    } catch (e) {}
    var co = {};
    ['em', 'nm', 'ph', 'ad', 'sd', 'ds', 'pv', 'zp'].forEach(function (id) { var el = document.getElementById(id); if (el) co[id] = el.value; });
    if (co.em != null || co.nm != null) {
      var pay = document.querySelector('input[name=pay]:checked');
      if (pay) co.pay = pay.value;
      try { localStorage.setItem('jg_checkout', JSON.stringify(co)); } catch (e) {}
    }
  } catch (e) {}
}
function checkoutStash() { try { return JSON.parse(localStorage.getItem('jg_checkout') || 'null'); } catch (e) { return null; } }
/* บันทึกดราฟทุกครั้งที่พิมพ์ (กันแท็บโดนล้างแล้วข้อมูลหาย) */
var syncT = null;
function syncSoon() { clearTimeout(syncT); syncT = setTimeout(function () { try { preserveDrafts(); } catch (e) {} }, 400); }
if (!window._draftListener) {
  window._draftListener = true;
  ['input', 'change'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      try { if (e.target && e.target.closest && e.target.closest('#app')) syncSoon(); } catch (x) {}
    });
  });
}
window.addEventListener('hashchange', function () { preserveDrafts(); Q = 1; SEL = {}; hc(); go(); scrollTo(0, 0); });

/* ---------- boot ---------- */
loadLocal(); handleAuthRedirect(); hc();
if (!E && loadDraft()) { /* มีดราฟค้าง: เปิดฟอร์มต่อ */ }
try {
  if (!HS) HS = JSON.parse(localStorage.getItem('jg_draft_home') || 'null');
  if (!PGS) PGS = JSON.parse(localStorage.getItem('jg_draft_page') || 'null');
} catch (e) {}
go();
(async function () {
  var ok = await loadSupabase();
  if (isStaff()) await sbLoadProfilesSilent();
  if (ok) go();
  var c = sb();
  if (c) c.auth.onAuthStateChange(function (ev, session) {
    SB_USER = session ? session.user : null;
    loadRole().then(async function () {
      if (SB_USER) { try { await loadSupabase(); } catch (e) {} }
      else { ORDS = {}; CUSTS = []; SB_ROLE = 'guest'; SB_PROFILE = null; }
      if (isStaff() && sb()) sbLoadProfilesSilent();
      go();
    });
  });
})();
async function sbLoadProfilesSilent() {
  try { var c = sb(); if (!c || !isStaff()) return; var r = await c.from('profiles').select('id,email,role').order('created_at'); if (!r.error && r.data) SB_PROFILES = r.data; } catch (e) {}
}
