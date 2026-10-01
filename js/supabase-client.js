/* JUNGRAI TACT — Supabase client + fallback local mode */
(function () {
  function getCfg() {
    // 1) Vercel/Netlify env inject (ถ้ามี script window.ENV)
    var envUrl = (window.ENV && window.ENV.SUPABASE_URL) || "";
    var envKey = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || "";
    // 2) js/config.js
    var cUrl = (window.JT_CONFIG && window.JT_CONFIG.SUPABASE_URL) || "";
    var cKey = (window.JT_CONFIG && window.JT_CONFIG.SUPABASE_ANON_KEY) || "";
    // 3) Admin ตั้งค่าผ่าน UI (localStorage jt_supabase)
    var ls = {};
    try { ls = JSON.parse(localStorage.getItem("jt_supabase") || "{}"); } catch (e) {}
    var url = envUrl || cUrl || ls.url || "";
    var key = envKey || cKey || ls.key || "";
    url = String(url || "").trim(); key = String(key || "").trim();
    return { url: url, key: key };
  }

  function init() {
    var cfg = getCfg();
    var client = null, configured = false;
    try {
      if (cfg.url && cfg.key && window.supabase) {
        client = window.supabase.createClient(cfg.url, cfg.key);
        configured = true;
      }
    } catch (e) { client = null; configured = false; }
    window.SB = {
      client: client,
      configured: configured,
      url: cfg.url,
      saveConn: function (url, key) {
        try { localStorage.setItem("jt_supabase", JSON.stringify({ url: url, key: key })); } catch (e) {}
        location.reload();
      },
      clearConn: function () {
        try { localStorage.removeItem("jt_supabase"); } catch (e) {}
        location.reload();
      }
    };
  }
  init();
})();
