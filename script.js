(function(){
'use strict';

/* ══════════════════════════════════════════
   STORAGE
══════════════════════════════════════════ */
var K = {
  name:'nt_name', style:'nt_greet_style', customGreet:'nt_custom_greet',
  sc:'nt_shortcuts', fav:'nt_favicon', browserIcon:'nt_browser_icon',
  font:'nt_font', customFont:'nt_custom_font',
  browser:'nt_browser', browserCustom:'nt_browser_custom',
  clockStyle:'nt_clock_style', hourFmt:'nt_hour_fmt',
  showSecs:'nt_show_secs', dateFmt:'nt_date_fmt', clockSize:'nt_clock_size',
  videoZoom:'nt_video_zoom', videoX:'nt_video_x', videoY:'nt_video_y',
  quoteAuto:'nt_quote_auto', favicons:'nt_fav_icons', quoteLast:'nt_quote_last',
  positions:'nt_positions',
  greetWeight:'nt_greet_weight',
  greetItalic:'nt_greet_italic',
  greetSize:'nt_greet_size',
  greetColor:'nt_greet_color',
  fontColor:'nt_font_color',
  glassBlur:'nt_glass_blur',
  glassAlpha:'nt_glass_alpha',
  glassTint:'nt_glass_tint',
  tabNameStyle:'nt_tab_name_style',
  customTabName:'nt_custom_tab_name',
  tabScroll:'nt_tab_scroll',
  uiScale:'nt_ui_scale',
  uiScalePreset:'nt_ui_scale_preset',
  animStyle:'nt_anim_style',
  layoutEditing:'nt_layout_editing',
  searchEngine:'nt_search_engine',
  showGreet:'nt_show_greet', showClock:'nt_show_clock', showSearch:'nt_show_search',
  showShortcuts:'nt_show_shortcuts', showWeather:'nt_show_weather', showQuote:'nt_show_quote',
  showStatus:'nt_show_status', statusLabel:'nt_status_label',
  showCalendar:'nt_show_calendar', showPrayer:'nt_show_prayer', prayerCache:'nt_prayer_cache',
  showHolidays:'nt_show_holidays', holidayCountry:'nt_holiday_country', holidayCache:'nt_holiday_cache',
  showStocks:'nt_show_stocks', stocksList:'nt_stocks_list', stocksCache:'nt_stocks_cache', stocksEvery:'nt_stocks_every',
  stocksMarket:'nt_stocks_market', cryptoList:'nt_crypto_list',
  stocksCurrency:'nt_stocks_currency', fxCache:'nt_fx_cache',
  prayerRemind:'nt_prayer_remind', prayerNotified:'nt_prayer_notified',
  prayerSound:'nt_prayer_sound',
  weatherCity:'nt_weather_city', weatherGeo:'nt_weather_geo',
  weatherCache:'nt_weather_cache', weatherUnit:'nt_weather_unit',
  weatherEvery:'nt_weather_every',
  quoteCat:'nt_quote_cat', quoteCache:'nt_quote_cache',
  quoteEvery:'nt_quote_every', customQuote:'nt_quote_custom', customQuoteAuthor:'nt_quote_custom_author',
  quoteAlign:'nt_quote_align', quoteStyle:'nt_quote_style', quoteSize:'nt_quote_size',
  quoteAuthorAlign:'nt_quote_author_align', quoteAuthorStyle:'nt_quote_author_style', quoteAuthorSize:'nt_quote_author_size',
  batterySaver:'nt_battery_saver', pauseHidden:'nt_pause_hidden', gradient:'nt_gradient',
  panelSize:'nt_panel_size', sizes:'nt_sizes',
  timeSource:'nt_time_source', calSize:'nt_cal_size',
  onboarded:'nt_onboarded',
  motion:'nt_grad_motion', motionSpeed:'nt_grad_speed', flow:'nt_grad_flow', waveDir:'nt_wave_dir',
  waveZoom:'nt_wave_zoom', waveX:'nt_wave_x', waveY:'nt_wave_y',
  glassStyle:'nt_glass_style', glassTintMode:'nt_glass_tint_mode',
  lensCustom:'nt_lens_custom',
  lensPeak:'nt_lens_peak', lensEdge:'nt_lens_edge', lensSpread:'nt_lens_spread',
  lensZoom:'nt_lens_zoom'
};

/* in-memory mirror: the clock used to hit localStorage 4x per second */
var _store = {};
function gs(k){
  if(Object.prototype.hasOwnProperty.call(_store,k)) return _store[k];
  var v = null;
  try{ v = localStorage.getItem(k); }catch(e){}
  _store[k] = v;
  return v;
}
function ss(k,v){
  _store[k] = (v==null?'':String(v));
  try{ localStorage.setItem(k,_store[k]); }catch(e){}
}

/* ══════════════════════════════════════════
   SMALL HELPERS
══════════════════════════════════════════ */
function $(id){ return document.getElementById(id); }
function setText(el,txt){ if(el && el.textContent !== txt) el.textContent = txt; }
function parseJSON(s,fb){
  try{ return s ? JSON.parse(s) : fb; }catch(e){ return fb; }
}
function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
function flash(btn,msg){
  if(!btn) return;
  var o = btn.textContent;
  btn.textContent = msg;
  setTimeout(function(){ btn.textContent = o; },1400);
}
function isShown(id){
  var el = $(id);
  return !!el && !el.classList.contains('hidden');
}
function fetchJSON(url,ms){
  return new Promise(function(resolve,reject){
    var ctrl = new AbortController();
    var t = setTimeout(function(){ ctrl.abort(); }, ms || 9000);
    fetch(url,{ signal:ctrl.signal, cache:'no-store' })
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(j){ clearTimeout(t); resolve(j); })
      .catch(function(e){ clearTimeout(t); reject(e); });
  });
}

/* ══════════════════════════════════════════
   INDEXEDDB (video)
══════════════════════════════════════════ */
var db = null;
function openDB(cb){
  if(db){ cb(db); return; }
  var r = indexedDB.open('newtab_db',1);
  r.onupgradeneeded = function(e){ e.target.result.createObjectStore('files'); };
  r.onsuccess = function(e){ db = e.target.result; cb(db); };
  r.onerror = function(){ cb(null); };
}
function saveBlob(blob,cb){
  openDB(function(d){
    if(!d){ cb && cb(false); return; }
    var tx = d.transaction('files','readwrite');
    tx.objectStore('files').put(blob,'bg_video');
    tx.oncomplete = function(){ cb && cb(true); };
    tx.onerror = function(){ cb && cb(false); };
  });
}
function loadBlob(cb){
  openDB(function(d){
    if(!d){ cb(null); return; }
    var tx = d.transaction('files','readonly');
    var r = tx.objectStore('files').get('bg_video');
    r.onsuccess = function(){ cb(r.result || null); };
    r.onerror = function(){ cb(null); };
  });
}
function deleteBlob(cb){
  openDB(function(d){
    if(!d){ cb && cb(); return; }
    var tx = d.transaction('files','readwrite');
    tx.objectStore('files').delete('bg_video');
    tx.oncomplete = function(){ cb && cb(); };
  });
}

/* ══════════════════════════════════════════
   DATA
══════════════════════════════════════════ */
var DEF_SC = [
  {label:'Google',  url:'https://www.google.com'},
  {label:'YouTube', url:'https://www.youtube.com'},
  {label:'Spotify', url:'https://open.spotify.com'},
  {label:'ChatGPT', url:'https://chat.openai.com'}
];

var BROWSERS = [
  { name:'Chrome', url:'https://www.google.com/chrome/',
    favicon:'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Google_Chrome_icon_%282011%29.png/250px-Google_Chrome_icon_%282011%29.png' },
  { name:'Brave', url:'https://brave.com/',
    favicon:'https://brave.com/static-assets/images/brave-logo-sans-text.svg' },
  { name:'Edge', url:'https://www.microsoft.com/edge',
    favicon:'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Microsoft_Edge_logo_%282019%29.svg/960px-Microsoft_Edge_logo_%282019%29.svg.png' },
  { name:'Firefox', url:'https://www.mozilla.org/firefox/',
    favicon:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Firefox_logo%2C_2019.svg/500px-Firefox_logo%2C_2019.svg.png' }
];

/* ── a fresh profile starts on the browser it was opened in ──
   The tab icon matches instead of waiting for a manual pick. Only a profile
   with no settings at all is touched, so an upgrade never changes anyone's
   chosen icon; the Browser pane still overrides this at any time. */
function detectBrowserDefault(){
  try{
    if(gs(K.browser) || gs(K.fav)) return;
    var established = ['name','weatherCity','gradient','quoteCat','searchEngine','tabNameStyle','statusLabel','sc'].some(function(k){
      var v = gs(K[k]);
      return v != null && v !== '' && v !== '[]' && v !== '{}';
    });
    if(established) return;
    var apply = function(name){
      if(!name || gs(K.browser) || gs(K.fav)) return;
      var b = null;
      BROWSERS.forEach(function(x){ if(x.name === name) b = x; });
      if(!b) return;
      ss(K.browser, b.name);
      ss(K.fav, b.favicon);
      applyBrowserFav(b.favicon);
    };
    var ua = navigator.userAgent || '';
    if(/Firefox\//.test(ua) || /FxiOS\//.test(ua)){ apply('Firefox'); return; }
    if(/Edg\//.test(ua) || /EdgiOS\//.test(ua) || /EdgA\//.test(ua)){ apply('Edge'); return; }
    if(navigator.brave && typeof navigator.brave.isBrave === 'function'){
      navigator.brave.isBrave().then(function(ok){ apply(ok ? 'Brave' : 'Chrome'); }, function(){ apply('Chrome'); });
      return;
    }
    apply('Chrome');
  }catch(e){}
}

/* Apple-ish gradients used whenever the video is off. Each palette carries a
   base wash plus a ramp of wave-band colours, dark at the back and light at
   the front. The bands are what give the liquid lens real structure to bend. */
var GRADIENTS = [
  { name:'Reze',     css:'linear-gradient(125deg,#241a44,#0d2438 32%,#3a1b3d 62%,#08182b)', amp:56,
    bands:['#070912','#0b0920','#0f0c26','#1a1340','#221850','#2a1c5e','#3f2a86','#5c44b0','#8f79d4'] },
  { name:'Midnight', css:'linear-gradient(125deg,#0b1026,#131a3a 40%,#1b1030 70%,#05070f)', amp:42,
    bands:['#03050c','#050a18','#070d24','#0c1638','#101c44','#122150','#1c2f72','#2b459c','#4a68c4'] },
  { name:'Aurora',   css:'linear-gradient(125deg,#06312e,#0b3a4a 35%,#123a56 65%,#04121f)', amp:72,
    bands:['#02110d','#031712','#041d18','#072b26','#0a3d36','#0f574a','#17786a','#2b9a80','#33b394'] },
  { name:'Sunset',   css:'linear-gradient(125deg,#3a1630,#4a1c2e 35%,#2a1230 65%,#12081a)', amp:62,
    bands:['#140812','#1c0918','#250b1f','#3d1230','#4a1636','#5a1a3c','#7d274a','#a63b56','#d1666b'] },
  { name:'Ocean',    css:'linear-gradient(125deg,#0a2740,#0d3a52 40%,#123047 70%,#04121e)', amp:64,
    bands:['#030f19','#041721','#061f2e','#0a3145','#0f4a5f','#176b82','#2196a2','#2fb0b0','#4cc6bd'] },
  { name:'Graphite', css:'linear-gradient(125deg,#1a1a1f,#232329 40%,#141418 70%,#0a0a0d)', amp:34,
    bands:['#08080a','#0c0c0f','#101013','#18181d','#232329','#33333c','#4a4a56','#5a5a68','#6c6c7a'] }
];

/* ── the wave field ─────────────────────────────────────────────────────────
   Layered silk ribbons, matched to the reference wallpaper: parallel bands
   tilted down-right, each a flat colour, with a compact soft shadow where it
   laps over the ribbon behind. Colours ramp from the dark back edge to the
   pale front edge, and the field is measured in real screen space so the full
   ramp always spans the window. Built once, then slid one wavelength along the
   ribbon axis on the compositor, so the loop is seamless. */

var WAVE_TILT_DEG       = 42;     /* ribbon direction, down-right from horizontal */
var WAVE_CYCLES         = 2.75;   /* wave cycles along the ribbon axis across the window */
var WAVE_A1             = 0.42;   /* fundamental amplitude, x band width */
var WAVE_A2             = 0.07;   /* 2nd-harmonic amplitude, x band width */
var WAVE_PH2            = 1.15;   /* 2nd-harmonic phase (rad) */
var WAVE_SEGS           = 16;     /* cubic segments per wavelength (integer: keeps loop seamless) */
var WAVE_TARGET_BW      = 200;    /* preferred band width in px (decides ribbon count, 6..9) */
var WAVE_MIN_RIBBONS    = 6;
var WAVE_MAX_RIBBONS    = 9;
var WAVE_EDGE_BIAS      = 0.55;   /* where ribbon 0's edge sits, in band widths from the back edge */
var WAVE_EXTRA_BACK     = 2;      /* extra ribbons behind the dark edge */
var WAVE_EXTRA_FRONT    = 2;      /* extra ribbons past the light edge */
var WAVE_SHADOW_LAYERS  = 10;
var WAVE_SHADOW_REACH   = 0.18;   /* shadow depth, x band width */
var WAVE_SHADOW_TOTAL   = 0.5;    /* peak shadow opacity at the edge */
var WAVE_SHADOW_Q       = 1.6;    /* falloff exponent */
var WAVE_SHADOW_BLACK   = 0.45;   /* how far the shadow colour is pulled toward black */
var WAVE_STEP_FRAC      = 0.3;    /* --wave-step, x band width */
var WAVE_DEFAULT_BANDS  = ['#0f1c24', '#002b40', '#034556', '#056a75', '#3da8a8', '#74c6c8', '#a9c0c4', '#cfd8d3', '#f4e4d8'];

function waveClamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

function waveHexToRgb(hex) {
  var s = String(hex || '').replace('#', '');
  if (s.length === 3) {
    s = s.charAt(0) + s.charAt(0) + s.charAt(1) + s.charAt(1) + s.charAt(2) + s.charAt(2);
  }
  if (!/^[0-9a-fA-F]{6}$/.test(s)) { return [0, 0, 0]; }
  return [parseInt(s.substr(0, 2), 16), parseInt(s.substr(2, 2), 16), parseInt(s.substr(4, 2), 16)];
}

function waveRgbToHex(c) {
  var out = '#', i, h;
  for (i = 0; i < 3; i++) {
    h = Math.round(waveClamp(c[i], 0, 255)).toString(16);
    if (h.length < 2) { h = '0' + h; }
    out += h;
  }
  return out;
}

function waveMix(a, b, t) {
  var ca = waveHexToRgb(a), cb = waveHexToRgb(b);
  return waveRgbToHex([
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t
  ]);
}

/* colour of visible ribbon j (0..n-1), sampled along the dark->light ramp */
function waveBandColor(bands, j, n) {
  var pos = n > 1 ? j * (bands.length - 1) / (n - 1) : 0;
  var lo = Math.floor(pos + 1e-9);
  var hi = Math.min(bands.length - 1, lo + 1);
  var f = pos - lo;
  if (f < 1e-6 || hi === lo) { return bands[lo]; }
  return waveMix(bands[lo], bands[hi], f);
}

/* Shadow stack. Layer m is the ribbon silhouette pushed back by s*D.
   Equal opacity steps (total/n each) at positions following (1-s)^q, so the
   contrast of every step is identical and the largest step is the minimum
   possible for n layers. Per-layer alpha is corrected for "over" compositing. */
function waveShadow(n, total, q) {
  var out = [], m, norm, prev = 0, cum, a, s;
  norm = 1 - Math.pow(0.5 / n, 1 / q);
  for (m = 0; m < n; m++) {
    s = (1 - Math.pow((m + 0.5) / n, 1 / q)) / norm;
    cum = total * (m + 1) / n;
    a = 1 - (1 - cum) / (1 - prev);
    prev = cum;
    out.push({ s: s, a: a });
  }
  return out;
}

function waveFmt(v) {
  return (Math.round(v * 10) / 10).toString();
}

/* (t,u) -> screen "x y" */
function waveXY(c, t, u) {
  return waveFmt(c.cs * t - c.sn * u) + ' ' + waveFmt(c.sn * t + c.cs * u);
}

/* One filled region: wavy edge at u = edgeU + f(t) running along t, closed
   far away at uFar. Cubic Hermite segments (exact under the rotation). */
function waveBandPath(c, edgeU, uFar) {
  var n = c.i1 - c.i0, h3 = c.h / 3, i, ta, tb, t0, t1, d;
  t0 = c.i0 * c.h;
  t1 = c.i1 * c.h;
  d = 'M' + waveXY(c, t0, edgeU + c.ft[0]);
  for (i = 0; i < n; i++) {
    ta = (c.i0 + i) * c.h;
    tb = ta + c.h;
    d += 'C' + waveXY(c, ta + h3, edgeU + c.ft[i] + c.fp[i] * h3) +
         ' ' + waveXY(c, tb - h3, edgeU + c.ft[i + 1] - c.fp[i + 1] * h3) +
         ' ' + waveXY(c, tb, edgeU + c.ft[i + 1]);
  }
  d += 'L' + waveXY(c, t1, uFar) + 'L' + waveXY(c, t0, uFar) + 'Z';
  return d;
}

function buildWaveSvg(g, W, H) {
  var bands, N, i, k, m, c, rad, cs, sn, xs, ys, t, u;
  var tmin, tmax, umin, umax, T, L, bw, lam, h, w, ph, A1, A2, D, uFar, uEdge, uBase, segs;
  var shade, layers, parts, d, dx, dy, st, kFirst, kLast, col, t0, t1;

  W = +W; H = +H;
  if (!(W > 0)) { W = 1920; }
  if (!(H > 0)) { H = 1080; }

  bands = (g && g.bands && g.bands.length) ? g.bands : WAVE_DEFAULT_BANDS;

  var tilt = (typeof waveDir === 'function') ? waveDir() : WAVE_TILT_DEG;
  rad = tilt * Math.PI / 180;
  cs = Math.cos(rad);
  sn = Math.sin(rad);

  /* extents of the screen in the rotated basis (t along ribbon, u across, u grows toward lower-left) */
  xs = [0, W, 0, W];
  ys = [0, 0, H, H];
  tmin = Infinity; tmax = -Infinity; umin = Infinity; umax = -Infinity;
  for (i = 0; i < 4; i++) {
    t = xs[i] * cs + ys[i] * sn;
    u = -xs[i] * sn + ys[i] * cs;
    if (t < tmin) { tmin = t; }
    if (t > tmax) { tmax = t; }
    if (u < umin) { umin = u; }
    if (u > umax) { umax = u; }
  }
  T = tmax - tmin;
  L = umax - umin;

  N = waveClamp(Math.round(L / WAVE_TARGET_BW), WAVE_MIN_RIBBONS, WAVE_MAX_RIBBONS);
  bw = L / N;                           /* band width: whole ramp spans the viewport */
  lam = T / WAVE_CYCLES;                /* one wavelength along t */
  segs = waveLowDetail ? 8 : WAVE_SEGS; /* lighter geometry while dragging */
  h = lam / segs;
  A1 = WAVE_A1 * bw;
  A2 = WAVE_A2 * bw;
  w = 2 * Math.PI / lam;
  D = WAVE_SHADOW_REACH * bw;

  c = { cs: cs, sn: sn, h: h, ft: [], fp: [] };
  c.i0 = Math.floor((tmin - lam - 2 * h) / h);
  c.i1 = Math.ceil((tmax + lam + 2 * h) / h);
  for (i = 0; i <= c.i1 - c.i0; i++) {
    ph = w * ((c.i0 + i) * h);
    c.ft[i] = A1 * Math.sin(ph) + A2 * Math.sin(2 * ph + WAVE_PH2);
    c.fp[i] = A1 * w * Math.cos(ph) + 2 * A2 * w * Math.cos(2 * ph + WAVE_PH2);
  }

  uFar = umax + 3 * bw;
  uBase = umin - 4 * bw;
  shade = waveMix(bands[0], '#000000', WAVE_SHADOW_BLACK);
  layers = waveShadow(waveLowDetail ? 2 : WAVE_SHADOW_LAYERS, WAVE_SHADOW_TOTAL, WAVE_SHADOW_Q);

  parts = [];
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ' +
    W + ' ' + H + '" preserveAspectRatio="none" style="display:block"><g class="wave-flow">');

  /* backstop slab: nothing can show through behind the first ribbon */
  t0 = c.i0 * h;
  t1 = c.i1 * h;
  parts.push('<path fill="' + waveBandColor(bands, 0, N) + '" d="M' + waveXY(c, t0, uBase) +
    'L' + waveXY(c, t1, uBase) + 'L' + waveXY(c, t1, uFar) + 'L' + waveXY(c, t0, uFar) + 'Z"/>');

  kFirst = -WAVE_EXTRA_BACK;
  kLast = N - 1 + WAVE_EXTRA_FRONT;
  for (k = kFirst; k <= kLast; k++) {
    uEdge = umin + (k + WAVE_EDGE_BIAS) * bw;

    /* shadow cast by ribbon k onto the ribbon behind it (only where it can be seen) */
    if (k >= 0 && k <= N) {
      for (m = 0; m < layers.length; m++) {
        d = waveBandPath(c, uEdge - layers[m].s * D, uFar);
        parts.push('<path fill="' + shade + '" fill-opacity="' + layers[m].a.toFixed(4) + '" d="' + d + '"/>');
      }
    }

    col = waveBandColor(bands, waveClamp(k, 0, N - 1), N);
    parts.push('<path fill="' + col + '" d="' + waveBandPath(c, uEdge, uFar) + '"/>');
  }

  parts.push('</g></svg>');

  /* one wavelength along t, expressed as a screen vector */
  dx = lam * cs;
  dy = lam * sn;
  if (typeof document !== 'undefined' && document.documentElement) {
    st = document.documentElement.style;
    st.setProperty('--wave-dx', dx.toFixed(2) + 'px');
    st.setProperty('--wave-dy', dy.toFixed(2) + 'px');
    st.setProperty('--wave-step', (bw * WAVE_STEP_FRAC).toFixed(2) + 'px');
  }

  return parts.join('');
}

function waveSize(){
  var fb = $('fallback-bg');
  var r = fb ? fb.getBoundingClientRect() : null;
  var W = (r && r.width)  || window.innerWidth  || 1280;
  var H = (r && r.height) || window.innerHeight || 720;
  return { w: Math.max(360, Math.round(W)), h: Math.max(280, Math.round(H)) };
}
function applyWave(i){
  var fb = $('fallback-bg');
  if(!fb) return;
  var g = GRADIENTS[i] || GRADIENTS[0];
  var host = $('wave-bg');
  if(!host){
    host = document.createElement('div');
    host.id = 'wave-bg';
    fb.insertBefore(host, fb.firstChild);
  }
  var s = waveSize();
  host.innerHTML = buildWaveSvg(g, s.w, s.h);
}

function gradientIndex(){
  var i = parseInt(gs(K.gradient),10);
  if(isNaN(i) || i < 0 || i >= GRADIENTS.length) i = 0;
  return i;
}
function applyGradient(i){
  if(typeof i !== 'number') i = gradientIndex();
  var g = GRADIENTS[i] || GRADIENTS[0];
  var root = document.documentElement.style;
  root.setProperty('--grad-bg', bandCss(g));
  applyWave(i);
  /* adaptive glass reads its tint from the scene, so a palette change is a
     tint change — re-derive it quietly on the next frame */
  if(glassTintMode() === 'adaptive') queueGlass();
}
/* how much the gradient drifts: 'still' or 'flow'. Flowing is the default —
   a gentle, always-there life in the colours. */
function motionMode(){
  var m = gs(K.motion);
  return (m === 'still') ? 'still' : 'flow';
}
/* 1–100, left slow, right fast. 50 is the calm default. */
function motionSpeed(){
  var s = parseInt(gs(K.motionSpeed),10);
  if(isNaN(s)) s = 50;
  return Math.max(1, Math.min(100, s));
}
/* ===== wave direction: rotates the ribbon SHAPE (independent of Flow) ===== */
var waveRaf = 0;
var waveLowDetail = false;   /* true while a slider is dragged: drop shadows */

function waveDir(){
  var d = parseInt(gs(K.waveDir),10);
  if(isNaN(d)) d = 40;              /* default keeps the calm look */
  d = ((d % 360) + 360) % 360;      /* wrap into 0..359 */
  return d;
}

function syncWaveDirUI(){
  var d = waveDir();
  [['iwavedir','iwavedir-v','wavedir-dial'],['ob-wavedir','ob-wavedir-v','ob-wavedir-dial']]
    .forEach(function(t){
      var r = $(t[0]), v = $(t[1]), dial = $(t[2]);
      if(r){ r.value = d; syncRangeFill(r); }
      if(v) v.textContent = d + '\u00b0';
      if(dial) dial.style.transform = 'rotate(' + d + 'deg)'; /* needle */
    });
}

/* at most one rebuild per animation frame */
function waveScheduleRebuild(){
  if(waveRaf) return;
  var run = function(){
    waveRaf = 0;
    if(typeof applyWave === 'function') applyWave(gradientIndex());
  };
  if(typeof window.requestAnimationFrame === 'function'){
    waveRaf = window.requestAnimationFrame(run);
  } else {
    waveRaf = 1;
    setTimeout(run, 16);
  }
}

/* shared setter: store now, repaint readout + dial now, rebuild next frame. */
function waveSetDir(val){
  var d = parseInt(val,10);
  if(isNaN(d)) d = 40;
  d = ((d % 360) + 360) % 360;
  ss(K.waveDir, String(d));
  syncWaveDirUI();
  waveScheduleRebuild();
  return d;
}
/* ── Calm Flow view: zoom + pan, mirroring the video wallpaper controls ── */
function waveZoomVal(){
  var z = parseInt(gs(K.waveZoom),10);
  if(isNaN(z)) z = 100;
  return Math.max(100, Math.min(250, z));
}
function wavePanXVal(){
  var x = parseInt(gs(K.waveX),10);
  if(isNaN(x)) x = 0;
  return Math.max(-600, Math.min(600, x));
}
function wavePanYVal(){
  var y = parseInt(gs(K.waveY),10);
  if(isNaN(y)) y = 0;
  return Math.max(-600, Math.min(600, y));
}
function syncWaveViewUI(){
  var z = waveZoomVal(), x = wavePanXVal(), y = wavePanYVal();
  var zi = $('iwavezoom'), zv = $('iwavezoom-v');
  if(zi){ zi.value = z; syncRangeFill(zi); }
  if(zv) zv.textContent = z + '%';
  var xi = $('iwavex'), xv = $('iwavex-v');
  if(xi){ xi.value = x; syncRangeFill(xi); }
  if(xv) xv.textContent = x;
  var yi = $('iwavey'), yv = $('iwavey-v');
  if(yi){ yi.value = y; syncRangeFill(yi); }
  if(yv) yv.textContent = y;
}
function applyWaveView(){
  var root = document.documentElement.style;
  root.setProperty('--wave-zoom', (waveZoomVal() / 100).toFixed(3));
  root.setProperty('--wave-pan-x', wavePanXVal() + 'px');
  root.setProperty('--wave-pan-y', wavePanYVal() + 'px');
  syncWaveViewUI();
}
/* swatch preview built from the wave's own band colours, so the tile matches
   the wallpaper it produces (dark edge -> pale front). */
function bandCss(item){
  if(!item) return '';
  var b = item.bands;
  if(!b || !b.length) return item.css || '#000';
  var n = b.length, out = [], i;
  for(i = 0; i < n; i++){
    out.push(b[n - 1 - i] + ' ' + Math.round(i * 100 / (n - 1)) + '%');
  }
  return 'linear-gradient(125deg,' + out.join(',') + ')';
}
/* the flow cycle in seconds for the current speed. A shorter cycle is a
   faster drift: one full wave-slide, so 100% sweeps the field in a few
   seconds and even the calm default stays clearly alive. Flow rides at 0.45x
   this, so Flowing is always the livelier one. */
function motionDuration(){
  return 5 * Math.pow(20, (100 - motionSpeed()) / 99);
}
/* where the bands flow. The arrow points the way the waves travel. */
var FLOWS = ['tl','ttb','tr','rtl','ltr','bl','btt','br'];
var FLOW_ARROWS = { tl:'↖', ttb:'↓', tr:'↗', rtl:'←', ltr:'→', bl:'↙', btt:'↑', br:'↘' };
var FLOW_TITLES = { tl:'Top-left', ttb:'Top to bottom', tr:'Top-right', rtl:'Right to left',
                    ltr:'Left to right', bl:'Bottom-left', btt:'Bottom to top', br:'Bottom-right' };
function flowDir(){
  var f = gs(K.flow);
  return (FLOWS.indexOf(f) >= 0) ? f : 'rtl';
}
function paintFlowPad(hostId){
  var host = $(hostId);
  if(!host) return;
  var cur = flowDir();
  Array.prototype.forEach.call(host.querySelectorAll('.seg-btn'), function(b){
    b.classList.toggle('on', b.getAttribute('data-flow') === cur);
  });
}
/* speed is a ten-step segmented control, not a slider */
function paintSpeedSeg(hostId, sp){
  var host = $(hostId);
  if(!host) return;
  Array.prototype.forEach.call(host.querySelectorAll('.seg-btn'), function(b){
    b.classList.toggle('on', parseInt(b.getAttribute('data-speed'),10) === sp);
  });
}
function buildFlowPad(hostId, onPick){
  var host = $(hostId);
  if(!host || host._built) return;
  host._built = true;
  ['tl','ttb','tr','rtl','','ltr','bl','btt','br'].forEach(function(f){
    if(!f){ var s = document.createElement('span'); s.className = 'flow-spacer'; host.appendChild(s); return; }
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'seg-btn';
    b.setAttribute('data-flow', f);
    b.setAttribute('aria-label', 'Flow ' + FLOW_TITLES[f]);
    b.title = FLOW_TITLES[f];
    b.textContent = FLOW_ARROWS[f];
    b.onclick = function(){ onPick(f); paintFlowPad(hostId); };
    host.appendChild(b);
  });
  paintFlowPad(hostId);
}
function applyMotion(){
  document.body.setAttribute('data-motion', motionMode());
  document.documentElement.setAttribute('data-flow', flowDir());
  document.documentElement.style.setProperty('--grad-dur', motionDuration().toFixed(1) + 's');
  var seg = $('motion-seg');
  if(seg){
    Array.prototype.forEach.call(seg.querySelectorAll('.seg-btn'), function(b){
      b.classList.toggle('on', b.getAttribute('data-motion') === motionMode());
    });
  }
  paintFlowPad('flow-seg');
  paintSpeedSeg('motion-speed-seg', motionSpeed());
  paintSpeedSeg('ob-motion-speed-seg', motionSpeed());
  /* Still has no drift, so Speed and Flow direction do nothing — tuck them
     away. Wave direction and zoom/pan still apply to the static field. */
  var still = (motionMode() === 'still');
  var mw = $('flow-move-wrap');
  if(mw) mw.style.display = still ? 'none' : '';
  var mwOb = $('ob-flow-move-wrap');
  if(mwOb) mwOb.style.display = still ? 'none' : '';
  syncWaveDirUI();
}
function buildGradGrid(){
  var g = $('grad-grid');
  if(!g) return;
  if(builtOnce('grad')){ selectIn(g,'.grad-card','data-grad',String(gradientIndex())); return; }
  g.innerHTML = '';
  GRADIENTS.forEach(function(item, i){
    var c = document.createElement('div');
    c.className = 'grad-card';
    c.setAttribute('data-grad', String(i));
    c.setAttribute('role', 'button');
    c.setAttribute('tabindex', '0');
    c.style.background = bandCss(item);
    var label = document.createElement('span');
    label.textContent = item.name;
    c.appendChild(label);
    c.onclick = function(){
      ss(K.gradient, String(i));
      selectIn(g,'.grad-card','data-grad',String(i));
      applyGradient(i);
    };
    c.onkeydown = function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); c.click(); }
    };
    g.appendChild(c);
  });
  selectIn(g,'.grad-card','data-grad',String(gradientIndex()));
}

var FONTS = [
  {name:'Default',      family:"'Plus Jakarta Sans','SF Pro Display','-apple-system','BlinkMacSystemFont','Helvetica Neue',Arial,sans-serif", local:true, prev:'Jakarta'},
  {name:'Geist',        family:"'Geist',sans-serif",            gfont:'Geist',              prev:'Geist'},
  {name:'DM Sans',      family:"'DM Sans',sans-serif",          gfont:'DM+Sans',            prev:'DM Sans'},
  {name:'Sora',         family:"'Sora',sans-serif",             gfont:'Sora',               prev:'Sora'},
  {name:'Space Grotesk',family:"'Space Grotesk',sans-serif",    gfont:'Space+Grotesk',      prev:'Space'},
  {name:'Outfit',       family:"'Outfit',sans-serif",           gfont:'Outfit',             prev:'Outfit'},
  {name:'Raleway',      family:"'Raleway',sans-serif",          gfont:'Raleway',            prev:'Raleway'},
  {name:'Roboto Mono',  family:"'Roboto Mono',monospace",       gfont:'Roboto+Mono',        prev:'Mono'}
];

var CLOCK_STYLES = [
  {id:'default', name:'Default',    prev:'09:35'},
  {id:'slim',    name:'Slim',       prev:'09:35'},
  {id:'big',     name:'Big',        prev:'09:35'},
  {id:'minimal', name:'Minimal',    prev:'9:35'}
];

var GREET_COLORS = [
  '#ffffff','#f5f5f5','#d0d0d0','#a0a0a0',
  '#5ac8fa','#bf5af2','#ff9f0a','#30d158','#ff6b6b','#1e1e3c',
  '#ffd700','#ffb3c6','#ff3b30','#ff6000',
  '#34c759','#00c7be','#007aff','#5856d6',
  '#ff2d55','#af52de','#ff9500','#ffcc00',
  '#000000','#1c1c1e','#2c2c2e','#3a3a3c'
];

var GLASS_TINTS = [
  'rgba(255,255,255,1)','rgba(90,200,250,1)','rgba(191,90,242,1)','rgba(255,159,10,1)',
  'rgba(48,209,88,1)','rgba(255,107,107,1)','rgba(0,0,0,1)','rgba(30,30,60,1)',
  'rgba(255,45,85,1)','rgba(0,122,255,1)','rgba(88,86,214,1)','rgba(0,199,190,1)',
  'rgba(255,204,0,1)','rgba(255,96,0,1)','rgba(52,199,89,1)','rgba(175,82,222,1)',
  'rgba(100,210,255,1)','rgba(255,179,64,1)','rgba(50,50,50,1)','rgba(15,15,30,1)'
];

var ANIM_STYLES = [
  {id:'spring', name:'Spring', icon:'🌀', desc:'Bouncy elastic'},
  {id:'fade',   name:'Fade',   icon:'✨', desc:'Soft crossfade'},
  {id:'slide',  name:'Slide',  icon:'↗️', desc:'Directional move'},
  {id:'zoom',   name:'Zoom',   icon:'🔍', desc:'Scale in/out'},
  {id:'blur',   name:'Blur',   icon:'💧', desc:'Glass blur morph'},
  {id:'drift',  name:'Drift',  icon:'🌊', desc:'Slow float upwards'},
  {id:'glide',  name:'Glide',  icon:'➡️', desc:'Smooth sideways glide'},
  {id:'unfold', name:'Unfold', icon:'🪭', desc:'Tilted panel unfold'},
  {id:'none',   name:'None',   icon:'⚡', desc:'Instant'}
];

var GLASS_PRESETS = {
  clear:   {blur:16, alpha:6,  tint:'rgba(255,255,255,1)'},
  frosted: {blur:44, alpha:16, tint:'rgba(255,255,255,1)'},
  tinted:  {blur:28, alpha:14, tint:'rgba(30,30,60,1)'},
  liquid:  {blur:2,  alpha:21, tint:'rgba(15,15,30,1)'}
};

var ENGINES = {
  google:  {name:'Google',     url:'https://www.google.com/search?q=',        domain:'google.com',     ph:'Search anything, at your own pace…'},
  brave:   {name:'Brave',      url:'https://search.brave.com/search?q=',      domain:'brave.com',      ph:'Search freely, at your own pace…'},
  ddg:     {name:'DuckDuckGo', url:'https://duckduckgo.com/?q=',               domain:'duckduckgo.com', ph:'Wander quietly, no rush…'},
  bing:    {name:'Bing',       url:'https://www.bing.com/search?q=',          domain:'bing.com',       ph:'Search anything, gently…'},
  youtube: {name:'YouTube',    url:'https://www.youtube.com/results?search_query=', domain:'youtube.com', ph:'Watch whatever catches your heart.'}
};

/* WMO weather codes -> emoji + label */
var WMO = {
  0:['☀️','Clear'], 1:['🌤️','Mostly clear'], 2:['⛅','Partly cloudy'], 3:['☁️','Overcast'],
  45:['🌫️','Fog'], 48:['🌫️','Rime fog'],
  51:['🌦️','Light drizzle'], 53:['🌦️','Drizzle'], 55:['🌧️','Heavy drizzle'],
  56:['🌧️','Freezing drizzle'], 57:['🌧️','Freezing drizzle'],
  61:['🌦️','Light rain'], 63:['🌧️','Rain'], 65:['🌧️','Heavy rain'],
  66:['🌧️','Freezing rain'], 67:['🌧️','Freezing rain'],
  71:['🌨️','Light snow'], 73:['🌨️','Snow'], 75:['❄️','Heavy snow'], 77:['❄️','Snow grains'],
  80:['🌦️','Showers'], 81:['🌧️','Showers'], 82:['⛈️','Violent showers'],
  85:['🌨️','Snow showers'], 86:['🌨️','Snow showers'],
  95:['⛈️','Thunderstorm'], 96:['⛈️','Storm + hail'], 99:['⛈️','Storm + hail']
};

/* offline / fallback quotes.
   Philosophy is always local (there is no reliable keyless philosophy API left),
   so it also works offline — and it's instant on a slow connection. */
var LOCAL_QUOTES = {
  philosophy: [
    {text:'The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.', author:'Albert Camus'},
    {text:'Should I kill myself, or have a cup of coffee?', author:'Albert Camus'},
    {text:'I rebel — therefore we exist.', author:'Albert Camus'},
    {text:'In the depth of winter, I finally learned that within me there lay an invincible summer.', author:'Albert Camus'},
    {text:'Nobody realizes that some people expend tremendous energy merely to be normal.', author:'Albert Camus'},
    {text:'The absurd is born of this confrontation between the human need and the unreasonable silence of the world.', author:'Albert Camus'},
    {text:'Live to the point of tears.', author:'Albert Camus'},

    {text:'I am a cage, in search of a bird.', author:'Franz Kafka'},
    {text:'A book must be the axe for the frozen sea within us.', author:'Franz Kafka'},
    {text:'The meaning of life is that it stops.', author:'Franz Kafka'},
    {text:'I have the true feeling of myself only when I am unbearably unhappy.', author:'Franz Kafka'},
    {text:'In man\'s struggle against the world, bet on the world.', author:'Franz Kafka'},
    {text:'Youth is happy because it has the capacity to see beauty. Anyone who keeps the ability to see beauty never grows old.', author:'Franz Kafka'},

    {text:'The mystery of human existence lies not in just staying alive, but in finding something to live for.', author:'Fyodor Dostoevsky'},
    {text:'Pain and suffering are always inevitable for a large intelligence and a deep heart.', author:'Fyodor Dostoevsky'},
    {text:'If you want to overcome the whole world, overcome yourself.', author:'Fyodor Dostoevsky'},
    {text:'Man is a mystery. It needs to be unravelled.', author:'Fyodor Dostoevsky'},
    {text:'Nothing is easier than denouncing the evildoer. Nothing is more difficult than understanding him.', author:'Fyodor Dostoevsky'},
    {text:'I love mankind, but I find to my amazement that the more I love mankind as a whole, the less I love man in particular.', author:'Fyodor Dostoevsky'},
    {text:'If God doesn\'t exist, then everything is permitted.', author:'Fyodor Dostoevsky'},

    {text:'God is dead. God remains dead. And we have killed him.', author:'Friedrich Nietzsche'},
    {text:'He who fights with monsters should look to it that he himself does not become a monster.', author:'Friedrich Nietzsche'},
    {text:'There are no facts, only interpretations.', author:'Friedrich Nietzsche'},
    {text:'One must still have chaos in oneself to be able to give birth to a dancing star.', author:'Friedrich Nietzsche'},
    {text:'Without music, life would be a mistake.', author:'Friedrich Nietzsche'},

    {text:'Hell is other people.', author:'Jean-Paul Sartre'},
    {text:'Man is nothing else but what he makes of himself.', author:'Jean-Paul Sartre'},
    {text:'Freedom is what you do with what\'s been done to you.', author:'Jean-Paul Sartre'},
    {text:'We are our choices.', author:'Jean-Paul Sartre'},

    {text:'It is not worth the bother of killing yourself, since you always kill yourself too late.', author:'Emil Cioran'},
    {text:'Consciousness is much more than the thorn, it is the dagger in the flesh.', author:'Emil Cioran'},

    {text:'Man can do what he wills but he cannot will what he wills.', author:'Arthur Schopenhauer'},
    {text:'Life can only be understood backwards; but it must be lived forwards.', author:'Søren Kierkegaard'},
    {text:'Anxiety is the dizziness of freedom.', author:'Søren Kierkegaard'},

    {text:'Perhaps everything terrible is in its deepest being something helpless that wants help from us.', author:'Rainer Maria Rilke'},
    {text:'Live the questions now. Perhaps you will then gradually, without noticing it, live along some distant day into the answer.', author:'Rainer Maria Rilke'},
    {text:'I have been and still am a seeker, but I have ceased to question stars and books; I have begun to listen to the teaching my blood whispers to me.', author:'Hermann Hesse'},
    {text:'Political language is designed to make lies sound truthful and murder respectable.', author:'George Orwell'},
    {text:'Facts do not cease to exist because they are ignored.', author:'Aldous Huxley'},
    {text:'Arrange whatever pieces come your way.', author:'Virginia Woolf'},
    {text:'I have always imagined that Paradise will be a kind of library.', author:'Jorge Luis Borges'},
    {text:'I am nothing. I will never be anything. I cannot wish to be anything. Aside from that, I have within me all the dreams of the world.', author:'Fernando Pessoa'},
    {text:'Some people never go crazy. What truly horrible lives they must lead.', author:'Charles Bukowski'},
    {text:'I took a deep breath and listened to the old brag of my heart: I am, I am, I am.', author:'Sylvia Plath'},
    {text:'The struggle of man against power is the struggle of memory against forgetting.', author:'Milan Kundera'},
    {text:'One does not discover new lands without consenting to lose sight of the shore for a very long time.', author:'André Gide'},
    {text:'We are so accustomed to disguise ourselves to others that in the end we become disguised to ourselves.', author:'La Rochefoucauld'},
    {text:'Perfect purity is possible if you turn your life into a line of poetry written with a splash of blood.', author:'Yukio Mishima'},
    {text:'The sacred is that prodigious effort of the human will to escape the world of things.', author:'Georges Bataille'},
    {text:'He has the most who is most content with the least.', author:'Diogenes'},
    {text:'Do not spoil what you have by desiring what you have not.', author:'Epicurus'},
    {text:'We suffer more often in imagination than in reality.', author:'Seneca'},
    {text:'Men are disturbed not by things, but by the opinions which they entertain about things.', author:'Epictetus'},
    {text:'No man ever steps in the same river twice.', author:'Heraclitus'}
  ],
  general: [
    {text:'The best way to predict the future is to invent it.', author:'Alan Kay'},
    {text:'Whether you think you can or you think you can\'t, you\'re right.', author:'Henry Ford'},
    {text:'It always seems impossible until it is done.', author:'Nelson Mandela'},
    {text:'Do what you can, with what you have, where you are.', author:'Theodore Roosevelt'},
    {text:'The only way to do great work is to love what you do.', author:'Steve Jobs'},
    {text:'In the middle of difficulty lies opportunity.', author:'Albert Einstein'},
    {text:'Simplicity is the soul of efficiency.', author:'Austin Freeman'},
    {text:'You miss 100% of the shots you don\'t take.', author:'Wayne Gretzky'},
    {text:'The quieter you become, the more you are able to hear.', author:'Ram Dass'},
    {text:'Amateurs sit and wait for inspiration. The rest of us just get up and go to work.', author:'Stephen King'},
    {text:'A ship in harbor is safe, but that is not what ships are built for.', author:'John A. Shedd'},
    {text:'Creativity is intelligence having fun.', author:'Albert Einstein'}
  ],
  bible: [
    {text:'The Lord is my shepherd; I shall not want.', author:'Psalm 23:1'},
    {text:'I can do all things through Christ, who strengthens me.', author:'Philippians 4:13'},
    {text:'Trust in the Lord with all your heart, and don\'t lean on your own understanding.', author:'Proverbs 3:5'},
    {text:'Be strong and courageous. Don\'t be afraid.', author:'Joshua 1:9'},
    {text:'Cast all your worries on him, because he cares for you.', author:'1 Peter 5:7'},
    {text:'Your word is a lamp to my feet, and a light for my path.', author:'Psalm 119:105'},
    {text:'The joy of the Lord is your strength.', author:'Nehemiah 8:10'},
    {text:'This is the day that the Lord has made. Let us rejoice and be glad in it.', author:'Psalm 118:24'},
    {text:'For where two or three are gathered together in my name, there I am in the middle of them.', author:'Matthew 18:20'},
    {text:'Let all that you do be done in love.', author:'1 Corinthians 16:14'},
    {text:'The light shines in the darkness, and the darkness hasn\'t overcome it.', author:'John 1:5'},
    {text:'Ask, and it will be given you. Seek, and you will find.', author:'Matthew 7:7'}
  ],
  /* public-domain translation: Muhammad Marmaduke Pickthall (1930) */
  quran: [
    {text:'Allah! There is no deity save Him, the Alive, the Eternal. Neither slumber nor sleep overtaketh Him.', author:'Qur\'an 2:255'},
    {text:'O ye who believe! Seek help in steadfastness and prayer. Lo! Allah is with the steadfast.', author:'Qur\'an 2:153'},
    {text:'Allah tasketh not a soul beyond its scope.', author:'Qur\'an 2:286'},
    {text:'Faint not nor grieve, for ye will overcome them if ye are (indeed) believers.', author:'Qur\'an 3:139'},
    {text:'Lo! Allah changeth not the condition of a folk until they (first) change that which is in their hearts.', author:'Qur\'an 13:11'},
    {text:'Whosoever doeth right, whether male or female, and is a believer, him verily We shall quicken with good life.', author:'Qur\'an 16:97'},
    {text:'And say: My Lord! Increase me in knowledge.', author:'Qur\'an 20:114'},
    {text:'And whosoever putteth his trust in Allah, He will suffice him.', author:'Qur\'an 65:3'},
    {text:'Lo! with hardship goeth ease.', author:'Qur\'an 94:6'},
    {text:'And He is with you wheresoever ye may be.', author:'Qur\'an 57:4'},
    {text:'Say: O my Lord! forgive and have mercy, for Thou art Best of all who show mercy.', author:'Qur\'an 23:118'},
    {text:'Despair not of the mercy of Allah, Who forgiveth all sins.', author:'Qur\'an 39:53'}
  ]
};

/* ══════════════════════════════════════════
   ANIMATION STYLE ENGINE
   One style drives every surface: the settings sheet (#panel), the widget
   windows (.win-panel) and the dimmer behind both. Every style fades through
   opacity — which is both the 1.0 blur-fade look *and* the cheap path, because
   a panel below full opacity skips its backdrop sampling, so the glass is only
   re-rasterised once, when the fade lands. A sheet therefore animates opacity
   alone: a transform or a filter on a live backdrop lens would force a fresh
   full-screen sample on every frame, which is what made opening a widget or the
   settings sheet drop frames. The paused-lens shortcut this replaced changed the
   look mid-animation, so it was removed.
══════════════════════════════════════════ */
function applyAnimStyle(id){
  var style = $('anim-vars');
  if(!style){ style = document.createElement('style'); style.id = 'anim-vars'; document.head.appendChild(style); }
  var SEL_C = '#overlay #panel,.win-modal .win-panel,.prayer-modal .prayer-panel';
  var SEL_O = '#overlay.open-anim #panel,.win-modal.in .win-panel,.prayer-modal.in .prayer-panel';
  var SCRIM = '#overlay,.win-modal,.prayer-modal{transition:background-color 0.30s ease;}';

  /* closed transform, duration, easing, closed blur (px), pane anim, keyframes, extra */
  var S = {
    spring:{ closed:'scale(0.94) translateY(14px)', dur:'0.34s', ease:'cubic-bezier(0.34,1.30,0.64,1)', blur:10,
      pane:'.pane.on{animation:pane-in 0.26s cubic-bezier(0.34,1.30,0.64,1) forwards;}',
      kf:'@keyframes pane-in{from{opacity:0;transform:translateY(10px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}',
      extra:'.tbtn{transition:background 0.18s,color 0.18s,transform 0.18s;}.tbtn:hover{transform:scale(1.06);}.tbtn.on{transform:scale(1.04);}' },
    fade:{ closed:'none', dur:'0.30s', ease:'ease', blur:12,
      pane:'.pane.on{animation:pane-fade 0.30s ease forwards;}',
      kf:'@keyframes pane-fade{from{opacity:0;}to{opacity:1;}}',
      extra:'.tbtn{transition:background 0.25s,color 0.25s;}' },
    slide:{ closed:'translateY(30px)', dur:'0.30s', ease:'cubic-bezier(0.25,1,0.5,1)', blur:10,
      pane:'.pane.on{animation:pane-slide 0.26s cubic-bezier(0.25,1,0.5,1) forwards;}',
      kf:'@keyframes pane-slide{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}' },
    zoom:{ closed:'scale(0.86)', dur:'0.28s', ease:'cubic-bezier(0.34,1.20,0.64,1)', blur:8,
      pane:'.pane.on{animation:pane-zoom 0.22s cubic-bezier(0.34,1.20,0.64,1) forwards;}',
      kf:'@keyframes pane-zoom{from{opacity:0;transform:scale(0.90);}to{opacity:1;transform:scale(1);}}' },
    blur:{ closed:'none', dur:'0.32s', ease:'ease', blur:18,
      pane:'.pane.on{animation:pane-blur 0.30s ease forwards;}',
      kf:'@keyframes pane-blur{from{opacity:0;filter:blur(8px);}to{opacity:1;filter:blur(0);}}' },
    drift:{ closed:'translateY(20px) scale(0.985)', dur:'0.34s', ease:'cubic-bezier(0.22,0.61,0.36,1)', blur:10,
      pane:'.pane.on{animation:pane-drift 0.34s cubic-bezier(0.22,0.61,0.36,1) forwards;}',
      kf:'@keyframes pane-drift{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}',
      extra:'.tbtn{transition:background 0.22s,color 0.22s,transform 0.22s;}.tbtn:hover{transform:translateY(-1px);}' },
    glide:{ closed:'translateX(28px)', dur:'0.32s', ease:'cubic-bezier(0.25,1,0.5,1)', blur:10,
      pane:'.pane.on{animation:pane-glide 0.30s cubic-bezier(0.25,1,0.5,1) forwards;}',
      kf:'@keyframes pane-glide{from{opacity:0;transform:translateX(-14px);}to{opacity:1;transform:translateX(0);}}',
      extra:'.tbtn{transition:background 0.22s,color 0.22s,transform 0.22s;}.tbtn:hover{transform:translateX(1px);}' },
    unfold:{ closed:'transform-origin:top center;transform:perspective(900px) rotateX(-9deg) translateY(-10px) scale(0.97)', dur:'0.34s', ease:'cubic-bezier(0.22,0.61,0.36,1)', blur:12,
      pane:'.pane.on{animation:pane-unfold 0.30s cubic-bezier(0.22,0.61,0.36,1) forwards;transform-origin:top center;}',
      kf:'@keyframes pane-unfold{from{opacity:0;transform:perspective(900px) rotateX(-7deg) translateY(-8px);}to{opacity:1;transform:perspective(900px) rotateX(0) translateY(0);}}',
      extra:'.tbtn{transition:background 0.22s,color 0.22s,transform 0.22s;}.tbtn:hover{transform:translateY(-1px);}' }
  };

  var css;
  if(id === 'none'){
    css = '#overlay,.win-modal,.prayer-modal{transition:none;}' +
          SEL_C + '{transition:none;transform:none;opacity:1;filter:none;}' +
          '.pane.on{animation:none;}' +
          '.lx-show,.lx-hide{animation:none;}';
  } else {
    var s = S[id] || S.spring;
    /* reuse the pane keyframes so a settings section can reveal/hide with the
       same motion the user picked for panels; `reverse both` reads as a fade
       back out for the disappearance */
    var am = s.pane ? s.pane.match(/animation:([^;]+);/) : null;
    var revealAnim = am ? am[1].replace(/\s*forwards\s*$/,'') : '';
    css = SCRIM +
      SEL_C + '{transition:opacity ' + s.dur + ' ease;opacity:0;}' +
      SEL_O + '{opacity:1;}' +
      (revealAnim ? '.lx-show{animation:' + revealAnim + ' both;}.lx-hide{animation:' + revealAnim + ' reverse both;}' : '') +
      (s.pane || '') + (s.kf || '') + (s.extra || '');
  }
  style.textContent = css;
}
applyAnimStyle(gs(K.animStyle) || 'spring');

/* ══════════════════════════════════════════
   FONTS  (lazy: only the selected font is fetched on startup,
           grid previews load on hover with a tiny &text= subset)
══════════════════════════════════════════ */
var _fontLinks = {};
function loadGFont(gname,text){
  var key = gname + '|' + (text || '');
  if(_fontLinks[key]) return;
  _fontLinks[key] = true;
  var href = 'https://fonts.googleapis.com/css2?family=' + gname + ':wght@300;400;600&display=swap';
  if(text) href += '&text=' + encodeURIComponent(text);
  var l = document.createElement('link');
  l.rel = 'stylesheet';
  l.href = href;
  document.head.appendChild(l);
}
function applyFont(familyStr,gfont){
  if(gfont) loadGFont(gfont);
  document.body.style.fontFamily = familyStr;
}
function initFont(){
  var saved = parseJSON(gs(K.font),null);
  /* the separate “Plus Jakarta” card merged into the new built-in default */
  if(saved && saved.name === 'Plus Jakarta'){
    saved = { name:'Default', family:FONTS[0].family, gfont:null };
    ss(K.font,JSON.stringify(saved));
  }
  if(saved && saved.family){ applyFont(saved.family, saved.gfont || null); return; }
  applyFont(FONTS[0].family,null);
}

/* ══════════════════════════════════════════
   GREETING TEXT STYLE
══════════════════════════════════════════ */
function applyGreetingStyle(){
  var el = $('greeting-text');
  if(!el) return;
  el.style.fontWeight  = gs(K.greetWeight) || '400';
  el.style.fontStyle   = gs(K.greetItalic) || 'normal';
  el.style.fontSize    = gs(K.greetSize)   || '22px';
  el.style.color       = gs(K.greetColor)  || gs(K.fontColor) || '#ffffff';
  renderGreetPreviews();
}

/* the greeting window and the greeting pane show the same words the card
   will show, and follow every change as it happens */
function greetPreviewText(){
  var style = gs(K.style) || 'hi';
  if(style === 'none') return '';
  var name = gs(K.name) || '';
  if(!name) return '';
  return buildGreeting(name, style, gs(K.customGreet) || '');
}
function renderGreetPreviews(){
  ['ig-preview-text','gw-preview-text'].forEach(function(id){
    var el = $(id);
    if(!el) return;
    var style = gs(K.style) || 'hi';
    var txt = greetPreviewText();
    el.textContent = txt || (style === 'none'
      ? 'Hidden \u2014 the greeting will not show.'
      : (!(gs(K.name) || '').trim()
          ? 'Add your name to see it here.'
          : 'Write something to see it here.'));
    el.style.fontWeight = gs(K.greetWeight) || '400';
    el.style.fontStyle  = gs(K.greetItalic) || 'normal';
    var px = parseInt(gs(K.greetSize), 10);
    if(!(px > 0)) px = 22;
    el.style.fontSize = Math.max(14, Math.min(30, px)) + 'px';
    el.style.color = gs(K.greetColor) || gs(K.fontColor) || '#ffffff';
    el.style.opacity = txt ? '1' : '0.5';
  });
}

/* one colour for every widget text — helpful on bright wallpapers */
function applyFontColor(){
  var c = gs(K.fontColor) || '#ffffff';
  document.documentElement.style.setProperty('--fg', c);
  /* the greeting has its own colour setting; fall back to the global one */
  if(!gs(K.greetColor)) applyGreetingStyle();
}

/* ══════════════════════════════════════════
   GLASS  (CSS variables instead of rewriting a stylesheet)
══════════════════════════════════════════ */
/* classic = the 1.0 frosted look; liquid = real refraction at the rim.
   Liquid is the default now; Classic stays one click away. */
function glassStyle(){
  var s = gs(K.glassStyle);
  return (s === 'classic') ? 'classic' : 'liquid';
}
function glassTintMode(){
  var m = gs(K.glassTintMode);
  return (m === 'adaptive') ? 'adaptive' : 'manual';
}
/* a mid-light band colour from the active palette, lifted toward white so the
   glass stays bright and readable — used when tint is set to Adaptive */
function hexToRgb(h){
  h = String(h || '').replace('#','');
  if(h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n = parseInt(h, 16);
  if(isNaN(n)) return [255,255,255];
  return [(n>>16)&255, (n>>8)&255, n&255];
}
function paletteAccent(){
  var g = GRADIENTS[gradientIndex()] || GRADIENTS[0];
  var arr = (g && g.bands) || [];
  var hex = arr.length ? arr[Math.min(arr.length - 1, Math.round(arr.length * 0.7))] : '#ffffff';
  var p = hexToRgb(hex);
  var r = p[0], gg = p[1], b = p[2];
  r  = Math.round(r  * 0.55 + 255 * 0.45);
  gg = Math.round(gg * 0.55 + 255 * 0.45);
  b  = Math.round(b  * 0.55 + 255 * 0.45);
  return 'rgba(' + r + ',' + gg + ',' + b + ',1)';
}
function effectiveTint(){
  if(glassTintMode() === 'adaptive') return paletteAccent();
  return gs(K.glassTint) || GLASS_TINTS[GLASS_TINTS.length - 1];
}
/* Liquid Glass lens: a MIRROR at every edge, not a blur.
   Each surface's backdrop is flipped about a line just inside each border, so
   the rim shows the strip beside it reflected: bottom mirrors up, top mirrors
   down, left mirrors right, right mirrors left. The calm middle is untouched.

   The delivery took two fixes:
   - Chromium does not stretch a percentage-sized feImage inside a shared SVG
     filter, so the 2.0 build only showed the field on the bottom/right.
   - It also drops backdrop-filter references to per-element filters addressed by
     fragment id (url(#lg-f-0)) and the lens vanished.
   So every surface gets a complete filter as a data URL, sized in real pixels
   and carrying its own small displacement map.

   In each edge band the displacement ramps linearly from the band boundary to
   the rim, and feDisplacementMap scale = 4 x band, which produces exactly a
   2 x band shift at the rim: a true mirror of the band-wide strip just inside.
   Sliders: strength scales that shift; edge sets the band in pixels (0 = Auto);
   spread widens the band; zoom magnifies the middle only. With Custom lens off
   the recommended lens is used. */
var _lensMaps = {}, _lensMapCount = 0;
var _lensTimer = null, _lensLiveRaf = 0, _lensLiveIdle = null;
var _lensPreview = false, _lensSyncQueued = false;
var _lensRecs = [], _lensRO = null, _lensParts = {}, _lensTick = 0;
var _LENS_SHEET_SEL = '#panel, .win-panel, .prayer-panel, .changelog-panel';

/* Fresh install and "Reset lens" both use this preset: 17% strength,
   25px edge, 140% spread, 24% zoom. A fixed edge width is used on purpose,
   because "Auto" would change the band with every card size. */
var LENS_DEF_PEAK   = 0.17;
var LENS_DEF_EDGE   = 25;
var LENS_DEF_SPREAD = 1.40;
var LENS_DEF_ZOOM   = 0.24;

function lensCustom(){ return gs(K.lensCustom) === '1'; }
function lensPeak(){
  if(!lensCustom()) return LENS_DEF_PEAK;
  var v = parseFloat(gs(K.lensPeak));
  if(!isFinite(v)) v = LENS_DEF_PEAK * 100;
  return Math.max(0, Math.min(0.85, v / 100));
}
function lensEdgePx(){
  if(!lensCustom()) return LENS_DEF_EDGE;
  var v = parseFloat(gs(K.lensEdge));
  if(!isFinite(v)) v = LENS_DEF_EDGE;
  if(v <= 0) return 0;                          /* 0 = automatic */
  return Math.max(2, Math.min(60, v));
}
function lensSpread(){
  if(!lensCustom()) return LENS_DEF_SPREAD;
  var v = parseFloat(gs(K.lensSpread));
  if(!isFinite(v)) v = LENS_DEF_SPREAD * 100;
  return Math.max(10, Math.min(250, v)) / 100;
}
function lensZoom(){
  if(!lensCustom()) return LENS_DEF_ZOOM;
  var v = parseFloat(gs(K.lensZoom));
  if(!isFinite(v)) v = LENS_DEF_ZOOM * 100;
  return Math.max(0, Math.min(35, v)) / 100;
}
function lensEdgeLabel(v){
  v = parseInt(v, 10) || 0;
  return v > 0 ? (v + 'px') : 'Auto';
}
/* Band width in pixels: the Edge slider sets the base, Spread widens it.
   Edge 0 ("Auto") uses a share of the short side. Capped so a full mirror can
   never sample past the opposite edge. */
function lensBandPx(w, h){
  var e = lensEdgePx();
  var base = e > 0 ? e * 2.4 : Math.min(w, h) * 0.22;
  var b = base * lensSpread();
  var cap = Math.min(w, h) / 2.1;
  return Math.max(6, Math.min(b, cap));
}
/* Each surface's map is a small square carried by its own data-URL filter. The
   R channel drives x, G drives y. In each edge band the displacement grows
   linearly toward the rim, so the band samples the strip just inside it and
   shows it FLIPPED: bottom mirrors up, top mirrors down, left mirrors right,
   right mirrors left. Inside the bands the small Zoom term magnifies instead. */
function lensMapSig(w, h){
  return Math.round(w) + 'x' + Math.round(h) + '@' + lensPeak().toFixed(3) +
         'e' + lensEdgePx().toFixed(0) + 's' + lensSpread().toFixed(3) +
         'z' + lensZoom().toFixed(3);
}
function lensMapFor(w, h){
  var key = lensMapSig(w, h);
  if(_lensMaps[key]) return _lensMaps[key];
  if(++_lensMapCount > 48){ _lensMaps = {}; _lensMapCount = 0; }
  w = Math.max(1, w); h = Math.max(1, h);
  /* Strength deepens the mirror by widening the band. Scaling the offset
     half-way would compress the reflection into a streak, so the band width is
     what changes instead and the flip stays exact at every setting. */
  var str = Math.max(0, Math.min(1, lensPeak() / 0.85));
  var B = lensBandPx(w, h) * str;
  var fx = B > 0 ? Math.min(0.45, B / w) : 0;
  var fy = B > 0 ? Math.min(0.45, B / h) : 0;
  var zoomAmp = lensZoom() * 0.25;
  var N = _lensPreview ? 64 : 128;
  var cv = document.createElement('canvas'), ctx, img, data;
  cv.width = cv.height = N;
  ctx = cv.getContext('2d');
  if(!ctx) return null;
  img = ctx.createImageData(N, N);
  data = img.data;
  var i, j, k, nx, ny, ax, ay, tx, ty, devX, devY, interior;
  for(j = 0; j < N; j++){
    ny = (j + 0.5) / N;
    ay = Math.min(ny, 1 - ny);
    ty = fy > 0 ? Math.max(0, Math.min(1, (fy - ay) / fy)) : 0;
    for(i = 0; i < N; i++){
      nx = (i + 0.5) / N;
      ax = Math.min(nx, 1 - nx);
      tx = fx > 0 ? Math.max(0, Math.min(1, (fx - ax) / fx)) : 0;
      devX = 0; devY = 0;
      /* mirror: the sample moves away from the edge it is reflecting */
      if(tx > 0) devX = (nx < 0.5 ? 1 : -1) * 0.5 * tx;
      if(ty > 0) devY = (ny < 0.5 ? 1 : -1) * 0.5 * ty;
      /* magnification only in the calm middle, never inside a mirror band */
      interior = 1 - Math.max(tx, ty);
      if(zoomAmp > 0 && interior > 0){
        devX -= (nx - 0.5) * zoomAmp * interior;
        devY -= (ny - 0.5) * zoomAmp * interior;
      }
      k = (j * N + i) * 4;
      data[k]     = Math.round(Math.max(0, Math.min(1, 0.5 + devX)) * 255);
      data[k + 1] = Math.round(Math.max(0, Math.min(1, 0.5 + devY)) * 255);
      data[k + 2] = 0;
      data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  /* scale 4B gives exactly a 2B shift at the rim: a true mirror of the B-wide
     strip just inside each edge */
  var map = { url: cv.toDataURL('image/png'), scale: Math.round(4 * B * 10) / 10, key: key };
  _lensMaps[key] = map;
  return map;
}
function lensIsSheet(el){
  return !!(el && el.matches && el.matches(_LENS_SHEET_SEL));
}
/* Cards nested inside a sheet read the sheet, not the wallpaper. */
function lensInsideSheet(el){
  var p = el.parentNode;
  while(p && p.nodeType === 1){
    if(p.matches && p.matches(_LENS_SHEET_SEL)) return true;
    p = p.parentNode;
  }
  return false;
}
/* The proven delivery: the whole filter travels as a data URL, because Chromium
   does not honour a plain url(#id) reference in backdrop-filter. The SVG
   carries this surface's exact pixel size and a matching viewBox, so the map
   lands 1:1 on the border box and every edge mirrors. */
function lensFilterURL(rec){
  var map = lensMapFor(rec.w, rec.h);
  if(!map) return '';
  var w = Math.max(2, Math.round(rec.w)), h = Math.max(2, Math.round(rec.h));
  var mw = w + 2, mh = h + 2;
  var key = mw + 'x' + mh + '@' + map.key;
  if(_lensParts[key]) return _lensParts[key];
  if(Object.keys(_lensParts).length > 40) _lensParts = {};
  var svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + mw + '" height="' + mh +
    '" viewBox="0 0 ' + mw + ' ' + mh + '">' +
      '<defs>' +
        '<filter id="lg" color-interpolation-filters="sRGB">' +
          '<feImage x="0" y="0" width="' + mw + '" height="' + mh +
            '" preserveAspectRatio="none" href="' + map.url + '" result="map"/>' +
          '<feDisplacementMap in="SourceGraphic" in2="map" scale="' + map.scale +
            '" xChannelSelector="R" yChannelSelector="G"/>' +
        '</filter>' +
      '</defs>' +
    '</svg>';
  var out = 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '#lg")';
  _lensParts[key] = out;
  return out;
}
function paintLens(rec){
  var u = lensFilterURL(rec);
  if(!u || rec.url === u) return;
  rec.url = u;
  var css = rec.kind === 'sheet'
    ? 'blur(var(--glass-sheet-blur,20px)) ' + u + ' saturate(165%)'
    : 'blur(var(--glass-blur)) ' + u + ' saturate(170%) brightness(1.05)';
  rec.el.style.setProperty('backdrop-filter', css);
  rec.el.style.setProperty('-webkit-backdrop-filter', css);
}
/* Size each surface's filter to its real border box, and create/tear down the
   inline references as surfaces open, close or resize. */
function syncLensFilters(){
  if(!document.body.classList.contains('glass-liquid')) return;
  var list = document.querySelectorAll('.glass, #gear-btn, #layout-btn');
  var tick = (_lensTick += 1), i, j, rec, el, w, h, kind;
  for(i = 0; i < list.length; i++){
    el = list[i];
    if(!lensIsSheet(el) && lensInsideSheet(el)) continue;
    w = el.offsetWidth; h = el.offsetHeight;
    if(w < 4 || h < 4) continue;
    rec = null;
    for(j = 0; j < _lensRecs.length; j++){
      if(_lensRecs[j].el === el){ rec = _lensRecs[j]; break; }
    }
    if(!rec){
      rec = { el:el, w:0, h:0, kind:'', url:'' };
      _lensRecs.push(rec);
      if(_lensRO) _lensRO.observe(el);
    }
    rec.tick = tick;
    kind = lensIsSheet(el) ? 'sheet' : 'card';
    if(rec.w !== w || rec.h !== h || rec.kind !== kind){
      rec.w = w; rec.h = h; rec.kind = kind; rec.url = '';
      paintLens(rec);
    }
  }
  for(i = 0; i < _lensRecs.length; i++){
    rec = _lensRecs[i];
    if(rec.tick !== tick){
      rec.w = 0; rec.h = 0; rec.url = '';
      rec.el.style.removeProperty('backdrop-filter');
      rec.el.style.removeProperty('-webkit-backdrop-filter');
    }
  }
}
function applyLensMap(){
  for(var i = 0; i < _lensRecs.length; i++){
    if(_lensRecs[i].w > 0) paintLens(_lensRecs[i]);
  }
}
function dropLensCache(){ _lensMaps = {}; _lensMapCount = 0; _lensParts = {}; }
/* Classic writes no inline filter, but tolerate any left over from an older build. */
function clearLensFilters(){
  var list = document.querySelectorAll('.glass, #gear-btn, #layout-btn, #panel, .win-panel, .prayer-panel, .changelog-panel');
  for(var i = 0; i < list.length; i++){
    list[i].style.removeProperty('backdrop-filter');
    list[i].style.removeProperty('-webkit-backdrop-filter');
  }
  for(i = 0; i < _lensRecs.length; i++){
    _lensRecs[i].w = 0; _lensRecs[i].h = 0; _lensRecs[i].url = '';
  }
}
function lensObserve(){
  if(_lensRO || !window.ResizeObserver) return;
  _lensRO = new ResizeObserver(function(){
    if(_lensSyncQueued) return;
    _lensSyncQueued = true;
    window.requestAnimationFrame(function(){
      _lensSyncQueued = false;
      if(document.body.classList.contains('glass-liquid')) scheduleLens();
    });
  });
  var list = document.querySelectorAll('.glass, #gear-btn, #layout-btn');
  for(var i = 0; i < list.length; i++) _lensRO.observe(list[i]);
}
function scheduleLens(){
  if(_lensTimer) clearTimeout(_lensTimer);
  _lensTimer = setTimeout(function(){
    _lensTimer = null;
    if(!document.body.classList.contains('glass-liquid')) return;
    applyLensMap();
    syncLensFilters();
  }, 60);
}
/* Dragging a lens slider: rebuild at a small map so the drag stays smooth, then
   one sharp pass on release / after 220ms of quiet. */
function scheduleLensLive(){
  _lensPreview = true;
  if(!_lensLiveRaf && window.requestAnimationFrame){
    _lensLiveRaf = window.requestAnimationFrame(function(){
      _lensLiveRaf = 0;
      if(document.body.classList.contains('glass-liquid')){
        applyLensMap();
        syncLensFilters();
      }
    });
  }
  if(_lensLiveIdle) clearTimeout(_lensLiveIdle);
  _lensLiveIdle = setTimeout(scheduleLensFull, 220);
}
function scheduleLensFull(){
  if(_lensLiveIdle){ clearTimeout(_lensLiveIdle); _lensLiveIdle = null; }
  if(_lensLiveRaf && window.cancelAnimationFrame){
    window.cancelAnimationFrame(_lensLiveRaf);
    _lensLiveRaf = 0;
  }
  _lensPreview = false;
  if(document.body.classList.contains('glass-liquid')){
    applyLensMap();
    syncLensFilters();
  }
}
window.addEventListener('resize', function(){ scheduleLens(); });


/* dragging the window between monitors with different DPR fires no resize;
   watch the media query and rebuild the maps when it changes */
function watchDpr(){
  if(!window.matchMedia) return;
  var mq;
  try{
    mq = window.matchMedia('(resolution: ' + (window.devicePixelRatio || 1) + 'dppx)');
  }catch(e){ return; }
  function onChange(){
    if(mq.removeEventListener) mq.removeEventListener('change', onChange);
    else if(mq.removeListener) mq.removeListener(onChange);
    scheduleLens();
    watchDpr();
  }
  if(mq.addEventListener) mq.addEventListener('change', onChange);
  else if(mq.addListener) mq.addListener(onChange);
}
watchDpr();
/* Liquid Glass is the one heavy thing here. After it is switched on, watch the
   real frame rate for a moment. If the device cannot hold a calm pace, ask
   before changing anything — a silent downgrade is never the answer. The same
   question is throttled to once every five minutes, so a machine that is
   simply busy once does not get nagged. One probe at a time. */
var _glassProbe = false;
var PERF_PROMPT_EVERY = 5 * 60 * 1000;
var _perfPromptTimer = null;
function perfPromptOpen(){
  var p = $('perf-pop');
  return !!(p && p.classList.contains('open'));
}
function showGlassPerfPrompt(){
  if(glassStyle() !== 'liquid' || document.hidden || perfPromptOpen()) return;
  /* never interrupt the first-run welcome with a performance question */
  if(_openWin === 'welcome-modal') return;
  var last = parseInt(gs('nt_perf_prompt'), 10) || 0;
  if(last && (Date.now() - last) < PERF_PROMPT_EVERY) return;
  var pop = $('perf-pop');
  if(!pop) return;
  ss('nt_perf_prompt', String(Date.now()));
  pop.classList.add('open');
  pop.setAttribute('aria-hidden','false');
}
function hideGlassPerfPrompt(){
  var pop = $('perf-pop');
  if(!pop) return;
  pop.classList.remove('open');
  pop.setAttribute('aria-hidden','true');
}
function scheduleGlassReprobe(){
  if(_perfPromptTimer){ clearTimeout(_perfPromptTimer); _perfPromptTimer = null; }
  if(glassStyle() !== 'liquid') return;
  _perfPromptTimer = setTimeout(function(){
    _perfPromptTimer = null;
    if(!document.hidden) glassPerfProbe();
  }, PERF_PROMPT_EVERY + 2000);
}
function glassPerfProbe(){
  if(_glassProbe || document.hidden) return;
  _glassProbe = true;
  /* Let the new-tab page finish its own startup work first: measuring during
     load would blame Liquid Glass for someone else's frames. */
  setTimeout(function(){
    if(glassStyle() !== 'liquid' || document.hidden){ _glassProbe = false; return; }
    var warmup = 10, frames = 0, start = 0;
    function tick(now){
      if(document.hidden || glassStyle() !== 'liquid'){ _glassProbe = false; return; }
      frames++;
      if(frames <= warmup){ requestAnimationFrame(tick); return; }
      if(!start){ start = now; requestAnimationFrame(tick); return; }
      if(now - start < 2000){ requestAnimationFrame(tick); return; }
      var fps = (frames - warmup) / ((now - start) / 1000);
      _glassProbe = false;
      if(fps < 32 && glassStyle() === 'liquid'){
        showGlassPerfPrompt();
        scheduleGlassReprobe();
      }
    }
    requestAnimationFrame(tick);
  }, 1200);
}

var _glassQueued = false;
/* Firefox (and any engine that cannot use an SVG filter reference as a
   backdrop-filter value) must not be handed the lens: the declaration is
   syntactically valid, so the browser keeps it and then renders nothing,
   leaving the glass with no blur at all. Detect it once and render the
   frosted material instead, while the stored choice stays "Liquid". */
var _lensOK = null;
function lensSupported(){
  if(_lensOK !== null) return _lensOK;
  try{
    _lensOK = !!(window.CSS && CSS.supports && (
      CSS.supports('backdrop-filter', 'url(#lg-lens)') ||
      CSS.supports('-webkit-backdrop-filter', 'url(#lg-lens)')
    ));
  }catch(e){ _lensOK = false; }
  return _lensOK;
}
function applyGlassSettings(){
  var blur  = parseInt(gs(K.glassBlur)  || '2',10);
  var alpha = parseInt(gs(K.glassAlpha) || '21',10);
  var tint  = effectiveTint();
  var m = tint.match(/rgba?\(([^)]+)\)/);
  var p = (m ? m[1] : '255,255,255').split(',');
  var r = parseInt(p[0],10) || 0;
  var g = parseInt(p[1],10) || 0;
  var b = parseInt(p[2],10) || 0;
  var root = document.documentElement.style;
  root.setProperty('--glass-blur', blur + 'px');
  root.setProperty('--glass-bg', 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha/100) + ')');
  root.setProperty('--glass-tint-rgb', r + ',' + g + ',' + b);
  /* A sheet is a denser material than a card, and the scene behind it gets a
     soft blur of its own, so text always has something calm to sit on. */
  root.setProperty('--glass-sheet-blur', Math.min(44, Math.max(18, blur)) + 'px');
  root.setProperty('--glass-scrim-blur', Math.min(16, Math.max(8, blur)) + 'px');
  var liquid = glassStyle() === 'liquid' && lensSupported();
  document.body.classList.toggle('glass-liquid', liquid);
  document.body.classList.toggle('glass-classic', !liquid);
  document.body.classList.toggle('glass-lens-off', !lensSupported());
  /* one quiet note, only when a "Liquid" choice cannot actually render */
  if(!lensSupported() && glassStyle() === 'liquid' && !$('glass-lens-note')){
    var segWrap = $('glass-style-seg');
    if(segWrap && segWrap.parentNode){
      var note = document.createElement('p');
      note.className = 'hint';
      note.id = 'glass-lens-note';
      note.textContent = 'This browser cannot render the liquid lens, so the frosted glass is shown instead.';
      segWrap.parentNode.insertBefore(note, segWrap.nextSibling);
    }
  }
  document.body.classList.toggle('glass-tint-adaptive', glassTintMode() === 'adaptive');
  var seg = $('glass-style-seg');
  if(seg){
    Array.prototype.forEach.call(seg.querySelectorAll('.seg-btn'), function(btn){
      btn.classList.toggle('on', btn.getAttribute('data-glass') === glassStyle());
    });
  }
  var tseg = $('glass-tint-seg');
  if(tseg){
    Array.prototype.forEach.call(tseg.querySelectorAll('.seg-btn'), function(btn){
      btn.classList.toggle('on', btn.getAttribute('data-tintmode') === glassTintMode());
    });
  }
  if(liquid){
    lensObserve();
    applyLensMap();
    syncLensFilters();
    glassPerfProbe();
  }
  else {
    /* Classic must not inherit an inline lens written by an older build */
    clearLensFilters();
    hideGlassPerfPrompt();
    if(_perfPromptTimer){ clearTimeout(_perfPromptTimer); _perfPromptTimer = null; }
  }
  syncAllRangeFills();
}
function queueGlass(){
  if(_glassQueued) return;
  _glassQueued = true;
  requestAnimationFrame(function(){
    _glassQueued = false;
    applyGlassSettings();
  });
}

/* ── sliders: keep the travelled part in the accent colour ──
   The track is painted with a gradient that stops at --fill, so every range
   input reports its own percentage here. */
function syncRangeFill(el){
  if(!el || el.type !== 'range') return;
  var min = parseFloat(el.min), max = parseFloat(el.max), v = parseFloat(el.value);
  if(!isFinite(min)) min = 0;
  if(!isFinite(max)) max = min + 100;
  if(!isFinite(v)) v = min;
  var p = (max > min) ? ((v - min) / (max - min)) * 100 : 0;
  el.style.setProperty('--fill', Math.max(0, Math.min(100, p)) + '%');
}
function syncAllRangeFills(){
  Array.prototype.forEach.call(document.querySelectorAll('input[type=range]'), syncRangeFill);
}
document.addEventListener('input', function(e){
  if(e.target && e.target.type === 'range') syncRangeFill(e.target);
}, true);

/* ══════════════════════════════════════════
   SETTINGS PANEL SIZE  (3 steps, not freeform)
══════════════════════════════════════════ */
var PANEL_SIZES = { compact:440, default:540, large:700 };

function markPanelSize(s){
  var row = $('panel-size-row');
  if(!row) return;
  Array.prototype.forEach.call(row.querySelectorAll('.preset'),function(b){
    b.classList.toggle('on',b.getAttribute('data-size') === s);
  });
}
function applyPanelSize(){
  var s = gs(K.panelSize) || 'default';
  if(!PANEL_SIZES[s]) s = 'default';
  document.documentElement.style.setProperty('--panel-w',PANEL_SIZES[s] + 'px');
  markPanelSize(s);
}

/* ══════════════════════════════════════════
   SCREEN SCALING PRESETS
   Same CSS-pixel layout on very different screens: scale the widget
   cards, the clock and the greeting together.
══════════════════════════════════════════ */
/* 100% is the design size. Nothing is ever scaled *down* — small laptops
   already get a smaller CSS viewport from the OS, so shrinking on top of
   that made every card unreadable. */
var UI_SCALES = { hd:1.0, sd:1.0, qhd:1.25, uhd:1.5 };

function clampScale(s){
  if(!(s > 0)) s = 1;
  return Math.max(1.0, Math.min(1.6, s));
}
function applyUiScale(scale, presetKey){
  var s = clampScale(parseFloat(scale));

  /* clock and greeting first, so their new size is part of the measurement */
  ss(K.clockSize, String(Math.round(30 * s)));
  ss(K.greetSize, Math.round(22 * s) + 'px');
  applyClockStyle();
  applyGreetingStyle();
  applyQuoteStyle();

  /* measure the real natural size of every card — these presets used to
     multiply DEFAULT_SIZE, which is smaller than the actual content */
  measureBases();

  var sizes = {};
  RESIZABLE.forEach(function(id){
    var b   = _baseSize[id] || DEFAULT_SIZE[id] || { w:200, h:80 };
    var pad = _padSize[id]  || { x:0, y:0 };
    /* content scales, padding stays put: outer = base*s + pad*(1-s) */
    var w = Math.round(b.w * s + pad.x * (1 - s));
    var h = Math.round(b.h * s + pad.y * (1 - s));
    sizes[id] = {
      w: Math.max(MIN_W[id] || 120, Math.min(window.innerWidth,  w)),
      /* every widget follows its own content height; a manual resize clears
         this flag so the height the user picked is kept */
      auto: 1
    };
    if(id !== 'quote' && id !== 'weather'){
      sizes[id].h = Math.max(MIN_H[id] || 60, Math.min(window.innerHeight, h));
    }
  });
  ss(K.sizes, JSON.stringify(sizes));
  ss(K.positions, '{}');
  ss(K.uiScale, String(s));
  ss(K.uiScalePreset, presetKey || '');

  /* drop inline positions so the CSS corner anchors take over again */
  EL_IDS.forEach(function(id){
    var el = $(id);
    if(!el) return;
    el.style.left = ''; el.style.top = '';
    el.style.right = ''; el.style.bottom = '';
    el.style.transform = '';
  });

  /* the measured bases are already correct; applySizes derives --ws from
     them, so content ends up at exactly the requested scale */
  applySizes();
  applyPositions();
  buildPosControls();

  var st = $('scale-status');
  if(st) st.textContent = 'Applied ' + Math.round(s * 100) + '% · widget sizes and positions reset.';
}

/* ══════════════════════════════════════════
   GREETING
══════════════════════════════════════════ */
function timeOfDay(){
  var h = wallNow().h;
  if(h >= 5  && h < 12) return 'morning';
  if(h >= 12 && h < 17) return 'afternoon';
  if(h >= 17 && h < 20) return 'evening';
  return 'night';
}
function buildGreeting(name,style,custom){
  var t = timeOfDay();
  if(style === 'none')    return '';
  if(style === 'hi')      return 'Hi, ' + name + '!';
  if(style === 'hey')     return 'Hey, ' + name + ' \uD83D\uDC4B';
  if(style === 'welcome') return 'Welcome back, ' + name + '.';
  if(style === 'good')    return 'Good ' + t + ', ' + name + '.';
  if(style === 'custom')  return (custom || '').replace(/{name}/g,name).replace(/{time}/g,t);
  return '';
}
function renderGreeting(){
  var el = $('greeting-text');
  var wrap = $('greeting-wrap');
  if(!el) return;
  var name = gs(K.name) || '';
  var style = gs(K.style) || 'hi';
  var custom = gs(K.customGreet) || '';
  var text = (style === 'none' || !name) ? '' : buildGreeting(name,style,custom);
  setText(el,text);
  if(wrap) wrap.style.display = text ? '' : 'none';
  applyGreetingStyle();
  updateTabName();
  /* the greeting grows or shrinks with the name and its style, the same way
     the weather and quote cards re-fit their content */
  scheduleRefit();
}

/* ══════════════════════════════════════════
   TAB TITLE (long names scroll like a marquee)
══════════════════════════════════════════ */
var _titleTimer = null;
var _titleRaw = '';
function applyTabTitle(raw){
  _titleRaw = raw || 'Newly';
  if(_titleTimer){ clearInterval(_titleTimer); _titleTimer = null; }
  setText($('tab-title'),_titleRaw);
  if(gs(K.tabScroll) === '0' || _titleRaw.length <= 16 || document.hidden) return;

  var pad = '   ';
  var loop = _titleRaw + pad + _titleRaw;
  var span = Math.min(18, Math.max(16, _titleRaw.length));
  var i = 0;
  _titleTimer = setInterval(function(){
    if(document.hidden) return;
    i = (i + 1) % (_titleRaw.length + pad.length);
    setText($('tab-title'),loop.substr(i,span));
  }, 550);
}

function updateTabName(){
  var style  = gs(K.tabNameStyle) || 'default';
  var custom = gs(K.customTabName) || '';
  var name   = gs(K.name) || '';
  var title  = 'Newly';
  if(style === 'greeting')   title = name ? (buildGreeting(name, gs(K.style) || 'hi', gs(K.customGreet) || '') || 'Newly') : 'Newly';
  else if(style === 'time')  title = clockTitle();
  else if(style === 'minimal') title = '· · ·';
  else if(style === 'calm')  title = 'Calm Space';
  else if(style === 'focus') title = 'Focus Mode';
  else if(style === 'custom') title = custom || 'Newly';
  applyTabTitle(title);
}
function clockTitle(){
  var now = wallNow();
  var h = now.h;
  var hf = gs(K.hourFmt) || '24';
  var hh = hf === '12' ? (h % 12 || 12) : h;
  return hh + ':' + String(now.m).padStart(2,'0');
}

/* ══════════════════════════════════════════
   FAVICON
══════════════════════════════════════════ */
function applyFav(url){
  if(!url) return;
  var el = $('tab-favicon');
  if(!el){
    el = document.createElement('link');
    el.rel = 'icon'; el.id = 'tab-favicon';
    document.head.appendChild(el);
  }
  el.href = url;
}

/* The browser logo is normally a remote URL, so the tab icon used to be
   downloaded again on every new tab. Fetch it once, keep it as a data: URL
   and paint that from then on — instant, and it works offline. */
function cachedBrowserIcon(url){
  if(!url || /^data:/i.test(url)) return '';
  var c = parseJSON(gs(K.browserIcon),null);
  return (c && c.url === url && c.d) ? c.d : '';
}
function cacheBrowserIcon(url){
  if(!url || /^data:/i.test(url)) return;
  var c = parseJSON(gs(K.browserIcon),null);
  if(c && c.url === url && c.d) return;
  fetch(url,{mode:'cors',credentials:'omit'}).then(function(r){
    if(!r.ok) throw new Error('icon ' + r.status);
    return r.blob();
  }).then(function(blob){
    if(!blob || !blob.size) throw new Error('empty icon');
    return new Promise(function(resolve,reject){
      var fr = new FileReader();
      fr.onload  = function(){ resolve(fr.result); };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }).then(function(dataURL){
    try{ ss(K.browserIcon, JSON.stringify({ url:url, d:dataURL, ts:Date.now() })); }catch(e){}
    /* only swap the live icon if the user hasn't changed it meanwhile */
    if((gs(K.fav) || '') === url) applyFav(dataURL);
  }).catch(function(){});
}
function applyBrowserFav(url){
  applyFav(cachedBrowserIcon(url) || url);
  cacheBrowserIcon(url);
}

/* ══════════════════════════════════════════
   CLOCK  (one aligned timer, writes only on change)
══════════════════════════════════════════ */
function getClockOpts(){
  var style = gs(K.clockStyle) || 'default';
  if(style === 'colon') style = 'default';   /* retired style */
  return {
    style:  style,
    hour:   gs(K.hourFmt)    || '12',
    secs:   gs(K.showSecs)   || '0',
    datefmt:gs(K.dateFmt)    || 'long'
  };
}
var CLOCK_SIZES   = {default:'30px', slim:'26px', big:'48px', minimal:'38px'};
var CLOCK_WEIGHTS = {default:'bold', slim:'300', big:'bold', minimal:'300'};
var CLOCK_SPACE   = {default:'0.03em', slim:'0.08em', big:'0.02em', minimal:'0.1em'};

function applyClockStyle(){
  var o = getClockOpts();
  var timeEl = $('time');
  var dateEl = $('date');
  if(!timeEl) return;
  var size = clockFontSizes().time;
  timeEl.style.fontSize      = size + 'px';
  timeEl.style.fontWeight    = CLOCK_WEIGHTS[o.style] || 'bold';
  timeEl.style.letterSpacing = CLOCK_SPACE[o.style]   || '0.03em';
  if(dateEl){
    dateEl.style.fontSize = clockFontSizes().date + 'px';
    dateEl.style.display  = (o.datefmt === 'none' ? 'none' : '');
  }
  /* the card is part of the clock, so it grows with it — same approach the
     calendar uses for its type and padding */
  var root = document.documentElement.style;
  root.setProperty('--clock-pad-y',  Math.round(size * 0.47) + 'px');
  root.setProperty('--clock-pad-x',  Math.round(size * 0.73) + 'px');
  root.setProperty('--clock-radius', Math.round(size * 0.60) + 'px');
  root.setProperty('--clock-min-w',  Math.round(size * 5.80) + 'px');
  root.setProperty('--clock-gap',    Math.max(2, Math.round(size * 0.17)) + 'px');
}

/* the size slider owns the whole card, exactly like the calendar: drop any
   hand-pinned width/height first so nothing caps the new proportions */
function refreshClockCard(){
  var sizes = parseJSON(gs(K.sizes),{}) || {};
  if(sizes.datetime){ delete sizes.datetime; ss(K.sizes, JSON.stringify(sizes)); }
  var el = $('datetime');
  if(el){ el.style.width = ''; el.style.height = ''; el.style.removeProperty('--ws'); }
  measureBases();
  applySizes();
}

/* custom size wins; otherwise each clock style keeps its designed size */
function clockFontSizes(){
  var o = getClockOpts();
  var custom = parseInt(gs(K.clockSize),10);
  var size = (custom > 0) ? custom : (parseInt(CLOCK_SIZES[o.style] || '30',10) || 30);
  return { time: size, date: Math.max(9, Math.round(size * 0.43)) };
}

var _clockTimer = null;
var _lastTime = '';
var _lastDate = '';
var _lastHour = -1;
var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function pad2(n){ return n < 10 ? '0' + n : '' + n; }

/* ── live previews for the clock & date controls ──
   The option labels in Settings and in the Clock window used to show a
   frozen sample ("09:35", "Fri, June 26"). They now read the same wall clock
   the widget uses, so choosing a format never means imagining a different
   time. */
function clockPreviewText(styleId){
  var now = wallNow();
  var o = getClockOpts();
  var hh = (o.hour === '12') ? (now.h % 12 || 12) : now.h;
  var t = (styleId === 'minimal' ? '' + hh : pad2(hh)) + ':' + pad2(now.m);
  if(o.secs === '1') t += ':' + pad2(now.s);
  if(o.hour === '12') t += (now.h < 12 ? ' AM' : ' PM');
  return t;
}
function datePreviewText(fmt){
  var now = wallNow();
  var dd = now.date, mo = now.mon, yr = now.year;
  if(fmt === 'long')  return DAYS[now.dow] + ', ' + MONTHS[mo] + ' ' + dd;
  if(fmt === 'short') return pad2(dd) + '/' + pad2(mo + 1) + '/' + yr;
  if(fmt === 'us')    return pad2(mo + 1) + '/' + pad2(dd) + '/' + yr;
  if(fmt === 'iso')   return yr + '-' + pad2(mo + 1) + '-' + pad2(dd);
  return '';
}
function refreshClockLivePreviews(){
  var now = wallNow();
  var h12 = (now.h % 12 || 12);
  var t12 = pad2(h12) + ':' + pad2(now.m) + (now.h < 12 ? ' AM' : ' PM');
  var t24 = pad2(now.h) + ':' + pad2(now.m);
  ['ihour','clockwin-hour'].forEach(function(id){
    var s = $(id);
    if(!s) return;
    var a = s.querySelector('option[value="12"]');
    var b = s.querySelector('option[value="24"]');
    if(a) a.textContent = '12-hour (' + t12 + ')';
    if(b) b.textContent = '24-hour (' + t24 + ')';
  });
  ['idatefmt','clockwin-datefmt'].forEach(function(id){
    var s = $(id);
    if(!s) return;
    ['long','short','us','iso'].forEach(function(fmt){
      var opt = s.querySelector('option[value="' + fmt + '"]');
      if(opt) opt.textContent = datePreviewText(fmt);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('.clock-card'), function(card){
    var p = card.querySelector('.cprev');
    if(p) p.textContent = clockPreviewText(card.getAttribute('data-id'));
  });
}

/* ── time source: this device, or the weather city's timezone ──
   Open-Meteo hands back a UTC offset for the city; we shift the clock by it
   and read the UTC fields, which gives that place's wall clock. */
var _tzOffsetSec = null;
function followCityTime(){
  return (gs(K.timeSource) || 'device') === 'city' && _tzOffsetSec != null;
}
function wallNow(){
  if(followCityTime()){
    var d = new Date(Date.now() + _tzOffsetSec * 1000);
    return { h:d.getUTCHours(), m:d.getUTCMinutes(), s:d.getUTCSeconds(),
             dow:d.getUTCDay(), date:d.getUTCDate(), mon:d.getUTCMonth(), year:d.getUTCFullYear(), city:true };
  }
  var n = new Date();
  return { h:n.getHours(), m:n.getMinutes(), s:n.getSeconds(),
           dow:n.getDay(), date:n.getDate(), mon:n.getMonth(), year:n.getFullYear(), city:false };
}
function refreshTimeSource(){
  _lastTime = ''; _lastDate = '';
  applyClockStyle();
  renderClock();
  renderCalendar();
  scheduleCalendar();   /* repaint on the city's midnight too, not just the device's */
  renderGreeting();
  updateTabName();
}
/* one place every "time source" control goes through, so the clock, the
   calendar and the settings segments never fall out of step */
function onTimeSourcePicked(){
  refreshTimeSource();
  extSyncTimeSource();
  /* switching to the city before its offset is known: pull the forecast so
     utc_offset_seconds arrives and the clock + calendar can follow it */
  if((gs(K.timeSource) || 'device') === 'city' && _tzOffsetSec == null) loadWeather(false);
}
function applyCalSize(){
  var px = parseInt(gs(K.calSize),10); if(!(px > 0)) px = 9;
  var root = document.documentElement.style;
  root.setProperty('--cal-day-size', px + 'px');
  root.setProperty('--cal-dow-size', Math.max(7, Math.round(px * 0.8)) + 'px');
  root.setProperty('--cal-month-size', Math.max(8, Math.round(px * 0.95)) + 'px');
  root.setProperty('--cal-year-size', Math.max(8, Math.round(px * 0.9)) + 'px');
  /* the card itself grows with the type, not just the numbers inside it */
  root.setProperty('--cal-gap', Math.max(2, Math.round(px * 0.22)) + 'px');
  root.setProperty('--cal-w', Math.round(px * 22.2) + 'px');
  root.setProperty('--cal-pad-x', Math.round(px * 1.2) + 'px');
  root.setProperty('--cal-pad-y', Math.round(px * 1.0) + 'px');
  root.setProperty('--cal-radius', Math.round(px * 0.7) + 'px');
  /* the calendar window (opened from the card) follows the same scale, so a
     big monitor gets a big month — window and contents together */
  var day = Math.max(12, Math.round(px * 1.15));
  root.setProperty('--calwin-day-size', day + 'px');
  root.setProperty('--calwin-w', Math.max(360, Math.round(px * 30)) + 'px');
}
/* one calendar size, three places to set it (clock pane, widgets pane and the
   calendar window itself) — every copy stays in step */
function calSizeValue(){
  var v = parseInt(gs(K.calSize),10);
  return (v > 0) ? v : 9;
}
function syncCalSizeUI(){
  var v = calSizeValue();
  [['icalsize','icalsize-v'],['icalsize-w','icalsize-w-v'],['calwin-size','calwin-size-v']].forEach(function(pair){
    var el = $(pair[0]), lab = $(pair[1]);
    if(el) el.value = v;
    if(lab) lab.textContent = v + 'px';
  });
}
function setCalSize(v){
  v = parseInt(v,10);
  if(!(v > 0)) return;
  ss(K.calSize, String(v));
  /* this option owns the whole card, so drop any hand-resized size that would
     otherwise pin the old width */
  var sizes = parseJSON(gs(K.sizes),{}) || {};
  if(sizes.calendar){ delete sizes.calendar; ss(K.sizes, JSON.stringify(sizes)); }
  var cel = $('calendar');
  if(cel){ cel.style.width = ''; cel.style.height = ''; cel.style.removeProperty('--ws'); }
  applyCalSize();
  renderCalendar();
  measureBases();
  applySizes();
  syncCalSizeUI();
}

function renderClock(){
  var timeEl = $('time');
  var dateEl = $('date');
  if(!timeEl) return;
  var now = wallNow();
  var o = getClockOpts();
  var h = now.h;
  var m = now.m;
  var s = now.s;
  var hh = (o.hour === '12') ? (h % 12 || 12) : h;
  var tstr = pad2(hh) + ':' + pad2(m);
  if(o.secs === '1') tstr += ':' + pad2(s);
  if(o.hour === '12') tstr += (h < 12 ? ' AM' : ' PM');

  if(tstr !== _lastTime){ _lastTime = tstr; setText(timeEl,tstr); }

  if(dateEl && o.datefmt !== 'none'){
    var d = '';
    var dd = now.date, mo = now.mon, yr = now.year;
    if(o.datefmt === 'long')       d = DAYS[now.dow] + ', ' + MONTHS[mo] + ' ' + dd;
    else if(o.datefmt === 'short') d = pad2(dd) + '/' + pad2(mo+1) + '/' + yr;
    else if(o.datefmt === 'us')    d = pad2(mo+1) + '/' + pad2(dd) + '/' + yr;
    else if(o.datefmt === 'iso')   d = yr + '-' + pad2(mo+1) + '-' + pad2(dd);
    if(d !== _lastDate){ _lastDate = d; setText(dateEl,d); }
  }

  if((gs(K.tabNameStyle) || '') === 'time') updateTabName();

  /* "Good night" must not stay "Good evening" all night */
  if(h !== _lastHour){
    _lastHour = h;
    var gstyle = gs(K.style) || 'hi';
    if(gstyle === 'good' || gstyle === 'custom') renderGreeting();
  }

  /* keep the live option previews in step while Settings or the Clock window
     is on screen; both are hidden the rest of the time, so skip the writes */
  if((overlay && overlay.classList.contains('open')) || _openWin === 'clock-modal'){
    refreshClockLivePreviews();
  }
}

function scheduleClock(immediate){
  if(_clockTimer){ clearTimeout(_clockTimer); _clockTimer = null; }
  if(immediate){
    renderClock();
  } else {
    renderClock();
  }
  var secs = (gs(K.showSecs) || '0') === '1';
  var now = Date.now();
  var delay = secs ? (1000 - (now % 1000)) + 15 : (60000 - (now % 60000)) + 15;
  if(document.hidden) delay = 60000;
  _clockTimer = setTimeout(scheduleClock,delay);
}

/* ══════════════════════════════════════════
   SHORTCUTS
══════════════════════════════════════════ */
function getSC(){
  var a = parseJSON(gs(K.sc),null);
  if(!Array.isArray(a)) return DEF_SC.map(function(x){ return {label:x.label,url:x.url}; });
  return a;
}
function saveSC(a){ ss(K.sc,JSON.stringify(a)); }

function iconURL(domain){
  return 'https://www.google.com/s2/favicons?sz=64&domain=' + encodeURIComponent(domain);
}
function domainOf(url){
  try{ return new URL(url).hostname; }catch(e){ return ''; }
}
function getIconUrl(url){
  return iconURL(domainOf(url) || url);
}

/* ── offline shortcut icons ──
   The icon is fetched once (host permission lets us read it), turned into a
   data: URL and kept in localStorage, so every later new tab paints instantly
   and works with no connection. */
function favStore(){
  return parseJSON(gs(K.favicons),{}) || {};
}
function saveFavStore(o){
  try{ ss(K.favicons,JSON.stringify(o)); }catch(e){}
}
var _favPending = {};

function cacheFavicon(domain,force,cb){
  if(!domain) return;
  if(_favPending[domain]) return;
  var store = favStore();
  if(!force && store[domain] && store[domain].d) return;
  _favPending[domain] = true;
  fetch(iconURL(domain)).then(function(r){
    if(!r.ok) throw new Error('icon ' + r.status);
    return r.blob();
  }).then(function(blob){
    if(!blob || !blob.size) throw new Error('empty icon');
    return new Promise(function(resolve,reject){
      var fr = new FileReader();
      fr.onload  = function(){ resolve(fr.result); };
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
  }).then(function(dataURL){
    var o = favStore();
    o[domain] = { d:dataURL, ts:Date.now() };
    /* keep it bounded so localStorage never fills up */
    var keys = Object.keys(o);
    if(keys.length > 80){
      keys.sort(function(a,b){ return (o[a].ts || 0) - (o[b].ts || 0); });
      while(keys.length > 60) delete o[keys.shift()];
    }
    saveFavStore(o);
    if(cb) cb(dataURL);
  }).catch(function(){
    /* no permission / offline / blocked: the remote URL stays as fallback */
  }).then(function(){ delete _favPending[domain]; });
}
function letterTile(label,url){
  var src = label || '';
  if(!src){
    try{ src = new URL(url).hostname.replace(/^www\./,''); }catch(e){ src = '?'; }
  }
  var span = document.createElement('span');
  span.className = 'sc-letter';
  span.textContent = (src.charAt(0) || '?');
  return span;
}

function renderSC(){
  var wrap = $('shortcuts');
  if(!wrap) return;
  /* the tiles live inside .w-body so they zoom with the card */
  var box = wrap.querySelector('.w-body') || wrap;
  var handle = wrap.querySelector('.drag-handle');
  Array.prototype.slice.call(box.querySelectorAll('.shortcut')).forEach(function(n){ n.remove(); });

  getSC().forEach(function(sc){
    var a = document.createElement('a');
    a.href = sc.url;
    a.className = 'shortcut';
    a.title = sc.label || '';
    a.setAttribute('aria-label', sc.label || 'Shortcut');

    var img = document.createElement('img');
    img.alt = sc.label || '';
    img.decoding = 'async';
    var domain = domainOf(sc.url);
    var cached = (favStore()[domain] || {}).d;
    if(cached){
      img.src = cached;
    } else {
      img.src = getIconUrl(sc.url);
      cacheFavicon(domain,false,function(dataURL){
        if(img.isConnected) img.src = dataURL;
      });
    }
    img.addEventListener('error',function(){
      img.remove();
      if(!a.querySelector('.sc-letter')) a.appendChild(letterTile(sc.label,sc.url));
    });
    a.appendChild(img);
    box.appendChild(a);
  });
  if(handle && wrap.firstChild !== handle) wrap.insertBefore(handle,wrap.firstChild);
}

var _scTimer = null;
function scheduleShortcuts(){
  if(_scTimer) clearTimeout(_scTimer);
  _scTimer = setTimeout(renderSC,350);
}

/* ══════════════════════════════════════════
   VIDEO + POWER
══════════════════════════════════════════ */
var _videoURL = null;

function updateVideoPlayback(){
  var v = $('background');
  if(!v) return;
  var saving = document.body.classList.contains('battery-saver');
  var hidden = document.hidden || document.visibilityState === 'hidden';
  var hiddenPause = (gs(K.pauseHidden) || '1') !== '0' && hidden;
  var stop = saving || hiddenPause;
  /* belt-and-braces: take the surface out of the layout too, so a browser
     that keeps a decoded frame around has nothing to paint */
  document.body.classList.toggle('wall-paused', stop);
  if(stop || !v.getAttribute('src')){
    if(!v.paused) v.pause();
    return;
  }
  if(v.paused){
    var p = v.play();
    if(p && p.catch) p.catch(function(){});
  }
}

function applyVideoBlob(blob){
  var v = $('background');
  if(!v) return;
  if(_videoURL){ URL.revokeObjectURL(_videoURL); _videoURL = null; }
  if(blob){
    _videoURL = URL.createObjectURL(blob);
    v.src = _videoURL;
  } else {
    v.removeAttribute('src');
  }
  document.body.classList.toggle('no-video', !blob);
  /* Firefox decodes video through the OS, so a format Chrome plays may not
     exist there. Fall back to the static gradient rather than a black page. */
  if(!v._ntErrWired){
    v._ntErrWired = true;
    v.addEventListener('error', function(){
      if(v.currentSrc || v.src) document.body.classList.add('video-failed');
    });
    v.addEventListener('playing', function(){
      document.body.classList.remove('video-failed');
    });
  }
  try{ v.load(); }catch(e){}
  updateVideoPlayback();
}

/* one shared way to import a video: store it, then paint it. Both the
   Settings drop zone and first-run onboarding come through here. */
function saveVideoFile(file, cb){
  if(!file){ if(cb) cb(false); return; }
  saveBlob(file, function(ok){
    if(ok) applyVideoBlob(file);
    if(cb) cb(ok, file);
  });
}

function applyVideoView(){
  var z = parseInt(gs(K.videoZoom),10); if(isNaN(z)) z = 100;
  var x = parseInt(gs(K.videoX),10);    if(isNaN(x)) x = 0;
  var y = parseInt(gs(K.videoY),10);    if(isNaN(y)) y = 0;
  z = Math.max(100, Math.min(250, z));
  x = Math.max(-600, Math.min(600, x));
  y = Math.max(-600, Math.min(600, y));
  var root = document.documentElement.style;
  root.setProperty('--vid-z', (z / 100).toFixed(3));
  root.setProperty('--vid-x', x + 'px');
  root.setProperty('--vid-y', y + 'px');
}

var _powerWired = false;

function initPower(){
  updateVideoPlayback();
  if(!_powerWired){
    _powerWired = true;
    document.addEventListener('visibilitychange',updateVideoPlayback);
    window.addEventListener('blur',updateVideoPlayback);
    window.addEventListener('focus',updateVideoPlayback);
  }

  /* The wallpaper choice is a plain two-way setting: '1' shows the calm
     gradient, '0' plays the video. No battery-level guessing — that API is
     unreliable on Chromium and missing on Firefox. */
  document.body.classList.toggle('battery-saver', gs(K.batterySaver) !== '0');
  updateVideoPlayback();
}

function wallIsGradient(){ return gs(K.batterySaver) !== '0'; }
function applyWallModeUI(){
  var grad = wallIsGradient();
  var g = $('gradient-options'), v = $('video-options');
  if(g) g.style.display = grad ? '' : 'none';
  if(v) v.style.display = grad ? 'none' : '';
  selectIn($('wall-grid'),'.wall-card','data-wall', grad ? 'gradient' : 'video');
  var hint = $('wall-hint');
  if(hint) hint.textContent = grad
    ? 'Calm Wave \u2014 a soft static colour. It also asks a little less of your battery.'
    : 'Video Wallpaper \u2014 your video plays behind the glass. Choose a video below.';
}
/* First run: start on the gradient so nobody meets a black empty page. Any
   profile that already has settings keeps whatever it had (video unless the
   gradient was already chosen). */
function ensureWallModeDefault(){
  if(gs(K.batterySaver) !== null) return;
  var fresh = true;
  try{
    for(var i = 0; i < localStorage.length; i++){
      var k = localStorage.key(i);
      if(k && k.indexOf('nt_') === 0){ fresh = false; break; }
    }
  }catch(e){}
  ss(K.batterySaver, fresh ? '1' : '0');
}

/* ══════════════════════════════════════════
   LAYOUT EDIT + DRAG
══════════════════════════════════════════ */
var EL_IDS = ['shortcuts','datetime','calendar','prayer','greeting-wrap','searchbar','gear-btn','weather','quote','stocks'];
var _layoutEditing = false;
var _lastDragEnd = 0;

function getPos(){
  return parseJSON(gs(K.positions),{}) || {};
}
function savePos(o){ ss(K.positions,JSON.stringify(o)); }
/* remember where a widget was put, and the window it was put in, so a later
   resize can keep its relative place instead of drifting */
function saveWidgetPos(id, x, y){
  var p = getPos();
  p[id] = {
    x: Math.round(x), y: Math.round(y),
    vw: window.innerWidth, vh: window.innerHeight
  };
  savePos(p);
}

function setLayoutEditing(on, quiet){
  _layoutEditing = !!on;
  ss(K.layoutEditing,on ? '1' : '0');
  document.body.classList.toggle('layout-editing',_layoutEditing);
  var btn = $('layout-btn');
  if(btn) btn.classList.toggle('active',_layoutEditing);
  if(_layoutEditing){
    /* put the search bar back where it lives; it must not lift or focus
       while the layout is being moved around */
    var g = $('engine-menu'); if(g) g.classList.remove('open');
    var si = $('search-input'); if(si) si.blur();
    var sb = $('searchbar'); if(sb) sb.classList.remove('search-focus');
    document.body.classList.remove('search-active');
  }
  if(!quiet){
    layoutHint(_layoutEditing
      ? 'Resize mode on — drag a card, or pull its corner.'
      : 'Resize mode off.');
  }
}
/* plain two-second nudge: no fade, no blur, just a clear hint */
function layoutHint(msg){
  noteToast(msg, true);
}
/* a click that misses every card while arranging gets a calm, unmistakable
   nudge: a soft low tone, one gentle shake, and a plain line of text */
function layoutMiss(msg){
  noteToast(msg, true, true);
  var t = $('note-toast');
  if(t){
    t.classList.remove('shake');
    void t.offsetWidth;               /* restart the animation every time */
    t.classList.add('shake');
    t.addEventListener('animationend', function(){ t.classList.remove('shake'); }, { once:true });
  }
  softNope();
}
var _nopeCtx = null;
function softNope(){
  try{
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    _nopeCtx = _nopeCtx || new AC();
    var ctx = _nopeCtx;
    if(ctx.state === 'suspended' && ctx.resume) ctx.resume();
    var t0 = ctx.currentTime + 0.01;
    /* two falling sine notes, quiet enough to be a sigh rather than an alarm */
    [[420, 0, 0.10], [300, 0.085, 0.16]].forEach(function(n){
      var osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(n[0], t0 + n[1]);
      g.gain.setValueAtTime(0.0001, t0 + n[1]);
      g.gain.exponentialRampToValueAtTime(0.045, t0 + n[1] + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + n[1] + n[2]);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t0 + n[1]); osc.stop(t0 + n[1] + n[2] + 0.03);
    });
  }catch(e){}
}

function applyPositions(){
  var pos = getPos();
  var W = window.innerWidth, H = window.innerHeight;
  EL_IDS.forEach(function(id){
    var el = $(id);
    var p = pos[id];
    if(!el || !p) return;
    var w = el.offsetWidth, h = el.offsetHeight;
    /* Positions are stored together with the window they were saved in. If
       the window has changed, keep the widget's relative place instead of
       pinning it to a raw pixel that only made sense at the old size. That is
       what used to look like "drift" after a resize or a zoom change.
       Older entries without vw/vh still behave exactly as before. */
    var maxX = Math.max(0, W - w), maxY = Math.max(0, H - h);
    var x = p.x, y = p.y;
    if(p.vw > 0 && p.vh > 0 && (p.vw !== W || p.vh !== H)){
      var oldMaxX = Math.max(0, p.vw - w), oldMaxY = Math.max(0, p.vh - h);
      var rx = oldMaxX > 0 ? p.x / oldMaxX : 0;
      var ry = oldMaxY > 0 ? p.y / oldMaxY : 0;
      rx = Math.max(0, Math.min(1, rx));
      ry = Math.max(0, Math.min(1, ry));
      x = rx * maxX;
      y = ry * maxY;
    }
    x = Math.round(Math.max(0, Math.min(maxX, x)));
    y = Math.round(Math.max(0, Math.min(maxY, y)));
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.transform = 'none';
  });
}

/* ══════════════════════════════════════════
   FREE RESIZE (widget cards)
══════════════════════════════════════════ */
var RESIZABLE = ['shortcuts','datetime','calendar','prayer','greeting-wrap','searchbar','weather','quote','stocks'];
var MIN_W = {shortcuts:140, datetime:120, calendar:160, prayer:150, 'greeting-wrap':140, searchbar:220, weather:120, quote:180, stocks:150};
var MIN_H = {shortcuts:70,  datetime:70,  calendar:128, prayer:76,  'greeting-wrap':48,  searchbar:44,  weather:70,  quote:60, stocks:80};

/* nominal "design" size of every card — the reference point for content
   scaling, so a bigger card really means bigger text, not empty space */
var DEFAULT_SIZE = {
  shortcuts:       { w:356, h:76 },
  datetime:        { w:175, h:78 },
  calendar:        { w:200, h:168 },
  prayer:          { w:200, h:96 },
  'greeting-wrap': { w:300, h:50 },
  searchbar:       { w:500, h:42 },
  weather:         { w:152, h:90 },
  quote:           { w:300, h:96 },
  stocks:          { w:200, h:132 }
};
/* nothing may be measured smaller than this — the content would clip */
var NATURAL_MIN = {
  shortcuts:       { w:300, h:76  },
  datetime:        { w:175, h:84  },
  calendar:        { w:192, h:160 },
  prayer:          { w:180, h:92  },
  'greeting-wrap': { w:240, h:50  },
  searchbar:       { w:420, h:42  },
  weather:         { w:180, h:112 },
  quote:           { w:300, h:100 },
  stocks:          { w:180, h:110 }
};
/* Cards whose text changes with the network must not use the current content
   as their base. A placeholder such as "Updating..." measured at boot used to
   shrink the base, so after data arrived the grid columns collapsed. These
   bases are stable for the life of the profile; the card still scales with
   --ws, and the user can resize it. */
var FIXED_BASE = {
  weather: { w:180, h:112 },
  stocks:  { w:248, h:132 }
};
var _baseSize = {};
var _padSize = {};
var SCALE_MIN = 0.55, SCALE_MAX = 2.6;

function measureBases(){
  RESIZABLE.forEach(function(id){
    var el    = $(id);
    var def   = DEFAULT_SIZE[id] || { w:200, h:80 };
    var floor = NATURAL_MIN[id]  || { w:0, h:0 };

    _padSize[id] = { x:0, y:0 };

    if(!el){
      _baseSize[id] = { w:Math.max(def.w,floor.w), h:Math.max(def.h,floor.h) };
      return;
    }
    var cs = getComputedStyle(el);
    _padSize[id] = {
      x: (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0),
      y: (parseFloat(cs.paddingTop)  || 0) + (parseFloat(cs.paddingBottom) || 0)
    };

    if(FIXED_BASE[id]){
      _baseSize[id] = { w:FIXED_BASE[id].w, h:FIXED_BASE[id].h };
      return;
    }

    /* hidden cards have no measurable size — use the nominal one */
    if(el.classList.contains('hidden') || el.offsetWidth === 0){
      var hw = def.w, hh = def.h;
      /* the calendar's width comes from a CSS variable, so a hidden card
         still knows how big it will be when it comes back */
      if(id === 'calendar'){
        var cv = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cal-w'),10);
        if(cv > 0) hw = cv;
      }
      _baseSize[id] = { w:Math.max(hw,floor.w), h:Math.max(hh,floor.h) };
      return;
    }

    var pw = el.style.width, ph = el.style.height;
    var ws = el.style.getPropertyValue('--ws');
    var wbw = el.style.getPropertyValue('--wbw');
    el.style.width = ''; el.style.height = '';
    el.style.removeProperty('--ws');
    el.style.removeProperty('--wbw');
    var w = el.offsetWidth, h = el.offsetHeight;
    el.style.width = pw; el.style.height = ph;
    if(ws) el.style.setProperty('--ws',ws);
    if(wbw) el.style.setProperty('--wbw',wbw);

    _baseSize[id] = {
      w: Math.max(floor.w, w || def.w),
      h: Math.max(floor.h, h || def.h)
    };
  });
}

function applySizeScale(id,live){
  var el = $(id);
  if(!el) return;
  var base = _baseSize[id] || DEFAULT_SIZE[id];
  if(!base || !base.w || !base.h) return;
  var s = (parseJSON(gs(K.sizes),{}) || {})[id];
  if(!s && !live){ el.style.removeProperty('--ws'); el.style.removeProperty('--wbw'); return; }
  var w = el.offsetWidth || s.w, h = el.offsetHeight || s.h;
  /* compare content boxes, so the fixed padding doesn't inflate the scale */
  var pad = _padSize[id] || { x:0, y:0 };
  var bw = Math.max(1, base.w - pad.x), bh = Math.max(1, base.h - pad.y);
  var aw = Math.max(1, w - pad.x),      ah = Math.max(1, h - pad.y);
  /* a quote never has a fixed height, so its width is the only honest cue */
  var auto = s && (s.auto === 1 || s.auto === true);
  var scale = (auto || !(s && s.h > 0)) ? (aw / bw) : Math.min(aw / bw, ah / bh);
  scale = Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale));
  el.style.setProperty('--ws', String(Math.round(scale * 1000) / 1000));
  /* The markets grid has fixed-width value columns. `zoom` shrinks its local
     layout width as it grows, which collapsed the 1fr symbol column. Giving the
     body its true base width keeps the columns intact while zoom scales the
     whole thing to the card. */
  el.style.setProperty('--wbw', Math.round(bw) + 'px');
}

function syncInnerSize(el){
  if(el.id !== 'searchbar') return;
  var w = el.querySelector('.search-wrap');
  if(w){ w.style.width = '100%'; w.style.height = '100%'; }
}

function applySizes(){
  var sizes = parseJSON(gs(K.sizes),{}) || {};
  RESIZABLE.forEach(function(id){
    var el = $(id), s = sizes[id];
    if(!el) return;
    if(!s){ el.style.removeProperty('--ws'); el.style.removeProperty('--wbw'); return; }
    var w = Math.max(MIN_W[id] || 120, Math.min(window.innerWidth,  s.w));
    var auto = s.auto === 1 || s.auto === true;
    el.style.width = w + 'px';
    if(!auto && typeof s.h === 'number' && s.h > 0){
      var h = Math.max(MIN_H[id] || 60, Math.min(window.innerHeight, s.h));
      el.style.height = h + 'px';
    } else {
      /* height follows the content, so new text/metrics never get clipped */
      el.style.height = '';
    }
    syncInnerSize(el);
    applySizeScale(id);
  });
  scheduleLens();
}

/* re-measure and re-fit every auto widget after a font/content change */
function refitAutoSizes(){
  var sizes = parseJSON(gs(K.sizes),{}) || {};
  var s = clampScale(parseFloat(gs(K.uiScale)) || 1);
  var any = false;
  measureBases();
  RESIZABLE.forEach(function(id){
    var st = sizes[id];
    /* a widget the user resized by hand keeps its size */
    if(st && !(st.auto === 1 || st.auto === true)) return;
    if(!st){ st = sizes[id] = { auto: 1 }; }
    var b   = _baseSize[id] || DEFAULT_SIZE[id] || { w:200, h:80 };
    var pad = _padSize[id]  || { x:0, y:0 };
    var w = Math.round(b.w * s + pad.x * (1 - s));
    if(id === 'weather') w = Math.min(w, 340);   /* a very long city shouldn't stretch the card */
    st.w = Math.max(MIN_W[id] || 120, Math.min(window.innerWidth, w));
    delete st.h;
    any = true;
  });
  if(!any) return;
  ss(K.sizes, JSON.stringify(sizes));
  applySizes();
}
var _refitTimer = null;
function scheduleRefit(){
  if(_refitTimer) clearTimeout(_refitTimer);
  _refitTimer = setTimeout(function(){ _refitTimer = null; refitAutoSizes(); }, 120);
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(function(){ refitAutoSizes(); });
  }
}

/* put one widget back to its designed size + corner, without touching others */
function resetWidget(id){
  var el = $(id);
  var pos = getPos();
  if(pos[id]){ delete pos[id]; savePos(pos); }
  var sizes = parseJSON(gs(K.sizes),{}) || {};
  if(sizes[id]){ delete sizes[id]; ss(K.sizes,JSON.stringify(sizes)); }
  if(!el) return;
  el.style.left = ''; el.style.top = '';
  el.style.right = ''; el.style.bottom = '';
  el.style.transform = '';
  el.style.width = ''; el.style.height = '';
  el.style.removeProperty('--ws');
  el.style.removeProperty('--wbw');
  var body = el.querySelector('.w-body');
  if(body) body.style.zoom = '';
  if(id === 'searchbar'){
    var w = el.querySelector('.search-wrap');
    if(w){ w.style.width = ''; w.style.height = ''; }
  }
}

function addResetKnob(el){
  var id = el.id;
  var knob = document.createElement('div');
  knob.className = 'reset-knob';
  knob.title = 'Reset this widget';
  knob.setAttribute('aria-label','Reset this widget');
  knob.textContent = '\u21ba';
  knob.addEventListener('mousedown',function(e){ e.stopPropagation(); });
  knob.addEventListener('touchstart',function(e){ e.stopPropagation(); },{passive:true});
  knob.onclick = function(e){
    e.preventDefault();
    e.stopPropagation();
    resetWidget(id);
    if(id === 'quote'){ loadQuote(true); startQuoteTimer(); }
    if(id === 'weather') loadWeather(true);
    setTimeout(buildPosControls,150);
  };
  el.appendChild(knob);
}

function addResizeKnob(el){
  var id = el.id;
  var knob = document.createElement('div');
  knob.className = 'resize-knob';
  knob.title = 'Resize';
  el.appendChild(knob);

  var startX,startY,startW,startH,left,top,resizing = false;

  function onMove(e){
    if(!resizing) return;
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    var w = Math.max(MIN_W[id] || 120, Math.min(window.innerWidth  - left, startW + (cx - startX)));
    var h = Math.max(MIN_H[id] || 60,  Math.min(window.innerHeight - top,  startH + (cy - startY)));
    el.style.width  = w + 'px';
    el.style.height = h + 'px';
    syncInnerSize(el);
    applySizeScale(id,true);
    scheduleLens();
  }
  function onEnd(){
    if(!resizing) return;
    resizing = false;
    var sizes = parseJSON(gs(K.sizes),{}) || {};
    sizes[id] = { w:el.offsetWidth, h:el.offsetHeight, auto:0 };
    ss(K.sizes,JSON.stringify(sizes));
    scheduleLens();
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onEnd);
    document.removeEventListener('touchmove',onMove);
    document.removeEventListener('touchend',onEnd);
  }
  function onStart(e){
    if(!_layoutEditing) return;
    e.preventDefault();
    e.stopPropagation();
    resizing = true;
    var rect = el.getBoundingClientRect();
    left = rect.left; top = rect.top;
    startW = rect.width; startH = rect.height;
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    startX = cx; startY = cy;
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onEnd);
    document.addEventListener('touchmove',onMove,{passive:false});
    document.addEventListener('touchend',onEnd);
  }
  knob.addEventListener('mousedown',onStart);
  knob.addEventListener('touchstart',onStart,{passive:false});
}

function makeDraggable(el){
  var id = el.id;
  var startX,startY,startEX,startEY,isDragging = false;

  function onMove(e){
    if(!isDragging) return;
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    var nx = startEX + (cx - startX);
    var ny = startEY + (cy - startY);
    nx = Math.max(0,Math.min(window.innerWidth  - el.offsetWidth,  nx));
    ny = Math.max(0,Math.min(window.innerHeight - el.offsetHeight, ny));
    el.style.left = nx + 'px';
    el.style.top  = ny + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.transform = 'none';
  }
  function onEnd(){
    if(!isDragging) return;
    isDragging = false;
    el.classList.remove('dragging');
    _lastDragEnd = Date.now();
    var x = parseInt(el.style.left,10), y = parseInt(el.style.top,10);
    if(isNaN(x)) x = el.offsetLeft;
    if(isNaN(y)) y = el.offsetTop;
    saveWidgetPos(id, x, y);
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onEnd);
    document.removeEventListener('touchmove',onMove);
    document.removeEventListener('touchend',onEnd);
  }
  function onStart(e){
    if(!_layoutEditing) return;
    var handle = el.querySelector('.drag-handle');
    var target = e.target;
    var fromHandle = handle && (target === handle || handle.contains(target));
    if(!fromHandle) return;
    e.preventDefault();
    isDragging = true;
    el.classList.add('dragging');
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    startX = cx; startY = cy;
    var rect = el.getBoundingClientRect();
    startEX = rect.left; startEY = rect.top;
    el.style.left = startEX + 'px';
    el.style.top  = startEY + 'px';
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    el.style.transform = 'none';
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onEnd);
    document.addEventListener('touchmove',onMove,{passive:false});
    document.addEventListener('touchend',onEnd);
  }
  el.addEventListener('mousedown',onStart);
  el.addEventListener('touchstart',onStart,{passive:false});
}

/* ══════════════════════════════════════════
   SEARCH
══════════════════════════════════════════ */
function applySearchEngine(){
  var e = ENGINES[gs(K.searchEngine) || 'google'] || ENGINES.google;
  var input = $('search-input');
  if(input) input.placeholder = e.ph;
  var icon = $('search-engine-icon');
  if(icon){
    icon.style.visibility = '';
    icon.onerror = function(){ icon.style.visibility = 'hidden'; };
    icon.src = iconURL(e.domain);
  }
}

function runSearch(){
  if(_layoutEditing) return;
  var input = $('search-input');
  if(!input) return;
  var q = input.value.trim();
  if(!q) return;
  if(/^(https?:\/\/|about:|chrome:|edge:|brave:)/i.test(q)){
    window.location.href = q;
    return;
  }
  if(!/\s/.test(q) && /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(q)){
    window.location.href = 'https://' + q;
    return;
  }
  var e = ENGINES[gs(K.searchEngine) || 'google'] || ENGINES.google;
  window.location.href = e.url + encodeURIComponent(q);
}

/* ══════════════════════════════════════════
   WIDGET VISIBILITY
══════════════════════════════════════════ */
var _hideTimers = {};
/* the prayer feature is opt-in by category: it must never appear for people
   who have not chosen the Quran verses */
function quranActive(){
  return gs(K.showQuote) !== '0' && (gs(K.quoteCat) || 'general') === 'quran';
}
function applyWidgetVisibility(animate){
  var map = {
    'greeting-wrap': gs(K.showGreet),
    'datetime':      gs(K.showClock),
    'calendar':      gs(K.showCalendar),
    'prayer':        (gs(K.showPrayer) !== '0' && quranActive()) ? '1' : '0',
    'searchbar':     gs(K.showSearch),
    'shortcuts':     gs(K.showShortcuts),
    'weather':       gs(K.showWeather),
    'quote':         gs(K.showQuote),
    'status-tile':   gs(K.showStatus),
    'stocks':        gs(K.showStocks) === '1' ? '1' : '0'
  };
  Object.keys(map).forEach(function(id){
    var el = $(id);
    if(!el) return;
    var hide = map[id] === '0';
    if(_hideTimers[id]){ clearTimeout(_hideTimers[id]); _hideTimers[id] = null; }

    if(hide){
      if(!animate){ el.classList.add('hidden'); el.classList.remove('w-hiding'); return; }
      if(el.classList.contains('hidden')) return;
      el.classList.add('w-hiding');
      _hideTimers[id] = setTimeout(function(){
        el.classList.add('hidden');
        el.classList.remove('w-hiding');
        _hideTimers[id] = null;
      }, 220);
      return;
    }

    var wasHidden = el.classList.contains('hidden');
    el.classList.remove('hidden');
    if(animate && wasHidden){
      el.classList.add('w-hiding');
      void el.offsetWidth;
      requestAnimationFrame(function(){
        el.classList.remove('w-hiding');
      });
    } else {
      el.classList.remove('w-hiding');
    }
  });
}

/* ══════════════════════════════════════════
   WEATHER  (Open-Meteo, manual city, cached 30 min)
══════════════════════════════════════════ */
var WEATHER_DEFAULT_MIN = 30;
function weatherTTL(){
  var m = parseInt(gs(K.weatherEvery),10);
  if(!(m > 0)) m = WEATHER_DEFAULT_MIN;
  m = Math.max(1, Math.min(1440, m));
  return m * 60 * 1000;
}

function setWeatherStatus(msg){ setText($('weather-status'),msg); }

/* visible "working on it" state for the weather window, so pressing
   Update now never feels like a dead button */
var _weatherReq = 0;
var _wstatusTimer = null;
function setWeatherBusy(on){
  var btn = $('ww-refresh');
  if(btn){
    btn.disabled = !!on;
    btn.textContent = on ? 'Updating\u2026' : 'Update now';
  }
  var st = $('ww-status');
  if(!st) return;
  if(on){
    if(_wstatusTimer){ clearTimeout(_wstatusTimer); _wstatusTimer = null; }
    st.textContent = 'Updating\u2026';
  } else if(st.textContent === 'Updating\u2026'){
    st.textContent = '';
  }
}
function weatherJustUpdated(){
  var st = $('ww-status');
  if(!st) return;
  st.textContent = 'Updated just now.';
  if(_wstatusTimer) clearTimeout(_wstatusTimer);
  _wstatusTimer = setTimeout(function(){
    _wstatusTimer = null;
    if(st.textContent === 'Updated just now.') st.textContent = '';
  }, 2600);
}

var _weatherStamp = 0;
var _rainAt = 0;
var _rainHM = '';      /* the city-local "HH:MM" the rain is expected, kept as text */
var _rainAtP = 0;
var _rainAbsent = false;
var _rainChance = null;
function weatherClockString(ts){
  var dt = ts ? new Date(ts) : new Date();
  var hf = gs(K.hourFmt) || '24';
  var h = dt.getHours();
  var hh = (hf === '12') ? (h % 12 || 12) : h;
  return pad2(hh) + ':' + pad2(dt.getMinutes()) + (hf === '12' ? (h < 12 ? ' AM' : ' PM') : '');
}
/* weather times should read in the same zone as the clock: when the clock
   follows the city, shift the instant by the city's offset before formatting */
function weatherTimeString(ts){
  if(followCityTime()){
    var dt = new Date((ts || Date.now()) + _tzOffsetSec * 1000);
    var hf = gs(K.hourFmt) || '24';
    var h = dt.getUTCHours();
    var hh = (hf === '12') ? (h % 12 || 12) : h;
    return pad2(hh) + ':' + pad2(dt.getUTCMinutes()) + (hf === '12' ? (h < 12 ? ' AM' : ' PM') : '');
  }
  return weatherClockString(ts);
}
function renderRainNote(){
  var el = $('w-raintime');
  if(!el) return;
  if(_rainHM){
    /* the hour and its meridian come from one city-local string, so they
       can never disagree — this is what fixes the AM/PM drift */
    el.textContent = 'Expect rain around ' + prayerClock(_rainHM);
  }
  else if(_rainAt){
    el.textContent = 'Expect rain around ' + weatherTimeString(_rainAt);
  }
  /* the card's own rain line already says "no rain" when there is none, so
     only add a little texture when the chance is there but very low */
  else if(_rainChance != null && Number(_rainChance) < 20 && Number(_rainChance) >= 5){
    el.textContent = 'Mostly dry today.';
  }
  else el.textContent = '';
}
function refreshWeatherStamp(){
  var upd = $('w-updated');
  if(upd && _weatherStamp) upd.textContent = 'Last updated ' + weatherTimeString(_weatherStamp);
  renderRainNote();
}

function renderWeather(d){
  var code = d.code;
  var w = WMO[code] || ['🌡️','—'];
  var label = d.label || d.city || '';
  var cityName = d.cityName || label.split(',')[0] || 'Location';
  setText($('w-city'),cityName);
  setText($('w-icon'),w[0]);
  setText($('w-temp'), String(Math.round(d.temp)));
  setText($('w-unit'), (String(d.unit).toLowerCase() === 'f') ? 'F' : 'C');
  setText($('w-desc'),w[1]);
  var rain;
  if(d.src === 'bmkg') rain = bmkgRainLabel(d);
  else rain = (d.rain == null) ? 'No rain expected' : rainPhrase(d.rain);
  setText($('w-rain'),rain);
  /* always name the source: BMKG when its data is shown, Open-Meteo otherwise */
  var srcEl = $('w-src');
  if(srcEl){
    var isBmkg = d.src === 'bmkg';
    srcEl.hidden = false;
    srcEl.textContent = isBmkg ? 'Sumber: BMKG' : 'Source: Open-Meteo';
    srcEl.href = isBmkg ? 'https://data.bmkg.go.id/prakiraan-cuaca' : 'https://open-meteo.com/';
  }
  _weatherStamp = d.ts || Date.now();
  _rainAt = d.rainAt || 0;
  _rainHM = d.rainHM || '';
  _rainAtP = d.rainAtP || 0;
  _rainAbsent = !!d.rainAbsent;
  _rainChance = (d.rain == null) ? null : Number(d.rain);
  if(d.utcOffset != null && d.utcOffset !== _tzOffsetSec){
    _tzOffsetSec = d.utcOffset;
    refreshTimeSource();
  }
  renderRainNote();
  var upd = $('w-updated');
  if(upd) upd.textContent = 'Last updated ' + weatherTimeString(_weatherStamp);
  /* let the card grow/shrink with the new temperature and description */
  var wEl = $('weather');
  var wsz = (parseJSON(gs(K.sizes),{}) || {}).weather;
  if(wEl && (!wsz || wsz.auto === 1 || wsz.auto === true || !(wsz.h > 0))){
    wEl.style.height = '';
  }
  /* the base is fixed, so this only refreshes --ws/--wbw after the text lands */
  applySizeScale('weather');
  renderWeatherWindow();
}

/* the expanded weather window reads straight from the same cache */
function renderWeatherWindow(){
  var cache = parseJSON(gs(K.weatherCache), null);
  var city = (gs(K.weatherCity) || '').trim();
  var wwCity = $('ww-city'), now = $('ww-now'), segs = $('ww-segs');
  var ui = $('ww-city-input'); if(ui && document.activeElement !== ui) ui.value = city;
  var us = $('ww-unit'); if(us) us.value = gs(K.weatherUnit) || 'c';
  var we = $('ww-every');
  if(we && document.activeElement !== we){
    var m = parseInt(gs(K.weatherEvery),10); if(!(m > 0)) m = WEATHER_DEFAULT_MIN;
    we.value = m;
  }
  if(!cache || cache.v !== 2){
    if(wwCity) wwCity.textContent = city || 'No city set';
    if(now) now.innerHTML = '<div class="ww-now-ico">📍</div><div><div class="ww-now-temp">--</div><div class="ww-now-desc">' +
      (city ? 'Updating…' : 'Choose a city below') + '</div></div>';
    if(segs) segs.innerHTML = '';
    var wl0 = $('ww-link'), ws0 = $('ww-src');
    if(wl0) wl0.hidden = false;
    if(ws0) ws0.hidden = true;
    return;
  }
  var unit = (String(cache.unit).toLowerCase() === 'f') ? 'F' : 'C';
  var w = WMO[cache.code] || ['🌡️','—'];
  if(wwCity) wwCity.textContent = (cache.label || cache.cityName || cache.city) +
    ' \u00b7 ' + (cache.src === 'bmkg' ? 'BMKG' : 'Open-Meteo');
  if(now){
    var rainTxt;
    if(cache.src === 'bmkg') rainTxt = bmkgRainLabel(cache);
    else rainTxt = (cache.rain == null) ? '' : rainPhrase(cache.rain);
    var meta = (cache.hi != null && cache.lo != null)
      ? 'High ' + Math.round(cache.hi) + '° / Low ' + Math.round(cache.lo) + '°' : '';
    now.innerHTML =
      '<div class="ww-now-ico">' + w[0] + '</div>' +
      '<div><div class="ww-now-temp">' + Math.round(cache.temp) + '°' + unit + '</div>' +
      '<div class="ww-now-desc">' + w[1] + (rainTxt ? ' · ' + rainTxt : '') + '</div>' +
      (meta ? '<div class="ww-now-desc">' + meta + '</div>' : '') + '</div>';
  }
  if(segs){
    segs.innerHTML = (cache.segs || []).map(function(s){
      var sw = WMO[s.code] || ['·',''];
      var t = (s.temp == null) ? '--' : Math.round(s.temp) + '°';
      var r;
      if(cache.src === 'bmkg'){
        r = (Number(s.code) >= 61) ? bmkgRainWord(s.code, s.rainMm) : 'No rain';
      } else {
        r = (s.rain == null || s.rain < 5) ? 'No rain' : '💧 ' + s.rain + '%';
      }
      return '<div class="ww-seg"><div class="ws-lbl">' + s.lbl + '</div>' +
             '<div class="ws-ico">' + sw[0] + '</div>' +
             '<div class="ws-temp">' + t + '</div>' +
             '<div class="ws-rain">' + r + '</div></div>';
    }).join('');
  }
  /* credit the source that is actually on screen */
  var wl = $('ww-link'), ws = $('ww-src'), isBmkg = cache.src === 'bmkg';
  if(wl) wl.hidden = isBmkg;
  if(ws) ws.hidden = !isBmkg;
}

/* one city, shared by the weather card and the prayer times */
function setWeatherCity(city, btn){
  city = (city || '').trim();
  var prev = (gs(K.weatherCity) || '').trim();
  ss(K.weatherCity, city);
  ss(K.weatherGeo, '');
  ss(K.weatherCache, '');
  loadWeather(true);
  startWeatherTimer();
  if(prev !== city){
    ss(K.prayerCache, '');
    ss(K.prayerNotified, '');
    _prayerData = null;
    _prayerCity = city;
    if(quranActive() && isShown('prayer')) loadPrayer(true);
  }
  ['iweatherloc','ww-city-input','pw-city-input'].forEach(function(id){
    var el = $(id); if(el) el.value = city;
  });
  if(btn) flash(btn, 'Saved');
  renderWeatherWindow();
}

/* "% rain" is vague — describe what the chance actually means */
function rainPhrase(p){
  var n = Math.round(Number(p));
  /* anything under 5% reads as noise, not a forecast */
  if(!(n >= 5)) return 'No rain expected';
  if(n < 20)  return 'Slight chance of rain ' + n + '%';
  if(n < 45)  return 'Chance of rain ' + n + '%';
  if(n < 70)  return 'Likely to rain ' + n + '%';
  return 'Rain very likely ' + n + '%';
}

function geocode(city){
  var url = 'https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&format=json&name=' +
            encodeURIComponent(city);
  return fetchJSON(url,9000).then(function(j){
    if(!j || !j.results || !j.results.length){
      var e = new Error('City not found');
      e.code = 'CITY_NOT_FOUND';
      throw e;
    }
    var r = j.results[0];
    return { city:city, cityName:r.name, lat:r.latitude, lon:r.longitude,
             cc:(r.country_code || '').toUpperCase(),
             label:r.name + (r.country ? ', ' + r.country : '') };
  });
}

/* ══════════════════════════════════════════
   BMKG WEATHER  (Indonesia only, keyless via adm4)
   Curated city → adm4 table, verified live 2026-11-08. Anything unresolved,
   stale or failing falls straight back to Open-Meteo, silently. BMKG has no
   rain probability, so the card shows millimetres instead.
   Attribution is required by BMKG and shown only while src === 'bmkg'.
══════════════════════════════════════════ */
var BMKG_URL = 'https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=';
var BMKG_TIMEOUT_MS = 6000;
var BMKG_RAW_TTL_MIN = 180;      /* BMKG republishes ~2×/day; never refetch faster than this */
var BMKG_MIN_GAP_MS = 120000;    /* even force=true never hits the same adm4 twice inside 2 min */
var BMKG_BAD_SHORT_MS = 600000;  /* timeout / 5xx / 429 / offline: skip for 10 min */
var BMKG_BAD_LONG_MS = 86400000; /* 400 / 404 / empty body: skip this adm4 for 24 h */
var BMKG_RADIUS_KM = 30;         /* nearest-centre match radius when the name is not in the table */
var BMKG_MAX_CACHED = 4;
var BMKG_KEY_RAW = 'nt_bmkg_raw';
var BMKG_KEY_BAD = 'nt_bmkg_bad';
var bmkgInflight = {};

/* [aliases joined by |, adm4, centre lat, centre lon]. All 34 codes were probed
   live on 2026-11-08: HTTP 200 and the expected desa/kotkab. Re-probe before
   changing them; a wrong row simply falls back to Open-Meteo at runtime. */
var BMKG_CITIES = [
  ['jakarta|jakarta pusat|dki jakarta|central jakarta', '31.71.01.1001', -6.1763843, 106.8267074],
  ['jakarta utara|north jakarta', '31.72.01.1001', -6.1384, 106.8639],
  ['jakarta barat|west jakarta', '31.73.01.1001', -6.1683, 106.7588],
  ['jakarta selatan|south jakarta', '31.74.04.1006', -6.2749, 106.8352],
  ['jakarta timur|east jakarta', '31.75.01.1001', -6.2250, 106.9004],
  ['bogor', '32.71.01.1001', -6.5950, 106.8166],
  ['bandung', '32.73.01.1001', -6.9175, 107.6191],
  ['bekasi', '32.75.01.1001', -6.2383, 106.9756],
  ['depok', '32.76.03.1001', -6.4025, 106.7942],
  ['tangerang', '36.71.01.1001', -6.1783, 106.6319],
  ['tangerang selatan|south tangerang', '36.74.01.1001', -6.2886, 106.7179],
  ['semarang', '33.74.01.1001', -6.9667, 110.4167],
  ['surakarta|solo', '33.72.01.1001', -7.5755, 110.8243],
  ['yogyakarta|jogja', '34.71.01.1001', -7.7956, 110.3695],
  ['surabaya', '35.78.01.1001', -7.2575, 112.7521],
  ['sidoarjo', '35.15.01.2001', -7.4478, 112.7183],
  ['malang', '35.73.01.1001', -7.9666, 112.6326],
  ['denpasar', '51.71.01.1001', -8.6705, 115.2126],
  ['mataram', '52.71.02.1001', -8.5833, 116.1167],
  ['kupang', '53.71.01.1001', -10.1772, 123.6070],
  ['medan', '12.71.01.1001', 3.5952, 98.6722],
  ['padang', '13.71.01.1001', -0.9471, 100.4172],
  ['pekanbaru', '14.71.01.1002', 0.5071, 101.4478],
  ['batam', '21.71.02.1001', 1.0456, 104.0305],
  ['palembang', '16.71.01.1001', -2.9761, 104.7754],
  ['bandar lampung', '18.71.03.1001', -5.4500, 105.2667],
  ['pontianak', '61.71.01.1002', -0.0263, 109.3425],
  ['banjarmasin', '63.71.01.1001', -3.3194, 114.5908],
  ['balikpapan', '64.71.01.1001', -1.2379, 116.8529],
  ['samarinda', '64.72.01.1001', -0.5022, 117.1536],
  ['makassar', '73.71.01.1001', -5.1477, 119.4327],
  ['manado', '71.71.01.1001', 1.4748, 124.8421],
  ['ambon', '81.71.02.2001', -3.6954, 128.1814],
  ['jayapura', '91.71.01.1001', -2.5337, 140.7181]
];

function bmkgPad(n){ return (n < 10 ? '0' : '') + n; }

/* "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DDTHH:mm:ssZ" (both UTC in BMKG output) → epoch ms */
function bmkgUtcMs(s){
  var m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(s || ''));
  if(!m) return NaN;
  return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0));
}
/* epoch ms + zone offset (minutes) → "YYYY-MM-DDTHH:MM" local wall clock */
function bmkgIso(ms, offMin){
  var d = new Date(ms + offMin * 60000);
  return d.getUTCFullYear() + '-' + bmkgPad(d.getUTCMonth() + 1) + '-' + bmkgPad(d.getUTCDate()) +
    'T' + bmkgPad(d.getUTCHours()) + ':' + bmkgPad(d.getUTCMinutes());
}
function bmkgTemp(c, unit){
  var f = String(unit || '').toLowerCase().charAt(0) === 'f';
  return Math.round(f ? c * 9 / 5 + 32 : c);
}
function bmkgLoad(key){
  var s, o = null;
  try{ s = gs(key); o = s ? JSON.parse(s) : null; }catch(e){ o = null; }
  return (o && typeof o === 'object') ? o : {};
}
function bmkgSave(key, obj){ try{ ss(key, JSON.stringify(obj)); }catch(e){} }

/* BMKG text first: its numeric codes changed between the old XML feed and the
   live JSON (61 means Light Rain now). Numbers are only a fallback. */
function bmkgWmoFromText(s){
  s = String(s || '').toLowerCase();
  if(!s) return null;
  if(/thunder|petir/.test(s)) return 95;
  if(/(heavy|lebat)/.test(s) && /(rain|hujan)/.test(s)) return 65;
  if(/(moderate|sedang)/.test(s) && /(rain|hujan)/.test(s)) return 63;
  if(/(light|ringan)/.test(s) && /(rain|hujan)/.test(s)) return 61;
  if(/(shower|isolated|lokal)/.test(s)) return 80;
  if(/(rain|hujan)/.test(s)) return 63;
  if(/(fog|kabut|haze|smoke|kabur|asap)/.test(s)) return 45;
  if(/(overcast|berawan tebal)/.test(s)) return 3;
  if(/(partly|cerah berawan)/.test(s)) return 2;
  if(/(mostly cloudy|berawan)/.test(s)) return 3;
  if(/(sunny|clear|cerah)/.test(s)) return 0;
  return null;
}
var BMKG_NUM_TO_WMO = { 0:0, 1:0, 2:2, 3:3, 4:3, 5:45, 10:45, 45:45, 60:61, 61:61, 63:65, 80:80, 95:95, 97:95 };
function bmkgWmo(code, desc){
  var w = bmkgWmoFromText(desc);
  if(w !== null) return w;
  w = BMKG_NUM_TO_WMO[code];
  return (typeof w === 'number') ? w : 3;
}

function bmkgNorm(s){
  s = String(s || '').toLowerCase();
  s = s.replace(/\b(kota|kabupaten|city|regency|administrasi)\b/g, ' ');
  s = s.replace(/\bkab\b\.?/g, ' ');
  s = s.replace(/[^a-z ]/g, ' ');
  return s.replace(/\s+/g, ' ').replace(/^ | $/g, '');
}
function bmkgKm(la1, lo1, la2, lo2){
  var R = Math.PI / 180, dLa = (la2 - la1) * R, dLo = (lo2 - lo1) * R;
  var a = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
    Math.cos(la1 * R) * Math.cos(la2 * R) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
  return 12742 * Math.asin(Math.min(1, Math.sqrt(a)));
}
/* geo = { city, cityName, lat, lon, cc, label, adm4? } — adm4 is an optional pin */
function bmkgResolve(geo){
  var names = [], i, j, row, aliases, best = null, bestKm = 1e9, km, lat, lon;
  if(!geo) return null;
  if(geo.adm4 && /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/.test(String(geo.adm4))) return { adm4:String(geo.adm4), by:'pinned' };
  if(geo.cityName) names.push(bmkgNorm(geo.cityName));
  if(geo.city) names.push(bmkgNorm(geo.city));
  if(geo.label) names.push(bmkgNorm(String(geo.label).split(',')[0]));
  for(i = 0; i < BMKG_CITIES.length; i++){
    row = BMKG_CITIES[i];
    aliases = row[0].split('|');
    for(j = 0; j < names.length; j++){
      if(names[j] && aliases.indexOf(names[j]) >= 0) return { adm4:row[1], by:'name' };
    }
  }
  if(geo.lat !== null && geo.lat !== undefined && geo.lon !== null && geo.lon !== undefined){
    lat = +geo.lat; lon = +geo.lon;
    if(isFinite(lat) && isFinite(lon)){
      for(i = 0; i < BMKG_CITIES.length; i++){
        km = bmkgKm(lat, lon, BMKG_CITIES[i][2], BMKG_CITIES[i][3]);
        if(km < bestKm){ bestKm = km; best = BMKG_CITIES[i]; }
      }
      if(best && bestKm <= BMKG_RADIUS_KM) return { adm4:best[1], by:'near' };
    }
  }
  return null;
}

/* sunrise/sunset (BMKG has none): NOAA almanac, close to a minute for Jakarta */
function bmkgSunUT(doy, lat, lon, rise){
  var D = Math.PI / 180, lngH = lon / 15, t, M, L, RA, sinD, cosD, cosH, H, T;
  t = doy + ((rise ? 6 : 18) - lngH) / 24;
  M = 0.9856 * t - 3.289;
  L = M + 1.916 * Math.sin(M * D) + 0.020 * Math.sin(2 * M * D) + 282.634;
  L = ((L % 360) + 360) % 360;
  RA = Math.atan(0.91764 * Math.tan(L * D)) / D;
  RA = ((RA % 360) + 360) % 360;
  RA = (RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90)) / 15;
  sinD = 0.39782 * Math.sin(L * D);
  cosD = Math.cos(Math.asin(sinD));
  cosH = (Math.cos(90.833 * D) - sinD * Math.sin(lat * D)) / (cosD * Math.cos(lat * D));
  if(cosH > 1 || cosH < -1) return null;
  H = (rise ? 360 - Math.acos(cosH) / D : Math.acos(cosH) / D) / 15;
  T = H + RA - 0.06571 * t - 6.622;
  return (((T - lngH) % 24) + 24) % 24;
}
function bmkgSun(lat, lon, now, offMin){
  var d = new Date(now + offMin * 60000), y = d.getUTCFullYear(), mo = d.getUTCMonth(), dd = d.getUTCDate();
  var base = Date.UTC(y, mo, dd), doy = Math.floor((base - Date.UTC(y, 0, 0)) / 86400000);
  var start = base - offMin * 60000, out = { rise:null, set:null }, ut;
  function place(h){
    var x = base + h * 3600000;
    while(x < start) x += 86400000;
    while(x >= start + 86400000) x -= 86400000;
    return bmkgIso(x, offMin);
  }
  if(!isFinite(lat) || !isFinite(lon)) return out;
  ut = bmkgSunUT(doy, lat, lon, true);  if(ut !== null) out.rise = place(ut);
  ut = bmkgSunUT(doy, lat, lon, false); if(ut !== null) out.set = place(ut);
  return out;
}

/* live shape: { data:[ { lokasi:{...}, cuaca:[ [slot,…], [slot,…], [slot,…] ] } ] } */
function bmkgParse(json, adm4){
  var d0 = json && json.data && json.data[0], days, flat = [], i, j, day, it, ms, lms, off = null, loc, slots = [], tz;
  if(!d0 || !d0.cuaca || !d0.cuaca.length) throw new Error('bmkg-empty');
  days = d0.cuaca;
  for(i = 0; i < days.length; i++){
    day = Object.prototype.toString.call(days[i]) === '[object Array]' ? days[i] : [days[i]];
    for(j = 0; j < day.length; j++) flat.push(day[j]);
  }
  for(i = 0; i < flat.length; i++){
    it = flat[i];
    if(!it || typeof it.t !== 'number') continue;
    ms = bmkgUtcMs(it.utc_datetime || it.datetime);
    if(!isFinite(ms)) continue;
    if(off === null && it.local_datetime){
      lms = bmkgUtcMs(it.local_datetime);
      if(isFinite(lms)) off = Math.round((lms - ms) / 60000);
    }
    slots.push({
      ms:ms, t:it.t, w:+it.weather,
      d:String(it.weather_desc_en || it.weather_desc || ''),
      tp:+it.tp || 0, hu:+it.hu || 0
    });
  }
  if(!slots.length) throw new Error('bmkg-empty');
  slots.sort(function(a, b){ return a.ms - b.ms; });
  loc = d0.lokasi || json.lokasi || {};
  if(off === null){
    tz = /^([+-])(\d{2}):?(\d{2})$/.exec(String(loc.timezone || ''));
    off = tz ? (tz[1] === '-' ? -1 : 1) * (+tz[2] * 60 + +tz[3]) : 420;
  }
  return {
    adm4:adm4, ts:Date.now(), off:off, slots:slots,
    loc:{ desa:loc.desa || '', kecamatan:loc.kecamatan || '', kotkab:loc.kotkab || '', provinsi:loc.provinsi || '' }
  };
}
function bmkgMergeSlots(prev, next, now){
  var out = [], first = next.length ? next[0].ms : 0, i;
  if(prev){
    for(i = 0; i < prev.length; i++){
      if(prev[i].ms >= now - 12 * 3600000 && prev[i].ms < first) out.push(prev[i]);
    }
  }
  return out.concat(next);
}
function bmkgStore(adm4, entry){
  var all = bmkgLoad(BMKG_KEY_RAW), keys = [], k, oldest, i;
  all[adm4] = entry;
  for(k in all){ if(Object.prototype.hasOwnProperty.call(all, k)) keys.push(k); }
  while(keys.length > BMKG_MAX_CACHED){
    oldest = keys[0];
    for(i = 1; i < keys.length; i++){ if(all[keys[i]].ts < all[oldest].ts) oldest = keys[i]; }
    delete all[oldest];
    keys.splice(keys.indexOf(oldest), 1);
  }
  bmkgSave(BMKG_KEY_RAW, all);
}
function bmkgIsBad(adm4, now){
  var b = bmkgLoad(BMKG_KEY_BAD)[adm4];
  return !!(b && (now - b.ts) < b.ttl);
}
function bmkgMarkBad(adm4, err){
  var all = bmkgLoad(BMKG_KEY_BAD), m = String((err && err.message) || err || '');
  all[adm4] = { ts:Date.now(), ttl:(/\b(400|404|410)\b|bmkg-empty/.test(m)) ? BMKG_BAD_LONG_MS : BMKG_BAD_SHORT_MS };
  bmkgSave(BMKG_KEY_BAD, all);
}

/* one request per adm4 at a time; cache shared across tabs via localStorage */
function bmkgEntry(adm4, force){
  var now = Date.now(), hit = bmkgLoad(BMKG_KEY_RAW)[adm4], ttlMin, usable, fresh;
  ttlMin = Math.max(BMKG_RAW_TTL_MIN, Math.round((typeof weatherTTL === 'function' ? weatherTTL() : 1800000) / 60000) || 30);
  usable = !!(hit && hit.slots && hit.slots.length && hit.slots[hit.slots.length - 1].ms > now);
  fresh = usable && (now - hit.ts) < ttlMin * 60000;
  if(fresh && !force) return Promise.resolve(hit);
  if(usable && force && (now - hit.ts) < BMKG_MIN_GAP_MS) return Promise.resolve(hit);
  if(bmkgIsBad(adm4, now)) return usable ? Promise.resolve(hit) : Promise.reject(new Error('bmkg-backoff'));
  if(bmkgInflight[adm4]) return bmkgInflight[adm4];
  bmkgInflight[adm4] = fetchJSON(BMKG_URL + encodeURIComponent(adm4), BMKG_TIMEOUT_MS).then(function(json){
    var entry = bmkgParse(json, adm4), prev = bmkgLoad(BMKG_KEY_RAW)[adm4];
    entry.slots = bmkgMergeSlots(prev && prev.slots, entry.slots, Date.now());
    bmkgStore(adm4, entry);
    return entry;
  }).then(function(entry){
    bmkgInflight[adm4] = null;
    return entry;
  }, function(err){
    bmkgInflight[adm4] = null;
    bmkgMarkBad(adm4, err);
    if(usable) return hit;   /* stale but still covers "now": better than nothing */
    throw err;
  });
  return bmkgInflight[adm4];
}

function bmkgRain(slots, now, off){
  var out = { any:false, ms:0, hm:'', mm:0 }, i, s;
  for(i = 0; i < slots.length; i++){
    s = slots[i];
    if(s.ms < now - 5400000 || s.ms > now + 86400000) continue;
    if(bmkgWmo(s.w, s.d) >= 61){
      out.any = true;
      if(!out.ms){ out.ms = s.ms; out.hm = bmkgIso(s.ms, off).substr(11, 5); }
      if(s.tp > out.mm) out.mm = s.tp;
    }
  }
  return out;
}
/* BMKG reports millimetres of rain per slot, which means nothing to most people,
   so the card and the hourly tiles say it in plain words instead. Each slot
   already carries its own weather description, so use BMKG's own words; the
   millimetre figure is only a fallback when there is no description. */
function bmkgRainWord(code, mm){
  var w = WMO[code];
  if(Number(code) >= 61 && w && w[1]) return w[1];
  var n = Number(mm);
  if(!isFinite(n) || n <= 0) return 'Rain';
  if(n < 2) return 'Light rain';
  if(n < 10) return 'Rain';
  return 'Heavy rain';
}
function bmkgRainLabel(d){
  if(Number(d.rainMm) > 0) return bmkgRainWord(d.code, d.rainMm);
  if(d.rainAt) return 'Rain later';
  return 'No rain expected';
}
function bmkgToCache(entry, geo, unit, now){
  var slots = entry.slots || [], off = entry.off, i, s, cur = null, best = 1e18, dd, today, dayS = [], winS = [];
  var hi = -1e9, lo = 1e9, segs = [], rn, sun;
  for(i = 0; i < slots.length; i++){
    dd = Math.abs(slots[i].ms - now);
    if(dd < best){ best = dd; cur = slots[i]; }
  }
  if(!cur || best > 4.5 * 3600000) return null;   /* stale: caller falls back to Open-Meteo */
  today = bmkgIso(now, off).substr(0, 10);
  for(i = 0; i < slots.length; i++){
    s = slots[i];
    if(bmkgIso(s.ms, off).substr(0, 10) === today) dayS.push(s);
    if(s.ms >= now - 5400000 && s.ms <= now + 86400000) winS.push(s);
  }
  if(dayS.length < 4) dayS = winS;   /* BMKG drops past slots: use a rolling 24 h */
  if(!dayS.length) dayS = [cur];
  for(i = 0; i < dayS.length; i++){
    if(dayS[i].t > hi) hi = dayS[i].t;
    if(dayS[i].t < lo) lo = dayS[i].t;
  }
  for(i = 0; i < slots.length && segs.length < 4; i++){
    s = slots[i];
    if(s.ms > cur.ms){
      segs.push({
        lbl: bmkgIso(s.ms, off).substr(11, 2) + ':00',
        temp: bmkgTemp(s.t, unit),
        code: bmkgWmo(s.w, s.d),
        rain: null,
        rainMm: s.tp
      });
    }
  }
  rn = bmkgRain(slots, now, off);
  /* The card line must agree with the current slot. BMKG can carry rain in a
     later slot while the nearest one is dry, so the amount shown is the current
     slot's own tp; a future chance becomes "Rain later" plus the note. */
  var nowRain = Number(cur.tp) > 0 && bmkgWmo(cur.w, cur.d) >= 61;
  sun = bmkgSun(+geo.lat, +geo.lon, now, off);
  return {
    v:2, city:geo.city, unit:unit, ts:now, cityName:geo.cityName, label:geo.label,
    temp:bmkgTemp(cur.t, unit),
    code:bmkgWmo(cur.w, cur.d),
    rain:null, rainAbsent:!nowRain && !rn.any,
    rainMm:nowRain ? Number(cur.tp) : 0,
    rainAt:(!nowRain && rn.any) ? bmkgIso(rn.ms, off) : null,
    rainHM:(!nowRain && rn.any) ? rn.hm : null,
    rainAtP:null,
    utcOffset:off * 60,
    hi:bmkgTemp(hi, unit), lo:bmkgTemp(lo, unit),
    sunrise:sun.rise, sunset:sun.set,
    segs:segs,
    src:'bmkg', adm4:entry.adm4, desc:cur.d
  };
}
/* resolves with a ready-to-cache object, or rejects (never renders) → caller falls back */
function bmkgWeather(geo, unit, force){
  var hit;
  if(!geo || String(geo.cc || '').toUpperCase() !== 'ID') return Promise.reject(new Error('bmkg-skip'));
  hit = bmkgResolve(geo);
  if(!hit) return Promise.reject(new Error('bmkg-noadm4'));
  return bmkgEntry(hit.adm4, force).then(function(entry){
    var d = bmkgToCache(entry, geo, unit, Date.now());
    if(!d) throw new Error('bmkg-stale');
    d.by = hit.by;
    return d;
  });
}

function loadWeather(force){
  if(!isShown('weather')) return null;
  var city = (gs(K.weatherCity) || '').trim();
  var unit = gs(K.weatherUnit) || 'c';

  if(!city){
    setText($('w-city'),'Location');
    setText($('w-icon'),'📍');
    setText($('w-temp'),'--');
    setText($('w-unit'), (gs(K.weatherUnit) === 'f') ? 'F' : 'C');
    setText($('w-desc'),'Choose a city');
    setText($('w-rain'),'');
    var emptySrc = $('w-src'); if(emptySrc) emptySrc.hidden = true;
    _rainAt = 0; _rainAtP = 0; _rainAbsent = false; _rainChance = null; renderRainNote();
    setText($('w-updated'),'');
    setWeatherStatus('No city chosen yet.');
    return null;
  }

  var cache = parseJSON(gs(K.weatherCache),null);
  var geoNow = parseJSON(gs(K.weatherGeo), null);
  var geoCountry = (geoNow && geoNow.city === city && geoNow.cc) ? String(geoNow.cc).toUpperCase() : '';
  var cacheMatches = !!(cache && cache.v === 2 && cache.city === city && cache.unit === unit);
  var cacheFresh = cacheMatches && (Date.now() - cache.ts) < weatherTTL();
  /* An Indonesian city belongs on BMKG, so a plain Open-Meteo cache must not
     stop the first BMKG attempt. A geo saved before country codes existed also
     has to be refreshed, otherwise BMKG is skipped forever. */
  var cacheOwned = !!(cacheMatches && ((cache.src === 'bmkg') ||
    (geoCountry && geoCountry !== 'ID')));
  if(cacheFresh && cacheOwned && !force){
    renderWeather(cache);
    setWeatherStatus(cache.label + ' \u00b7 cached');
    return null;
  }

  /* Stale-while-revalidate: show whatever we already know instead of a tiny
     "Updating..." placeholder. The card keeps its size while the fetch runs,
     which is what made it jump after five minutes or on the next day. */
  if(cacheMatches){
    renderWeather(cache);
    setWeatherStatus(cache.label + ' \u00b7 updating\u2026');
  } else {
    /* genuinely first open: fill every line so the card never looks broken */
    setText($('w-city'), city);
    setText($('w-icon'), '\u00b7');
    setText($('w-temp'), '--');
    setText($('w-unit'), (unit === 'f') ? 'F' : 'C');
    setText($('w-desc'), 'Updating...');
    setText($('w-rain'), '');
    setText($('w-raintime'), '');
    setText($('w-updated'), 'If this lingers, your connection may be resting.');
    _rainAt = 0; _rainAtP = 0; _rainAbsent = false; _rainChance = null;
  }

  /* one request at a time worth showing: the newest one owns the busy state */
  var req = ++_weatherReq;
  setWeatherBusy(true);

  var geo = parseJSON(gs(K.weatherGeo),null);
  /* a geo saved before country codes existed must be refreshed, or BMKG is
     skipped forever for Indonesian cities */
  var geoP = (geo && geo.city === city && geo.lat != null && geo.lon != null && geo.cc)
    ? Promise.resolve(geo) : geocode(city);

  geoP.then(function(g){
    ss(K.weatherGeo,JSON.stringify(g));
    /* Indonesia first: BMKG by adm4, then the same Open-Meteo path as before.
       Every BMKG failure resolves to null, so this can never break the card. */
    var viaBmkg = (String(g.cc || '').toUpperCase() === 'ID')
      ? bmkgWeather(g, unit, force).then(null, function(e){
          try{ console.info('BMKG unavailable:', (e && e.message) || e); }catch(_e){}
          return null;
        })
      : Promise.resolve(null);
    return viaBmkg.then(function(bd){
      if(bd){
        ss(K.weatherCache,JSON.stringify(bd));
        renderWeather(bd);
        setWeatherStatus(bd.label + ' \u00b7 BMKG');
        return bd;
      }
    var u = 'https://api.open-meteo.com/v1/forecast?latitude=' + g.lat + '&longitude=' + g.lon +
            '&current=temperature_2m,weather_code,precipitation,rain' +
            '&hourly=precipitation_probability,precipitation,rain,temperature_2m,weather_code' +
            '&daily=precipitation_probability_max,weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset' +
            '&timezone=auto&forecast_days=1' +
            '&temperature_unit=' + (unit === 'f' ? 'fahrenheit' : 'celsius');
    return fetchJSON(u,9000).then(function(j){
      var cur = j.current || {};
      var daily = j.daily || {};
      var hourly = j.hourly || {};
      var hTimes = hourly.time || [];
      var hProb  = hourly.precipitation_probability || [];
      var hRain  = hourly.rain || [];
      var hPrec  = hourly.precipitation || [];
      var hTemp  = hourly.temperature_2m || [];
      var hCode  = hourly.weather_code || [];
      /* Open-Meteo's daily max is literally the highest hourly probability.
         Pick that same peak hour so the headline % and the time agree. */
      var bestT = 0, bestP = -1, wetT = 0, wetP = 0;
      var bestHM = '', wetHM = '';
      for(var i = 0; i < hTimes.length; i++){
        var t = new Date(hTimes[i]).getTime();
        if(isNaN(t) || t < Date.now() - 30 * 60000) continue;
        var p = Number(hProb[i]);
        if(isNaN(p)) p = 0;
        /* the "HH:MM" slice is the city-local wall time, exactly as Open-Meteo
           sends it — keep it as text so no zone parse can shift it */
        var hm = String(hTimes[i]).substr(11, 5);
        if(p > bestP){ bestP = p; bestT = t; bestHM = hm; }
        if(!wetT && (p >= 40 || Number(hRain[i] || 0) >= 0.2 || Number(hPrec[i] || 0) >= 0.2)){
          wetT = t; wetP = p; wetHM = hm;
        }
      }
      var rainAt = 0, rainAtP = 0, rainHM = '';
      if(bestP >= 20){ rainAt = bestT; rainAtP = bestP; rainHM = bestHM; }
      else if(wetT){ rainAt = wetT; rainAtP = wetP; rainHM = wetHM; }
      var dailyMax = (daily.precipitation_probability_max && daily.precipitation_probability_max[0] != null)
                ? Number(daily.precipitation_probability_max[0]) : null;
      var chance = (bestP >= 0) ? bestP : dailyMax;
      /* four moments of the day for the expanded weather window */
      var segs = [];
      [{l:'Morning',h:6},{l:'Noon',h:12},{l:'Evening',h:18},{l:'Night',h:22}].forEach(function(sd){
        var want = 'T' + pad2(sd.h) + ':';
        for(var k = 0; k < hTimes.length; k++){
          if(String(hTimes[k]).indexOf(want) >= 0){
            segs.push({
              lbl: sd.l,
              temp: (hTemp[k] == null ? null : Number(hTemp[k])),
              code: (hCode[k] == null ? null : Number(hCode[k])),
              rain: (hProb[k] == null ? null : Number(hProb[k]))
            });
            break;
          }
        }
      });
      var d = {
        v: 2,
        city: city, unit: unit, ts: Date.now(),
        cityName: g.cityName || city,
        label: g.label || city,
        temp: cur.temperature_2m,
        code: cur.weather_code,
        rain: chance,
        rainAt: rainAt,
        rainHM: rainHM,
        rainAtP: rainAtP,
        rainAbsent: (!rainAt && bestP >= 0 && bestP < 5),
        utcOffset: j.utc_offset_seconds,
        hi: (daily.temperature_2m_max && daily.temperature_2m_max[0] != null) ? Number(daily.temperature_2m_max[0]) : null,
        lo: (daily.temperature_2m_min && daily.temperature_2m_min[0] != null) ? Number(daily.temperature_2m_min[0]) : null,
        sunrise: (daily.sunrise && daily.sunrise[0]) || '',
        sunset: (daily.sunset && daily.sunset[0]) || '',
        segs: segs
      };
      ss(K.weatherCache,JSON.stringify(d));
      renderWeather(d);
      setWeatherStatus(d.label + ' · Open-Meteo');
      return d;
    });
    });
  }).catch(function(err){
    if(err && err.code === 'CITY_NOT_FOUND'){
      setText($('w-city'), city);
      setText($('w-icon'), '📍');
      setText($('w-temp'), '--');
      setText($('w-desc'), 'City not found \u2014 check the spelling');
      setText($('w-updated'), 'A nearby bigger town, or the country, often helps.');
      setWeatherStatus('City not found \u2014 check the spelling.');
      var noSrc = $('w-src'); if(noSrc) noSrc.hidden = true;
      return null;
    }
    if(cache && cache.city === city) renderWeather(cache);
    else{
      setText($('w-desc'), 'Open-Meteo is quiet right now');
      setText($('w-updated'), 'A quick connection check should help.');
      var quietSrc = $('w-src'); if(quietSrc) quietSrc.hidden = true;
    }
    setWeatherStatus('Couldn\u2019t load the weather. A quick connection check should help.');
    return null;
  }).then(function(d){
    /* only the newest request owns the busy state */
    if(req === _weatherReq){
      setWeatherBusy(false);
      if(d && $('weather-modal') && $('weather-modal').classList.contains('open')) weatherJustUpdated();
    }
    return d;
  });
}

/* refresh on the user's schedule (minutes, minimum 5) */
var _weatherTimer = null;
function startWeatherTimer(){
  if(_weatherTimer){ clearInterval(_weatherTimer); _weatherTimer = null; }
  if(!isShown('weather') || !(gs(K.weatherCity) || '').trim()) return;
  _weatherTimer = setInterval(function(){
    if(document.hidden) return;
    loadWeather(true);
  }, weatherTTL());
}

/* ══════════════════════════════════════════
   STOCKS  (watchlist via Yahoo Finance chart endpoint — keyless, delayed)
   Refreshes on a slow loop while visible and pauses with the tab.
══════════════════════════════════════════ */
var STOCKS_DEFAULT = ['^JKSE','BBCA.JK','AAPL','MSFT'];
var CRYPTO_DEFAULT = ['BTC-USD','ETH-USD','SOL-USD','XRP-USD'];
/* Currencies offered for display conversion — the famous ones only. "Native"
   keeps every symbol in its own currency, which is the calm default. Rates come
   from open.er-api.com (keyless, CORS `*`, so no host permission is needed). */
var STOCK_CURRENCIES = [
  ['native','Native (each symbol)'],
  ['IDR','IDR · Rupiah'],
  ['USD','USD · US Dollar'],
  ['EUR','EUR · Euro'],
  ['GBP','GBP · Pound'],
  ['JPY','JPY · Yen'],
  ['CNY','CNY · Yuan'],
  ['AUD','AUD · Australian Dollar'],
  ['SGD','SGD · Singapore Dollar'],
  ['INR','INR · Rupee'],
  ['MYR','MYR · Ringgit'],
  ['KRW','KRW · Won'],
  ['HKD','HKD · Hong Kong Dollar'],
  ['THB','THB · Baht'],
  ['PHP','PHP · Peso'],
  ['CAD','CAD · Canadian Dollar'],
  ['CHF','CHF · Franc']
];
var FX_TTL = 6 * 60 * 60 * 1000;
var _fxRates = null, _fxReq = null;
function stocksCurrency(){
  var c = String(gs(K.stocksCurrency) || 'native').toUpperCase();
  for(var i = 0; i < STOCK_CURRENCIES.length; i++){
    if(STOCK_CURRENCIES[i][0] === c) return STOCK_CURRENCIES[i][0];
  }
  return 'native';
}
function fxCache(){
  if(_fxRates) return _fxRates;
  var c = parseJSON(gs(K.fxCache), null);
  if(c && c.rates) _fxRates = c;
  return _fxRates;
}
/* every rate is "X per 1 USD", so from→to is rates[to] / rates[from] */
function fxRate(from, to){
  from = String(from || '').toUpperCase();
  to = String(to || '').toUpperCase();
  if(!from || !to) return null;
  if(from === to) return 1;
  var c = fxCache();
  if(!c || !c.rates) return null;
  var a = Number(c.rates[from]), b = Number(c.rates[to]);
  if(!(a > 0) || !(b > 0)) return null;
  return b / a;
}
function ensureFxRates(){
  if(stocksCurrency() === 'native') return null;
  var c = fxCache();
  if(c && c.rates && (Date.now() - c.ts) < FX_TTL) return Promise.resolve(c);
  if(_fxReq) return _fxReq;
  _fxReq = fetchJSON('https://open.er-api.com/v6/latest/USD', 9000).then(function(j){
    _fxReq = null;
    if(!j || j.result !== 'success' || !j.rates) throw new Error('fx-failed');
    var out = { ts: Date.now(), rates: j.rates };
    _fxRates = out;
    ss(K.fxCache, JSON.stringify(out));
    /* rates landed after the prices — repaint with the converted values */
    var cache = parseJSON(gs(K.stocksCache), null);
    if(cache){ renderStocks(cache); renderStocksWindow(cache); }
    return out;
  }).catch(function(e){
    _fxReq = null;
    /* leave the native prices in place and try again on the next refresh */
    return null;
  });
  return _fxReq;
}
/* the displayed number: original, or converted to the chosen currency */
function stockPriceText(r){
  var price = (r && r.price != null) ? Number(r.price) : NaN;
  if(!isFinite(price)) return '\u2014';
  var target = stocksCurrency();
  if(target !== 'native'){
    var rate = fxRate(r && r.cur, target);
    if(rate != null) return fmtStockPrice(price * rate);
  }
  return fmtStockPrice(price);
}
/* the small currency tag after the number; blank when nothing was converted */
function stockCurrencyTag(r){
  var target = stocksCurrency();
  if(target === 'native') return '';
  var rate = fxRate(r && r.cur, target);
  return rate != null ? target : '';
}
function stocksOn(){ return gs(K.showStocks) === '1'; }
function stocksMarket(){
  return gs(K.stocksMarket) === 'crypto' ? 'crypto' : 'stock';
}
function stocksListKey(){
  return stocksMarket() === 'crypto' ? K.cryptoList : K.stocksList;
}
function stocksDefaults(){
  return stocksMarket() === 'crypto' ? CRYPTO_DEFAULT : STOCKS_DEFAULT;
}
function stocksList(){
  var raw = parseJSON(gs(stocksListKey()), null);
  if(!raw || !raw.length) raw = stocksDefaults().slice();
  return raw.map(function(s){ return String(s).trim().toUpperCase(); })
            .filter(validStockSymbol).slice(0, 8);
}
function stocksEveryMin(){
  var m = parseInt(gs(K.stocksEvery), 10);
  if(!(m > 0)) m = 5;
  return Math.max(1, Math.min(60, m));
}
function stockLabel(sym){
  var map = { '^JKSE':'IHSG', '^GSPC':'S&P 500', '^IXIC':'Nasdaq', '^DJI':'Dow' };
  if(map[sym]) return map[sym];
  if(/-USD$/.test(sym)) return String(sym).replace(/-USD$/, '');
  return String(sym || '').replace(/\.JK$/, '');
}
function validStockSymbol(sym){
  return /^[A-Z0-9.\-=^]{1,14}$/.test(sym);
}
function fmtStockPrice(v){
  if(v == null || !isFinite(v)) return '\u2014';
  var a = Math.abs(v), d;
  if(a >= 1000) d = 0;
  else if(a >= 1) d = 2;
  else if(a >= 0.01) d = 4;
  else d = 6;
  try{ return Number(v).toLocaleString(undefined, { minimumFractionDigits:d, maximumFractionDigits:d }); }
  catch(e){ return Number(v).toFixed(d); }
}
function stockSpark(closes){
  var vals = [];
  for(var i = 0; i < closes.length; i++){
    var v = Number(closes[i]);
    if(isFinite(v)) vals.push(v);
  }
  if(vals.length < 2) return '';
  var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
  var span = (max - min) || 1;
  var w = 52, h = 16, pts = [];
  for(var k = 0; k < vals.length; k++){
    var x = (k / (vals.length - 1)) * w;
    var y = h - ((vals[k] - min) / span) * (h - 2) - 1;
    pts.push(x.toFixed(1) + ',' + y.toFixed(1));
  }
  var up = vals[vals.length - 1] >= vals[0];
  return '<svg class="sk-spark" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true">' +
         '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + (up ? '#7fe0a8' : '#ff9aa4') +
         '" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}
function setStocksNote(msg){
  var n = $('sk-note');
  if(n) setText(n, msg || 'Live');
}
function stocksHasOpen(data){
  var rows = (data && data.rows) || [];
  for(var i = 0; i < rows.length; i++){
    if(rows[i] && rows[i].open) return true;
  }
  return false;
}
/* the source label tells the truth: crypto trades non-stop, stocks only while
   their exchange session is open, and a failed refresh keeps the last close. */
function applyStocksLabels(data){
  var crypto = stocksMarket() === 'crypto';
  var note, sub;
  if(data && data.rateLimited){
    note = 'Busy'; sub = 'Yahoo is rate-limiting \u00b7 showing the last close';
  } else if(data && data.offline){
    note = 'Offline'; sub = 'Offline \u00b7 showing the last close';
  } else if(data && data.rows && data.rows.length && stocksPricedRows(data) === 0){
    note = 'Updating\u2026'; sub = 'Yahoo Finance';
  } else if(crypto){
    note = 'Live'; sub = 'Live \u00b7 Yahoo Finance';
  } else if(stocksHasOpen(data)){
    note = 'Delayed'; sub = 'Delayed \u00b7 Yahoo Finance';
  } else {
    note = 'Closed'; sub = 'Last close \u00b7 Yahoo Finance';
  }
  var n = $('sk-note');
  if(n) setText(n, note);
  var ws = $('stockswin-sub');
  if(ws) setText(ws, sub);
  var wsrc = $('stockswin-src');
  var src = stocksCurrency() === 'native' ? 'Source: Yahoo Finance'
    : 'Source: Yahoo Finance \u00b7 ' + stocksCurrency() + ' via er-api';
  if(wsrc) setText(wsrc, src);
  var cardSrc = $('sk-src');
  if(cardSrc) setText(cardSrc, 'Source: Yahoo Finance');
}
function renderStocks(data){
  var host = $('sk-list');
  if(!host) return;
  var rows = (data && data.rows) || [];
  if(!rows.length){
    host.innerHTML = '<div class="sk-empty">Add a few symbols in Settings.</div>';
    applyStocksLabels(data);
    applySizeScale('stocks');
    return;
  }
  var html = '';
  rows.forEach(function(r){
    var has = r.price != null && isFinite(r.price);
    var up = Number(r.pct || 0) >= 0;
    var pct = has ? ((up ? '+' : '') + Number(r.pct || 0).toFixed(2) + '%') : '\u2014';
    html += '<div class="sk-row' + (r.stale ? ' stale' : '') + '"' + (r.stale ? ' title="Last known price"' : '') + '>' +
      '<span class="sk-sym" title="' + holEsc(r.name || r.symbol) + '">' + holEsc(stockLabel(r.symbol)) + '</span>' +
      '<span class="sk-px">' + holEsc(stockPriceText(r)) + (stockCurrencyTag(r) ? '<span class="sk-cur">' + stockCurrencyTag(r) + '</span>' : '') + '</span>' +
      '<span class="sk-spark-slot">' + stockSpark(r.spark || []) + '</span>' +
      '<span class="sk-chg ' + (has ? (up ? 'up' : 'down') : 'flat') + '">' +
        (has ? (up ? '\u25B2' : '\u25BC') + ' ' : '') + pct + '</span>' +
    '</div>';
  });
  host.innerHTML = html;
  applyStocksLabels(data);
  /* fixed base => --wbw never follows the latest price width, so symbols stay
     visible and the numbers scale with the card instead of overlapping */
  applySizeScale('stocks');
}
var _stockReq = 0;
var _stocksRetry = null;
function scheduleStocksRetry(ms){
  if(_stocksRetry) return;
  _stocksRetry = setTimeout(function(){
    _stocksRetry = null;
    if(!stocksOn() || !isShown('stocks')) return;
    loadStocks(true);
  }, ms || 45000);
}
function stocksPricedRows(data){
  var rows = (data && data.rows) || [], n = 0;
  for(var i = 0; i < rows.length; i++){
    if(rows[i] && rows[i].price != null && isFinite(rows[i].price)) n++;
  }
  return n;
}
function stockSessionOpen(meta){
  var reg = meta && meta.currentTradingPeriod && meta.currentTradingPeriod.regular;
  if(!reg || !reg.start || !reg.end) return null;
  var now = Math.floor(Date.now() / 1000);
  if(now < reg.start) return false;
  return now <= reg.end;
}
function loadStocks(force){
  if(!stocksOn() || !isShown('stocks')) return null;
  var list = stocksList();
  var cache = parseJSON(gs(K.stocksCache), null);
  var same = !!(cache && cache.market === stocksMarket() && cache.symbols === list.join(','));
  var fresh = !!(same && cache.ts && !cache.offline && stocksPricedRows(cache) > 0 &&
    (Date.now() - cache.ts) < stocksEveryMin() * 60000);
  if(fresh && !force){
    renderStocks(cache);
    renderStocksWindow(cache);
    return null;
  }
  /* Stale-while-revalidate: paint the last watchlist immediately, then update
     it in place. The old code blanked the card, so its measured base shrank and
     the grid columns collapsed when the data finally arrived. */
  if(same && cache.rows && cache.rows.length){
    renderStocks(cache);
    renderStocksWindow(cache);
  }
  var req = ++_stockReq;
  setStocksNote('Updating\u2026');
  var jobs = list.map(function(sym, idx){
    var u = 'https://query1.finance.yahoo.com/v8/finance/chart/' +
            encodeURIComponent(sym) + '?range=1d&interval=15m';
    /* stagger the requests a little; Yahoo starts answering 429 when a new tab
       fires the whole watchlist at once */
    return new Promise(function(res){ setTimeout(res, idx * 400); }).then(function(){
      return fetchJSON(u, 9000).then(function(j){
        var r = j && j.chart && j.chart.result && j.chart.result[0];
        if(!r || !r.meta) throw new Error('no data');
        var meta = r.meta;
        var q = (r.indicators && r.indicators.quote && r.indicators.quote[0]) || {};
        var closes = q.close || [];
        var price = Number(meta.regularMarketPrice);
        var prev = Number(meta.chartPreviousClose != null ? meta.chartPreviousClose : meta.previousClose);
        /* markets can drop regularMarketPrice between sessions; the last real
           close in the series is still a valid answer */
        if(!isFinite(price) || price === 0){
          for(var ci = closes.length - 1; ci >= 0; ci--){
            var cv = Number(closes[ci]);
            if(isFinite(cv) && cv !== 0){ price = cv; break; }
          }
        }
        var pct = (meta.regularMarketChangePercent != null)
          ? Number(meta.regularMarketChangePercent)
          : ((isFinite(price) && isFinite(prev) && prev !== 0) ? ((price - prev) / prev) * 100 : 0);
        return {
          symbol: sym,
          price: (isFinite(price) && price !== 0) ? price : null,
          pct: isFinite(pct) ? pct : 0,
          cur: meta.currency || '',
          name: meta.shortName || meta.symbol || sym,
          open: stockSessionOpen(meta),
          spark: closes.slice(-26)
        };
      }).catch(function(e){
        return { symbol: sym, price: null, pct: 0, cur: '', name: sym, open: null, spark: [], failed: true,
                 err: String((e && e.message) || '') };
      });
    });
  });
  return Promise.all(jobs).then(function(rows){
    if(req !== _stockReq) return;
    var oldBy = {};
    if(same && cache.rows){
      cache.rows.forEach(function(r){ if(r && r.symbol) oldBy[r.symbol] = r; });
    }
    var fresh = 0, merged = rows.map(function(r){
      if(r.price != null && isFinite(r.price)){ fresh++; return r; }
      var old = oldBy[r.symbol];
      if(old && old.price != null && isFinite(old.price)){
        r.price = old.price; r.pct = old.pct; r.cur = old.cur; r.name = old.name;
        r.open = old.open; r.spark = old.spark || []; r.stale = true;
        delete r.failed;
      }
      return r;
    });
    if(!fresh){
      /* every symbol failed: keep whatever we showed before and try again
         soon, instead of blanking the card for a full refresh interval */
      var limited = false, i;
      for(i = 0; i < merged.length; i++){
        if(/429/.test(merged[i].err || '')) limited = true;
      }
      var view = {
        ts: (same && cache.ts) || Date.now(),
        market: stocksMarket(), symbols: list.join(','),
        rows: merged, offline: true, rateLimited: limited
      };
      renderStocks(view);
      renderStocksWindow(view);
      scheduleStocksRetry(limited ? 300000 : 45000);
      return;
    }
    var out = { ts: Date.now(), market: stocksMarket(), symbols: list.join(','), rows: merged };
    ss(K.stocksCache, JSON.stringify(out));
    renderStocks(out);
    renderStocksWindow(out);
    if(_stocksRetry){ clearTimeout(_stocksRetry); _stocksRetry = null; }
    syncStocksUI();
  });
}
var _stocksTimer = null;
function startStocksTimer(){
  if(_stocksTimer){ clearInterval(_stocksTimer); _stocksTimer = null; }
  if(!stocksOn() || !isShown('stocks')) return;
  _stocksTimer = setInterval(function(){
    if(document.hidden) return;
    loadStocks(true);
  }, stocksEveryMin() * 60000);
}
/* rows for the window: fall back to the saved symbol list before data lands */
function stocksRowsFor(data){
  var rows = (data && data.rows) || [];
  if(rows.length) return rows;
  return stocksList().map(function(s){
    return { symbol:s, price:null, pct:0, name:s, spark:[] };
  });
}
function renderStocksWindow(data){
  var host = $('stockswin-list');
  if(!host) return;
  var rows = stocksRowsFor(data);
  if(!rows.length){
    host.innerHTML = '<div class="sk-win-empty">No symbols yet \u2014 add one below.</div>';
    return;
  }
  var html = '';
  rows.forEach(function(r){
    var has = r.price != null && isFinite(r.price);
    var up = Number(r.pct || 0) >= 0;
    var pct = has ? ((up ? '+' : '') + Number(r.pct || 0).toFixed(2) + '%') : '\u2014';
    html += '<div class="sk-win-row' + (r.stale ? ' stale' : '') + '">' +
      '<div class="sk-win-id">' +
        '<span class="sk-win-sym">' + holEsc(stockLabel(r.symbol)) + '</span>' +
        '<span class="sk-win-name">' + holEsc(r.name || r.symbol) + '</span>' +
      '</div>' +
      '<div class="sk-win-num">' +
        '<span class="sk-win-px">' + holEsc(stockPriceText(r)) + (stockCurrencyTag(r) ? '<span class="sk-cur">' + stockCurrencyTag(r) + '</span>' : '') + '</span>' +
        '<span class="sk-chg ' + (has ? (up ? 'up' : 'down') : 'flat') + '">' +
          (has ? (up ? '\u25B2' : '\u25BC') + ' ' : '') + pct + '</span>' +
      '</div>' +
      '<span class="sk-spark-slot">' + stockSpark(r.spark || []) + '</span>' +
      '<button class="sk-remove" type="button" data-sym="' + holEsc(r.symbol) + '" title="Remove" aria-label="Remove ' + holEsc(r.symbol) + '">\u2715</button>' +
    '</div>';
  });
  host.innerHTML = html;
  applyStocksLabels(data);
}
function syncStocksUI(){
  var crypto = stocksMarket() === 'crypto';
  var t = $('sk-title'); if(t) setText(t, crypto ? 'Crypto' : 'Markets');
  var wt = $('stockswin-title'); if(wt) setText(wt, crypto ? 'Crypto' : 'Markets');
  function segPaint(id){
    var s = $(id);
    if(!s) return;
    Array.prototype.forEach.call(s.querySelectorAll('.seg-btn'), function(b){
      b.classList.toggle('on', b.getAttribute('data-market') === stocksMarket());
    });
  }
  segPaint('istocksmarket');
  segPaint('stockswin-market');
  var sl = $('istockslist');
  if(sl){
    /* never rewrite the field while the user is editing it */
    if(document.activeElement !== sl) sl.value = stocksList().join(', ');
    sl.placeholder = crypto ? 'BTC-USD, ETH-USD' : '^JKSE, BBCA.JK, AAPL';
  }
  var sev = $('istocksevery');
  if(sev && document.activeElement !== sev) sev.value = String(stocksEveryMin());
  var wev = $('stockswin-every');
  if(wev && document.activeElement !== wev) wev.value = String(stocksEveryMin());
  var inp = $('stockswin-input');
  if(inp) inp.placeholder = crypto ? 'Add symbol, e.g. DOGE-USD' : 'Add symbol, e.g. NVDA';
  var cur = stocksCurrency();
  var selA = $('istockscurrency'), selB = $('stockswin-currency');
  if(selA && selA.value !== cur) selA.value = cur;
  if(selB && selB.value !== cur) selB.value = cur;
  if(cur !== 'native') ensureFxRates();
  var cache = parseJSON(gs(K.stocksCache), null);
  var upd = $('stockswin-updated');
  if(upd){
    if(cache && cache.ts && cache.market === stocksMarket()){
      var dt = new Date(cache.ts);
      upd.textContent = pad2n(dt.getHours()) + ':' + pad2n(dt.getMinutes());
    } else {
      upd.textContent = '\u2014';
    }
  }
  applyStocksLabels(cache && cache.market === stocksMarket() ? cache : null);
}
function setStocksMarket(m){
  ss(K.stocksMarket, m === 'crypto' ? 'crypto' : 'stock');
  ss(K.stocksCache, '');
  syncStocksUI();
  loadStocks(true);
  startStocksTimer();
}
function setStocksCurrency(c){
  ss(K.stocksCurrency, c || 'native');
  if(stocksCurrency() !== 'native') ensureFxRates();
  var cache = parseJSON(gs(K.stocksCache), null);
  if(cache){ renderStocks(cache); renderStocksWindow(cache); }
  syncStocksUI();
}
function populateCurrencySelects(){
  ['istockscurrency','stockswin-currency'].forEach(function(id){
    var sel = $(id);
    if(!sel) return;
    sel.innerHTML = STOCK_CURRENCIES.map(function(c){
      return '<option value="' + c[0] + '">' + c[1] + '</option>';
    }).join('');
    sel.value = stocksCurrency();
  });
}
function addStockSymbol(sym){
  sym = String(sym || '').trim().toUpperCase();
  if(!validStockSymbol(sym)) return false;
  var list = stocksList();
  if(list.indexOf(sym) >= 0 || list.length >= 8) return false;
  list.push(sym);
  ss(stocksListKey(), JSON.stringify(list));
  ss(K.stocksCache, '');
  renderStocksWindow(null);
  loadStocks(true);
  syncStocksUI();
  return true;
}
function removeStockSymbol(sym){
  var list = stocksList();
  if(list.length <= 1) return;
  var i = list.indexOf(String(sym || '').toUpperCase());
  if(i < 0) return;
  list.splice(i, 1);
  ss(stocksListKey(), JSON.stringify(list));
  ss(K.stocksCache, '');
  renderStocksWindow(null);
  loadStocks(true);
  syncStocksUI();
}
function openStocks(){
  if(!stocksOn()) return;
  openWin('stocks-modal');
  var cache = parseJSON(gs(K.stocksCache), null);
  renderStocksWindow(cache && cache.market === stocksMarket() ? cache : null);
  syncStocksUI();
  loadStocks(false);
}
function initStocks(){
  var tile = $('stocks');
  if(tile) tile.addEventListener('click', function(e){
    if(_layoutEditing) return;
    if(Date.now() - _lastDragEnd < 300) return;
    if(e.target.closest('#stocks-refresh') || e.target.closest('.resize-knob') || e.target.closest('.reset-knob')) return;
    openStocks();
  });
  var cb = $('stockswin-close');
  if(cb) cb.onclick = function(){ closeWin('stocks-modal'); };
  var market = $('stockswin-market');
  if(market) market.addEventListener('click', function(e){
    var b = e.target.closest('.seg-btn');
    if(!b) return;
    setStocksMarket(b.getAttribute('data-market'));
  });
  var addBtn = $('stockswin-add'), inp = $('stockswin-input');
  function doAdd(){
    if(!inp) return;
    addStockSymbol(inp.value);
    inp.value = '';
  }
  if(addBtn) addBtn.onclick = doAdd;
  if(inp) inp.onkeydown = function(e){ if(e.key === 'Enter'){ e.preventDefault(); doAdd(); } };
  var list = $('stockswin-list');
  if(list) list.addEventListener('click', function(e){
    var b = e.target.closest('.sk-remove');
    if(!b) return;
    removeStockSymbol(b.getAttribute('data-sym'));
  });
  var rf = $('stockswin-refresh');
  if(rf) rf.onclick = function(){ loadStocks(true); };
  populateCurrencySelects();
  var wcur = $('stockswin-currency');
  if(wcur) wcur.onchange = function(){ setStocksCurrency(wcur.value); };
  var wev = $('stockswin-every');
  if(wev){
    var commitW = function(){
      var m = parseInt(wev.value, 10);
      if(!(m > 0)) m = 5;
      m = Math.max(1, Math.min(60, m));
      ss(K.stocksEvery, String(m));
      startStocksTimer();
      syncStocksUI();
    };
    wev.onchange = commitW;
    wev.onblur = commitW;
  }
}

/* ══════════════════════════════════════════
   DEVICE STATUS  (network · device · storage)
   — battery intentionally absent from the UI. See BATTERY_UI below.
══════════════════════════════════════════ */
/* BATTERY — parked on purpose, keep the code for a future browser.
   The Battery Status API is the only web-accessible source of battery
   data, and Chromium on Windows/macOS commonly feeds it a placeholder:
   level 1.0, charging true, chargingTime 0, dischargingTime Infinity.
   There is no newer JS API, flag or permission that exposes the real
   value — native apps read GetSystemPowerStatus / IOKit instead, which a
   web page or MV3 extension cannot call without a native host.
   Because a wrong number is worse than no number, the tile and popover
   no longer render battery at all. `batteryFake()` still detects the
   placeholder, and `batteryText()` still formats a genuine reading.
   To bring it back on a future platform:
     1. flip BATTERY_UI to true,
     2. restore the .st-batt markup in #status-tile (keeping .st-net),
     3. restore the Battery row in #status-pop.
   Everything below already handles both real and placeholder states. */
var BATTERY_UI = false;
var _statBatt = null;
var _statBattFake = false;
var _statusOpen = false;

function fmtDur(sec){
  if(!isFinite(sec) || sec <= 0) return '';
  var m = Math.round(sec / 60);
  var h = Math.floor(m / 60); m = m % 60;
  if(h && m) return h + 'h ' + m + 'm';
  if(h) return h + 'h';
  return m + 'm';
}
function deviceOS(){
  var ua = navigator.userAgent || '';
  if(/Windows/.test(ua)) return 'Windows';
  if(/Mac OS X/.test(ua)) return 'macOS';
  if(/CrOS/.test(ua)) return 'ChromeOS';
  if(/Android/.test(ua)) return 'Android';
  if(/Linux/.test(ua)) return 'Linux';
  return 'Device';
}
function deviceText(){
  var p = [deviceOS()];
  if(navigator.hardwareConcurrency) p.push(navigator.hardwareConcurrency + ' cores');
  if(navigator.deviceMemory) p.push(navigator.deviceMemory + ' GB RAM');
  var scr = screen.width + '\u00D7' + screen.height;
  if(window.devicePixelRatio > 1.01) scr += ' @ ' + Math.round(window.devicePixelRatio * 100) + '%';
  p.push(scr);
  return p.join(' \u00B7 ');
}
function batteryFake(b){
  /* Chromium on Windows commonly reports a placeholder: 100 %, "charging",
     chargingTime 0 and dischargingTime Infinity. Showing that as a real
     number is worse than showing nothing. */
  if(!b) return false;
  return (b.level >= 0.995) && b.charging === true &&
         (!isFinite(b.chargingTime) || b.chargingTime === 0);
}
function batteryText(){
  if(!_statBatt) return '';
  if(_statBattFake) return 'Not available from this browser \u00B7 Windows hides it';
  var pct = Math.round((_statBatt.level || 0) * 100);
  var parts = [pct + '%'];
  if(_statBatt.charging){
    parts.push('Charging');
    var t = fmtDur(_statBatt.chargingTime);
    if(t) parts.push(t + ' to full');
  } else {
    var d = fmtDur(_statBatt.dischargingTime);
    if(d) parts.push(d + ' left');
    else if((_statBatt.level || 0) >= 0.995) parts.push('Full');
  }
  if(gs(K.batterySaver) === '1') parts.push('Saver on');
  return parts.join(' \u00B7 ');
}
function netInfo(){
  var on = navigator.onLine;
  var c = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  var p = [on ? 'Online' : 'Offline'];
  if(on && c){
    if(c.effectiveType) p.push(String(c.effectiveType).toUpperCase());
    if(typeof c.downlink === 'number' && c.downlink > 0)
      p.push('~' + (c.downlink >= 10 ? Math.round(c.downlink) : c.downlink.toFixed(1)) + ' Mbps');
    if(typeof c.rtt === 'number' && c.rtt > 0) p.push(c.rtt + ' ms');
    if(c.saveData) p.push('Data saver');
  }
  return p.join(' \u00B7 ');
}
function statusLabelText(){ return (gs(K.statusLabel) || '').trim(); }

function updateStatusBattery(){
  if(!BATTERY_UI) return;   /* battery is off the UI on purpose — see above */
  var tile = $('status-tile');
  if(!tile) return;
  if(!_statBatt){
    tile.classList.add('no-batt');
    tile.classList.remove('charging');
    return;
  }
  _statBattFake = batteryFake(_statBatt);
  /* a fake reading is no reading: keep the home tile clean and only explain
     it inside the popover */
  tile.classList.toggle('no-batt', _statBattFake);
  tile.classList.toggle('charging', !_statBattFake && !!_statBatt.charging);
  if(_statBattFake){
    setText($('st-batt-text'), '');
    var ff = $('st-batt-fill');
    if(ff) ff.setAttribute('width','0');
    if(_statusOpen) setText($('sp-batt'), batteryText());
    return;
  }
  tile.classList.remove('no-batt');
  var pct = Math.round((_statBatt.level || 0) * 100);
  setText($('st-batt-text'), pct + '%');
  var fill = $('st-batt-fill');
  if(fill) fill.setAttribute('width', String(Math.max(0, Math.min(16.6, (_statBatt.level || 0) * 16.6))));
  if(_statusOpen) setText($('sp-batt'), batteryText());
}
function updateStatusNet(){
  var tile = $('status-tile');
  if(!tile) return;
  var on = navigator.onLine;
  var c = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  var label = statusLabelText();
  /* a pending update is more important than a custom network name, but an
     actual offline state is more important than both */
  if(on && _updateAvailable) label = 'New Update is Available!';
  else label = label || (on ? 'Online' : 'Offline');
  setText($('st-net-text'), label);
  var dot = $('st-dot');
  if(dot){
    var rough = on && c && ((typeof c.rtt === 'number' && c.rtt > 250) || c.saveData || c.effectiveType === '2g' || c.effectiveType === 'slow-2g');
    dot.className = 'st-dot ' + (!on ? 'off' : ((_updateAvailable || rough) ? 'warn' : 'on'));
  }
  if(_statusOpen) setText($('sp-net'), netInfo());
}
function updateStatusStorage(){
  var el = $('sp-store');
  if(!el) return;
  if(!(navigator.storage && navigator.storage.estimate)){
    var row = $('sp-store-row');
    if(row) row.style.display = 'none';
    return;
  }
  navigator.storage.estimate().then(function(e){
    var mb = (e.usage || 0) / 1048576;
    el.textContent = mb >= 0.1 ? mb.toFixed(1) + ' MB used' : 'Nothing stored yet';
  }).catch(function(){ el.textContent = '\u2014'; });
}
function refreshStatusPop(){
  var br = $('sp-batt-row');
  if(_statBatt){
    if(br) br.style.display = '';
    setText($('sp-batt'), batteryText());
  } else if(br){
    br.style.display = 'none';
  }
  setText($('sp-net'), netInfo());
  setText($('sp-dev'), deviceText());
  updateStatusStorage();
}

/* ── update line ──
   A quiet look at the repository's manifest. Nothing downloads by itself and
   nothing nags: the row simply says whether something newer exists. The
   result is kept for twelve hours so opening the popover does not hammer
   GitHub on every new tab. */
var UPDATE_MANIFEST = 'https://raw.githubusercontent.com/zClovince/Newly/main/manifest.json';
var _localVersion = '';
var _updateBusy = false;
var _updateAvailable = false;

function cmpVersion(a, b){
  var A = String(a || '0').split('.'), B = String(b || '0').split('.');
  for(var i = 0; i < Math.max(A.length, B.length); i++){
    var x = parseInt(A[i], 10) || 0, y = parseInt(B[i], 10) || 0;
    if(x !== y) return x > y ? 1 : -1;
  }
  return 0;
}
function currentVersion(){
  if(_localVersion) return Promise.resolve(_localVersion);
  return fetch('manifest.json', {cache:'no-store'})
    .then(function(r){ return r.json(); })
    .then(function(j){ _localVersion = (j && j.version) || ''; return _localVersion; });
}
function paintUpdate(remote, local){
  var out = $('sp-update');
  if(!out) return;
  out.classList.remove('new');
  var has = !!(local && remote && cmpVersion(remote, local) > 0);
  _updateAvailable = has;
  var open = $('sp-update-open');
  if(open) open.hidden = !has;
  updateStatusNet();
  if(!local){ setText(out, '\u2014'); return; }
  if(has){
    setText(out, remote + ' available');
    out.classList.add('new');
    out.title = 'A newer release exists on GitHub \u2014 github.com/zClovince/Newly/releases';
    return;
  }
  setText(out, local + ' \u00B7 up to date');
  out.title = 'This is the latest release.';
}
function checkUpdates(manual){
  if(_updateBusy) return;
  var out = $('sp-update'), btn = $('sp-update-check');
  if(!navigator.onLine){
    if(out) setText(out, 'Offline');
    if(manual) noteToast('No connection to check with.', true, true);
    return;
  }
  _updateBusy = true;
  if(btn){ btn.disabled = true; setText(btn, 'Checking\u2026'); }
  if(out) setText(out, 'Checking\u2026');
  currentVersion()
    .then(function(lv){
      return fetch(UPDATE_MANIFEST, {cache:'no-store'})
        .then(function(r){ if(!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function(remote){
          var rv = (remote && remote.version) || '';
          ss('nt_update', JSON.stringify({ at: Date.now(), local: lv, remote: rv }));
          paintUpdate(rv, lv);
        });
    })
    .catch(function(){
      if(out){
        setText(out, 'Couldn\u2019t check');
        out.title = 'No answer from GitHub. It may be offline, or the repository may not be public yet.';
      }
    })
    .then(function(){
      _updateBusy = false;
      if(btn){ btn.disabled = false; setText(btn, 'Check for updates'); }
    });
}
function maybeAutoCheckUpdate(){
  var raw = parseJSON(gs('nt_update'), null) || {};
  currentVersion().then(function(lv){
    if(raw.remote) paintUpdate(raw.remote, lv);
    if(raw.at && (Date.now() - raw.at) < 12 * 3600 * 1000) return;
    checkUpdates(false);
  }).catch(function(){ checkUpdates(false); });
}
function openStatus(){
  var pop = $('status-pop'), tile = $('status-tile');
  if(!pop || !tile) return;
  pop.classList.remove('closing');
  pop.classList.add('open');
  pop.setAttribute('aria-hidden','false');
  tile.setAttribute('aria-expanded','true');
  _statusOpen = true;
  refreshStatusPop();
  maybeAutoCheckUpdate();
  var li = $('sp-label-input');
  if(li) li.value = statusLabelText();
  setText($('sp-test-out'),'');
}
function closeStatus(returnFocus){
  var pop = $('status-pop'), tile = $('status-tile');
  if(!pop || !_statusOpen) return;
  _statusOpen = false;
  pop.setAttribute('aria-hidden','true');
  if(tile) tile.setAttribute('aria-expanded','false');
  /* let it fall away instead of blinking out */
  pop.classList.add('closing');
  setTimeout(function(){
    pop.classList.remove('open','closing');
    if(returnFocus && tile) tile.focus();
  }, 200);
}
function testConnection(){
  var out = $('sp-test-out');
  if(!out) return;
  if(!navigator.onLine){ out.textContent = 'Offline'; return; }
  out.textContent = 'Testing\u2026';
  var t0 = performance.now();
  /* Google's captive-portal endpoint: a 204 with no body, so the number is
     round-trip time to Google rather than a cold API start.
     Firefox MV3 does not grant host permissions automatically, so the request
     is opaque (no-cors): it still resolves when the network answers and rejects
     when there is nothing there, which is all this test needs. */
  fetch('https://www.gstatic.com/generate_204?_=' + Date.now(), {mode:'no-cors', cache:'no-store'})
    .then(function(){
      out.textContent = 'Online \u00B7 ' + Math.round(performance.now() - t0) + ' ms \u00B7 Google';
    })
    .catch(function(){
      out.textContent = 'No response';
    });
}

function initStatus(){
  var tile = $('status-tile');
  if(!tile) return;

  if(BATTERY_UI && navigator.getBattery){
    navigator.getBattery().then(function(b){
      _statBatt = b;
      b.addEventListener('levelchange', updateStatusBattery);
      b.addEventListener('chargingchange', updateStatusBattery);
      updateStatusBattery();
    }).catch(function(){});
  }

  /* events can be silent on some laptops — a slow poll keeps the tile honest
     without waking anything while the tab is in the background */
  if(BATTERY_UI) setInterval(function(){
    if(document.hidden || !_statBatt) return;
    updateStatusBattery();
    if(_statusOpen) refreshStatusPop();
  }, 60000);

  updateStatusNet();
  window.addEventListener('online', updateStatusNet);
  window.addEventListener('offline', updateStatusNet);
  var c = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  if(c && c.addEventListener) c.addEventListener('change', updateStatusNet);

  tile.onclick = function(e){
    e.preventDefault();
    e.stopPropagation();
    if(_statusOpen) closeStatus(true); else openStatus();
  };
  tile.onkeydown = function(e){
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); tile.click(); }
  };

  var cb = $('status-pop-close');
  if(cb) cb.onclick = function(){ closeStatus(true); };

  var pop = $('status-pop');
  if(pop){
    pop.onclick = function(e){ e.stopPropagation(); };
  }
  document.addEventListener('click', function(e){
    if(!_statusOpen) return;
    var t = e.target;
    if(pop && pop.contains(t)) return;
    if(tile && tile.contains(t)) return;
    closeStatus(false);
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && _statusOpen){
      e.stopPropagation();
      closeStatus(true);
    }
  }, true);

  var li = $('sp-label-input');
  if(li){
    li.value = statusLabelText();
    li.oninput = function(){
      ss(K.statusLabel, li.value.trim());
      updateStatusNet();
    };
  }

  var tb = $('sp-test');
  if(tb) tb.onclick = testConnection;

  var ub = $('sp-update-check');
  if(ub) ub.onclick = function(){ checkUpdates(true); };

  var uo = $('sp-update-open');
  if(uo) uo.onclick = function(){
    window.open('https://github.com/zClovince/Newly/releases', '_blank', 'noopener');
  };

  /* paint whatever we already know, and quietly look for a newer release on
     every new tab. The twelve-hour cache keeps this from hammering GitHub. */
  maybeAutoCheckUpdate();
  currentVersion().then(function(lv){
    var out = $('sp-update');
    if(out && out.textContent === '-') setText(out, lv);
  }).catch(function(){});
}

/* ══════════════════════════════════════════
   PUBLIC HOLIDAYS  (opt-in; keyless via Nager.Date)
   Follows the weather city's country when we know it, and can be pinned
   to one country in Settings. Pure nicety: any failure stays silent.
══════════════════════════════════════════ */
function holidaysOn(){ return gs(K.showHolidays) === '1'; }
function holidayRegion(){
  var own = (gs(K.holidayCountry) || '').toUpperCase();
  if(own) return own;
  var geo = parseJSON(gs(K.weatherGeo), null);
  if(geo && geo.cc) return geo.cc;
  return 'ID';
}
function holEsc(s){
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
var _holidays = parseJSON(gs(K.holidayCache), null) || {};
var _holidayReq = {};
function holidayFor(y,m,d){
  var region = holidayRegion();
  var year = _holidays[region] && _holidays[region][y];
  if(!year) return null;
  return year[y + '-' + pad2n(m + 1) + '-' + pad2n(d)] || null;
}
/* every marked day in a month, in date order, for the visible name lists */
function holidaysInMonth(y,m){
  if(!holidaysOn()) return [];
  var out = [], days = new Date(y, m + 1, 0).getDate();
  for(var d = 1; d <= days; d++){
    var h = holidayFor(y, m, d);
    if(h) out.push({ d:d, name:(h.local || h.name) });
  }
  return out;
}
var NAGER_HOL = 'https://date.nager.at/api/v3/PublicHolidays/';
var ID_HOL = 'https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/holidays.json';
var _idHolState = '';   /* '' | 'loading' | 'done' | 'fail' */
function holidaysChanged(){
  renderCalendar();
  if(_openWin === 'calendar-modal') renderCalWin(false);
}
/* Indonesia keeps its own list: Nager only carries a handful of ID days,
   while this small community dataset has the full SKB calendar. */
function fetchIDHolidays(year){
  if(_idHolState === 'loading') return;
  _idHolState = 'loading';
  fetchJSON(ID_HOL, 12000).then(function(map){
    if(!map || typeof map !== 'object') throw new Error('empty');
    var byYear = {}, seen = false;
    Object.keys(map).forEach(function(k){
      if(!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
      var item = map[k] || {};
      var y = k.slice(0, 4);
      if(!byYear[y]) byYear[y] = {};
      byYear[y][k] = { name: item.summary || '', local: item.summary || '' };
      seen = true;
    });
    if(!seen) throw new Error('empty');
    _holidays.ID = byYear;
    ss(K.holidayCache, JSON.stringify(_holidays));
    _idHolState = 'done';
    holidaysChanged();
    if(!_holidays.ID[year]) fetchNagerHolidays(year);
  }).catch(function(){
    _idHolState = 'fail';
    fetchNagerHolidays(year);
  });
}
function fetchNagerHolidays(year){
  var region = holidayRegion();
  var tag = region + '|' + year;
  if(_holidayReq[tag]) return;
  _holidayReq[tag] = true;
  fetchJSON(NAGER_HOL + year + '/' + region, 9000)
    .then(function(list){
      if(!list || !list.length) throw new Error('empty');
      var map = {};
      list.forEach(function(h){
        if(!h || !h.date) return;
        /* a holiday shared by a sub-region is not a nationwide day off */
        if(h.global === false) return;
        map[h.date] = { name: h.name || '', local: h.localName || '' };
      });
      if(!_holidays[region]) _holidays[region] = {};
      _holidays[region][year] = map;
      ss(K.holidayCache, JSON.stringify(_holidays));
      holidaysChanged();
    })
    .catch(function(){
      /* remember the miss so we do not hammer the endpoint */
      if(!_holidays[region]) _holidays[region] = {};
      _holidays[region][year] = {};
      ss(K.holidayCache, JSON.stringify(_holidays));
    })
    .then(function(){ _holidayReq[tag] = false; });
}
function ensureHolidays(year){
  if(!holidaysOn()) return;
  var region = holidayRegion();
  if(_holidays[region] && _holidays[region][year]) return;
  if(region !== 'ID'){ fetchNagerHolidays(year); return; }
  if(_idHolState === '') fetchIDHolidays(year);
  else if(_idHolState === 'done' && !((_holidays.ID || {})[year])) fetchNagerHolidays(year);
  else if(_idHolState === 'fail') fetchNagerHolidays(year);
}
function holidaysRefresh(){
  var region = holidayRegion();
  if(_holidays[region]) delete _holidays[region];
  if(region === 'ID') _idHolState = '';
  ss(K.holidayCache, JSON.stringify(_holidays));
  var now = wallNow();
  ensureHolidays(now.year);
  holidaysChanged();
}

/* ══════════════════════════════════════════
   CALENDAR  (month grid, today highlighted)
══════════════════════════════════════════ */
var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
var _calTimer = null;

function renderCalendar(){
  var grid = $('cal-grid');
  if(!grid) return;
  var now = wallNow();
  var y = now.year, m = now.mon, today = now.date;
  var firstDow = (new Date(y, m, 1).getDay() + 6) % 7;   /* Monday first */
  var daysInMonth = new Date(y, m + 1, 0).getDate();
  var daysPrev = new Date(y, m, 0).getDate();
  var out = ['Mo','Tu','We','Th','Fr','Sa','Su'].map(function(d){
    return '<span class="cal-dow">' + d + '</span>';
  }).join('');

  for(var i = firstDow; i > 0; i--){
    out += '<span class="cal-day other">' + (daysPrev - i + 1) + '</span>';
  }
  for(var d = 1; d <= daysInMonth; d++){
    var hol = holidaysOn() ? holidayFor(y, m, d) : null;
    out += '<span class="cal-day' + (d === today ? ' today' : '') + (hol ? ' hol' : '') +
           (hol ? '" title="' + holEsc(hol.local || hol.name) : '') + '">' + d + '</span>';
  }
  var cells = firstDow + daysInMonth;
  var nextDay = 1;
  while(cells % 7 !== 0 || cells < 35){
    out += '<span class="cal-day other">' + (nextDay++) + '</span>';
    cells++;
  }

  grid.innerHTML = out;
  setText($('cal-month'), MONTH_NAMES[m]);
  setText($('cal-year'), String(y));
  var hb = $('cal-hol');
  if(hb){
    var hlist = holidaysInMonth(y, m), pickH = null;
    for(var hi = 0; hi < hlist.length; hi++){
      if(hlist[hi].d >= today){ pickH = hlist[hi]; break; }
    }
    if(pickH){
      hb.innerHTML = '<span class="cal-hol-star">\u2726</span><span class="cal-hol-txt">' +
        pickH.d + ' ' + MONTH_NAMES[m].slice(0, 3) + ' \u00b7 ' + holEsc(pickH.name) + '</span>';
      hb.title = pickH.name;
      hb.hidden = false;
    } else {
      hb.innerHTML = '';
      hb.title = '';
      hb.hidden = true;
    }
  }
  if(holidaysOn()) ensureHolidays(y);
}

function scheduleCalendar(){
  if(_calTimer) clearTimeout(_calTimer);
  var delay;
  if(followCityTime()){
    delay = 60000;
  } else {
    var now = new Date();
    var next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 10);
    delay = Math.max(5000, next.getTime() - now.getTime());
  }
  _calTimer = setTimeout(function(){
    renderCalendar();
    scheduleCalendar();
  }, delay);
}

/* ══════════════════════════════════════════
   PRAYER TIMES  (shown only while Quran verses are selected)
══════════════════════════════════════════ */
var _prayerOpen = false;
var _prayerData = null;
var _prayerCity = '';
var _prayerTick = null;
var _prayerWidgetTick = null;
var _prayerCloseTimer = null;
var _toastCloseTimer = null;
var _audioCtx = null;
var PRAYER_ORDER = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];

function pad2n(n){ return n < 10 ? '0' + n : '' + n; }
function prayerMethodFor(label){
  var l = (label || '').toLowerCase();
  if(l.indexOf('indonesia') >= 0) return { id:20, name:'Kemenag' };
  if(l.indexOf('malaysia') >= 0)  return { id:17, name:'JAKIM' };
  if(l.indexOf('singapore') >= 0) return { id:11, name:'MUIS' };
  if(l.indexOf('turkey') >= 0)    return { id:13, name:'Diyanet' };
  return { id:3, name:'Muslim World League' };
}
function prayerClock(hhmm){
  var m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || ''));
  if(!m) return '—';
  var h = parseInt(m[1], 10), mm = m[2];
  if((gs(K.hourFmt) || '24') === '12'){
    var ap = h < 12 ? 'AM' : 'PM';
    return pad2n(h % 12 || 12) + ':' + mm + ' ' + ap;
  }
  return pad2n(h) + ':' + mm;
}
function prayerMinutes(hhmm){
  var m = /^(\d{1,2}):(\d{2})/.exec(String(hhmm || ''));
  if(!m) return -1;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}
function minutesToClock(mins){
  var h = Math.floor(mins / 60) % 24, m = mins % 60;
  return pad2n(h) + ':' + pad2n(m);
}

function nextPrayerInfo(data){
  var now = new Date();
  var nowMin = now.getHours() * 60 + now.getMinutes();
  var nextName = '', nextMin = -1, nextDay = false;
  for(var i = 0; i < PRAYER_ORDER.length; i++){
    var n = PRAYER_ORDER[i];
    var t = prayerMinutes(data.times[n]);
    if(t > nowMin){ nextName = n; nextMin = t; break; }
  }
  if(!nextName){
    nextName = 'Fajr'; nextMin = prayerMinutes(data.times.Fajr); nextDay = true;
  }
  return {
    name: nextName,
    min: nextMin,
    nextDay: nextDay,
    diff: nextMin - nowMin + (nextDay ? 24 * 60 : 0)
  };
}

function renderPrayer(){
  var list = $('prayer-list');
  var data = _prayerData;
  setText($('prayer-city'), _prayerCity || '—');
  setText($('pw-city'), _prayerCity || '');
  if(!data || !data.times){
    if(list) list.innerHTML = '';
    setText($('prayer-next-name'), '—');
    setText($('prayer-next-time'), '');
    setText($('prayer-count'), '');
    setText($('pw-name'), '—');
    setText($('pw-time'), '');
    setText($('pw-count'), _prayerCity ? 'Prayer times are resting for now' : 'Add a weather city');
    return;
  }
  var info = nextPrayerInfo(data);
  var nextName = info.name, nextMin = info.min, nextDay = info.nextDay, diff = info.diff;
  var hh = Math.floor(diff / 60), mm = diff % 60;
  var clock = prayerClock(minutesToClock(nextMin));

  setText($('prayer-next-name'), nextName);
  setText($('prayer-next-time'), clock + (nextDay ? ' tomorrow' : ''));
  setText($('prayer-count'), 'in ' + (hh ? hh + 'h ' : '') + mm + 'm');

  setText($('pw-name'), nextName);
  setText($('pw-time'), clock);
  setText($('pw-count'), 'in ' + (hh ? hh + 'h ' : '') + mm + 'm' + (nextDay ? ' · tomorrow' : ''));

  if(list){
    list.innerHTML = PRAYER_ORDER.map(function(n){
      var t = data.times[n];
      return '<div class="prayer-row' + (n === nextName ? ' next' : '') + '">' +
             '<span class="prayer-name">' + n + '</span>' +
             '<span class="prayer-time">' + prayerClock(t) + '</span></div>';
    }).join('');
  }
  var note = $('prayer-note');
  if(note){
    note.textContent = (data.method ? data.method + ' · ' : '') +
      (data.timezone ? data.timezone + ' · ' : '') + 'Times from Aladhan';
  }
  maybePrayerReminder(nextName, nextMin, diff);
}

/* ── 5-minutes-before reminder (in-page glass toast) ── */
var _toastTimer = null;
function prayerRemindMins(){
  var v = parseInt(gs(K.prayerRemind), 10);
  return isNaN(v) ? 5 : v;   /* 0 = off */
}
function prayerChime(){
  if(gs(K.prayerSound) === '0') return;
  try{
    var AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return;
    if(!_audioCtx) _audioCtx = new AC();
    if(_audioCtx.state === 'suspended') _audioCtx.resume();
    var t0 = _audioCtx.currentTime;
    /* two soft bell notes — generated, so there is no file to ship */
    [880, 1174.66].forEach(function(f, i){
      var o = _audioCtx.createOscillator();
      var g = _audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      var at = t0 + i * 0.20;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.10, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.85);
      o.connect(g); g.connect(_audioCtx.destination);
      o.start(at); o.stop(at + 0.9);
    });
  }catch(e){ /* audio is a nicety, never a failure */ }
}
function fmtMinsShort(diff){
  var h = Math.floor(diff / 60), m = diff % 60;
  if(h && m) return h + 'h ' + m + 'm';
  if(h) return h + 'h';
  return m + 'm';
}
function showPrayerToast(name, nextMin, diff){
  var t = $('prayer-toast');
  if(!t) return;
  setText($('pt-title'), diff > 0
    ? name + ' in ' + fmtMinsShort(diff)
    : name + ' — it’s time');
  setText($('pt-sub'), prayerClock(minutesToClock(nextMin)) + ' · ' + (_prayerCity || 'your city'));
  if(_toastCloseTimer){ clearTimeout(_toastCloseTimer); _toastCloseTimer = null; }
  t.classList.add('open');
  t.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ t.classList.add('in'); });
  });
  prayerChime();
  if(_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(hidePrayerToast, 15000);
}
function hidePrayerToast(){
  var t = $('prayer-toast');
  if(!t) return;
  t.classList.remove('in');
  t.setAttribute('aria-hidden', 'true');
  if(_toastTimer){ clearTimeout(_toastTimer); _toastTimer = null; }
  if(_toastCloseTimer) clearTimeout(_toastCloseTimer);
  _toastCloseTimer = setTimeout(function(){
    t.classList.remove('open');
    _toastCloseTimer = null;
  }, 280);
}
function maybePrayerReminder(name, nextMin, diff){
  if(!quranActive()) return;
  var off = prayerRemindMins();
  if(!(off > 0) || diff > off) return;
  var key = new Date().toDateString() + '|' + name;
  if(gs(K.prayerNotified) === key) return;   /* one reminder per prayer per day */
  ss(K.prayerNotified, key);
  showPrayerToast(name, nextMin, diff);
}

function loadPrayer(force){
  var city = (gs(K.weatherCity) || '').trim();
  var note = $('prayer-note');
  var geo = parseJSON(gs(K.weatherGeo), null);
  var knownLabel = (geo && geo.city === city && geo.label) ? geo.label : city;
  _prayerCity = knownLabel;
  setText($('prayer-city'), knownLabel || 'No city set');
  setText($('pw-city'), knownLabel || '');
  if(!city){
    _prayerData = null;
    if(note) note.textContent = 'Add a city in Widgets → Weather first.';
    renderPrayer();
    return Promise.resolve();
  }
  var cached = parseJSON(gs(K.prayerCache), null);
  var todayKey = new Date().toDateString() + '|' + city;
  if(!force && cached && cached.key === todayKey && cached.times){
    _prayerData = cached;
    renderPrayer();
    return Promise.resolve();
  }
  if(note) note.textContent = 'Loading times…';

  var geoP = (geo && geo.city === city && geo.lat != null) ? Promise.resolve(geo) : geocode(city);

  return geoP.then(function(g){
    ss(K.weatherGeo, JSON.stringify(g));
    /* show the resolved place (city, country) so it is clear which location
       the times belong to */
    _prayerCity = g.label || city;
    setText($('prayer-city'), _prayerCity);
    setText($('pw-city'), _prayerCity);
    var method = prayerMethodFor(g.label || city);
    var d = new Date();
    var ds = pad2n(d.getDate()) + '-' + pad2n(d.getMonth() + 1) + '-' + d.getFullYear();
    var url = 'https://api.aladhan.com/v1/timings/' + ds +
              '?latitude=' + g.lat + '&longitude=' + g.lon +
              '&method=' + method.id + '&school=0';
    return fetchJSON(url, 9000).then(function(j){
      var t = (j && j.data && j.data.timings) || {};
      var clean = {};
      Object.keys(t).forEach(function(k){ clean[k] = String(t[k]).replace(/\s*\(.*$/, ''); });
      var meta = (j && j.data && j.data.meta) || {};
      var out = {
        key: todayKey,
        times: clean,
        method: method.name,
        timezone: meta.timezone || ''
      };
      ss(K.prayerCache, JSON.stringify(out));
      _prayerData = out;
      renderPrayer();
    });
  }).catch(function(err){
    _prayerData = { key: todayKey, times: null };
    if(err && err.code === 'CITY_NOT_FOUND'){
      if(note) note.textContent = 'City not found \u2014 a small spelling check on your weather city should help.';
    } else {
      if(note) note.textContent = 'Couldn\u2019t load prayer times. A quick connection check should help.';
    }
    renderPrayer();
  });
}

function openPrayer(){
  var modal = $('prayer-modal');
  if(!modal) return;
  if(_prayerCloseTimer){ clearTimeout(_prayerCloseTimer); _prayerCloseTimer = null; }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  _prayerOpen = true;
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ modal.classList.add('in'); });
  });
  loadPrayer(false);
  var pci = $('pw-city-input');
  if(pci && document.activeElement !== pci) pci.value = (gs(K.weatherCity) || '').trim();
  if(_prayerTick) clearInterval(_prayerTick);
  _prayerTick = setInterval(function(){
    if(!_prayerOpen) return;
    var city = (gs(K.weatherCity) || '').trim();
    var dkey = new Date().toDateString() + '|' + city;
    if(city && (!_prayerData || _prayerData.key !== dkey)) loadPrayer(true);
    else renderPrayer();
  }, 30000);
}
function closePrayer(){
  var modal = $('prayer-modal');
  if(!modal || !_prayerOpen) return;
  modal.classList.remove('in');
  modal.setAttribute('aria-hidden','true');
  _prayerOpen = false;
  if(_prayerTick){ clearInterval(_prayerTick); _prayerTick = null; }
  if(_prayerCloseTimer) clearTimeout(_prayerCloseTimer);
  _prayerCloseTimer = setTimeout(function(){
    modal.classList.remove('open');
    _prayerCloseTimer = null;
  }, 360);
}

function initPrayer(){
  var tile = $('prayer');
  if(tile) tile.addEventListener('click', function(e){
    if(_layoutEditing) return;
    if(Date.now() - _lastDragEnd < 300) return;   /* don't open right after a drag */
    if(e.target.closest('.resize-knob')) return;
    openPrayer();
  });
  var cb = $('prayer-close');
  if(cb) cb.onclick = closePrayer;
  var tcb = $('pt-close');
  if(tcb) tcb.onclick = hidePrayerToast;

  var testBtn = $('prayer-test');
  if(testBtn) testBtn.onclick = function(){
    if(!quranActive()) return;
    /* the preview must use the same fetched data as the widget: real next
       prayer, real clock time and real minutes remaining */
    function runTest(retried){
      if(!_prayerData || !_prayerData.times){
        if(retried) return;
        loadPrayer(true).then(function(){ runTest(true); });
        return;
      }
      var info = nextPrayerInfo(_prayerData);
      /* simulate a real reminder: nothing else on screen when it appears */
      closePanel();
      setTimeout(function(){ showPrayerToast(info.name, info.min, info.diff); }, 360);
    }
    runTest(false);
  };

  var sel = $('prayer-remind');
  if(sel) sel.addEventListener('change', function(){
    ss(K.prayerRemind, String(parseInt(sel.value, 10) || 0));
  });

  document.addEventListener('keydown', function(e){
    var toastUp = $('prayer-toast');
    if(e.key === 'Tab'){
      if(toastUp && toastUp.classList.contains('open')){
        e.preventDefault();
        var c = $('pt-close');
        if(c) c.focus();
        return;
      }
      if(_prayerOpen){
        e.preventDefault();
        var pc = $('prayer-close');
        if(pc) pc.focus();
        return;
      }
    }
    if(e.key !== 'Escape') return;
    if(_prayerOpen){
      e.stopPropagation();
      closePrayer();
    } else if(toastUp && toastUp.classList.contains('open')){
      hidePrayerToast();
    }
  }, true);

  /* the widget keeps itself current on its own, but only while it is on
     screen — nothing runs in the background */
  function prayerLive(){
    if(document.hidden || !quranActive()) return;
    if(!isShown('prayer') && !_prayerOpen) return;
    var city = (gs(K.weatherCity) || '').trim();
    var dkey = new Date().toDateString() + '|' + city;
    if(city && (!_prayerData || _prayerData.key !== dkey)) loadPrayer(true);
    else renderPrayer();
  }
  if(_prayerWidgetTick) clearInterval(_prayerWidgetTick);
  _prayerWidgetTick = setInterval(prayerLive, 30000);

  document.body.classList.toggle('quran-mode', quranActive());
  applyWidgetVisibility();
  if(isShown('prayer') && quranActive()) loadPrayer(false);
}

/* ══════════════════════════════════════════
   QUOTE OF THE DAY
══════════════════════════════════════════ */
var _lastQuoteText = '';

function renderQuote(q){
  _lastQuoteText = q.text || '';
  setText($('q-text'),q.text || '');
  setText($('q-author'),q.author || '');
  renderQuoteWinPreview();
  try{
    ss(K.quoteLast, JSON.stringify({
      text: q.text || '',
      author: q.author || '',
      cat: gs(K.quoteCat) || 'general'
    }));
  }catch(e){}
  /* keep the card hugging the text instead of leaving a fixed box */
  var el = $('quote');
  var s = (parseJSON(gs(K.sizes),{}) || {}).quote;
  if(el && !(s && s.h > 0)) el.style.height = '';
}

/* text/author typography: align, italic/bold, size */
function quoteFlags(v){
  return {
    italic: v === 'italic' || v === 'bolditalic',
    weight: (v === 'bold' || v === 'bolditalic') ? '600' : '400'
  };
}
function applyQuoteStyle(){
  var t = $('q-text'), a = $('q-author');
  if(t){
    var ta = gs(K.quoteAlign) || 'left';
    var tf = quoteFlags(gs(K.quoteStyle) || 'italic');
    var ts = parseInt(gs(K.quoteSize),10);
    if(!(ts > 0)) ts = 13;
    t.style.textAlign   = ta;
    t.style.fontStyle   = tf.italic ? 'italic' : 'normal';
    t.style.fontWeight  = tf.weight;
    t.style.fontSize    = Math.max(10, Math.min(32, ts)) + 'px';
  }
  if(a){
    var aa = gs(K.quoteAuthorAlign) || 'right';
    var af = quoteFlags(gs(K.quoteAuthorStyle) || 'normal');
    var as = parseInt(gs(K.quoteAuthorSize),10);
    if(!(as > 0)) as = 11;
    a.style.textAlign  = aa;
    a.style.fontStyle  = af.italic ? 'italic' : 'normal';
    a.style.fontWeight = af.weight;
    a.style.fontSize   = Math.max(9, Math.min(24, as)) + 'px';
  }
}

function localQuote(cat){
  var list = LOCAL_QUOTES[cat] || LOCAL_QUOTES.general;
  var q = pick(list), tries = 0;
  while(q.text === _lastQuoteText && tries++ < 6) q = pick(list);
  return q;
}

function fetchQuote(cat){
  if(cat === 'general'){
    return fetchJSON('https://dummyjson.com/quotes/random',8000).then(function(j){
      return { text:j.quote, author:j.author };
    });
  }
  if(cat === 'bible'){
    return fetchJSON('https://bible-api.com/data/web/random',8000).then(function(j){
      var v = j.random_verse || {};
      var txt = (v.text || '').replace(/\s+/g,' ').trim();
      if(!txt) throw new Error('Empty verse');
      return { text:txt, author:(v.book || '') + ' ' + (v.chapter || '') + ':' + (v.verse || '') };
    });
  }
  if(cat === 'quran'){
    /* some ayahs are pages long (2:282), so retry once or twice for a
       quote-sized verse instead of blowing up the card */
    function getAyah(tries){
      return fetchJSON('https://api.alquran.cloud/v1/ayah/random/en.pickthall',9000).then(function(j){
        var d = j && j.data;
        if(!d || !d.text) throw new Error('Empty ayah');
        var s = d.surah || {};
        var txt = String(d.text).replace(/\s+/g,' ').trim();
        if(txt.length > 300 && tries < 2) return getAyah(tries + 1);
        var ref = (s.englishName || 'Qur\'an') + ' ' + (s.number || '') + ':' + (d.numberInSurah || '');
        return { text:txt, author:ref + ' · Pickthall' };
      });
    }
    return getAyah(0);
  }
  return Promise.resolve(localQuote('philosophy'));
}

function customQuote(){
  var text = (gs(K.customQuote) || '').trim();
  var author = (gs(K.customQuoteAuthor) || '').trim();
  if(!text) return { text:'Your own quote will appear here. Add one in Settings \u2192 Widgets.', author:'' };
  return { text:text, author:author };
}

/* every N seconds rotate through the offline pools — no network per tick */
var _quoteTimer = null;
function quoteAutoOn(){
  return (gs(K.quoteAuto) || '0') === '1';
}
function quoteIntervalSecs(){
  var secs = parseInt(gs(K.quoteEvery),10);
  if(!(secs > 0)) secs = 0;
  if(secs > 0 && secs < 5) secs = 5;
  return secs;
}
function startQuoteTimer(){
  if(_quoteTimer){ clearInterval(_quoteTimer); _quoteTimer = null; }
  if(!isShown('quote') || !quoteAutoOn()) return;
  var secs = quoteIntervalSecs();
  if(!(secs > 0)) return;
  _quoteTimer = setInterval(function(){
    if(document.hidden) return;
    if(!quoteAutoOn()) return;
    var cat = gs(K.quoteCat) || 'general';
    /* a hand-written quote should never be replaced automatically */
    if(cat === 'custom') return;
    var base = (cat === 'random') ? pick(['general','philosophy','bible','quran']) : cat;
    renderQuote(localQuote(base));
  }, secs * 1000);
}

/* a fresh random quote on every new tab, in every category */
function loadQuote(force){
  var cat  = gs(K.quoteCat) || 'general';

  /* gate the prayer feature on the category itself, so switching away hides
     the widget, its settings and its window immediately */
  var quran = quranActive();
  document.body.classList.toggle('quran-mode', quran);
  applyWidgetVisibility(true);
  if(!quran){
    if(_prayerOpen) closePrayer();
    hidePrayerToast();
  } else if(isShown('prayer') && !_prayerData){
    loadPrayer(false);
  }

  if(!isShown('quote')) return;

  if(cat === 'custom'){
    renderQuote(customQuote());
    setText($('quote-status'), (gs(K.customQuote) || '').trim()
      ? 'Your custom quote is showing.'
      : 'No custom quote saved yet — add one above.');
    return;
  }

  var base = (cat === 'random') ? pick(['general','philosophy','bible','quran']) : cat;

  /* rotation off? then keep the quote you left on screen last time */
  if(!force && !quoteAutoOn()){
    var last = parseJSON(gs(K.quoteLast), null);
    if(last && last.text && last.cat === cat){
      renderQuote({ text:last.text, author:last.author });
      setText($('quote-status'), 'Rotation is off, so same one as before.');
      return;
    }
  }

  /* show something instantly, even on a bad connection */
  renderQuote(localQuote(base));
  setText($('quote-status'),'Loading…');

  if(base === 'philosophy'){
    setText($('quote-status'),'Built-in collection · random each tab');
    return;
  }

  fetchQuote(base).then(function(q){
    renderQuote(q);
    ss(K.quoteCache,JSON.stringify({ base:base, text:q.text, author:q.author, ts:Date.now() }));
    var src = base === 'bible' ? 'bible-api.com'
            : base === 'quran' ? 'alquran.cloud'
            : 'dummyjson.com';
    setText($('quote-status'),'Source: ' + src + ' · random each tab');
  }).catch(function(){
    setText($('quote-status'),'Offline — here is one from within.');
  });
}

/* ══════════════════════════════════════════
   SETTINGS PANEL
══════════════════════════════════════════ */
var overlay = $('overlay');
var _closeTimer = null;

function openPanel(){
  if(!overlay) return;
  if(_closeTimer){ clearTimeout(_closeTimer); _closeTimer = null; }
  overlay.style.display = 'flex';
  loadUI();
  refreshRichLabels();
  syncAllRangeFills();
  refreshClockLivePreviews();
  /* a slow tick keeps a rich dropdown's face in step when another control
     changes its native value (the quote presets do this to each other) */
  if(!_richSyncTimer) _richSyncTimer = setInterval(function(){
    if(document.hidden) return;
    refreshRichLabels();
  }, 500);
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      overlay.classList.add('open','open-anim');
      scheduleLens();
    });
  });
}
var _richSyncTimer = null;
function closePanel(){
  if(!overlay) return;
  if(_richOpen) closeRich(_richOpen);
  if(_richSyncTimer){ clearInterval(_richSyncTimer); _richSyncTimer = null; }
  overlay.classList.remove('peek');
  var hud = $('peek-hud');
  if(hud) hud.classList.remove('on');
  overlay.classList.remove('open-anim');
  scheduleLens();
  if(_closeTimer) clearTimeout(_closeTimer);
  _closeTimer = setTimeout(function(){
    overlay.classList.remove('open');
    overlay.style.display = 'none';
    _closeTimer = null;
  },360);
}

/* ══════════════════════════════════════════
   BUILDERS  (built once, then only re-selected)
══════════════════════════════════════════ */
var _built = {};
function builtOnce(id){
  if(_built[id]) return true;
  _built[id] = 1;
  return false;
}
function selectIn(container,sel,attr,val){
  if(!container) return;
  Array.prototype.forEach.call(container.querySelectorAll(sel),function(n){
    n.classList.toggle('selected',n.getAttribute(attr) === val);
  });
}

function buildClockStyleGrid(current){
  var g = $('clock-style-grid');
  if(!g) return;
  if(!current || current === 'colon') current = 'default';
  if(builtOnce('clock')){ selectIn(g,'.clock-card','data-id',current); return; }
  g.innerHTML = '';
  CLOCK_STYLES.forEach(function(cs){
    var c = document.createElement('div');
    c.className = 'clock-card';
    c.setAttribute('data-id',cs.id);
    c.innerHTML = '<div class="cname">' + cs.name + '</div><div class="cprev">' + clockPreviewText(cs.id) + '</div>';
    c.onclick = function(){
      selectIn(g,'.clock-card','data-id',cs.id);
      ss(K.clockStyle,cs.id);
      applyClockStyle();
      refreshClockCard();
      scheduleClock();
      scheduleRefit();
    };
    g.appendChild(c);
  });
  selectIn(g,'.clock-card','data-id',current);
}

function toggleCustomFont(name){
  var w = $('custom-font-wrap');
  if(w) w.style.display = (name === 'Custom') ? '' : 'none';
  if(name !== 'Custom') setFontStatus('');
}

/* Show a plain-language result under the custom-font box: neutral while we
   check, green when it worked, red when it did not. */
function setFontStatus(msg,ok){
  var el = $('font-status');
  if(!el) return;
  el.textContent = msg || '';
  el.className = 'font-status' + (msg ? (ok ? ' ok' : ' err') : '');
}

/* Is the name installed on this machine? Compares the width of a sample
   string rendered with the named font against a generic fallback. */
function fontAvailable(name){
  try{
    var ctx = document.createElement('canvas').getContext('2d');
    var sample = 'mmmmmmmmmmlliWW0123456789@#';
    ctx.font = '72px monospace';
    var base = ctx.measureText(sample).width;
    ctx.font = '72px "' + name + '", monospace';
    return ctx.measureText(sample).width !== base;
  }catch(e){ return false; }
}

/* Is a @font-face already registered for this family (our bundled font, or a
   Google font loaded earlier this session)? */
function fontLoaded(name){
  if(!document.fonts || !document.fonts.forEach) return false;
  var want = String(name).replace(/['"]/g,'').trim().toLowerCase();
  var found = false;
  document.fonts.forEach(function(f){
    if(String(f.family).replace(/['"]/g,'').trim().toLowerCase() === want) found = true;
  });
  return found;
}

/* Try to make a font real: first a local install, then Google Fonts.
   Resolves true only when the font can actually be rendered. */
function tryCustomFont(name){
  var clean = String(name || '').replace(/['"\\]/g,'').trim();
  if(!clean) return Promise.resolve(false);
  if(fontLoaded(clean) || fontAvailable(clean)) return Promise.resolve(true);
  if(!document.fonts || !document.fonts.load) return Promise.resolve(true);

  var gname = encodeURIComponent(clean).replace(/%20/g,'+');
  return new Promise(function(resolve){
    var settled = false;
    function finish(ok){
      if(settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    }
    var timer = setTimeout(function(){ finish(false); }, 6000);
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + gname + ':wght@300;400;600&display=swap';
    link.onerror = function(){ finish(false); };
    link.onload = function(){
      _fontLinks[gname] = true;
      document.fonts.load('16px "' + clean + '"').then(function(faces){
        finish(!!(faces && faces.length));
      }).catch(function(){ finish(false); });
    };
    document.head.appendChild(link);
  });
}

function buildFontGrid(){
  var g = $('font-grid');
  if(!g) return;
  if(builtOnce('font')) return;
  g.innerHTML = '';
  var saved = parseJSON(gs(K.font),null);
  FONTS.forEach(function(f){
    var c = document.createElement('div');
    c.className = 'font-card';
    c.setAttribute('data-name',f.name);
    var nameEl = document.createElement('div');
    nameEl.className = 'fname';
    nameEl.textContent = f.name;
    var prev = document.createElement('div');
    prev.className = 'fprev';
    prev.textContent = f.prev;
    c.appendChild(nameEl); c.appendChild(prev);
    /* tiny subset request, only when the user actually hovers a card */
    if(f.gfont){
      c.addEventListener('mouseenter',function(){
        loadGFont(f.gfont,f.prev);
        prev.style.fontFamily = f.family;
      },{once:true});
    } else {
      prev.style.fontFamily = f.family;
    }
    c.onclick = function(){
      selectIn(g,'.font-card','data-name',f.name);
      toggleCustomFont(f.name);
      prev.style.fontFamily = f.family;
      ss(K.font,JSON.stringify({name:f.name,family:f.family,gfont:f.gfont || null}));
      applyFont(f.family,f.gfont || null);
      scheduleRefit();
    };
    g.appendChild(c);
  });

  /* custom is always last, and its input only appears once it's picked */
  var cc = document.createElement('div');
  cc.className = 'font-card';
  cc.setAttribute('data-name','Custom');
  var cname = document.createElement('div');
  cname.className = 'fname';
  cname.textContent = 'Custom';
  var cprev = document.createElement('div');
  cprev.className = 'fprev';
  cprev.textContent = 'Custom';
  cc.appendChild(cname); cc.appendChild(cprev);
  cc.onclick = function(){
    selectIn(g,'.font-card','data-name','Custom');
    toggleCustomFont('Custom');
    var icf = $('icustomfont');
    if(icf) icf.focus();
  };
  g.appendChild(cc);

  var known = saved && FONTS.some(function(f){ return f.name === saved.name; });
  var sel = known ? saved.name : ((saved && saved.gfont) ? 'Custom' : 'Default');
  selectIn(g,'.font-card','data-name',sel);
  toggleCustomFont(sel);
}

function buildAnimGrid(){
  var g = $('anim-grid');
  if(!g) return;
  if(builtOnce('anim')){ selectIn(g,'.anim-card','data-id',gs(K.animStyle) || 'spring'); return; }
  g.innerHTML = '';
  ANIM_STYLES.forEach(function(a){
    var c = document.createElement('div');
    c.className = 'anim-card';
    c.setAttribute('data-id',a.id);
    c.innerHTML = '<div class="anim-icon">' + a.icon + '</div><div>' + a.name + '</div>';
    c.title = a.desc;
    c.onclick = function(){
      selectIn(g,'.anim-card','data-id',a.id);
      ss(K.animStyle,a.id);
      applyAnimStyle(a.id);
    };
    g.appendChild(c);
  });
  selectIn(g,'.anim-card','data-id',gs(K.animStyle) || 'spring');
}

function buildGreetColorSwatches(){
  var g = $('greet-color-swatches');
  if(!g) return;
  if(builtOnce('greetcolor')){ selectIn(g,'.swatch','data-color',gs(K.greetColor) || '#ffffff'); return; }
  g.innerHTML = '';
  var cur = gs(K.greetColor) || '#ffffff';
  GREET_COLORS.forEach(function(col){
    var s = document.createElement('div');
    s.className = 'swatch';
    s.style.background = col;
    s.title = col;
    s.setAttribute('data-color',col);
    if(col === '#000000' || col === '#1c1c1e' || col === '#2c2c2e' || col === '#3a3a3c'){
      s.style.border = '2px solid rgba(255,255,255,0.25)';
    }
    s.onclick = function(){
      selectIn(g,'.swatch','data-color',col);
      ss(K.greetColor,col);
      applyGreetingStyle();
    };
    g.appendChild(s);
  });
  selectIn(g,'.swatch','data-color',cur);
}

function buildFontColorSwatches(){
  var g = $('font-color-swatches');
  if(!g) return;
  var cur = gs(K.fontColor) || '#ffffff';
  if(builtOnce('fontcolor')){ selectIn(g,'.swatch','data-color',cur); return; }
  g.innerHTML = '';
  GREET_COLORS.forEach(function(col){
    var s = document.createElement('div');
    s.className = 'swatch';
    s.style.background = col;
    s.title = col;
    s.setAttribute('data-color',col);
    if(col === '#000000' || col === '#1c1c1e' || col === '#2c2c2e' || col === '#3a3a3c'){
      s.style.border = '2px solid rgba(255,255,255,0.25)';
    }
    s.onclick = function(){
      selectIn(g,'.swatch','data-color',col);
      ss(K.fontColor,col);
      applyFontColor();
      var inp = $('ifontcolor');
      if(inp) inp.value = col;
    };
    g.appendChild(s);
  });
  selectIn(g,'.swatch','data-color',cur);
}

function buildGlassTintSwatches(){
  var g = $('glass-tint-swatches');
  if(!g) return;
  if(builtOnce('glasstint')){ selectIn(g,'.swatch','data-color',gs(K.glassTint) || GLASS_TINTS[GLASS_TINTS.length - 1]); return; }
  g.innerHTML = '';
  var cur = gs(K.glassTint) || GLASS_TINTS[GLASS_TINTS.length - 1];
  GLASS_TINTS.forEach(function(col){
    var s = document.createElement('div');
    s.className = 'swatch';
    s.style.background = col;
    s.setAttribute('data-color',col);
    if(col === 'rgba(0,0,0,1)' || col === 'rgba(30,30,60,1)' || col === 'rgba(50,50,50,1)' || col === 'rgba(15,15,30,1)'){
      s.style.border = '2px solid rgba(255,255,255,0.25)';
    }
    s.onclick = function(){
      selectIn(g,'.swatch','data-color',col);
      ss(K.glassTint,col);
      applyGlassSettings();
      markPreset('');
    };
    g.appendChild(s);
  });
  selectIn(g,'.swatch','data-color',cur);
}

function markPreset(id){
  var row = $('preset-row');
  if(!row) return;
  Array.prototype.forEach.call(row.querySelectorAll('.preset'),function(b){
    b.classList.toggle('on',b.getAttribute('data-preset') === id);
  });
}
/* highlight whichever preset the stored values match — a fresh install matches
   "liquid", so that is the one that reads as chosen */
function markMatchingGlassPreset(){
  var blur  = parseInt(gs(K.glassBlur)  || '2',10);
  var alpha = parseInt(gs(K.glassAlpha) || '21',10);
  var tint  = gs(K.glassTint) || GLASS_TINTS[GLASS_TINTS.length - 1];
  var hit = '';
  Object.keys(GLASS_PRESETS).forEach(function(k){
    var p = GLASS_PRESETS[k];
    if(p.blur === blur && p.alpha === alpha && p.tint === tint) hit = k;
  });
  markPreset(hit);
}

function buildBrowserGrid(){
  var g = $('browser-grid');
  if(!g) return;
  if(builtOnce('browser')){ selectIn(g,'.browser-card','data-name',gs(K.browser) || ''); return; }
  g.innerHTML = '';
  var cur = gs(K.browser) || '';
  BROWSERS.forEach(function(b){
    var c = document.createElement('div');
    c.className = 'browser-card';
    c.setAttribute('data-name',b.name);
    var img = document.createElement('img');
    img.alt = b.name;
    img.src = b.favicon;
    img.onerror = function(){
      try{ img.src = iconURL(new URL(b.url).hostname); }catch(e){ img.style.display = 'none'; }
    };
    var nameEl = document.createElement('span');
    nameEl.textContent = b.name;
    c.appendChild(img); c.appendChild(nameEl);
    c.onclick = function(){
      selectIn(g,'.browser-card','data-name',b.name);
      ss(K.browser,b.name);
      ss(K.fav,b.favicon);
      ss(K.browserCustom,'');
      applyBrowserFav(b.favicon);
    };
    g.appendChild(c);
  });
  selectIn(g,'.browser-card','data-name',cur);
}

function buildScEditor(){
  var list = $('sclist');
  if(!list) return;
  list.innerHTML = '';
  getSC().forEach(function(sc,i){
    var row = document.createElement('div');
    row.className = 'sci';
    var urlInp = document.createElement('input');
    urlInp.placeholder = 'URL';
    urlInp.value = sc.url || '';
    var labelInp = document.createElement('input');
    labelInp.placeholder = 'Label';
    labelInp.value = sc.label || '';
    var del = document.createElement('button');
    del.className = 'sdel';
    del.textContent = '✕';
    row.appendChild(urlInp); row.appendChild(labelInp); row.appendChild(del);
    list.appendChild(row);

    urlInp.oninput = function(){
      var a = getSC(); a[i].url = urlInp.value; saveSC(a);
      /* the icon for a new domain is fetched (and cached) right away */
      cacheFavicon(domainOf(urlInp.value),false);
      scheduleShortcuts();
    };
    labelInp.oninput = function(){
      var a = getSC(); a[i].label = labelInp.value; saveSC(a);
      scheduleShortcuts();
    };
    del.onclick = function(){
      var a = getSC(); a.splice(i,1); saveSC(a);
      buildScEditor(); renderSC();
    };
  });
}

function buildPosControls(){
  var box = $('pos-controls');
  if(!box) return;
  box.innerHTML = '';
  var labels = {
    shortcuts:'Shortcuts', datetime:'Clock & date', calendar:'Calendar', prayer:'Prayer times', 'greeting-wrap':'Greeting',
    searchbar:'Search bar', 'gear-btn':'Settings button', weather:'Weather', quote:'Quote'
  };
  var W = window.innerWidth, H = window.innerHeight;
  EL_IDS.forEach(function(id){
    var el = $(id);
    if(!el) return;
    var rect = el.getBoundingClientRect();
    var curX = Math.max(0, Math.round(rect.left));
    var curY = Math.max(0, Math.round(rect.top));

    var block = document.createElement('div');
    block.className = 'pos-block';

    var head = document.createElement('div');
    head.className = 'reset-row';

    var lab = document.createElement('span');
    lab.textContent = labels[id] || id;
    head.appendChild(lab);

    var rb = document.createElement('button');
    rb.type = 'button';
    rb.className = 'mini-btn';
    rb.textContent = 'Reset';
    rb.title = 'Reset only this widget';
    rb.onclick = function(){
      resetWidget(id);
      flash(rb,'Reset');
      if(id === 'quote'){ loadQuote(true); startQuoteTimer(); }
      if(id === 'weather'){ loadWeather(true); }
      setTimeout(buildPosControls,150);
    };
    head.appendChild(rb);
    block.appendChild(head);

    var xInp = slider('Left','px_',curX,Math.max(120,W-80));
    var yInp = slider('Top', 'py_',curY,Math.max(80, H-60));

    function slider(label,prefix,val,max){
      var row = document.createElement('div');
      row.className = 'pos-row';
      var l = document.createElement('label');
      l.textContent = label;
      var inp = document.createElement('input');
      inp.type = 'range'; inp.min = '0'; inp.max = String(max);
      inp.step = '1'; inp.value = String(val);
      inp.id = prefix + id;
      var out = document.createElement('span');
      out.textContent = String(val);
      row.appendChild(l); row.appendChild(inp); row.appendChild(out);
      inp._out = out;

      inp.oninput = function(){
        var v = parseInt(inp.value,10) || 0;
        out.textContent = v;
        if(prefix === 'px_'){
          el.style.left = v + 'px';
        } else {
          el.style.top = v + 'px';
        }
        el.style.right  = 'auto';
        el.style.bottom = 'auto';
        el.style.transform = 'none';
        showPeek(labels[id] + ' · ' + label + ' ' + v + ' px', inp);
        commitPos();
      };
      inp.onpointerdown = function(){ startPeek(inp); };
      inp.onpointerup   = function(){ endPeek(); commitPos(); };
      inp.onpointercancel = endPeek;
      inp.onchange = commitPos;
      inp.onblur   = endPeek;
      block.appendChild(row);
      return inp;
    }

    /* Save where the widget actually sits and mirror that back into BOTH
       sliders, so the Left and Top rows can never disagree or wipe each
       other — whichever one you move, the other follows the real position. */
    function commitPos(){
      var r = el.getBoundingClientRect();
      var nx = Math.round(r.left), ny = Math.round(r.top);
      saveWidgetPos(id, nx, ny);
      xInp.value = String(nx); yInp.value = String(ny);
      if(xInp._out) xInp._out.textContent = String(nx);
      if(yInp._out) yInp._out.textContent = String(ny);
    }

    box.appendChild(block);
  });
}

/* ── peek: fade the settings panel while dragging a position slider ── */
/* While a slider is held, every other control fades out so the widget behind
   the panel can be seen moving. The slider being dragged keeps full strength —
   fading it too was making the panel look empty and the slider hard to aim. */
var _peekDim = [];
function clearPeekDim(){
  _peekDim.forEach(function(node){ node.classList.remove('peek-dim'); });
  _peekDim = [];
}
function dimPeekPath(el){
  clearPeekDim();
  if(!el || !el.closest) return;
  var box = el.closest('#panel, .win-panel, .prayer-panel, .changelog-panel');
  if(!box) return;
  /* keep the whole slider row (label + track + value) solid, not just the
     input, so the thing under your finger never fades */
  var node = el.closest('.pos-row') || el;
  while(node && node !== box){
    var parent = node.parentElement;
    if(!parent) break;
    Array.prototype.forEach.call(parent.children, function(ch){
      if(ch === node) return;
      ch.classList.add('peek-dim');
      _peekDim.push(ch);
    });
    node = parent;
  }
}
function showPeek(text, el){
  var hud = $('peek-hud'), ov = $('overlay');
  var already = !!(ov && ov.classList.contains('peek'));
  if(ov) ov.classList.add('peek');
  if(hud){ hud.textContent = text; hud.classList.add('on'); }
  if(el && !already) dimPeekPath(el);
}
function startPeek(el){
  var ov = $('overlay'), hud = $('peek-hud');
  if(ov) ov.classList.add('peek');
  if(hud) hud.classList.add('on');
  dimPeekPath(el);
}
function endPeek(){
  var ov = $('overlay'), hud = $('peek-hud');
  if(ov) ov.classList.remove('peek');
  if(hud) hud.classList.remove('on');
  clearPeekDim();
  Array.prototype.forEach.call(
    document.querySelectorAll('.win-modal.peek,.prayer-modal.peek'),
    function(m){ m.classList.remove('peek'); }
  );
}
/* update the peek read-out only while a peek is already running, so keyboard
   nudges never leave the panel faded on its own */
function peekUpdate(text){
  var ov = $('overlay'), hud = $('peek-hud');
  if(ov && ov.classList.contains('peek') && hud) hud.textContent = text;
}
/* fade the panel for the whole time the pointer rests on a slider */
function wirePeek(el, label){
  if(!el) return;
  el.addEventListener('pointerdown', function(){
    startPeek(el);
    var hud = $('peek-hud');
    if(hud) hud.textContent = (typeof label === 'function') ? label() : label;
  });
  el.addEventListener('pointerup', endPeek);
  el.addEventListener('pointercancel', endPeek);
  el.addEventListener('blur', endPeek);
}
/* fade one centred window while its own slider is dragged, so the widget
   behind it updates in plain sight */
function wireWinPeek(el, modalId, label){
  if(!el) return;
  var m = $(modalId);
  function on(){
    if(m) m.classList.add('peek');
    startPeek(el);
    var hud = $('peek-hud');
    if(hud) hud.textContent = (typeof label === 'function') ? label() : label;
  }
  el.addEventListener('pointerdown', on);
  el.addEventListener('pointerup', endPeek);
  el.addEventListener('pointercancel', endPeek);
  el.addEventListener('blur', endPeek);
}
/* safety net: pointer released anywhere ends the peek */
window.addEventListener('pointerup', endPeek);

/* ══════════════════════════════════════════
   LOAD UI
══════════════════════════════════════════ */
function loadUI(){
  /* greeting */
  var ni = $('iname'), si = $('istyle'), ci = $('icustomgreet');
  if(ni) ni.value = gs(K.name) || '';
  if(si){ si.value = gs(K.style) || 'hi'; toggleCustomGreet(si.value); }
  if(ci) ci.value = gs(K.customGreet) || '';

  /* clock */
  buildClockStyleGrid(gs(K.clockStyle) || 'default');
  var ih = $('ihour'), isec = $('isecs'), idf = $('idatefmt');
  if(ih) ih.value = gs(K.hourFmt) || '24';
  if(isec) isec.value = gs(K.showSecs) || '0';
  if(idf) idf.value = gs(K.dateFmt) || 'long';
  var ics = $('iclocktime'), icsv = $('iclocktime-v');
  if(ics){
    var cs = parseInt(gs(K.clockSize),10);
    if(!(cs > 0)) cs = clockFontSizes().time;
    ics.value = cs;
    if(icsv) icsv.textContent = cs + 'px';
  }
  var ias = $('icalsize'), iasv = $('icalsize-v');
  if(ias){
    var csz = parseInt(gs(K.calSize),10);
    if(!(csz > 0)) csz = 9;
    ias.value = csz;
    if(iasv) iasv.textContent = csz + 'px';
  }
  syncCalSizeUI();
  var its = $('itimesource');
  if(its) its.value = gs(K.timeSource) || 'device';

  /* display */
  buildFontGrid();
  var icf = $('icustomfont');
  if(icf) icf.value = gs(K.customFont) || '';

  var igw = $('igreetweight'), igs2 = $('igreetsyle'), igsize = $('igreetsize');
  if(igw)    igw.value    = gs(K.greetWeight) || '400';
  if(igs2)   igs2.value   = gs(K.greetItalic) || 'normal';
  if(igsize) igsize.value = gs(K.greetSize)   || '22px';

  buildGlassTintSwatches();
  buildGreetColorSwatches();
  buildFontColorSwatches();
  var fci = $('ifontcolor');
  if(fci) fci.value = gs(K.fontColor) || '#ffffff';
  var gti = $('iglasstint');
  if(gti) gti.value = tintToHex(gs(K.glassTint) || GLASS_TINTS[GLASS_TINTS.length - 1]);

  var blur  = parseInt(gs(K.glassBlur)  || '2',10);
  var alpha = parseInt(gs(K.glassAlpha) || '21',10);
  var bs = $('iglassblur'), as = $('iglassalpha');
  var bv = $('iglassblur-v'), av = $('iglassalpha-v');
  if(bs){ bs.value = blur;  if(bv) bv.textContent = blur + 'px'; }
  if(as){ as.value = alpha; if(av) av.textContent = alpha + '%'; }

  var lc = $('lens-custom');
  if(lc) lc.checked = lensCustom();
  syncLensSliders();
  updateLensUI(false);
  markMatchingGlassPreset();

  buildAnimGrid();
  buildBrowserGrid();
  buildGradGrid();
  buildScEditor();

  /* widgets */
  setChecked('w-greet',     gs(K.showGreet)     !== '0');
  setChecked('w-clock',     gs(K.showClock)     !== '0');
  setChecked('w-calendar',  gs(K.showCalendar)  !== '0');
  setChecked('w-prayer',    gs(K.showPrayer)    !== '0');
  setChecked('w-prayer-sound', gs(K.prayerSound) !== '0');
  var prs = $('prayer-remind');
  if(prs) prs.value = String(prayerRemindMins());
  setChecked('w-search',    gs(K.showSearch)    !== '0');
  setChecked('w-shortcuts', gs(K.showShortcuts) !== '0');
  setChecked('w-weather',   gs(K.showWeather)   !== '0');
  setChecked('w-quote',     gs(K.showQuote)     !== '0');
  setChecked('w-status',    gs(K.showStatus)    !== '0');
  setChecked('w-stocks',    gs(K.showStocks)    === '1');
  setChecked('w-holidays',  gs(K.showHolidays)  === '1');
  var hc = $('iholidaycountry');
  if(hc) hc.value = (gs(K.holidayCountry) || '').toUpperCase();
  var sl = $('istockslist');
  var sev = $('istocksevery');
  if(sev) sev.value = String(stocksEveryMin());
  syncStocksUI();
  setChecked('p-pause',     gs(K.pauseHidden)   !== '0');
  applyWallModeUI();

  var se = $('isearchengine');
  if(se) se.value = gs(K.searchEngine) || 'google';

  var wl = $('iweatherloc');
  if(wl) wl.value = gs(K.weatherCity) || '';
  var wu = $('iweatherunit');
  if(wu) wu.value = gs(K.weatherUnit) || 'c';
  var we = $('iweatherevery');
  if(we){
    var wm = parseInt(gs(K.weatherEvery),10);
    if(!(wm > 0)) wm = WEATHER_DEFAULT_MIN;
    we.value = wm;
  }

  var qc = $('iquotecat');
  if(qc){
    qc.value = gs(K.quoteCat) || 'general';
    toggleCustomQuote(qc.value);
  }
  var qe = $('iquoteevery');
  if(qe){
    qe.value = gs(K.quoteEvery) || '';
    qe.disabled = !quoteAutoOn();
  }
  setChecked('q-auto', quoteAutoOn());
  var icq = $('icustomquote'), icqa = $('icustomquoteauthor');
  if(icq)  icq.value  = gs(K.customQuote) || '';
  if(icqa) icqa.value = gs(K.customQuoteAuthor) || '';
  var qal = $('iquotealign'), qst = $('iquotestyle'), qsz = $('iquotesize'), qszv = $('iquotesize-v');
  var qaa = $('iquoteauthoralign'), qas = $('iquoteauthorstyle'), qaz = $('iquoteauthorsize'), qazv = $('iquoteauthorsize-v');
  if(qal) qal.value = gs(K.quoteAlign) || 'left';
  if(qst) qst.value = gs(K.quoteStyle) || 'italic';
  if(qaa) qaa.value = gs(K.quoteAuthorAlign) || 'right';
  if(qas) qas.value = gs(K.quoteAuthorStyle) || 'normal';
  var qsv = parseInt(gs(K.quoteSize),10);        if(!(qsv > 0)) qsv = 13;
  var qav = parseInt(gs(K.quoteAuthorSize),10);  if(!(qav > 0)) qav = 11;
  if(qsz){ qsz.value = qsv; if(qszv) qszv.textContent = qsv + 'px'; }
  if(qaz){ qaz.value = qav; if(qazv) qazv.textContent = qav + 'px'; }
  startQuoteTimer();

  /* video view */
  var vz = $('ivideozoom'), vzv = $('ivideozoom-v');
  var vx = $('ivideox'), vxv = $('ivideox-v');
  var vy = $('ivideoy'), vyv = $('ivideoy-v');
  var zVal = parseInt(gs(K.videoZoom),10); if(isNaN(zVal)) zVal = 100;
  var xVal = parseInt(gs(K.videoX),10);    if(isNaN(xVal)) xVal = 0;
  var yVal = parseInt(gs(K.videoY),10);    if(isNaN(yVal)) yVal = 0;
  if(vz){ vz.value = zVal; if(vzv) vzv.textContent = zVal + '%'; }
  if(vx){ vx.value = xVal; if(vxv) vxv.textContent = xVal; }
  if(vy){ vy.value = yVal; if(vyv) vyv.textContent = yVal; }

  /* video */
  loadBlob(function(b){
    var vs = $('vstatus');
    if(vs) vs.textContent = b ? '✓ Custom video loaded' : 'No custom video set.';
  });

  /* tab */
  var its = $('itabnamestyle'), ict = $('icustomtabname');
  if(its){ its.value = gs(K.tabNameStyle) || 'default'; toggleCustomTabName(its.value); }
  if(ict) ict.value = gs(K.customTabName) || '';
  setChecked('tab-scroll', gs(K.tabScroll) !== '0');

  /* screen scaling */
  var scs = $('iscale');
  if(scs){
    var savedKey = gs(K.uiScalePreset) || '';
    if(savedKey && UI_SCALES[savedKey] !== undefined){
      scs.value = savedKey;
    } else {
      var us = parseFloat(gs(K.uiScale));
      var match = '';
      Object.keys(UI_SCALES).forEach(function(k){
        if(Math.abs(UI_SCALES[k] - us) < 0.01) match = k;
      });
      scs.value = match || 'hd';
    }
  }

  /* layout */
  buildPosControls();
  applyPanelSize();
}

function setChecked(id,on){
  var el = $(id);
  if(el) el.checked = !!on;
}

/* ══════════════════════════════════════════
   PANE HELPERS
══════════════════════════════════════════ */
function toggleCustomGreet(val){
  var w = $('custom-greeting-wrap');
  if(w) w.style.display = (val === 'custom' ? '' : 'none');
}
function toggleCustomTabName(val){
  var w = $('custom-tabname-wrap');
  if(w) w.style.display = (val === 'custom' ? '' : 'none');
}
function toggleCustomQuote(val){
  var w = $('custom-quote-wrap');
  if(w) w.style.display = (val === 'custom' ? '' : 'none');
}

/* ── animated show/hide for a settings section ──
   Mirrors the UI Animation style: the section enters and leaves with the same
   keyframes the panes use (via the .lx-show/.lx-hide classes built in
   applyAnimStyle). Falls back to an instant toggle for "None", reduced motion,
   or the first paint (animate === false). */
function uiReveal(el, show, animate){
  if(!el) return;
  if(!el._lxBound){
    el._lxBound = true;
    el.addEventListener('animationend', function(ev){
      if(ev.target !== el) return;
      if(el.classList.contains('lx-hide')){
        el.style.display = 'none';
        el.classList.remove('lx-hide');
      }
    });
  }
  var reduce = false;
  try{
    reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }catch(e){}
  var styleId = gs(K.animStyle) || 'spring';
  if(animate === false || reduce || styleId === 'none'){
    el.classList.remove('lx-show','lx-hide');
    el.style.display = show ? '' : 'none';
    return;
  }
  if(show){
    if(el.style.display !== 'none' && !el.classList.contains('lx-hide')) return;
    el.style.display = '';
    el.classList.remove('lx-hide','lx-show');
    void el.offsetWidth;
    el.classList.add('lx-show');
  } else {
    if(el.style.display === 'none' && !el.classList.contains('lx-show')) return;
    el.classList.remove('lx-show','lx-hide');
    void el.offsetWidth;
    el.classList.add('lx-hide');
  }
}

/* show/sync the liquid-lens controls: the whole block only for Liquid Glass,
   the sliders only when "Custom lens" is on */
function updateLensUI(animate){
  var liquid = glassStyle() === 'liquid';
  uiReveal($('lens-block'), liquid, animate);
  uiReveal($('lens-tuning'), liquid && lensCustom(), animate);
}
function syncLensSliders(){
  var lp = $('ilenspeak'), le = $('ilensedge'), lsp = $('ilensspread'), lz = $('ilenszoom');
  var lpv = $('ilenspeak-v'), lev = $('ilensedge-v'), lspv = $('ilensspread-v'), lzv = $('ilenszoom-v');
  var pv = Math.round(lensPeak() * 100);
  var ev = Math.round(lensEdgePx());
  var sv = Math.round(lensSpread() * 100);
  var zv = Math.round(lensZoom() * 100);
  if(lp){ lp.value = pv; if(lpv) lpv.textContent = pv + '%'; }
  if(le){ le.value = ev; if(lev) lev.textContent = lensEdgeLabel(ev); }
  if(lsp){ lsp.value = sv; if(lspv) lspv.textContent = sv + '%'; }
  if(lz){ lz.value = zv; if(lzv) lzv.textContent = zv + '%'; }
  syncAllRangeFills();
}

/* ══════════════════════════════════════════
   BACKUP
══════════════════════════════════════════ */
var BACKUP_KEYS = Object.keys(K).map(function(k){ return K[k]; });

function exportSettings(){
  var out = { app:'custom-new-tab', version:3, savedAt:new Date().toISOString(), settings:{} };
  BACKUP_KEYS.forEach(function(k){
    var v = null;
    try{ v = localStorage.getItem(k); }catch(e){}
    if(v !== null) out.settings[k] = v;
  });
  var blob = new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'custom-new-tab-backup.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1000);
}

function importSettings(file){
  var reader = new FileReader();
  reader.onload = function(e){
    var data = parseJSON(e.target.result,null);
    if(!data || !data.settings){
      flash($('bimport'),'Not a Newly backup');
      return;
    }
    var n = 0;
    Object.keys(data.settings).forEach(function(k){
      if(k.indexOf('nt_') !== 0) return;
      try{ localStorage.setItem(k,data.settings[k]); n++; }catch(err){}
    });
    flash($('bimport'),'Restored');
    setTimeout(function(){ window.location.reload(); },500);
  };
  reader.onerror = function(){ flash($('bimport'),'Couldn\u2019t read that'); };
  reader.readAsText(file);
}

/* ══════════════════════════════════════════
   BOOT
══════════════════════════════════════════ */
ensureWallModeDefault();
/* paint the right surface from the very first frame, before the video blob
   loads — otherwise a fresh gradient profile would flash a frame of video */
document.body.classList.toggle('battery-saver', gs(K.batterySaver) !== '0');
/* show the gradient until IndexedDB says whether a wallpaper exists, so the
   first frames are never a black rectangle */
document.body.classList.add('no-video');
applyWallModeUI();
initFont();
/* remember the weather city's UTC offset across loads, so a "follow the city"
   clock is already right before the first forecast request comes back */
(function(){
  var c = parseJSON(gs(K.weatherCache), null);
  if(c && c.utcOffset != null) _tzOffsetSec = c.utcOffset;
})();
applyGreetingStyle();
applyFontColor();
applyGlassSettings();
applyPanelSize();
applyClockStyle();
applyCalSize();
applyVideoView();
applyGradient();
applyMotion();
applyWaveView();
renderGreeting();
updateTabName();
detectBrowserDefault();
applyBrowserFav(gs(K.fav) || '');
renderSC();
applySearchEngine();
applyWidgetVisibility();
initStatus();
renderCalendar();
scheduleCalendar();
initPrayer();
initStocks();

/* one-time: the quote card used to be saved with a fixed height, which left
   gaps or clipped text as quotes rotated. Switch it back to auto height. */
(function(){
  if(gs('nt_quote_autoh_v1') === '1') return;
  var sz = parseJSON(gs(K.sizes),{}) || {};
  if(sz.quote){ delete sz.quote.h; ss(K.sizes, JSON.stringify(sz)); }
  ss('nt_quote_autoh_v1','1');
})();

/* one-time: widgets used to keep a fixed height, which clipped or pushed
   content after a font change. Mark every saved widget as auto-height. */
(function(){
  if(gs('nt_auto_sizes_v1') === '1') return;
  var sz = parseJSON(gs(K.sizes),{}) || {};
  var changed = false;
  Object.keys(sz).forEach(function(id){
    if(!sz[id]) return;
    sz[id].auto = 1;
    delete sz[id].h;
    changed = true;
  });
  if(changed) ss(K.sizes, JSON.stringify(sz));
  ss('nt_auto_sizes_v1','1');
})();

/* one-time: the weather and markets cards used to measure their base from a
   transient "Updating..." placeholder, which shrank the card and collapsed the
   markets grid once the data landed. Give them the stable base once so existing
   profiles stop looking broken. */
(function(){
  if(gs('nt_datafix_v1') === '1') return;
  var sz = parseJSON(gs(K.sizes),{}) || {};
  ['weather','stocks'].forEach(function(id){
    sz[id] = { w:FIXED_BASE[id].w, auto:1 };
  });
  ss(K.sizes, JSON.stringify(sz));
  ss('nt_datafix_v1','1');
})();

measureBases();
applySizes();
applyPositions();
syncAllRangeFills();

/* one-time repair: older builds stored scale-derived sizes computed from
   DEFAULT_SIZE (too small) and a 0.8 compact preset. Re-apply once with the
   corrected maths so existing profiles stop looking broken. */
(function(){
  var saved = parseFloat(gs(K.uiScale));
  if(saved && gs('nt_scale_fix_v2') !== '1'){
    applyUiScale(saved);
    ss('nt_scale_fix_v2','1');
  }
})();

setLayoutEditing(gs(K.layoutEditing) === '1', true);

EL_IDS.forEach(function(id){
  var el = $(id);
  if(el) makeDraggable(el);
});
RESIZABLE.forEach(function(id){
  var el = $(id);
  if(el){ addResizeKnob(el); addResetKnob(el); }
});

loadBlob(function(b){ applyVideoBlob(b || null); });
initPower();
scheduleClock();

if(isShown('weather')) loadWeather(false);
if(isShown('quote'))   loadQuote(false);
if(isShown('stocks'))  loadStocks(false);
applyQuoteStyle();
startQuoteTimer();
startWeatherTimer();
startStocksTimer();

/* Window resize: re-derive widget widths first (a saved size is clamped to
   the viewport, so shrinking used to leave the smaller inline width behind
   after maximising), then re-place from the saved coordinates. A second pass
   catches late layout work (fonts, scrollbars, zoom) that can still move a
   card by a pixel or two after the first frame. */
var _resizeTimer = null;
var _resizeClassTimer = null;
window.addEventListener('resize',function(){
  /* cards glide to their new spots during a window resize, matching the
     search bar; the class is removed shortly after so dragging stays 1:1 */
  document.body.classList.add('win-resizing');
  if(_resizeClassTimer) clearTimeout(_resizeClassTimer);
  _resizeClassTimer = setTimeout(function(){
    _resizeClassTimer = null;
    document.body.classList.remove('win-resizing');
  }, 700);
  if(_resizeTimer) clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(function(){
    _resizeTimer = null;
    applySizes();
    /* the wave field is measured in screen space, so re-lay it out for the
       new window size (the palette then always spans the whole screen) */
    applyWave(gradientIndex());
    /* widths are inline now, so re-measure on the next frame before placing */
    requestAnimationFrame(applyPositions);
    setTimeout(applyPositions, 260);
  }, 90);
});
document.addEventListener('visibilitychange',function(){
  if(!document.hidden){
    scheduleClock();
    if(_titleRaw && _titleRaw.length > 16) applyTabTitle(_titleRaw);
  } else if(_titleTimer){
    clearInterval(_titleTimer);
    _titleTimer = null;
  }
});

/* ── clock wiring ── */
(function(){
  var ih = $('ihour'), isec = $('isecs'), idf = $('idatefmt');
  if(ih)   ih.onchange   = function(){ ss(K.hourFmt,ih.value);  applyClockStyle(); scheduleClock(); refreshWeatherStamp(); scheduleRefit(); };
  if(isec) isec.onchange = function(){ ss(K.showSecs,isec.value); scheduleClock(); scheduleRefit(); };
  if(idf)  idf.onchange  = function(){ ss(K.dateFmt,idf.value); applyClockStyle(); scheduleClock(); scheduleRefit(); };
  var ics = $('iclocktime'), icsv = $('iclocktime-v');
  if(ics) ics.oninput = function(){
    var v = parseInt(ics.value,10);
    if(!(v > 0)) return;
    ss(K.clockSize,String(v));
    if(icsv) icsv.textContent = v + 'px';
    applyClockStyle();
    refreshClockCard();
    var z = $('clockwin-size'); if(z) z.value = v;
    var zv = $('clockwin-size-v'); if(zv) zv.textContent = v + 'px';
  };
})();

/* ── layout button ── */
(function(){
  var b = $('layout-btn');
  if(b) b.onclick = function(){ setLayoutEditing(!_layoutEditing); };
})();

/* arranging the page: clicking the empty page is a miss, and a miss should
   say so quietly instead of doing nothing at all */
(function(){
  var last = 0;
  document.addEventListener('pointerdown', function(e){
    if(!_layoutEditing) return;
    if(Date.now() - _lastDragEnd < 350) return;
    var t = e.target;
    if(!t || !t.closest) return;
    if(t.closest('.draggable') || t.closest('#layout-btn') || t.closest('#gear-btn') ||
       t.closest('#status-tile') || t.closest('#status-pop') || t.closest('.win-modal') || t.closest('#overlay') ||
       t.closest('#peek-hud') || t.closest('#note-toast') || t.closest('.prayer-toast') ||
       t.closest('.prayer-modal') || t.closest('.changelog-modal') || t.closest('#search-dim')) return;
    var now = Date.now();
    if(now - last < 900) return;      /* one nudge per beat, not a machine gun */
    last = now;
    layoutMiss('That is the page, not a card \u2014 tap a card, or pull its corner.');
  }, true);
})();

/* ── gear / overlay ── */
(function(){
  var gb = $('gear-btn');
  if(gb){
    gb.onclick = function(e){
      if(_layoutEditing) return;
      if(Date.now() - _lastDragEnd < 300) return;   /* don't open right after a drag */
      e.stopPropagation();
      if(overlay && overlay.classList.contains('open-anim')) closePanel();
      else openPanel();
    };
  }
  var xb = $('xbtn');
  if(xb) xb.onclick = closePanel;
  /* clicking the dimmed area no longer closes the panel — use the ✕ instead */
  if(overlay) overlay.onclick = null;
})();

/* ── changelog window (click the version badge) ── */
(function(){
  var modal = $('changelog-modal');
  var body  = $('changelog-body');
  var loaded = false;

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function inline(s){
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }
  function render(md){
    /* skip the file title and intro — the window already has its own header */
    var start = md.search(/^##\s+/m);
    if(start > 0) md = md.slice(start);
    var lines = md.replace(/\r/g,'').split('\n');
    var out = '', inList = false;
    function closeList(){ if(inList){ out += '</ul>'; inList = false; } }
    lines.forEach(function(line){
      if(/^\s*$/.test(line)){ closeList(); return; }
      if(/^#\s+/.test(line)){ closeList(); out += '<h2>' + inline(line.replace(/^#\s+/,'')) + '</h2>'; return; }
      if(/^##\s+/.test(line)){ closeList(); out += '<h3>' + inline(line.replace(/^##\s+/,'')) + '</h3>'; return; }
      if(/^###\s+/.test(line)){ closeList(); out += '<h4>' + inline(line.replace(/^###\s+/,'')) + '</h4>'; return; }
      if(/^\s*[-*]\s+/.test(line)){
        if(!inList){ out += '<ul>'; inList = true; }
        out += '<li>' + inline(line.replace(/^\s*[-*]\s+/,'')) + '</li>';
        return;
      }
      closeList();
      out += '<p>' + inline(line) + '</p>';
    });
    closeList();
    return out;
  }
  function open(){
    if(!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    if(loaded || !body) return;
    body.innerHTML = '<div class="clog-loading">Loading…</div>';
    fetch('CHANGELOG.md').then(function(r){
      if(!r.ok) throw new Error('missing');
      return r.text();
    }).then(function(txt){
      body.innerHTML = render(txt);
      body.scrollTop = 0;
      loaded = true;
    }).catch(function(){
      body.innerHTML = '<p>Couldn\u2019t open the changelog just now. It travels beside these files.</p>';
    });
  }
  function close(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
  }
  var vb = $('version-badge');
  if(vb){
    vb.onclick = open;
    vb.onkeydown = function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); open(); }
    };
  }
  var cb = $('changelog-close');
  if(cb) cb.onclick = close;
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && modal && modal.classList.contains('open')){
      e.stopPropagation();
      close();
    }
  }, true);
})();

/* ── panel tabs ── */
document.querySelectorAll('.tbtn').forEach(function(btn){
  btn.onclick = function(){
    var next = $('pane-' + btn.getAttribute('data-t'));
    var cur  = document.querySelector('.pane.on');
    document.querySelectorAll('.tbtn').forEach(function(b){ b.classList.remove('on'); });
    btn.classList.add('on');
    if(!next || next === cur) return;
    /* let the old pane fade out instead of snapping away; it is lifted out
       of the flow so the new pane's height is the one that counts */
    if(cur){
      cur.classList.remove('on');
      cur.classList.add('out');
      setTimeout(function(){ cur.classList.remove('out'); }, 220);
    }
    next.classList.remove('out');
    next.style.animation = 'none';
    next.classList.add('on');
    requestAnimationFrame(function(){ next.style.animation = ''; });
  };
});

/* ── greeting wiring ── */
(function(){
  var si = $('istyle');
  if(si) si.onchange = function(){
    toggleCustomGreet(si.value);
    ss(K.style,si.value);
    renderGreeting();
  };
  var ni = $('iname');
  if(ni) ni.oninput = function(){ ss(K.name,ni.value.trim()); renderGreeting(); };
  var ci = $('icustomgreet');
  if(ci) ci.oninput = function(){ ss(K.customGreet,ci.value); renderGreeting(); };
})();

/* ── display wiring ── */
(function(){
  var igw = $('igreetweight'), igs2 = $('igreetsyle'), igsize = $('igreetsize');
  if(igw)    igw.onchange    = function(){ ss(K.greetWeight,igw.value);   applyGreetingStyle(); };
  if(igs2)   igs2.onchange   = function(){ ss(K.greetItalic,igs2.value);  applyGreetingStyle(); };
  if(igsize) igsize.onchange = function(){ ss(K.greetSize,igsize.value);  applyGreetingStyle(); };

  /* glass style + tint mode: one class flip on <body>, applied at once */
  var gss = $('glass-style-seg');
  if(gss) gss.addEventListener('click', function(e){
    var b = e.target.closest('.seg-btn');
    if(!b) return;
    ss(K.glassStyle, b.getAttribute('data-glass') === 'liquid' ? 'liquid' : 'classic');
    applyGlassSettings();
    updateLensUI(true);
  });
  var gts = $('glass-tint-seg');
  if(gts) gts.addEventListener('click', function(e){
    var b = e.target.closest('.seg-btn');
    if(!b) return;
    ss(K.glassTintMode, b.getAttribute('data-tintmode') === 'adaptive' ? 'adaptive' : 'manual');
    applyGlassSettings();
  });

  var bs = $('iglassblur'), as = $('iglassalpha');
  var bv = $('iglassblur-v'), av = $('iglassalpha-v');
  if(bs) bs.oninput = function(){
    if(bv) bv.textContent = bs.value + 'px';
    ss(K.glassBlur,bs.value);
    queueGlass();
    markPreset('');
    peekUpdate('Glass blur ' + bs.value + 'px');
  };
  if(as) as.oninput = function(){
    if(av) av.textContent = as.value + '%';
    ss(K.glassAlpha,as.value);
    queueGlass();
    markPreset('');
    peekUpdate('Glass opacity ' + as.value + '%');
  };
  wirePeek(bs, function(){ return 'Glass blur ' + bs.value + 'px'; });
  wirePeek(as, function(){ return 'Glass opacity ' + as.value + '%'; });

  /* ── liquid lens tuning ── */
  var lp = $('ilenspeak'), le = $('ilensedge'), lsp = $('ilensspread'), lz = $('ilenszoom');
  var lpv = $('ilenspeak-v'), lev = $('ilensedge-v'), lspv = $('ilensspread-v'), lzv = $('ilenszoom-v');
  function lensTuningChanged(){
    /* live: rebuild on every frame at a small map size, then one crisp pass
       once the drag settles (scheduleLensLive does both) */
    if(glassStyle() === 'liquid' && lensSupported()) scheduleLensLive();
  }
  if(lp) lp.oninput = function(){
    if(lpv) lpv.textContent = lp.value + '%';
    ss(K.lensPeak, lp.value);
    lensTuningChanged();
    markPreset('');
    peekUpdate('Lens strength ' + lp.value + '%');
  };
  if(le) le.oninput = function(){
    if(lev) lev.textContent = lensEdgeLabel(le.value);
    ss(K.lensEdge, le.value);
    lensTuningChanged();
    markPreset('');
    peekUpdate('Lens edge ' + lensEdgeLabel(le.value));
  };
  if(lsp) lsp.oninput = function(){
    if(lspv) lspv.textContent = lsp.value + '%';
    ss(K.lensSpread, lsp.value);
    lensTuningChanged();
    markPreset('');
    peekUpdate('Lens spread ' + lsp.value + '%');
  };
  if(lz) lz.oninput = function(){
    if(lzv) lzv.textContent = lz.value + '%';
    ss(K.lensZoom, lz.value);
    lensTuningChanged();
    markPreset('');
    peekUpdate('Lens zoom ' + lz.value + '%');
  };
  /* releasing a slider (or any committed change) skips the wait and finishes
     at full resolution right away */
  function lensSettled(){
    dropLensCache();
    if(glassStyle() === 'liquid' && lensSupported()) scheduleLensFull();
  }
  if(lp)  lp.onchange  = lensSettled;
  if(le)  le.onchange  = lensSettled;
  if(lsp) lsp.onchange = lensSettled;
  if(lz)  lz.onchange  = lensSettled;
  wirePeek(lp,  function(){ return 'Lens strength ' + lp.value + '%'; });
  wirePeek(le,  function(){ return 'Lens edge ' + lensEdgeLabel(le.value); });
  wirePeek(lsp, function(){ return 'Lens spread ' + lsp.value + '%'; });
  wirePeek(lz,  function(){ return 'Lens zoom ' + lz.value + '%'; });
  /* back to the fresh-install preset without touching the Custom toggle */
  var lreset = $('lens-reset');
  if(lreset) lreset.onclick = function(){
    ss(K.lensPeak,   String(Math.round(LENS_DEF_PEAK * 100)));
    ss(K.lensEdge,   String(LENS_DEF_EDGE));
    ss(K.lensSpread, String(Math.round(LENS_DEF_SPREAD * 100)));
    ss(K.lensZoom,   String(Math.round(LENS_DEF_ZOOM * 100)));
    syncLensSliders();
    dropLensCache();
    if(glassStyle() === 'liquid' && lensSupported()) scheduleLensFull();
    markPreset('');
    peekUpdate('Lens reset');
  };

  var lc = $('lens-custom');
  if(lc) lc.onchange = function(){
    ss(K.lensCustom, lc.checked ? '1' : '0');
    if(lc.checked){
      /* seed the sliders at the recommended lens the first time Custom is on */
      if(gs(K.lensPeak)   == null) ss(K.lensPeak,   String(Math.round(LENS_DEF_PEAK * 100)));
      if(gs(K.lensEdge)   == null) ss(K.lensEdge,   String(LENS_DEF_EDGE));
      if(gs(K.lensSpread) == null) ss(K.lensSpread, String(Math.round(LENS_DEF_SPREAD * 100)));
      if(gs(K.lensZoom)   == null) ss(K.lensZoom,   String(Math.round(LENS_DEF_ZOOM * 100)));
      syncLensSliders();
    }
    dropLensCache();
    if(glassStyle() === 'liquid' && lensSupported()) scheduleLensFull();
    markPreset('');
    updateLensUI(true);
    peekUpdate(lc.checked ? 'Custom lens on' : 'Recommended lens');
  };

  var row = $('preset-row');
  if(row){
    Array.prototype.forEach.call(row.querySelectorAll('.preset'),function(b){
      b.onclick = function(){
        var p = GLASS_PRESETS[b.getAttribute('data-preset')];
        if(!p) return;
        ss(K.glassBlur,p.blur);
        ss(K.glassAlpha,p.alpha);
        ss(K.glassTint,p.tint);
        if(bs){ bs.value = p.blur; if(bv) bv.textContent = p.blur + 'px'; }
        if(as){ as.value = p.alpha; if(av) av.textContent = p.alpha + '%'; }
        applyGlassSettings();
        selectIn($('glass-tint-swatches'),'.swatch','data-color',p.tint);
        markPreset(b.getAttribute('data-preset'));
      };
    });
  }

  var icf = $('icustomfont'), bsf = $('bsavefont');
  if(icf) icf.onkeydown = function(e){
    if(e.key === 'Enter'){ e.preventDefault(); if(bsf) bsf.click(); }
  };
  if(bsf && icf) bsf.onclick = function(){
    if(bsf.disabled) return;
    var v = icf.value.trim();
    if(!v){ setFontStatus('Type a font name first, and we\u2019ll take a look.', false); return; }
    var label = bsf.textContent;
    bsf.disabled = true;
    bsf.textContent = 'Checking\u2026';
    setFontStatus('Looking for \u201c' + v + '\u201d\u2026', null);
    function reset(){ bsf.disabled = false; bsf.textContent = label; }
    tryCustomFont(v).then(function(ok){
      reset();
      if(ok){
        var obj = { name:'custom', family:"'" + v + "',sans-serif", gfont:encodeURIComponent(v).replace(/%20/g,'+') };
        ss(K.font,JSON.stringify(obj));
        ss(K.customFont,v);
        applyFont(obj.family,null);
        var fg = $('font-grid');
        if(fg) selectIn(fg,'.font-card','data-name','Custom');
        toggleCustomFont('Custom');
        scheduleRefit();
        setFontStatus('\u201c' + v + '\u201d is now your font.', true);
      } else {
        /* nothing was changed, so the previous font simply stays in place */
        setFontStatus('Couldn\u2019t find \u201c' + v + '\u201d. Check the spelling, then try again.', false);
      }
    }).catch(function(){
      reset();
      setFontStatus('Couldn\u2019t check that just now. Give it another try in a moment.', false);
    });
  };

  var sizeRow = $('panel-size-row');
  if(sizeRow){
    Array.prototype.forEach.call(sizeRow.querySelectorAll('.preset'),function(b){
      b.onclick = function(){
        ss(K.panelSize,b.getAttribute('data-size'));
        applyPanelSize();
      };
    });
  }

  /* global text colour */
  var fci = $('ifontcolor');
  if(fci) fci.oninput = function(){
    ss(K.fontColor,fci.value);
    applyFontColor();
    selectIn($('font-color-swatches'),'.swatch','data-color',fci.value);
  };

  /* screen scaling presets */
  var scs = $('iscale'), bsa = $('bscaleapply'), bau = $('bscaleauto');
  if(bsa) bsa.onclick = function(){
    var k = scs ? scs.value : 'hd';
    if(!UI_SCALES[k]) k = 'hd';
    applyUiScale(UI_SCALES[k], k);
    flash(bsa,'Applied');
    noteToast('Scaled. If anything looks off, drag it back or reset the layout.');
  };
  if(bau) bau.onclick = function(){
    applyUiScale(window.innerWidth / 1920);
    flash(bau,'Fitted');
    noteToast('Fitted to this window. On odd screens it can look a little rough \u2014 drag cards back if so.');
  };
})();

/* ── tab pane wiring ── */
(function(){
  var its = $('itabnamestyle'), ict = $('icustomtabname');
  if(its) its.onchange = function(){
    ss(K.tabNameStyle,its.value);
    toggleCustomTabName(its.value);
    updateTabName();
  };
  if(ict) ict.oninput = function(){ ss(K.customTabName,ict.value.trim()); updateTabName(); };

  var tsc = $('tab-scroll');
  if(tsc) tsc.onchange = function(){
    ss(K.tabScroll, tsc.checked ? '1' : '0');
    updateTabName();
  };

  var brp = $('bresetpos');
  if(brp) brp.onclick = function(){
    ss(K.positions,'{}');
    ss(K.sizes,'{}');
    EL_IDS.forEach(function(id){
      var el = $(id);
      if(!el) return;
      el.style.left = ''; el.style.top = '';
      el.style.right = ''; el.style.bottom = '';
      el.style.transform = '';
    });
    RESIZABLE.forEach(function(id){
      var el = $(id);
      if(!el) return;
      el.style.width = '';
      el.style.height = '';
      el.style.removeProperty('--ws');
      el.style.removeProperty('--wbw');
      if(id === 'searchbar'){
        var w = el.querySelector('.search-wrap');
        if(w){ w.style.width = ''; w.style.height = ''; }
      }
    });
    flash(brp,'Reset');
    setTimeout(buildPosControls,200);
  };

  var be = $('bexport');
  if(be) be.onclick = function(){
    exportSettings();
    flash(be,'Exported');
  };
  var bi = $('bimport'), ifile = $('importfile');
  if(bi && ifile){
    bi.onclick = function(){ ifile.click(); };
    ifile.onchange = function(){ if(ifile.files && ifile.files[0]) importSettings(ifile.files[0]); };
  }
})();

/* ── browser custom icon ── */
(function(){
  var customUrl = $('ibrowsercustomurl');
  var customFile = $('ibrowsercustomfile');
  var customBtn = $('ibrowsercustombtn');
  var customApply = $('ibrowsercustomapply');
  if(customBtn && customFile){
    customBtn.onclick = function(){ customFile.click(); };
    customFile.onchange = function(){
      if(!customFile.files[0]) return;
      var reader = new FileReader();
      reader.onload = function(e){
        var dataUrl = e.target.result;
        ss(K.fav,dataUrl); ss(K.browserCustom,dataUrl);
        applyFav(dataUrl);
        if(customUrl) customUrl.value = '';
        selectIn($('browser-grid'),'.browser-card','data-name','');
      };
      reader.readAsDataURL(customFile.files[0]);
    };
  }
  if(customApply && customUrl){
    customApply.onclick = function(){
      var url = customUrl.value.trim();
      if(!url) return;
      ss(K.fav,url); ss(K.browserCustom,url);
      applyBrowserFav(url);
      selectIn($('browser-grid'),'.browser-card','data-name','');
    };
  }
})();

/* ── shortcuts add ── */
(function(){
  var add = $('scadd');
  if(add) add.onclick = function(){
    var a = getSC();
    a.push({label:'New',url:'https://'});
    saveSC(a);
    buildScEditor();
    renderSC();
  };
})();

/* ── video wiring ── */
(function(){
  var vdrop = $('vdrop'), vfile = $('vfile');
  if(vdrop){
    vdrop.onclick = function(){ vfile.click(); };
    vdrop.ondragover = function(e){ e.preventDefault(); vdrop.classList.add('dg'); };
    vdrop.ondragleave = function(){ vdrop.classList.remove('dg'); };
    vdrop.ondrop = function(e){
      e.preventDefault();
      vdrop.classList.remove('dg');
      var f = e.dataTransfer.files[0];
      if(f && f.type.indexOf('video/') === 0) saveVid(f);
    };
  }
  if(vfile) vfile.onchange = function(){ if(vfile.files[0]) saveVid(vfile.files[0]); };

  function saveVid(file){
    var vs = $('vstatus');
    if(vs) vs.textContent = 'Saving…';
    saveVideoFile(file, function(ok){
      if(ok){
        if(vs) vs.textContent = '✓ "' + file.name + '" loaded';
      } else if(vs){
        vs.textContent = '⚠ Couldn\u2019t save just now.';
      }
    });
  }

  var bclrv = $('bclrv');
  if(bclrv) bclrv.onclick = function(){
    deleteBlob(function(){
      applyVideoBlob(null);
      var vs = $('vstatus');
      if(vs) vs.textContent = 'Removed.';
    });
  };

  /* ── wallpaper zoom / pan ── */
  var vz = $('ivideozoom'), vzv = $('ivideozoom-v');
  var vx = $('ivideox'),    vxv = $('ivideox-v');
  var vy = $('ivideoy'),    vyv = $('ivideoy-v');
  if(vz) vz.oninput = function(){
    ss(K.videoZoom,vz.value);
    if(vzv) vzv.textContent = vz.value + '%';
    applyVideoView();
    showPeek('Wallpaper zoom ' + vz.value + '%', vz);
  };
  if(vx) vx.oninput = function(){
    ss(K.videoX,vx.value);
    if(vxv) vxv.textContent = vx.value;
    applyVideoView();
    showPeek('Wallpaper left / right ' + vx.value, vx);
  };
  if(vy) vy.oninput = function(){
    ss(K.videoY,vy.value);
    if(vyv) vyv.textContent = vy.value;
    applyVideoView();
    showPeek('Wallpaper up / down ' + vy.value, vy);
  };
  /* same peek as the layout sliders: hide the panel while dragging so you
     can actually watch the wallpaper move */
  [vz,vx,vy].forEach(function(inp){
    if(!inp) return;
    inp.addEventListener('pointerdown', function(){ startPeek(inp); });
    inp.addEventListener('pointerup',endPeek);
    inp.addEventListener('pointercancel',endPeek);
    inp.addEventListener('blur',endPeek);
  });
  var brv = $('bresetvideo');
  if(brv) brv.onclick = function(){
    ss(K.videoZoom,'100'); ss(K.videoX,'0'); ss(K.videoY,'0');
    if(vz){ vz.value = 100; }
    if(vx){ vx.value = 0; }
    if(vy){ vy.value = 0; }
    if(vzv) vzv.textContent = '100%';
    if(vxv) vxv.textContent = '0';
    if(vyv) vyv.textContent = '0';
    applyVideoView();
    syncAllRangeFills();
    flash(brv,'Reset');
  };
})();

/* ── search wiring ── */
(function(){
  var input = $('search-input');
  var btn = $('search-submit-btn');
  if(btn) btn.onclick = runSearch;
  if(input){
    input.addEventListener('keydown',function(e){
      if(e.key === 'Enter') runSearch();
      if(e.key === 'Escape') input.blur();
    });
  }
  document.addEventListener('keydown',function(e){
    var t = e.target;
    var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')){
      if(!isShown('searchbar') || _layoutEditing) return;
      e.preventDefault();
      if(input){ input.focus(); input.select(); }
      return;
    }
    if(e.key === '/' && !typing && !_layoutEditing && !(overlay && overlay.classList.contains('open'))){
      if(!isShown('searchbar')) return;
      e.preventDefault();
      if(input) input.focus();
    }
    if(e.key === 'Escape'){
      if(overlay && overlay.classList.contains('open')) closePanel();
    }
  });
  var se = $('isearchengine');
  if(se) se.onchange = function(){
    ss(K.searchEngine,se.value);
    applySearchEngine();
    if($('search-input')) $('search-input').focus();
  };
})();

/* ── widgets wiring ── */
(function(){
  function showToggle(id,key,after){
    var el = $(id);
    if(!el) return;
    el.onchange = function(){
      ss(key,el.checked ? '1' : '0');
      applyWidgetVisibility(true);
      if(after) after(el.checked);
    };
  }
  showToggle('w-greet',K.showGreet,function(on){ if(on) renderGreeting(); });
  showToggle('w-clock',K.showClock,function(){ scheduleClock(); });
  showToggle('w-calendar',K.showCalendar,function(on){ if(on) renderCalendar(); });
  showToggle('w-prayer',K.showPrayer,function(on){ if(on) loadPrayer(false); else closePrayer(); });
  showToggle('w-prayer-sound',K.prayerSound,function(){});
  showToggle('w-search',K.showSearch,function(){});
  showToggle('w-shortcuts',K.showShortcuts,function(){});
  showToggle('w-weather',K.showWeather,function(on){ if(on) loadWeather(false); startWeatherTimer(); });
  showToggle('w-quote',K.showQuote,function(on){
    var quran = quranActive();
    document.body.classList.toggle('quran-mode', quran);
    applyWidgetVisibility(true);
    if(!quran){ closePrayer(); hidePrayerToast(); }
    if(on) loadQuote(false);
    startQuoteTimer();
  });
  showToggle('w-status',K.showStatus,function(on){ if(!on) closeStatus(false); });
  showToggle('w-stocks',K.showStocks,function(on){
    if(on) loadStocks(true);
    startStocksTimer();
  });
  showToggle('w-holidays',K.showHolidays,function(on){
    if(on){ ensureHolidays(wallNow().year); }
    renderCalendar();
    if(_openWin === 'calendar-modal') renderCalWin(false);
  });

  var skRefresh = $('stocks-refresh');
  if(skRefresh) skRefresh.onclick = function(){
    /* drop focus so :focus-within can't keep the button on screen after the
       window closes */
    try{ skRefresh.blur(); }catch(e){}
    loadStocks(true);
  };

  var stocksInput = $('istockslist');
  if(stocksInput){
    var commitStocks = function(){
      var parts = stocksInput.value.split(',');
      var out = [];
      parts.forEach(function(p){
        p = p.trim().toUpperCase();
        if(p && validStockSymbol(p) && out.indexOf(p) < 0) out.push(p);
      });
      out = out.slice(0, 8);
      if(!out.length) out = stocksDefaults().slice();
      ss(stocksListKey(), JSON.stringify(out));
      ss(K.stocksCache, '');
      stocksInput.value = out.join(', ');
      loadStocks(true);
      startStocksTimer();
      syncStocksUI();
    };
    stocksInput.onchange = commitStocks;
    stocksInput.onblur = commitStocks;
  }
  var stocksMarketSeg = $('istocksmarket');
  if(stocksMarketSeg){
    stocksMarketSeg.addEventListener('click', function(e){
      var b = e.target.closest('.seg-btn');
      if(!b) return;
      setStocksMarket(b.getAttribute('data-market'));
    });
  }
  var stocksEvery = $('istocksevery');
  if(stocksEvery){
    var commitStockEvery = function(){
      var m = parseInt(stocksEvery.value, 10);
      if(!(m > 0)) m = 5;
      m = Math.max(1, Math.min(60, m));
      stocksEvery.value = m;
      ss(K.stocksEvery, String(m));
      startStocksTimer();
    };
    stocksEvery.onchange = commitStockEvery;
    stocksEvery.onblur = commitStockEvery;
  }
  populateCurrencySelects();
  var settingsCurrency = $('istockscurrency');
  if(settingsCurrency) settingsCurrency.onchange = function(){ setStocksCurrency(settingsCurrency.value); };
  var holCountry = $('iholidaycountry');
  if(holCountry){
    holCountry.onchange = function(){
      ss(K.holidayCountry, (holCountry.value || '').toUpperCase());
      holidaysRefresh();
    };
  }

  var wall = $('wall-grid');
  if(wall){
    Array.prototype.forEach.call(wall.querySelectorAll('.wall-card'), function(card){
      function choose(){
        var grad = card.getAttribute('data-wall') === 'gradient';
        ss(K.batterySaver, grad ? '1' : '0');
        applyWallModeUI();
        initPower();
      }
      card.onclick = choose;
      card.onkeydown = function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); choose(); }
      };
    });
  }
  var mseg = $('motion-seg');
  if(mseg){
    mseg.addEventListener('click', function(e){
      var b = e.target.closest('.seg-btn');
      if(!b) return;
      ss(K.motion, b.getAttribute('data-motion') || 'flow');
      applyMotion();
    });
  }
  buildFlowPad('flow-seg', function(f){
    ss(K.flow, f);
    applyMotion();
    peekUpdate('Flow ' + (FLOW_TITLES[f] || f));
  });
  var wdir = $('iwavedir');
  if(wdir){
    var waveBegin = function(){
      waveLowDetail = true;
      document.body.classList.add('wave-adjusting');
    };
    var waveEnd = function(){
      if(!waveLowDetail) return;
      waveLowDetail = false;
      document.body.classList.remove('wave-adjusting');
      waveScheduleRebuild();
    };
    wdir.oninput = function(){
      waveBegin();
      var d = waveSetDir(wdir.value);
      showPeek('Wave direction ' + d + '\u00b0', wdir);
    };
    wdir.addEventListener('pointerdown', function(){ waveBegin(); startPeek(wdir); });
    wdir.addEventListener('pointerup', waveEnd);
    wdir.addEventListener('pointercancel', waveEnd);
    wdir.addEventListener('change', waveEnd);
    wdir.addEventListener('blur', waveEnd);
  }
  var wzoom = $('iwavezoom'), wzoomv = $('iwavezoom-v');
  var wpanx = $('iwavex'), wpanxv = $('iwavex-v');
  var wpany = $('iwavey'), wpanyv = $('iwavey-v');
  if(wzoom) wzoom.oninput = function(){
    ss(K.waveZoom, wzoom.value);
    if(wzoomv) wzoomv.textContent = wzoom.value + '%';
    applyWaveView();
    showPeek('Wave zoom ' + wzoom.value + '%', wzoom);
  };
  if(wpanx) wpanx.oninput = function(){
    ss(K.waveX, wpanx.value);
    if(wpanxv) wpanxv.textContent = wpanx.value;
    applyWaveView();
    showPeek('Flow left / right ' + wpanx.value, wpanx);
  };
  if(wpany) wpany.oninput = function(){
    ss(K.waveY, wpany.value);
    if(wpanyv) wpanyv.textContent = wpany.value;
    applyWaveView();
    showPeek('Flow up / down ' + wpany.value, wpany);
  };
  [wzoom,wpanx,wpany].forEach(function(inp){
    if(!inp) return;
    inp.addEventListener('pointerdown', function(){
      document.body.classList.add('wave-adjusting');
      startPeek(inp);
    });
    inp.addEventListener('pointerup', function(){ document.body.classList.remove('wave-adjusting'); endPeek(); });
    inp.addEventListener('pointercancel', function(){ document.body.classList.remove('wave-adjusting'); endPeek(); });
    inp.addEventListener('blur', function(){ document.body.classList.remove('wave-adjusting'); endPeek(); });
  });
  var brst = $('bresetflow');
  if(brst) brst.onclick = function(){
    ss(K.gradient, '0');
    ss(K.motion, 'flow');
    ss(K.motionSpeed, '50');
    ss(K.flow, 'rtl');
    ss(K.waveDir, '40');
    ss(K.waveZoom, '100');
    ss(K.waveX, '0');
    ss(K.waveY, '0');
    var g = $('grad-grid');
    if(g) selectIn(g,'.grad-card','data-grad','0');
    applyGradient(0);
    applyMotion();
    applyWaveView();
    syncAllRangeFills();
    flash(brst,'Reset');
  };
  var speedSeg = $('motion-speed-seg');
  if(speedSeg){
    speedSeg.addEventListener('click', function(e){
      var b = e.target.closest('.seg-btn');
      if(!b) return;
      var v = b.getAttribute('data-speed');
      ss(K.motionSpeed, v);
      applyMotion();
      showPeek('Wave speed ' + v + '%', b);
    });
  }

  var pause = $('p-pause');
  if(pause) pause.onchange = function(){
    ss(K.pauseHidden,pause.checked ? '1' : '0');
    updateVideoPlayback();
  };

  var wl = $('iweatherloc'), wb = $('bweatherset');
  function commitCity(){
    if(!wl) return;
    setWeatherCity(wl.value, wb);
  }
  if(wb) wb.onclick = commitCity;
  if(wl) wl.onkeydown = function(e){ if(e.key === 'Enter') commitCity(); };

  var wu = $('iweatherunit');
  if(wu) wu.onchange = function(){
    ss(K.weatherUnit,wu.value);
    ss(K.weatherCache,'');
    loadWeather(true);
    startWeatherTimer();
  };

  var we = $('iweatherevery');
  function commitWeatherEvery(){
    if(!we) return;
    var m = parseInt(we.value,10);
    if(isNaN(m) || m < 1) m = 1;
    if(m > 1440) m = 1440;
    we.value = m;
    ss(K.weatherEvery,String(m));
    startWeatherTimer();
  }
  if(we){
    we.onchange = commitWeatherEvery;
    we.onblur   = commitWeatherEvery;
  }

  var bwn = $('bweathernow');
  if(bwn) bwn.onclick = function(){
    if(!isShown('weather')){
      setWeatherStatus('The weather widget is resting off — bring it back above.');
      return;
    }
    if(!(gs(K.weatherCity) || '').trim()){
      setWeatherStatus('Add a city first, and the forecast will follow.');
      return;
    }
    bwn.disabled = true;
    var p = loadWeather(true);
    function done(){ bwn.disabled = false; }
    if(p && p.then) p.then(done, done); else done();
    flash(bwn,'Updating…');
  };

  var wr = $('weather-refresh');
  if(wr) wr.onclick = function(e){
    e.preventDefault();
    e.stopPropagation();
    try{ wr.blur(); }catch(err){}
    if(wr.classList.contains('spinning')) return;   /* one tap, one request */
    wr.classList.add('spinning');
    var p = loadWeather(true);
    function stop(){ wr.classList.remove('spinning'); }
    /* the icon spins for as long as the forecast actually takes */
    if(p && p.then) p.then(stop, stop); else stop();
  };

  var qc = $('iquotecat');
  if(qc) qc.onchange = function(){
    ss(K.quoteCat,qc.value);
    toggleCustomQuote(qc.value);
    loadQuote(true);
    startQuoteTimer();
  };

  var qb = $('bquoterefresh');
  if(qb) qb.onclick = function(){ loadQuote(true); startQuoteTimer(); };

  var qr = $('quote-refresh');
  if(qr) qr.onclick = function(e){
    e.preventDefault();
    e.stopPropagation();
    try{ qr.blur(); }catch(err){}
    loadQuote(true);
    startQuoteTimer();
  };

  var qe = $('iquoteevery');
  var qAuto = $('q-auto');
  function commitEvery(){
    if(!qe) return;
    var v = parseInt(qe.value,10);
    if(isNaN(v) || v < 0) v = 0;
    if(v > 86400) v = 86400;
    if(v > 0 && v < 5) v = 5;
    qe.value = v ? v : '';
    ss(K.quoteEvery,String(v));
    startQuoteTimer();
  }
  if(qe){
    qe.oninput = function(){
      if(!(parseInt(qe.value,10) > 0)){ ss(K.quoteEvery,'0'); startQuoteTimer(); return; }
      ss(K.quoteEvery,qe.value);
      startQuoteTimer();
    };
    qe.onchange = commitEvery;
    qe.onblur = commitEvery;
  }
  if(qAuto) qAuto.onchange = function(){
    ss(K.quoteAuto,qAuto.checked ? '1' : '0');
    if(qe) qe.disabled = !qAuto.checked;
    if(qAuto.checked && qe && !(parseInt(qe.value,10) > 0)){
      qe.value = 30;
      ss(K.quoteEvery,'30');
    }
    startQuoteTimer();
  };

  /* quote typography */
  var qal = $('iquotealign'), qst = $('iquotestyle');
  var qaa = $('iquoteauthoralign'), qas = $('iquoteauthorstyle');
  var qsz = $('iquotesize'), qszv = $('iquotesize-v');
  var qaz = $('iquoteauthorsize'), qazv = $('iquoteauthorsize-v');
  function commitQuoteStyle(){
    if(qal) ss(K.quoteAlign,qal.value);
    if(qst) ss(K.quoteStyle,qst.value);
    if(qaa) ss(K.quoteAuthorAlign,qaa.value);
    if(qas) ss(K.quoteAuthorStyle,qas.value);
    applyQuoteStyle();
  }
  [qal,qst,qaa,qas].forEach(function(el){ if(el) el.onchange = commitQuoteStyle; });
  if(qsz) qsz.oninput = function(){
    ss(K.quoteSize,qsz.value);
    if(qszv) qszv.textContent = qsz.value + 'px';
    applyQuoteStyle();
    peekUpdate('Quote text ' + qsz.value + 'px');
  };
  if(qaz) qaz.oninput = function(){
    ss(K.quoteAuthorSize,qaz.value);
    if(qazv) qazv.textContent = qaz.value + 'px';
    applyQuoteStyle();
    peekUpdate('Author ' + qaz.value + 'px');
  };
  wirePeek(qsz, function(){ return 'Quote text ' + qsz.value + 'px'; });
  wirePeek(qaz, function(){ return 'Author ' + qaz.value + 'px'; });

  var bsq = $('bsavequote'), icq = $('icustomquote'), icqa = $('icustomquoteauthor');
  if(bsq) bsq.onclick = function(){
    var txt = (icq ? icq.value : '').trim();
    if(!txt){
      setText($('customquote-status'),'A few words first, whenever you are ready.');
      return;
    }
    ss(K.customQuote,txt);
    ss(K.customQuoteAuthor,(icqa ? icqa.value : '').trim());
    ss(K.quoteCat,'custom');
    if(qc) qc.value = 'custom';
    toggleCustomQuote('custom');
    loadQuote(true);
    startQuoteTimer();
    setText($('customquote-status'),'Saved — it is resting on your new tab now.');
    flash(bsq,'Saved');
  };
})();

/* ══════════════════════════════════════════
   WINDOWS & WIDGET EXTRAS
   Weather / calendar / clock / greeting / quote windows, the search engine
   menu, the custom-quote entry, the page dimmer and the small toasts.
   Everything here reads and writes the same nt_* keys the panel uses, so the
   two stay in step whichever one you touched last.
══════════════════════════════════════════ */

/* tiny confirmation toast */
function noteToast(msg, plain, center){
  var t = $('note-toast');
  if(!t) return;
  t.classList.toggle('plain', !!plain);
  t.classList.toggle('center', !!center);
  t.textContent = msg || '';
  t.classList.add('on');
  if(noteToast._t) clearTimeout(noteToast._t);
  noteToast._t = setTimeout(function(){ t.classList.remove('on'); }, 2000);
}

/* performance prompt: keep Liquid, switch to the original blur, or dismiss.
   Either way the question waits at least five minutes before asking again. */
(function(){
  var pop = $('perf-pop');
  if(!pop) return;
  function dismiss(){
    hideGlassPerfPrompt();
    scheduleGlassReprobe();
  }
  var keep = $('perf-pop-keep');
  if(keep) keep.onclick = dismiss;
  var close = $('perf-pop-close');
  if(close) close.onclick = dismiss;
  var sw = $('perf-pop-classic');
  if(sw) sw.onclick = function(){
    ss(K.glassStyle, 'classic');
    if(_perfPromptTimer){ clearTimeout(_perfPromptTimer); _perfPromptTimer = null; }
    applyGlassSettings();
    updateLensUI(true);
    hideGlassPerfPrompt();
    noteToast('Original blur is on \u2014 switch back anytime in Display.', true, true);
  };
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && pop.classList.contains('open')){
      e.stopPropagation();
      dismiss();
    }
  }, true);
})();

/* colour helpers for the custom glass tint */
function tintToHex(t){
  var m = String(t || '').match(/rgba?\(([^)]+)\)/);
  if(!m) return '#ffffff';
  var p = m[1].split(',');
  function h(x){ var v = parseInt(x,10) || 0; v = Math.max(0, Math.min(255, v)); return ('0' + v.toString(16)).slice(-2); }
  return '#' + h(p[0]) + h(p[1]) + h(p[2]);
}
function hexToRgba(hex){
  hex = String(hex || '').replace('#','');
  if(hex.length === 3) hex = hex.replace(/(.)/g,'$1$1');
  var n = parseInt(hex,16);
  if(isNaN(n)) return null;
  return 'rgba(' + ((n>>16)&255) + ',' + ((n>>8)&255) + ',' + (n&255) + ',1)';
}

/* one shared window manager */
var _openWin = null;
function openWin(id){
  var m = $(id);
  if(!m) return;
  if(_openWin && _openWin !== id) closeWin(_openWin, true);
  _openWin = id;
  document.body.classList.add('win-open');
  document.body.classList.remove('hover-stale');
  m.classList.add('open');
  m.setAttribute('aria-hidden','false');
  refreshRichLabels();
  syncAllRangeFills();
  refreshClockLivePreviews();
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ m.classList.add('in'); scheduleLens(); });
  });
}
function closeWin(id, instant){
  var m = $(id);
  if(!m) return;
  if(_richOpen) closeRich(_richOpen);
  if(_openWin === id) _openWin = null;
  document.body.classList.remove('win-open');
  /* the pointer may still be over a card the overlay had covered: hold the
     card controls off until the next real pointer move */
  document.body.classList.add('hover-stale');
  m.classList.remove('in');
  m.setAttribute('aria-hidden','true');
  if(instant){ m.classList.remove('open'); return; }
  setTimeout(function(){
    if(!m.classList.contains('in')) m.classList.remove('open');
  }, 360);
}
/* the first real pointer move after a window closes settles :hover again */
document.addEventListener('pointermove', function(){
  if(document.body.classList.contains('hover-stale')){
    document.body.classList.remove('hover-stale');
  }
}, {passive:true});

/* ── first-run welcome ──
   A short, calm first run: say hello, take a name and a city, then set the
   clock, a quote source and a wallpaper. Every step is optional and skipping
   it never breaks anything. It runs once, only when there is no saved
   profile, and never returns afterwards. */
function openWelcome(){
  var m = $('welcome-modal');
  if(!m) return;
  openWin('welcome-modal');
  m.setAttribute('aria-hidden','false');
}
(function initWelcome(){
  var m = $('welcome-modal');
  if(!m) return;
  var nameIn = $('ob-name'), cityIn = $('ob-city'), prev = $('ob-preview');
  var nextBtn = $('ob-next'), backBtn = $('ob-back'), skipBtn = $('ob-skip');
  var steps = m.querySelectorAll('.ob-step');
  var dots  = m.querySelectorAll('.ob-dots span');
  var title = $('ob-title'), sub = $('ob-sub');
  var total = steps.length || 8;
  var step = 1;
  var TITLES = ['Welcome to Newly','A name, if you like','One city, for the weather',
                'How time should feel','Where should search go','A thought for the moment',
                'How the glass feels','A wallpaper to start with','A couple of calm extras'];

  /* choices are held in memory until Finish, so Back never loses them */
  var choice = {
    hour: gs(K.hourFmt) || '24',
    timeSrc: gs(K.timeSource) || 'device',
    engine: gs(K.searchEngine) || 'google',
    cat: gs(K.quoteCat) || 'general',
    wall: 'gradient',
    grad: gradientIndex(),
    motion: motionMode(),
    flow: flowDir(),
    waveDir: waveDir(),
    glass: glassStyle(),
    tintMode: glassTintMode()
  };

  function paintSeg(segId, attr, value){
    var seg = $(segId);
    if(!seg) return;
    Array.prototype.forEach.call(seg.querySelectorAll('.seg-btn'), function(b){
      b.classList.toggle('on', b.getAttribute(attr) === String(value));
    });
  }
  function segClick(segId, attr, set){
    var seg = $(segId);
    if(!seg) return;
    seg.addEventListener('click', function(e){
      var b = e.target.closest('.seg-btn');
      if(!b) return;
      var val = b.getAttribute(attr);
      set(val);
      paintSeg(segId, attr, val);
    });
  }

  function buildObCats(){
    var g = $('ob-cats');
    if(!g || g._built) return;
    g._built = true;
    EXT_QUOTE_CATS.forEach(function(pair){
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ob-cat';
      b.setAttribute('data-cat', pair[0]);
      b.textContent = pair[1];
      b.onclick = function(){
        choice.cat = pair[0];
        Array.prototype.forEach.call(g.querySelectorAll('.ob-cat'), function(x){
          x.classList.toggle('on', x.getAttribute('data-cat') === choice.cat);
        });
      };
      g.appendChild(b);
    });
    Array.prototype.forEach.call(g.querySelectorAll('.ob-cat'), function(x){
      x.classList.toggle('on', x.getAttribute('data-cat') === choice.cat);
    });
  }
  function paintSwatches(){
    var g = $('ob-swatches');
    if(!g) return;
    Array.prototype.forEach.call(g.querySelectorAll('.ob-swatch'), function(x){
      x.classList.toggle('on', Number(x.getAttribute('data-grad')) === choice.grad);
    });
  }
  function buildObSwatches(){
    var g = $('ob-swatches');
    if(!g || g._built) return;
    g._built = true;
    GRADIENTS.forEach(function(item, i){
      var c = document.createElement('div');
      c.className = 'ob-swatch';
      c.setAttribute('data-grad', String(i));
      c.setAttribute('role','button');
      c.setAttribute('tabindex','0');
      c.title = item.name;
      c.style.background = bandCss(item);
      c.onclick = function(){
        choice.grad = i;
        paintSwatches();
        if(choice.wall === 'gradient'){ ss(K.gradient, String(i)); applyGradient(i); }
      };
      c.onkeydown = function(e){
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); c.click(); }
      };
      g.appendChild(c);
    });
    paintSwatches();
  }
  function syncObWall(){
    paintSeg('ob-wall','data-wall', choice.wall);
    var grad = choice.wall === 'gradient';
    var gw = $('ob-grad-wrap');
    if(gw) gw.style.display = grad ? '' : 'none';
    var vw = $('ob-vid-wrap');
    if(vw) vw.style.display = grad ? 'none' : '';
    var hint = $('ob-wall-hint');
    if(hint) hint.textContent = grad
      ? 'Calm Wave is a soft, flowy wave \u2014 easy on the battery.'
      : 'Video Wallpaper plays your own clip behind the glass. Pick one here, or add it later in Settings.';
  }
  /* the wallpaper choice takes hold at once, so a video imported while the
     first run is still open can actually be seen behind the glass */
  function applyWallChoice(){
    ss(K.batterySaver, choice.wall === 'gradient' ? '1' : '0');
    applyWallModeUI();
    initPower();
  }
  function obVidStatus(msg, ok){
    var s = $('ob-vstatus');
    if(s){ s.textContent = msg; s.classList.toggle('ok', !!ok); }
  }

  /* ── glass step: mirrors the Settings controls and applies them live,
     because this card is made of the very glass it is changing ── */
  function obGlassPreset(id){
    var row = $('ob-glass-presets');
    if(!row) return;
    Array.prototype.forEach.call(row.querySelectorAll('.preset'), function(b){
      b.classList.toggle('on', b.getAttribute('data-preset') === id);
    });
  }
  function buildObGlassSwatches(cur){
    var g = $('ob-glass-swatches');
    if(!g || g._built) return;
    g._built = true;
    GLASS_TINTS.forEach(function(col){
      var s = document.createElement('div');
      s.className = 'swatch';
      s.style.background = col;
      s.setAttribute('data-color', col);
      if(col === 'rgba(0,0,0,1)' || col === 'rgba(30,30,60,1)' || col === 'rgba(50,50,50,1)' || col === 'rgba(15,15,30,1)'){
        s.style.border = '2px solid rgba(255,255,255,0.25)';
      }
      s.onclick = function(){
        selectIn(g,'.swatch','data-color',col);
        ss(K.glassTint, col);
        applyGlassSettings();
        obGlassPreset('');
        var ci = $('ob-glass-tint'); if(ci) ci.value = tintToHex(col);
      };
      g.appendChild(s);
    });
    selectIn(g,'.swatch','data-color',cur || GLASS_TINTS[0]);
  }
  function syncObGlass(){
    var blur  = parseInt(gs(K.glassBlur)  || '2', 10);
    var alpha = parseInt(gs(K.glassAlpha) || '21', 10);
    var tint  = gs(K.glassTint) || GLASS_TINTS[GLASS_TINTS.length - 1];
    var bs = $('ob-glass-blur'), as = $('ob-glass-alpha');
    var bv = $('ob-glass-blur-v'), av = $('ob-glass-alpha-v');
    if(bs) bs.value = blur;
    if(as) as.value = alpha;
    if(bv) bv.textContent = blur + 'px';
    if(av) av.textContent = alpha + '%';
    paintSeg('ob-glass-style','data-glass', choice.glass || glassStyle());
    paintSeg('ob-glass-tintmode','data-tintmode', choice.tintMode || glassTintMode());
    var ci = $('ob-glass-tint');
    if(ci) ci.value = tintToHex(tint);
    buildObGlassSwatches(tint);
    var match = '';
    Object.keys(GLASS_PRESETS).forEach(function(k){
      var p = GLASS_PRESETS[k];
      if(p.blur === blur && p.alpha === alpha && p.tint === tint) match = k;
    });
    obGlassPreset(match);
    syncAllRangeFills();
  }
  function applyObGlass(){
    var bs = $('ob-glass-blur'), as = $('ob-glass-alpha');
    if(bs) ss(K.glassBlur, bs.value);
    if(as) ss(K.glassAlpha, as.value);
    applyGlassSettings();
  }
  function syncObEngine(){
    var se = $('ob-engine');
    if(!se) return;
    se.value = choice.engine;
    updateRich(se);
  }

  function previewLine(name){
    var style = gs(K.style) || 'hi';
    if(style === 'none') return 'The greeting is off \u2014 you can turn it back on in Settings.';
    return buildGreeting(name || 'you', style, gs(K.customGreet) || '') ||
           ('Hello, ' + (name || 'you') + '.');
  }

  function paint(){
    Array.prototype.forEach.call(steps, function(s){
      s.hidden = Number(s.getAttribute('data-step')) !== step;
    });
    Array.prototype.forEach.call(dots, function(d,i){
      d.classList.toggle('on', i === step - 1);
    });
    if(title) title.textContent = TITLES[step - 1] || TITLES[0];
    if(sub) sub.textContent = 'Step ' + step + ' of ' + total;
    if(backBtn) backBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
    if(nextBtn) nextBtn.textContent = step === total ? 'Finish' : (step === 1 ? 'Begin' : 'Continue');
    if(step === 2 && nameIn) setTimeout(function(){ nameIn.focus(); }, 90);
    if(step === 3 && cityIn) setTimeout(function(){ cityIn.focus(); }, 90);
    if(step === 4){
      paintSeg('ob-hour','data-hour', choice.hour);
      paintSeg('ob-timesrc','data-src', choice.timeSrc);
    }
    if(step === 5) syncObEngine();
    if(step === 6) buildObCats();
    if(step === 7) syncObGlass();
    if(step === 8){
      buildObSwatches();
      paintSeg('ob-motion','data-motion', choice.motion);
      buildFlowPad('ob-flow-seg', function(f){ choice.flow = f; ss(K.flow, f); applyMotion(); });
      paintFlowPad('ob-flow-seg');
      syncWaveDirUI();
      var owd = $('ob-wavedir');
      if(owd){
        owd.oninput = function(){ choice.waveDir = waveSetDir(owd.value); };
      }
      syncObWall();
    }
  }

  function rememberName(){
    var v = nameIn ? nameIn.value.trim() : '';
    if(!v) return;
    ss(K.name, v);
    var si = $('iname');
    if(si) si.value = v;
    renderGreeting();
    renderGreetPreviews();
  }
  function rememberCity(){
    var v = cityIn ? cityIn.value.trim() : '';
    if(!v) return;
    if(v === (gs(K.weatherCity) || '')) return;
    setWeatherCity(v, null);
  }
  function rememberClock(){
    if(choice.hour !== (gs(K.hourFmt) || '24')){
      ss(K.hourFmt, choice.hour);
      var ih = $('ihour');
      if(ih) ih.value = choice.hour;
      applyClockStyle();
      if(typeof refreshClockCard === 'function') refreshClockCard();
    }
    if(choice.timeSrc !== (gs(K.timeSource) || 'device')){
      ss(K.timeSource, choice.timeSrc);
      refreshTimeSource();
      extSyncTimeSource();
    }
  }
  function rememberQuote(){
    if(choice.cat !== (gs(K.quoteCat) || 'general')){
      extPickQuoteCat(choice.cat);
    }
  }
  function rememberEngine(){
    if(choice.engine !== (gs(K.searchEngine) || 'google')){
      ss(K.searchEngine, choice.engine);
      applySearchEngine();
      var se = $('isearchengine');
      if(se) se.value = choice.engine;
    }
  }
  function rememberWall(){
    var grad = choice.wall === 'gradient';
    ss(K.batterySaver, grad ? '1' : '0');
    ss(K.gradient, String(choice.grad));
    ss(K.motion, choice.motion);
    ss(K.flow, choice.flow);
    ss(K.waveDir, String(choice.waveDir));
    applyGradient(choice.grad);
    applyMotion();
    applyWallModeUI();
    initPower();
  }

  function closeWelcome(){
    if(_richOpen) closeRich(_richOpen);
    m.classList.remove('in');
    m.setAttribute('aria-hidden','true');
    if(_openWin === 'welcome-modal') _openWin = null;
    document.body.classList.remove('win-open');
    document.body.classList.add('hover-stale');
    setTimeout(function(){ m.classList.remove('open'); }, 360);
  }
  function finish(skipped){
    rememberName();
    rememberCity();
    rememberClock();
    rememberEngine();
    rememberQuote();
    rememberWall();
    ss(K.onboarded,'1');
    closeWelcome();
    if(!skipped){
      setTimeout(function(){
        noteToast('That\u2019s it. Move anything you like.', true, true);
      }, 320);
    }
  }

  if(nextBtn) nextBtn.onclick = function(){
    if(step < total){ step++; paint(); return; }
    finish(false);
  };
  if(backBtn) backBtn.onclick = function(){ if(step > 1){ step--; paint(); } };
  if(skipBtn) skipBtn.onclick = function(){ finish(true); };

  segClick('ob-hour','data-hour', function(v){ choice.hour = v; });
  segClick('ob-timesrc','data-src', function(v){ choice.timeSrc = v; });
  segClick('ob-glass-style','data-glass', function(v){
    choice.glass = (v === 'liquid') ? 'liquid' : 'classic';
    ss(K.glassStyle, choice.glass);
    applyGlassSettings();
  });
  segClick('ob-glass-tintmode','data-tintmode', function(v){
    choice.tintMode = (v === 'adaptive') ? 'adaptive' : 'manual';
    ss(K.glassTintMode, choice.tintMode);
    applyGlassSettings();
  });
  segClick('ob-motion','data-motion', function(v){
    choice.motion = v;
    ss(K.motion, v);
    applyMotion();
  });
  segClick('ob-wall','data-wall', function(v){
    choice.wall = v;
    applyWallChoice();
    syncObWall();
  });

  /* extras step — written the moment they are toggled */
  var obStocks = $('ob-stocks'), obHols = $('ob-holidays');
  if(obStocks){
    obStocks.checked = gs(K.showStocks) === '1';
    obStocks.onchange = function(){
      ss(K.showStocks, obStocks.checked ? '1' : '0');
      applyWidgetVisibility(true);
      if(obStocks.checked) loadStocks(true);
      startStocksTimer();
    };
  }
  if(obHols){
    obHols.checked = gs(K.showHolidays) === '1';
    obHols.onchange = function(){
      ss(K.showHolidays, obHols.checked ? '1' : '0');
      applyWidgetVisibility(true);
      if(obHols.checked) ensureHolidays(wallNow().year);
      renderCalendar();
    };
  }

  /* glass sliders and presets — every touch is felt at once */
  var gBlur = $('ob-glass-blur'), gAlpha = $('ob-glass-alpha');
  var gBlurV = $('ob-glass-blur-v'), gAlphaV = $('ob-glass-alpha-v');
  if(gBlur) gBlur.oninput = function(){
    if(gBlurV) gBlurV.textContent = gBlur.value + 'px';
    applyObGlass();
    obGlassPreset('');
    peekUpdate('Glass blur ' + gBlur.value + 'px');
  };
  if(gAlpha) gAlpha.oninput = function(){
    if(gAlphaV) gAlphaV.textContent = gAlpha.value + '%';
    applyObGlass();
    obGlassPreset('');
    peekUpdate('Glass opacity ' + gAlpha.value + '%');
  };
  /* fade the welcome card while dragging, like every other slider */
  wireWinPeek(gBlur, 'welcome-modal', function(){ return 'Glass blur ' + gBlur.value + 'px'; });
  wireWinPeek(gAlpha, 'welcome-modal', function(){ return 'Glass opacity ' + gAlpha.value + '%'; });

  /* flow speed — ten-step segmented control, same as Settings */
  var obSpeedSeg = $('ob-motion-speed-seg');
  if(obSpeedSeg){
    obSpeedSeg.addEventListener('click', function(e){
      var b = e.target.closest('.seg-btn');
      if(!b) return;
      ss(K.motionSpeed, b.getAttribute('data-speed'));
      applyMotion();
      peekUpdate('Wave speed ' + b.getAttribute('data-speed') + '%');
    });
  }

  /* search engine — the same list and the same rich dropdown as Settings */
  var obEng = $('ob-engine');
  if(obEng){
    obEng.onchange = function(){
      choice.engine = obEng.value;
      ss(K.searchEngine, obEng.value);
      applySearchEngine();
      var se = $('isearchengine');
      if(se){ se.value = obEng.value; updateRich(se); }
      updateRich(obEng);
    };
  }
  var gRow = $('ob-glass-presets');
  if(gRow){
    Array.prototype.forEach.call(gRow.querySelectorAll('.preset'), function(b){
      b.onclick = function(){
        var p = GLASS_PRESETS[b.getAttribute('data-preset')];
        if(!p) return;
        ss(K.glassBlur, p.blur);
        ss(K.glassAlpha, p.alpha);
        ss(K.glassTint, p.tint);
        if(gBlur){ gBlur.value = p.blur; if(gBlurV) gBlurV.textContent = p.blur + 'px'; }
        if(gAlpha){ gAlpha.value = p.alpha; if(gAlphaV) gAlphaV.textContent = p.alpha + '%'; }
        applyGlassSettings();
        var sw = $('ob-glass-swatches');
        if(sw) selectIn(sw,'.swatch','data-color',p.tint);
        var ci = $('ob-glass-tint');
        if(ci) ci.value = tintToHex(p.tint);
        obGlassPreset(b.getAttribute('data-preset'));
      };
    });
  }
  var gTint = $('ob-glass-tint');
  if(gTint) gTint.oninput = function(){
    var rgba = hexToRgba(gTint.value);
    if(!rgba) return;
    ss(K.glassTint, rgba);
    applyGlassSettings();
    obGlassPreset('');
    var sw = $('ob-glass-swatches');
    if(sw) selectIn(sw,'.swatch','data-color','');
  };

  /* video import, only relevant when Video Wallpaper is chosen */
  var obDrop = $('ob-vdrop'), obFile = $('ob-vfile'), obClear = $('ob-vclear');
  function obImport(file){
    if(!file) return;
    obVidStatus('Saving\u2026', false);
    saveVideoFile(file, function(ok){
      if(ok){
        choice.wall = 'video';
        applyWallChoice();
        syncObWall();
        obVidStatus('\u2713 "' + file.name + '" is your wallpaper', true);
        if(obClear) obClear.style.display = '';
      } else {
        obVidStatus('\u26A0 Couldn\u2019t save just now.', false);
      }
    });
  }
  if(obDrop){
    obDrop.onclick = function(){ if(obFile) obFile.click(); };
    obDrop.ondragover = function(e){ e.preventDefault(); obDrop.classList.add('dg'); };
    obDrop.ondragleave = function(){ obDrop.classList.remove('dg'); };
    obDrop.ondrop = function(e){
      e.preventDefault();
      obDrop.classList.remove('dg');
      var f = e.dataTransfer.files[0];
      if(f && f.type.indexOf('video/') === 0) obImport(f);
    };
  }
  if(obFile) obFile.onchange = function(){ if(obFile.files[0]) obImport(obFile.files[0]); };
  if(obClear) obClear.onclick = function(){
    deleteBlob(function(){
      applyVideoBlob(null);
      if(obClear) obClear.style.display = 'none';
      obVidStatus('Removed.', false);
    });
  };

  if(nameIn){
    nameIn.oninput = function(){
      if(prev) prev.textContent = previewLine(nameIn.value.trim());
    };
    nameIn.onkeydown = function(e){
      if(e.key === 'Enter'){ e.preventDefault(); nextBtn && nextBtn.click(); }
    };
  }
  if(cityIn){
    cityIn.onkeydown = function(e){
      if(e.key === 'Enter'){ e.preventDefault(); nextBtn && nextBtn.click(); }
    };
  }

  document.addEventListener('keydown', function(e){
    if(e.key !== 'Escape') return;
    if(!m.classList.contains('open')) return;
    /* an open dropdown folds first; Escape should not end the whole first run */
    if(_richOpen) return;
    e.stopPropagation();
    finish(true);
  }, true);

  paint();
  if(gs(K.onboarded) === '1') return;
  /* only a genuinely new profile is greeted. Anyone carrying a saved name,
     city, gradient, quote source or engine from before this release keeps
     their page exactly as it was and is marked as settled, so an update never
     greets an existing user. */
  var PROFILE_KEYS = ['name','weatherCity','gradient','quoteCat','searchEngine','tabNameStyle','statusLabel','sc'];
  var existing = PROFILE_KEYS.some(function(k){
    var v = gs(K[k]);
    return v != null && v !== '' && v !== '[]' && v !== '{}';
  });
  if(existing){ ss(K.onboarded,'1'); return; }
  setTimeout(openWelcome, 850);
})();

/* ── weather window ── */
function openWeatherWin(){
  renderWeatherWindow();
  openWin('weather-modal');
}
(function(){
  var cs = $('ww-city-set');
  var ci = $('ww-city-input');
  if(cs) cs.onclick = function(){ setWeatherCity(ci ? ci.value : '', cs); };
  if(ci) ci.onkeydown = function(e){ if(e.key === 'Enter'){ e.preventDefault(); setWeatherCity(ci.value, cs); } };

  var us = $('ww-unit');
  if(us) us.onchange = function(){
    ss(K.weatherUnit, us.value);
    ss(K.weatherCache,'');
    loadWeather(true);
    startWeatherTimer();
    var iu = $('iweatherunit'); if(iu) iu.value = us.value;
  };

  var we = $('ww-every');
  function commitEvery(){
    if(!we) return;
    var m = parseInt(we.value,10);
    if(isNaN(m) || m < 1) m = 1;
    if(m > 1440) m = 1440;
    we.value = m;
    ss(K.weatherEvery, String(m));
    startWeatherTimer();
    var iw = $('iweatherevery'); if(iw) iw.value = m;
  }
  if(we){ we.onchange = commitEvery; we.onblur = commitEvery; }

  var wr = $('ww-refresh');
  if(wr) wr.onclick = function(){ if(!wr.disabled) loadWeather(true); };

  /* the same city, settable from inside the prayer window too */
  var pcs = $('pw-city-set');
  var pci = $('pw-city-input');
  if(pcs) pcs.onclick = function(){ setWeatherCity(pci ? pci.value : '', pcs); };
  if(pci) pci.onkeydown = function(e){ if(e.key === 'Enter'){ e.preventDefault(); setWeatherCity(pci.value, pcs); } };
})();

/* ── time-source segmented controls (calendar + clock windows) ── */
function extSetSeg(id, src){
  var s = $(id);
  if(!s) return;
  Array.prototype.forEach.call(s.querySelectorAll('.seg-btn'), function(b){
    b.classList.toggle('on', b.getAttribute('data-src') === src);
  });
}
function extSyncTimeSource(){
  var src = gs(K.timeSource) || 'device';
  var its = $('itimesource'); if(its) its.value = src;
  extSetSeg('calwin-source', src);
  extSetSeg('clockwin-source', src);
}
(function(){
  ['calwin-source','clockwin-source'].forEach(function(id){
    var s = $(id);
    if(!s) return;
    s.addEventListener('click', function(e){
      var b = e.target.closest('.seg-btn');
      if(!b) return;
      ss(K.timeSource, b.getAttribute('data-src') || 'device');
      onTimeSourcePicked();
    });
  });
})();

/* ── calendar window: browse any month of any year (years roll over on paging) ── */
var _calWinMonth = null;
var _calWinYear = null;
function renderCalWin(anim){
  var grid = $('calwin-grid');
  if(!grid) return;
  var now = wallNow();
  if(_calWinMonth == null) _calWinMonth = now.mon;
  if(_calWinYear == null)  _calWinYear  = now.year;
  var y = _calWinYear, m = _calWinMonth;
  var firstDow = (new Date(y, m, 1).getDay() + 6) % 7;   /* Monday first */
  var daysInMonth = new Date(y, m + 1, 0).getDate();
  var daysPrev = new Date(y, m, 0).getDate();
  var out = ['Mo','Tu','We','Th','Fr','Sa','Su'].map(function(d){
    return '<span class="cal-dow">' + d + '</span>';
  }).join('');
  for(var i = firstDow; i > 0; i--){
    out += '<span class="cal-day other">' + (daysPrev - i + 1) + '</span>';
  }
  for(var d = 1; d <= daysInMonth; d++){
    var today = (y === now.year && m === now.mon && d === now.date);
    var hol = holidaysOn() ? holidayFor(y, m, d) : null;
    out += '<span class="cal-day' + (today ? ' today' : '') + (hol ? ' hol' : '') +
           (hol ? '" title="' + holEsc(hol.local || hol.name) : '') + '">' + d + '</span>';
  }
  var cells = firstDow + daysInMonth, nextDay = 1;
  while(cells % 7 !== 0 || cells < 35){
    out += '<span class="cal-day other">' + (nextDay++) + '</span>';
    cells++;
  }
  grid.innerHTML = out;
  setText($('calwin-month'), MONTH_NAMES[m]);
  setText($('calwin-sub'), String(y));
  var hw = $('calwin-hols');
  if(hw){
    var hlist = holidaysInMonth(y, m);
    if(hlist.length){
      var hh = '';
      hlist.forEach(function(h){
        hh += '<div class="calwin-hol"><span class="calwin-hol-d">' + h.d + '</span>' +
              '<span class="calwin-hol-n" title="' + holEsc(h.name) + '">' + holEsc(h.name) + '</span></div>';
      });
      hw.innerHTML = hh;
    } else if(holidaysOn()){
      hw.innerHTML = '<div class="calwin-hol empty">No public holidays this month.</div>';
    } else {
      hw.innerHTML = '';
    }
  }
  if(holidaysOn()) ensureHolidays(y);
  if(anim){
    var style = gs(K.animStyle) || 'spring';
    ['cal-anim','cal-spring','cal-fade','cal-slide','cal-zoom','cal-blur','cal-drift','cal-glide','cal-unfold','cal-none'].forEach(function(c){
      grid.classList.remove(c);
    });
    void grid.offsetWidth;
    grid.classList.add('cal-anim','cal-' + style);
  }
}
function openCalWin(){
  _calWinMonth = wallNow().mon;
  _calWinYear  = wallNow().year;
  extSyncTimeSource();
  renderCalWin(true);
  syncCalSizeUI();
  openWin('calendar-modal');
}
(function(){
  var p = $('calwin-prev');
  if(p) p.onclick = function(){
    var now = wallNow();
    var m = (_calWinMonth == null) ? now.mon : _calWinMonth;
    var y = (_calWinYear  == null) ? now.year : _calWinYear;
    m--; if(m < 0){ m = 11; y--; }
    _calWinMonth = m; _calWinYear = y;
    renderCalWin(true);
  };
  var n = $('calwin-next');
  if(n) n.onclick = function(){
    var now = wallNow();
    var m = (_calWinMonth == null) ? now.mon : _calWinMonth;
    var y = (_calWinYear  == null) ? now.year : _calWinYear;
    m++; if(m > 11){ m = 0; y++; }
    _calWinMonth = m; _calWinYear = y;
    renderCalWin(true);
  };
})();

/* ── clock window ── */
function buildClockWinGrid(){
  var g = $('clockwin-style-grid');
  if(!g) return;
  var cur = gs(K.clockStyle) || 'default';
  if(cur === 'colon') cur = 'default';
  if(builtOnce('clockwin')){ selectIn(g,'.clock-card','data-id',cur); return; }
  g.innerHTML = '';
  CLOCK_STYLES.forEach(function(cs){
    var c = document.createElement('div');
    c.className = 'clock-card';
    c.setAttribute('data-id', cs.id);
    c.innerHTML = '<div class="cname">' + cs.name + '</div><div class="cprev">' + clockPreviewText(cs.id) + '</div>';
    c.onclick = function(){
      selectIn(g,'.clock-card','data-id',cs.id);
      ss(K.clockStyle, cs.id);
      applyClockStyle();
      refreshClockCard();
      scheduleClock();
      scheduleRefit();
      var sc = $('clock-style-grid');
      if(sc) selectIn(sc,'.clock-card','data-id',cs.id);
    };
    g.appendChild(c);
  });
  selectIn(g,'.clock-card','data-id',cur);
}
function extSyncClockWin(){
  buildClockWinGrid();
  var h = $('clockwin-hour');    if(h) h.value = gs(K.hourFmt) || '24';
  var s = $('clockwin-secs');    if(s) s.value = gs(K.showSecs) || '0';
  var d = $('clockwin-datefmt'); if(d) d.value = gs(K.dateFmt) || 'long';
  var z = $('clockwin-size'), zv = $('clockwin-size-v');
  if(z){
    var cs = parseInt(gs(K.clockSize),10);
    if(!(cs > 0)) cs = clockFontSizes().time;
    z.value = cs;
    if(zv) zv.textContent = cs + 'px';
  }
}
function openClockWin(){
  extSyncClockWin();
  extSyncTimeSource();
  openWin('clock-modal');
}
(function(){
  var h = $('clockwin-hour');
  if(h) h.onchange = function(){
    ss(K.hourFmt, h.value);
    applyClockStyle(); scheduleClock(); refreshWeatherStamp(); scheduleRefit();
    var ih = $('ihour'); if(ih) ih.value = h.value;
  };
  var s = $('clockwin-secs');
  if(s) s.onchange = function(){
    ss(K.showSecs, s.value);
    applyClockStyle(); scheduleClock(); scheduleRefit();
    var isec = $('isecs'); if(isec) isec.value = s.value;
  };
  var d = $('clockwin-datefmt');
  if(d) d.onchange = function(){
    ss(K.dateFmt, d.value);
    applyClockStyle(); scheduleClock(); scheduleRefit();
    var idf = $('idatefmt'); if(idf) idf.value = d.value;
  };
  var z = $('clockwin-size'), zv = $('clockwin-size-v');
  if(z) z.oninput = function(){
    var v = parseInt(z.value,10);
    if(!(v > 0)) return;
    ss(K.clockSize, String(v));
    if(zv) zv.textContent = v + 'px';
    applyClockStyle();
    refreshClockCard();
    peekUpdate('Clock size ' + v + 'px');
    var ics = $('iclocktime'); if(ics) ics.value = v;
    var icsv = $('iclocktime-v'); if(icsv) icsv.textContent = v + 'px';
  };
  /* dragging the size slider fades this window so the clock itself is visible */
  wireWinPeek(z, 'clock-modal', function(){ return 'Clock size ' + z.value + 'px'; });

  var zr = $('clockwin-size-reset');
  if(zr) zr.onclick = function(){
    ss(K.clockSize, '');
    extSyncClockWin();
    applyClockStyle();
    refreshClockCard();
    scheduleClock();
    scheduleRefit();
    var ics = $('iclocktime');
    if(ics) ics.value = clockFontSizes().time;
    var icsv = $('iclocktime-v');
    if(icsv) icsv.textContent = clockFontSizes().time + 'px';
    noteToast('Clock size reset.');
  };
})();

/* ── greeting window ── */
function buildGreetWinColors(){
  var g = $('gw-colors');
  if(!g) return;
  var cur = gs(K.greetColor) || '#ffffff';
  if(builtOnce('gwcolors')){ selectIn(g,'.swatch','data-color',cur); return; }
  g.innerHTML = '';
  GREET_COLORS.forEach(function(col){
    var s = document.createElement('div');
    s.className = 'swatch';
    s.style.background = col;
    s.title = col;
    s.setAttribute('data-color', col);
    if(col === '#000000' || col === '#1c1c1e' || col === '#2c2c2e' || col === '#3a3a3c'){
      s.style.border = '2px solid rgba(255,255,255,0.25)';
    }
    s.onclick = function(){
      selectIn(g,'.swatch','data-color',col);
      ss(K.greetColor, col);
      applyGreetingStyle();
      var sg = $('greet-color-swatches');
      if(sg) selectIn(sg,'.swatch','data-color',col);
    };
    g.appendChild(s);
  });
  selectIn(g,'.swatch','data-color',cur);
}
function extSyncGreetWin(){
  var n = $('gw-name');   if(n) n.value = gs(K.name) || '';
  var st = $('gw-style');
  if(st) st.value = gs(K.style) || 'hi';
  var cw = $('gw-custom-wrap');
  if(cw) cw.style.display = ((gs(K.style) || 'hi') === 'custom') ? '' : 'none';
  var c = $('gw-custom');  if(c) c.value = gs(K.customGreet) || '';
  var w = $('gw-weight');  if(w) w.value = gs(K.greetWeight) || '400';
  var it = $('gw-italic'); if(it) it.value = gs(K.greetItalic) || 'normal';
  var sz = $('gw-size');   if(sz) sz.value = gs(K.greetSize) || '22px';
  var sg = $('greet-color-swatches');
  if(sg) selectIn(sg,'.swatch','data-color',gs(K.greetColor) || '#ffffff');
  buildGreetWinColors();
}
function openGreetWin(){
  extSyncGreetWin();
  renderGreetPreviews();
  openWin('greeting-modal');
}
(function(){
  var n = $('gw-name');
  if(n) n.oninput = function(){
    ss(K.name, n.value.trim());
    renderGreeting();
    var iname = $('iname'); if(iname) iname.value = n.value;
  };
  var st = $('gw-style');
  if(st) st.onchange = function(){
    toggleCustomGreet(st.value);
    var cw = $('gw-custom-wrap'); if(cw) cw.style.display = (st.value === 'custom') ? '' : 'none';
    ss(K.style, st.value);
    renderGreeting();
    var istyle = $('istyle'); if(istyle) istyle.value = st.value;
  };
  var c = $('gw-custom');
  if(c) c.oninput = function(){
    ss(K.customGreet, c.value);
    renderGreeting();
    var ic = $('icustomgreet'); if(ic) ic.value = c.value;
  };
  var w = $('gw-weight');
  if(w) w.onchange = function(){
    ss(K.greetWeight, w.value); applyGreetingStyle();
    var i = $('igreetweight'); if(i) i.value = w.value;
  };
  var it = $('gw-italic');
  if(it) it.onchange = function(){
    ss(K.greetItalic, it.value); applyGreetingStyle();
    var i = $('igreetsyle'); if(i) i.value = it.value;
  };
  var sz = $('gw-size');
  if(sz) sz.onchange = function(){
    ss(K.greetSize, sz.value); applyGreetingStyle();
    var i = $('igreetsize'); if(i) i.value = sz.value;
  };
})();

/* ── quote window ── */
var EXT_QUOTE_CATS = [
  ['general','General','Everyday lines from writers and thinkers. Fetched from dummyjson.com each new tab.'],
  ['philosophy','Philosophy','Words from famous philosophers. Kept inside Newly, so it works offline.'],
  ['bible','Bible verse','A random verse from bible-api.com \u2014 World English Bible, online.'],
  ['quran','Qur\u2019an verse','A random ayah from alquran.cloud (Pickthall). This mode also adds the prayer card \u2014 times from aladhan.com, using your weather city.'],
  ['custom','Custom','Your own words, exactly as you wrote them.'],
  ['random','Random mix','A little of everything \u2014 a different voice each new tab.']
];
var EXT_CAT_ICONS = {
  general:'\u270D\uFE0F', philosophy:'\uD83C\uDFDB\uFE0F', bible:'\u271D\uFE0E',
  quran:'\u262A\uFE0E', custom:'\uD83D\uDD8B\uFE0F', random:'\uD83C\uDFB2'
};
function extCatName(cat){
  for(var i = 0; i < EXT_QUOTE_CATS.length; i++){
    if(EXT_QUOTE_CATS[i][0] === cat) return EXT_QUOTE_CATS[i][1];
  }
  return '';
}
function markQuoteCats(cur){
  var g = $('qw-cats');
  if(!g) return;
  Array.prototype.forEach.call(g.querySelectorAll('.qw-cat'), function(b){
    var on = b.getAttribute('data-cat') === cur;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}
function buildQuoteCats(){
  var g = $('qw-cats');
  if(!g) return;
  var cur = gs(K.quoteCat) || 'general';
  if(builtOnce('qwc')){ markQuoteCats(cur); return; }
  g.innerHTML = '';
  EXT_QUOTE_CATS.forEach(function(pair){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'qw-cat';
    b.setAttribute('data-cat', pair[0]);

    var ico = document.createElement('span');
    ico.className = 'qw-cat-ico';
    ico.textContent = EXT_CAT_ICONS[pair[0]] || '';

    var body = document.createElement('span');
    body.className = 'qw-cat-body';

    var name = document.createElement('span');
    name.className = 'qw-cat-name';
    name.textContent = pair[1];

    var desc = document.createElement('span');
    desc.className = 'qw-cat-desc';
    desc.textContent = pair[2];

    body.appendChild(name);
    body.appendChild(desc);
    b.appendChild(ico);
    b.appendChild(body);
    b.onclick = function(){ extPickQuoteCat(pair[0]); };
    g.appendChild(b);
  });
  markQuoteCats(cur);
}
function renderQuoteWinPreview(){
  var t = $('qw-now-text'), a = $('qw-now-author');
  var txt = ($('q-text') ? $('q-text').textContent : '').trim();
  var au  = ($('q-author') ? $('q-author').textContent : '').trim();
  if(t) t.textContent = txt || 'Nothing on the card yet.';
  if(a) a.textContent = au;
}
function extPickQuoteCat(cat){
  ss(K.quoteCat, cat);
  var qc = $('iquotecat');
  if(qc){ qc.value = cat; toggleCustomQuote(cat); }
  buildQuoteCats();
  var cw = $('qw-custom-wrap');
  if(cw) cw.style.display = (cat === 'custom') ? '' : 'none';
  if(cat === 'custom'){
    var t = $('qw-custom-text');   if(t) t.value = gs(K.customQuote) || '';
    var a = $('qw-custom-author'); if(a) a.value = gs(K.customQuoteAuthor) || '';
  }
  setText($('qw-sub'), extCatName(cat));
  loadQuote(true);
  startQuoteTimer();
  renderQuoteWinPreview();
}
/* how often the window's refresh choice means, in words */
function everyLabel(secs){
  secs = parseInt(secs,10) || 0;
  if(secs <= 0) return 'until you ask for another';
  if(secs < 60) return 'every ' + secs + ' seconds';
  if(secs % 3600 === 0) return 'every ' + (secs / 3600) + (secs === 3600 ? ' hour' : ' hours');
  if(secs % 60 === 0) return 'every ' + (secs / 60) + ' minutes';
  return 'about every ' + Math.round(secs / 60) + ' minutes';
}
/* the settings allow any number of seconds; the window shows the nearest
   honest preset and adds a temporary line for anything else */
function syncQuoteEverySelect(){
  var sel = $('qw-every');
  if(!sel) return;
  var secs = quoteAutoOn() ? quoteIntervalSecs() : 0;
  var old = sel.querySelector('option[data-temp]');
  if(old) old.remove();
  var match = Array.prototype.some.call(sel.options, function(o){ return Number(o.value) === secs; });
  if(!match){
    var o = document.createElement('option');
    o.value = String(secs);
    o.setAttribute('data-temp','1');
    o.textContent = 'Custom \u2014 ' + everyLabel(secs);
    sel.appendChild(o);
  }
  sel.value = String(secs);
  /* the seconds field mirrors whatever is selected, so both stay honest */
  var box = $('qw-every-secs');
  if(box && document.activeElement !== box) box.value = secs > 0 ? String(secs) : '';
}
/* one place where both the preset list and the "own pace" field land */
function commitQuoteEvery(v){
  v = parseInt(v, 10) || 0;
  if(v > 0) v = Math.min(86400, Math.max(5, v));
  if(v > 0){ ss(K.quoteAuto,'1'); ss(K.quoteEvery,String(v)); }
  else { ss(K.quoteAuto,'0'); ss(K.quoteEvery,'0'); }
  var qa = $('q-auto'); if(qa) qa.checked = v > 0;
  var qe = $('iquoteevery');
  if(qe){ qe.value = v > 0 ? String(v) : ''; qe.disabled = !(v > 0); }
  startQuoteTimer();
  syncQuoteEverySelect();
  setText($('qw-status'), (gs(K.quoteCat) || 'general') === 'custom'
    ? 'Your own words stay exactly as you wrote them.'
    : (v > 0 ? 'A fresh voice ' + everyLabel(v) + '.'
             : 'The same one stays until you ask for another.'));
}
function openQuoteWin(){
  buildQuoteCats();
  syncQuoteEverySelect();
  var cat = gs(K.quoteCat) || 'general';
  var cw = $('qw-custom-wrap');
  if(cw) cw.style.display = (cat === 'custom') ? '' : 'none';
  var t = $('qw-custom-text');   if(t) t.value = gs(K.customQuote) || '';
  var a = $('qw-custom-author'); if(a) a.value = gs(K.customQuoteAuthor) || '';
  setText($('qw-sub'), extCatName(cat));
  renderQuoteWinPreview();
  openWin('quote-modal');
}
(function(){
  /* how often the quote changes, right here in the window */
  var qwe = $('qw-every');
  if(qwe) qwe.onchange = function(){ commitQuoteEvery(qwe.value); };

  /* your own number of seconds, in sync with the presets */
  var qws = $('qw-every-secs');
  if(qws){
    function commitOwn(){
      var raw = (qws.value || '').trim();
      var v = parseInt(raw, 10);
      if(!raw || !(v > 0)){ qws.value = ''; commitQuoteEvery(0); return; }
      commitQuoteEvery(v);
      qws.value = String(Math.min(86400, Math.max(5, v)));
    }
    qws.onchange = commitOwn;
    qws.onblur = commitOwn;
    qws.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){ e.preventDefault(); commitOwn(); qws.blur(); }
    });
  }

  var save = $('qw-custom-save');
  if(save) save.onclick = function(){
    var t = ($('qw-custom-text') ? $('qw-custom-text').value : '').trim();
    if(!t){ setText($('qw-status'),'A few words first, whenever you are ready.'); return; }
    var au = ($('qw-custom-author') ? $('qw-custom-author').value : '').trim();
    ss(K.customQuote, t);
    ss(K.customQuoteAuthor, au);
    var icq = $('icustomquote');       if(icq)  icq.value  = t;
    var icqa = $('icustomquoteauthor'); if(icqa) icqa.value = au;
    extPickQuoteCat('custom');
    setText($('qw-status'),'Saved \u2014 it is resting on your new tab now.');
    flash(save,'Saved');
  };

  /* copy the quote that is on screen right now */
  var copy = $('quote-copy');
  if(copy) copy.onclick = function(e){
    e.preventDefault();
    e.stopPropagation();
    var txt = ($('q-text')   ? $('q-text').textContent   : '').trim();
    var au  = ($('q-author') ? $('q-author').textContent : '').trim();
    if(!txt) return;
    var full = txt + (au ? ' \u2014 ' + au : '');
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(full).then(function(){
        noteToast('Quote copied.');
      }).catch(function(){
        noteToast('Couldn\u2019t copy \u2014 try again in a moment.');
      });
    } else {
      noteToast('Couldn\u2019t copy \u2014 try again in a moment.');
    }
  };
})();

/* ── open the windows from their widgets ── */
(function(){
  function wire(widgetId, open){
    var w = $(widgetId);
    if(!w) return;
    w.addEventListener('click', function(e){
      if(_layoutEditing) return;
      if(Date.now() - _lastDragEnd < 300) return;   /* don't open right after a drag */
      if(e.target.closest('.resize-knob') || e.target.closest('button') || e.target.closest('a')) return;
      open();
    });
  }
  wire('weather',       openWeatherWin);
  wire('calendar',      openCalWin);
  wire('datetime',      openClockWin);
  wire('greeting-wrap', openGreetWin);
  wire('quote',         openQuoteWin);

  /* close ✕ buttons only — a stray click outside must never dismiss a window */
  [['weather-modal','weather-close'],
   ['calendar-modal','calendar-close'],
   ['clock-modal','clockwin-close'],
   ['greeting-modal','greeting-close'],
   ['quote-modal','quote-close']].forEach(function(row){
    var c = $(row[1]);
    if(c) c.onclick = function(){ closeWin(row[0]); };
  });
})();

/* ── search: engine menu, focus lift, page dimmer ── */
function buildEngineMenu(){
  var g = $('engine-menu');
  if(!g) return;
  if(builtOnce('enginemenu')){ markEngineMenu(); return; }
  g.innerHTML = '';
  Object.keys(ENGINES).forEach(function(k){
    var e = ENGINES[k];
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mini-item';
    b.setAttribute('data-eng', k);
    b.innerHTML = '<img src="' + iconURL(e.domain) + '" alt=""><span>' + e.name + '</span>';
    /* keep the search input focused while choosing: otherwise the bar starts
       settling home on pointerdown and the click lands on empty space */
    b.addEventListener('pointerdown', function(ev){ ev.preventDefault(); });
    b.onclick = function(){
      ss(K.searchEngine, k);
      applySearchEngine();
      markEngineMenu();
      closeEngineMenu();
      /* keep the bar expanded after a choice — picking an engine should not
         drop you back to the resting position */
      var inp = $('search-input');
      if(inp && !_layoutEditing) inp.focus();
    };
    g.appendChild(b);
  });
  markEngineMenu();
}
function markEngineMenu(){
  var g = $('engine-menu');
  if(!g) return;
  var cur = gs(K.searchEngine) || 'google';
  Array.prototype.forEach.call(g.querySelectorAll('.mini-item'), function(b){
    b.classList.toggle('on', b.getAttribute('data-eng') === cur);
  });
}
/* the menu leaves the same way it arrived: a short fade-and-drop, not a snap.
   `closing` keeps it painted for the animation, then display:none returns. */
var _engineCloseTimer = null;
function openEngineMenu(){
  buildEngineMenu();
  var g = $('engine-menu');
  if(!g) return;
  if(_engineCloseTimer){ clearTimeout(_engineCloseTimer); _engineCloseTimer = null; }
  g.classList.remove('closing');
  g.classList.add('open');
}
function closeEngineMenu(){
  var g = $('engine-menu');
  if(!g || !g.classList.contains('open')) return;
  g.classList.remove('open');
  g.classList.add('closing');
  if(_engineCloseTimer) clearTimeout(_engineCloseTimer);
  _engineCloseTimer = setTimeout(function(){
    _engineCloseTimer = null;
    g.classList.remove('closing');
  }, 190);
}

(function(){
  var input = $('search-input');
  var icon  = $('search-engine-icon');
  var bar   = $('searchbar');
  var dim   = $('search-dim');
  /* the bar travels to the centre on focus, so the pointerup after opening
     the menu can land on the page; ignore that one click instead of closing
     the menu we just opened */
  var guardUntil = 0;

  function lift(){ if(_layoutEditing) return; if(overlay && overlay.classList.contains('open')) return; document.body.classList.add('search-active'); if(bar) bar.classList.add('search-focus'); }
  function settle(){ document.body.classList.remove('search-active'); if(bar) bar.classList.remove('search-focus'); }

  if(icon){
    /* pointerdown, not click: the bar is lifted while you type, and a plain
       click first blurred the input, which sent the bar home before the
       pointer was released — so the icon looked dead whenever the bar was
       already open. Preventing the default keeps the focus (and the bar)
       exactly where it is. */
    icon.addEventListener('pointerdown', function(e){
      if(_layoutEditing) return;
      e.preventDefault();
      e.stopPropagation();
      var g = $('engine-menu');
      if(g && g.classList.contains('open')) closeEngineMenu();
      else { openEngineMenu(); guardUntil = Date.now() + 450; if(input) input.focus(); }
    });
  }
  /* clicking anywhere on the bar sends focus into it, not just the input */
  if(bar) bar.addEventListener('click', function(e){
    if(_layoutEditing) return;
    if(e.target.closest('#search-engine-icon') || e.target.closest('#engine-menu') || e.target.closest('button')) return;
    if(input) input.focus();
  });
  if(input){
    input.addEventListener('focus', function(){
      if(_layoutEditing){ input.blur(); return; }
      lift();
      var g = $('engine-menu');
      if(g && g.classList.contains('open')) markEngineMenu();
    });
    input.addEventListener('blur', function(){
      setTimeout(function(){
        if(document.activeElement === input) return;
        var g = $('engine-menu');
        if(g && g.classList.contains('open')) return;
        settle();
      }, 140);
    });
  }
  if(dim) dim.onclick = function(){
    if(Date.now() < guardUntil) return;
    closeEngineMenu();
    settle();
    if(input) input.blur();
  };
  document.addEventListener('click', function(e){
    var g = $('engine-menu');
    if(!g || !g.classList.contains('open')) return;
    if(Date.now() < guardUntil) return;
    if(e.target.closest('#engine-menu') || e.target.closest('#search-engine-icon')) return;
    closeEngineMenu();
  });
})();

/* ── settings extras: calendar size, time source, custom tint ── */
(function(){
  function bindCalSize(id, modalId){
    var el = $(id);
    if(!el) return;
    el.oninput = function(){
      setCalSize(el.value);
      peekUpdate('Calendar size ' + el.value + 'px');
    };
    if(modalId) wireWinPeek(el, modalId, function(){ return 'Calendar size ' + el.value + 'px'; });
    else wirePeek(el, function(){ return 'Calendar size ' + el.value + 'px'; });
  }
  bindCalSize('icalsize');
  bindCalSize('icalsize-w');
  bindCalSize('calwin-size', 'calendar-modal');
  syncCalSizeUI();

  var ics = $('iclocktime');
  wirePeek(ics, function(){ return 'Clock size ' + ics.value + 'px'; });

  var its = $('itimesource');
  if(its) its.onchange = function(){
    ss(K.timeSource, its.value);
    onTimeSourcePicked();
  };

  var tinc = $('iglasstint');
  if(tinc) tinc.oninput = function(){
    var rgba = hexToRgba(tinc.value);
    if(!rgba) return;
    ss(K.glassTint, rgba);
    applyGlassSettings();
    markPreset('');
    var g = $('glass-tint-swatches');
    if(g) Array.prototype.forEach.call(g.querySelectorAll('.swatch'), function(s){ s.classList.remove('selected'); });
  };
})();

/* ══════════════════════════════════════════
   SHARED RICH DROPDOWN  (replaces native <select>)
   One calm popover for every choice, in the same voice as the search
   engine menu: a button that shows the current value, a floating list that
   flips up or down to fit the screen, and a soft tick on the one you have.
   Keyboard works too — Tab reaches it (the native value stays put for
   forms and assistive tech), Enter/Space/arrows open and move, Esc closes.
   The native <select> is kept underneath, invisible but never removed, so
   every existing onchange handler and the profile loader keep working. */
var _richOpen = null;
var _richTimer = null;

function syncRichItems(sel){
  var menu = sel.__menu;
  if(!menu) return;
  menu.innerHTML = '';
  var options = sel.options;
  for(var k = 0; k < options.length; k++){
    var o = options[k];
    var it = document.createElement('button');
    it.type = 'button';
    it.className = 'rich-item';
    it.setAttribute('role','option');
    it.setAttribute('aria-selected','false');
    var tx = document.createElement('span');
    tx.textContent = o.text;
    it.appendChild(tx);
    var tk = document.createElement('span');
    tk.className = 'tick';
    tk.setAttribute('aria-hidden','true');
    tk.textContent = '\u2713';
    it.appendChild(tk);
    it.addEventListener('pointerdown', function(ev){ ev.preventDefault(); });
    it.onclick = function(idx){
      return function(){
        var oo = sel.options[idx];
        if(sel.value !== oo.value){
          sel.value = oo.value;
          sel.options[idx].selected = true;
          sel.dispatchEvent(new Event('change',{bubbles:true}));
        }
        closeRich(sel);
        updateRich(sel);
      };
    }(k);
    menu.appendChild(it);
  }
}
function updateRich(sel){
  var rv = sel.__rv, trig = sel.__trig, menu = sel.__menu;
  if(!rv) return;
  var i = sel.selectedIndex; if(i < 0) i = 0;
  var ph = sel.getAttribute('data-ph') || sel.getAttribute('placeholder') || '';
  var next = '', isPh = false;
  if(sel.options.length && i < sel.options.length && sel.options[i]){
    next = sel.options[i].text;
    if(trig){
      var al = 'Choose: ' + next;
      if(trig.getAttribute('aria-label') !== al) trig.setAttribute('aria-label', al);
    }
  } else if(ph){
    next = ph;
    isPh = true;
  }
  if(rv.textContent !== next) rv.textContent = next;
  rv.classList.toggle('ph', isPh);
  if(menu){
    Array.prototype.forEach.call(menu.querySelectorAll('.rich-item'), function(item,k){
      var on = (k === i);
      item.classList.toggle('on', on);
      item.setAttribute('aria-selected', on ? 'true':'false');
    });
  }
}
function openRich(sel){
  var menu = sel.__menu, trig = sel.__trig;
  if(!menu || !trig) return;
  if(_richOpen && _richOpen !== sel) closeRich(_richOpen);
  syncRichItems(sel);
  updateRich(sel);
  var r = trig.getBoundingClientRect();
  menu.style.minWidth = Math.max(180, Math.round(r.width)) + 'px';
  var visible = sel.__menuRows ? Math.min(sel.__menuRows, sel.options.length) : sel.options.length;
  var est = Math.min(240, visible * 34 + 22);
  var spaceBelow = window.innerHeight - r.bottom - 10;
  var up = spaceBelow < est && r.top > 240;
  menu.setAttribute('data-up', up ? '1':'0');
  var left = Math.max(10, Math.min(r.left, window.innerWidth - 230));
  if(up){
    menu.style.bottom = Math.round(window.innerHeight - r.top + 8) + 'px';
    menu.style.top = 'auto';
  } else {
    menu.style.top = Math.round(r.bottom + 8) + 'px';
    menu.style.bottom = 'auto';
  }
  menu.style.left = left + 'px';
  if(_richTimer) clearTimeout(_richTimer);
  menu.classList.remove('closing', 'open');
  menu.style.display = 'flex';
  menu.classList.add('open');
  trig.classList.add('open');
  _richOpen = sel;
}
function closeRich(sel){
  var menu = sel.__menu, trig = sel.__trig;
  if(!menu || !menu.classList.contains('open')) return;
  menu.classList.remove('open');
  menu.classList.add('closing');
  if(trig) trig.classList.remove('open');
  if(_richTimer) clearTimeout(_richTimer);
  _richTimer = setTimeout(function(){
    menu.classList.remove('closing');
    menu.style.display = '';
  }, 160);
  if(_richOpen === sel) _richOpen = null;
}
function makeRich(sel){
  if(!sel || sel.__rich) return;
  if(sel.getAttribute('data-native')) return;   /* a field that should stay a real select */
  sel.__rich = true;

  var wrap = document.createElement('span');
  wrap.className = 'rich';
  sel.parentElement.insertBefore(wrap, sel);
  wrap.appendChild(sel);
  /* follow the width the select was given; nothing else may pin a pixel size,
     or the control would stop fitting when the panel or window resizes */
  wrap.style.width = sel.style.width || '100%';

  var trig = document.createElement('button');
  trig.type = 'button';
  trig.className = 'rich-trig';
  trig.setAttribute('aria-haspopup','listbox');
  if(sel.style.width) trig.style.width = sel.style.width;
  if(sel.style.fontSize) trig.style.fontSize = sel.style.fontSize;
  var rv = document.createElement('span');
  rv.className = 'rv';
  var caret = document.createElement('span');
  caret.className = 'caret';
  trig.appendChild(rv);
  trig.appendChild(caret);
  trig.addEventListener('pointerdown', function(e){ e.preventDefault(); });
  trig.onclick = function(){
    if(_richOpen === sel) closeRich(sel);
    else openRich(sel);
  };
  trig.onkeydown = function(e){
    if(e.key === 'Escape'){ if(_richOpen === sel) closeRich(sel); return; }
    if(e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp'){
      e.preventDefault();
      if(_richOpen === sel){ closeRich(sel); return; }
      openRich(sel);
      var items = sel.__menu.querySelectorAll('.rich-item');
      if(items.length) items[Math.max(0, sel.selectedIndex)].focus();
    }
  };

  var menu = document.createElement('div');
  menu.className = 'rich-menu';
  menu.setAttribute('role','listbox');
  menu.addEventListener('pointerdown', function(e){ e.preventDefault(); });

  wrap.appendChild(trig);
  /* the list lives on <body>, not inside the panel: the settings panel and the
     windows are scaled, which would trap a fixed child inside their own
     coordinate space. On <body> it floats over everything, at viewport edges. */
  document.body.appendChild(menu);
  sel.__wrap = wrap; sel.__trig = trig; sel.__rv = rv; sel.__menu = menu;

  /* a long list can cap its visible rows and scroll instead (currency, etc.) */
  var rows = parseInt(sel.getAttribute('data-rows'), 10);
  if(rows > 0){
    sel.__menuRows = rows;
    menu.style.overflowY = 'auto';
    menu.style.maxHeight = (rows * 32 + 12) + 'px';   /* fallback before measuring */
  }

  syncRichItems(sel);
  updateRich(sel);
  /* measure one row and cap at exactly that many rows, so the list never ends
     on a half-visible option */
  if(sel.__menuRows){
    menu.style.visibility = 'hidden';
    menu.style.display = 'flex';
    var probe = menu.querySelector('.rich-item');
    var ih = probe ? probe.offsetHeight : 30;
    menu.style.maxHeight = (sel.__menuRows * (ih + 2) + 10) + 'px';
    menu.style.display = '';
    menu.style.visibility = '';
  }
}

/* one popover at a time: a click that lands outside the open list folds it */
document.addEventListener('pointerdown', function(e){
  if(!_richOpen) return;
  var sel = _richOpen;
  var wrap = sel.__wrap;
  if(e.target && e.target.closest){
    if(e.target.closest('.rich-trig') || e.target.closest('.rich-menu')) return;
  }
  if(wrap && wrap.contains && wrap.contains(e.target)) return;
  closeRich(sel);
}, true);
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape') return;
  if(_richOpen){ e.stopPropagation(); e.preventDefault(); closeRich(_richOpen); }
}, true);
var _richMenuSelected = null;
document.addEventListener('keydown', function(e){
  var sel = _richOpen;
  if(!sel) return;
  if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){
    var items = sel.__menu.querySelectorAll('.rich-item');
    if(!items.length) return;
    e.preventDefault(); e.stopPropagation();
    var cur = Array.prototype.indexOf.call(items, document.activeElement);
    if(cur < 0) cur = sel.selectedIndex;
    if(cur < 0) cur = 0;
    cur += (e.key === 'ArrowDown') ? 1 : -1;
    cur = (cur + items.length) % items.length;
    items[cur].focus();
  }
}, true);

/* build a rich list for every native select that uses the field look */
function initRichSelects(){
  /* the currency lists are filled at runtime — build their options before the
     rich menus snapshot them */
  populateCurrencySelects();
  document.querySelectorAll('select.fi').forEach(makeRich);
}
function refreshRichLabels(){
  document.querySelectorAll('select.fi').forEach(updateRich);
}

/* start every window control in the right place */
extSyncTimeSource();
buildClockWinGrid();
buildQuoteCats();
buildEngineMenu();
initRichSelects();
refreshRichLabels();

/* ── Escape closes the topmost thing ── */
document.addEventListener('keydown', function(e){
  if(e.key !== 'Escape') return;
  var g = $('engine-menu');
  if(g && g.classList.contains('open')){ closeEngineMenu(); return; }
  if(_openWin){ var id = _openWin; closeWin(id); }
});

})();
