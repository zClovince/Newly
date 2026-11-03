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
  motion:'nt_grad_motion', motionSpeed:'nt_grad_speed'
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

/* Apple-ish static gradients used whenever the video is off. All are dark and
   desaturated on purpose, so white glass cards and text stay readable. */
var GRADIENTS = [
  { name:'Nebula',   css:'linear-gradient(125deg,#241a44,#0d2438 32%,#3a1b3d 62%,#08182b)',
    blob:'radial-gradient(46% 46% at 24% 30%, rgba(124,86,208,0.55), transparent 70%),radial-gradient(50% 50% at 78% 26%, rgba(52,110,196,0.45), transparent 72%),radial-gradient(54% 54% at 62% 80%, rgba(196,74,150,0.38), transparent 74%)' },
  { name:'Midnight', css:'linear-gradient(125deg,#0b1026,#131a3a 40%,#1b1030 70%,#05070f)',
    blob:'radial-gradient(50% 50% at 26% 28%, rgba(58,74,170,0.42), transparent 70%),radial-gradient(52% 52% at 76% 74%, rgba(96,68,168,0.34), transparent 72%),radial-gradient(46% 46% at 62% 32%, rgba(40,90,150,0.30), transparent 70%)' },
  { name:'Aurora',   css:'linear-gradient(125deg,#06312e,#0b3a4a 35%,#123a56 65%,#04121f)',
    blob:'radial-gradient(48% 48% at 24% 32%, rgba(28,150,132,0.48), transparent 70%),radial-gradient(52% 52% at 78% 30%, rgba(38,132,196,0.42), transparent 72%),radial-gradient(50% 50% at 60% 80%, rgba(30,170,150,0.34), transparent 72%)' },
  { name:'Sunset',   css:'linear-gradient(125deg,#3a1630,#4a1c2e 35%,#2a1230 65%,#12081a)',
    blob:'radial-gradient(48% 48% at 26% 30%, rgba(196,86,120,0.46), transparent 70%),radial-gradient(52% 52% at 78% 32%, rgba(214,120,72,0.40), transparent 72%),radial-gradient(50% 50% at 58% 80%, rgba(150,54,120,0.36), transparent 72%)' },
  { name:'Ocean',    css:'linear-gradient(125deg,#0a2740,#0d3a52 40%,#123047 70%,#04121e)',
    blob:'radial-gradient(48% 48% at 24% 30%, rgba(36,124,176,0.46), transparent 70%),radial-gradient(52% 52% at 78% 34%, rgba(28,158,168,0.38), transparent 72%),radial-gradient(50% 50% at 60% 80%, rgba(30,96,168,0.34), transparent 72%)' },
  { name:'Graphite', css:'linear-gradient(125deg,#1a1a1f,#232329 40%,#141418 70%,#0a0a0d)',
    blob:'radial-gradient(48% 48% at 26% 30%, rgba(150,152,170,0.20), transparent 70%),radial-gradient(52% 52% at 78% 34%, rgba(120,124,150,0.16), transparent 72%),radial-gradient(50% 50% at 60% 80%, rgba(170,172,190,0.14), transparent 72%)' }
];

function gradientIndex(){
  var i = parseInt(gs(K.gradient),10);
  if(isNaN(i) || i < 0 || i >= GRADIENTS.length) i = 0;
  return i;
}
function applyGradient(i){
  if(typeof i !== 'number') i = gradientIndex();
  var g = GRADIENTS[i] || GRADIENTS[0];
  var root = document.documentElement.style;
  root.setProperty('--grad-bg', g.css);
  root.setProperty('--grad-blob', g.blob || 'none');
}
/* how much the gradient drifts: 'still', 'slow' or 'flow'. Slow is the
   default — a barely-there life in the colours that costs almost nothing. */
function motionMode(){
  var m = gs(K.motion);
  return (m === 'still' || m === 'flow') ? m : 'slow';
}
/* 1–100, left slow, right fast. 50 is the calm default set earlier. */
function motionSpeed(){
  var s = parseInt(gs(K.motionSpeed),10);
  if(isNaN(s)) s = 50;
  return Math.max(1, Math.min(100, s));
}
/* the slow-mode cycle in seconds for the current speed; Flow rides at 0.45x */
function motionDuration(){
  return 40 * Math.pow(2, (50 - motionSpeed()) / 38);
}
function applyMotion(){
  document.body.setAttribute('data-motion', motionMode());
  document.documentElement.style.setProperty('--grad-dur', motionDuration().toFixed(1) + 's');
  var seg = $('motion-seg');
  if(seg){
    Array.prototype.forEach.call(seg.querySelectorAll('.seg-btn'), function(b){
      b.classList.toggle('on', b.getAttribute('data-motion') === motionMode());
    });
  }
  var sp = motionSpeed();
  var s1 = $('imotionspeed'), s1v = $('imotionspeed-v');
  if(s1) s1.value = sp;
  if(s1v) s1v.textContent = sp + '%';
  var s2 = $('ob-motion-speed'), s2v = $('ob-motion-speed-v');
  if(s2) s2.value = sp;
  if(s2v) s2v.textContent = sp + '%';
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
    c.style.background = item.css;
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
  liquid:  {blur:8,  alpha:40, tint:'rgba(15,15,30,1)'}
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
══════════════════════════════════════════ */
function applyAnimStyle(id){
  var style = $('anim-vars');
  if(!style){ style = document.createElement('style'); style.id = 'anim-vars'; document.head.appendChild(style); }
  var css = '';
  if(id === 'spring' || !id){
    css = `
      #overlay{transition:opacity 0.28s ease;}
      #panel{transition:transform 0.38s cubic-bezier(0.34,1.30,0.64,1),opacity 0.28s ease;}
      #overlay.open-anim #panel{transform:scale(1) translateY(0);opacity:1;}
      .pane.on{animation:pane-in 0.26s cubic-bezier(0.34,1.30,0.64,1) forwards;}
      @keyframes pane-in{from{opacity:0;transform:translateY(10px) scale(0.97);}to{opacity:1;transform:translateY(0) scale(1);}}
      .tbtn{transition:background 0.18s,color 0.18s,transform 0.18s;}
      .tbtn:hover{transform:scale(1.06);}
      .tbtn.on{transform:scale(1.04);}
    `;
  } else if(id === 'fade'){
    css = `
      #overlay{transition:opacity 0.35s ease;}
      #panel{transition:opacity 0.35s ease;transform:none!important;}
      #overlay.open-anim #panel{opacity:1;}
      .pane.on{animation:pane-fade 0.30s ease forwards;}
      @keyframes pane-fade{from{opacity:0;}to{opacity:1;}}
      .tbtn{transition:background 0.25s,color 0.25s;}
    `;
  } else if(id === 'slide'){
    css = `
      #overlay{transition:opacity 0.25s ease;}
      #panel{transition:transform 0.32s cubic-bezier(0.25,1,0.5,1),opacity 0.28s ease;transform:translateY(32px)!important;opacity:0;}
      #overlay.open-anim #panel{transform:translateY(0)!important;opacity:1;}
      .pane.on{animation:pane-slide 0.26s cubic-bezier(0.25,1,0.5,1) forwards;}
      @keyframes pane-slide{from{opacity:0;transform:translateX(16px);}to{opacity:1;transform:translateX(0);}}
    `;
  } else if(id === 'zoom'){
    css = `
      #overlay{transition:opacity 0.22s ease;}
      #panel{transition:transform 0.28s cubic-bezier(0.34,1.20,0.64,1),opacity 0.22s ease;transform:scale(0.80)!important;opacity:0;}
      #overlay.open-anim #panel{transform:scale(1)!important;opacity:1;}
      .pane.on{animation:pane-zoom 0.22s cubic-bezier(0.34,1.20,0.64,1) forwards;}
      @keyframes pane-zoom{from{opacity:0;transform:scale(0.90);}to{opacity:1;transform:scale(1);}}
    `;
  } else if(id === 'blur'){
    css = `
      #overlay{transition:opacity 0.30s ease;}
      #panel{transition:filter 0.34s ease,opacity 0.30s ease,transform 0.30s ease;filter:blur(16px)!important;opacity:0;transform:scale(0.96)!important;}
      #overlay.open-anim #panel{filter:blur(0)!important;opacity:1;transform:scale(1)!important;}
      .pane.on{animation:pane-blur 0.30s ease forwards;}
      @keyframes pane-blur{from{opacity:0;filter:blur(8px);}to{opacity:1;filter:blur(0);}}
    `;
  } else if(id === 'drift'){
    css = `
      #overlay{transition:opacity 0.32s ease;}
      #panel{transition:transform 0.42s cubic-bezier(0.22,0.61,0.36,1),opacity 0.32s ease;transform:translateY(18px) scale(0.985)!important;opacity:0;}
      #overlay.open-anim #panel{transform:translateY(0) scale(1)!important;opacity:1;}
      .pane.on{animation:pane-drift 0.34s cubic-bezier(0.22,0.61,0.36,1) forwards;}
      @keyframes pane-drift{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
      .tbtn{transition:background 0.22s,color 0.22s,transform 0.22s;}
      .tbtn:hover{transform:translateY(-1px);}
    `;
  } else if(id === 'glide'){
    css = `
      #overlay{transition:opacity 0.26s ease;}
      #panel{transition:transform 0.36s cubic-bezier(0.25,1,0.5,1),opacity 0.26s ease;transform:translateX(30px)!important;opacity:0;}
      #overlay.open-anim #panel{transform:translateX(0)!important;opacity:1;}
      .pane.on{animation:pane-glide 0.30s cubic-bezier(0.25,1,0.5,1) forwards;}
      @keyframes pane-glide{from{opacity:0;transform:translateX(-14px);}to{opacity:1;transform:translateX(0);}}
      .tbtn{transition:background 0.22s,color 0.22s,transform 0.22s;}
      .tbtn:hover{transform:translateX(1px);}
    `;
  } else if(id === 'unfold'){
    css = `
      #overlay{transition:opacity 0.28s ease;}
      #panel{transition:transform 0.38s cubic-bezier(0.22,0.61,0.36,1),opacity 0.28s ease;transform-origin:top center;transform:perspective(900px) rotateX(-9deg) translateY(-10px) scale(0.97)!important;opacity:0;}
      #overlay.open-anim #panel{transform:perspective(900px) rotateX(0deg) translateY(0) scale(1)!important;opacity:1;}
      .pane.on{animation:pane-unfold 0.30s cubic-bezier(0.22,0.61,0.36,1) forwards;transform-origin:top center;}
      @keyframes pane-unfold{from{opacity:0;transform:perspective(900px) rotateX(-7deg) translateY(-8px);}to{opacity:1;transform:perspective(900px) rotateX(0) translateY(0);}}
      .tbtn{transition:background 0.22s,color 0.22s,transform 0.22s;}
      .tbtn:hover{transform:translateY(-1px);}
    `;
  } else if(id === 'none'){
    css = `
      #overlay{transition:none;}
      #panel{transition:none;transform:none!important;opacity:1!important;filter:none!important;}
      #overlay.open-anim #panel{opacity:1!important;}
      .pane.on{animation:none;}
    `;
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
var _glassQueued = false;
function applyGlassSettings(){
  var blur  = parseInt(gs(K.glassBlur)  || '30',10);
  var alpha = parseInt(gs(K.glassAlpha) || '10',10);
  var tint  = gs(K.glassTint) || 'rgba(255,255,255,1)';
  var m = tint.match(/rgba?\(([^)]+)\)/);
  var p = (m ? m[1] : '255,255,255').split(',');
  var r = parseInt(p[0],10) || 0;
  var g = parseInt(p[1],10) || 0;
  var b = parseInt(p[2],10) || 0;
  var root = document.documentElement.style;
  root.setProperty('--glass-blur', blur + 'px');
  root.setProperty('--glass-bg', 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha/100) + ')');
}
function queueGlass(){
  if(_glassQueued) return;
  _glassQueued = true;
  requestAnimationFrame(function(){
    _glassQueued = false;
    applyGlassSettings();
  });
}

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
  var hf = gs(K.hourFmt) || '12';
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
  renderGreeting();
  updateTabName();
}
function applyCalSize(){
  var px = parseInt(gs(K.calSize),10); if(!(px > 0)) px = 10;
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
    ? 'Calm Gradient \u2014 a soft static colour. It also asks a little less of your battery.'
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
var EL_IDS = ['shortcuts','datetime','calendar','prayer','greeting-wrap','searchbar','gear-btn','weather','quote'];
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
var RESIZABLE = ['shortcuts','datetime','calendar','prayer','greeting-wrap','searchbar','weather','quote'];
var MIN_W = {shortcuts:140, datetime:120, calendar:160, prayer:150, 'greeting-wrap':140, searchbar:220, weather:120, quote:180};
var MIN_H = {shortcuts:70,  datetime:70,  calendar:128, prayer:76,  'greeting-wrap':48,  searchbar:44,  weather:70,  quote:60};

/* nominal "design" size of every card — the reference point for content
   scaling, so a bigger card really means bigger text, not empty space */
var DEFAULT_SIZE = {
  shortcuts:       { w:356, h:76 },
  datetime:        { w:175, h:78 },
  calendar:        { w:222, h:186 },
  prayer:          { w:200, h:96 },
  'greeting-wrap': { w:300, h:50 },
  searchbar:       { w:500, h:42 },
  weather:         { w:152, h:90 },
  quote:           { w:300, h:96 }
};
/* nothing may be measured smaller than this — the content would clip */
var NATURAL_MIN = {
  shortcuts:       { w:300, h:76  },
  datetime:        { w:175, h:84  },
  calendar:        { w:210, h:178 },
  prayer:          { w:180, h:92  },
  'greeting-wrap': { w:240, h:50  },
  searchbar:       { w:420, h:42  },
  weather:         { w:180, h:112 },
  quote:           { w:300, h:100 }
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
    el.style.width = ''; el.style.height = '';
    el.style.removeProperty('--ws');
    var w = el.offsetWidth, h = el.offsetHeight;
    el.style.width = pw; el.style.height = ph;
    if(ws) el.style.setProperty('--ws',ws);

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
  if(!s && !live){ el.style.removeProperty('--ws'); return; }
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
    if(!s){ el.style.removeProperty('--ws'); return; }
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
  }
  function onEnd(){
    if(!resizing) return;
    resizing = false;
    var sizes = parseJSON(gs(K.sizes),{}) || {};
    sizes[id] = { w:el.offsetWidth, h:el.offsetHeight, auto:0 };
    ss(K.sizes,JSON.stringify(sizes));
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
    'status-tile':   gs(K.showStatus)
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
    st.textContent = 'Gathering the forecast\u2026';
  } else if(st.textContent === 'Gathering the forecast\u2026'){
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
var _rainAtP = 0;
var _rainAbsent = false;
var _rainChance = null;
function weatherClockString(ts){
  var dt = ts ? new Date(ts) : new Date();
  var hf = gs(K.hourFmt) || '12';
  var h = dt.getHours();
  var hh = (hf === '12') ? (h % 12 || 12) : h;
  return pad2(hh) + ':' + pad2(dt.getMinutes()) + (hf === '12' ? (h < 12 ? ' AM' : ' PM') : '');
}
function renderRainNote(){
  var el = $('w-raintime');
  if(!el) return;
  if(_rainAt){
    var word = 'Expect rain around ';
    el.textContent = word + weatherClockString(_rainAt);
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
  if(upd && _weatherStamp) upd.textContent = 'Last updated ' + weatherClockString(_weatherStamp);
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
  var rain = (d.rain == null) ? 'No rain expected' : rainPhrase(d.rain);
  setText($('w-rain'),rain);
  _weatherStamp = d.ts || Date.now();
  _rainAt = d.rainAt || 0;
  _rainAtP = d.rainAtP || 0;
  _rainAbsent = !!d.rainAbsent;
  _rainChance = (d.rain == null) ? null : Number(d.rain);
  if(d.utcOffset != null && d.utcOffset !== _tzOffsetSec){
    _tzOffsetSec = d.utcOffset;
    refreshTimeSource();
  }
  renderRainNote();
  var upd = $('w-updated');
  if(upd) upd.textContent = 'Last updated ' + weatherClockString(_weatherStamp);
  /* let the card grow/shrink with the new temperature and description */
  var wEl = $('weather');
  var wsz = (parseJSON(gs(K.sizes),{}) || {}).weather;
  if(wEl && (!wsz || wsz.auto === 1 || wsz.auto === true || !(wsz.h > 0))){
    wEl.style.height = '';
  }
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
      (city ? 'Gathering the forecast…' : 'Choose a city below') + '</div></div>';
    if(segs) segs.innerHTML = '';
    return;
  }
  var unit = (String(cache.unit).toLowerCase() === 'f') ? 'F' : 'C';
  var w = WMO[cache.code] || ['🌡️','—'];
  if(wwCity) wwCity.textContent = cache.label || cache.cityName || cache.city;
  if(now){
    var rainTxt = (cache.rain == null) ? '' : rainPhrase(cache.rain);
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
      var r = (s.rain == null || s.rain < 5) ? 'No rain' : '💧 ' + s.rain + '%';
      return '<div class="ww-seg"><div class="ws-lbl">' + s.lbl + '</div>' +
             '<div class="ws-ico">' + sw[0] + '</div>' +
             '<div class="ws-temp">' + t + '</div>' +
             '<div class="ws-rain">' + r + '</div></div>';
    }).join('');
  }
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
             label:r.name + (r.country ? ', ' + r.country : '') };
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
    _rainAt = 0; _rainAtP = 0; _rainAbsent = false; _rainChance = null; renderRainNote();
    setText($('w-updated'),'');
    setWeatherStatus('No city chosen yet.');
    return null;
  }

  var cache = parseJSON(gs(K.weatherCache),null);
  if(!force && cache && cache.v === 2 && cache.city === city && cache.unit === unit && (Date.now() - cache.ts) < weatherTTL()){
    renderWeather(cache);
    setWeatherStatus(cache.label + ' · cached');
    return null;
  }

  /* first open has nothing cached — fill every line so the card never looks broken */
  setText($('w-city'), city);
  setText($('w-icon'), '·');
  setText($('w-temp'), '--');
  setText($('w-unit'), (unit === 'f') ? 'F' : 'C');
  setText($('w-desc'), 'Gathering the forecast from Open-Meteo…');
  setText($('w-rain'), '');
  setText($('w-raintime'), '');
  setText($('w-updated'), 'If this lingers, your connection may be resting.');
  _rainAt = 0; _rainAtP = 0; _rainAbsent = false; _rainChance = null;

  /* one request at a time worth showing: the newest one owns the busy state */
  var req = ++_weatherReq;
  setWeatherBusy(true);

  var geo = parseJSON(gs(K.weatherGeo),null);
  var geoP = (geo && geo.city === city && geo.lat != null) ? Promise.resolve(geo) : geocode(city);

  geoP.then(function(g){
    ss(K.weatherGeo,JSON.stringify(g));
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
      for(var i = 0; i < hTimes.length; i++){
        var t = new Date(hTimes[i]).getTime();
        if(isNaN(t) || t < Date.now() - 30 * 60000) continue;
        var p = Number(hProb[i]);
        if(isNaN(p)) p = 0;
        if(p > bestP){ bestP = p; bestT = t; }
        if(!wetT && (p >= 40 || Number(hRain[i] || 0) >= 0.2 || Number(hPrec[i] || 0) >= 0.2)){
          wetT = t; wetP = p;
        }
      }
      var rainAt = 0, rainAtP = 0;
      if(bestP >= 20){ rainAt = bestT; rainAtP = bestP; }
      else if(wetT){ rainAt = wetT; rainAtP = wetP; }
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
      setWeatherStatus(d.label + ' · updated');
      return d;
    });
  }).catch(function(err){
    if(err && err.code === 'CITY_NOT_FOUND'){
      setText($('w-city'), city);
      setText($('w-icon'), '📍');
      setText($('w-temp'), '--');
      setText($('w-desc'), 'City not found \u2014 check the spelling');
      setText($('w-updated'), 'A nearby bigger town, or the country, often helps.');
      setWeatherStatus('City not found \u2014 check the spelling.');
      return null;
    }
    if(cache && cache.city === city) renderWeather(cache);
    else{
      setText($('w-desc'), 'Open-Meteo is quiet right now');
      setText($('w-updated'), 'A quick connection check should help.');
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
  setText($('st-net-text'), label || (on ? 'Online' : 'Offline'));
  var dot = $('st-dot');
  if(dot){
    var rough = on && c && ((typeof c.rtt === 'number' && c.rtt > 250) || c.saveData || c.effectiveType === '2g' || c.effectiveType === 'slow-2g');
    dot.className = 'st-dot ' + (!on ? 'off' : (rough ? 'warn' : 'on'));
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
  if(!local){ setText(out, '\u2014'); return; }
  if(remote && cmpVersion(remote, local) > 0){
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

  /* show the build number straight away; the check itself happens when the
     popover opens, or when you ask for it */
  currentVersion().then(function(lv){
    var out = $('sp-update');
    if(out && out.textContent === '-') setText(out, lv);
  }).catch(function(){});
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
    out += '<span class="cal-day' + (d === today ? ' today' : '') + '">' + d + '</span>';
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
  if((gs(K.hourFmt) || '12') === '12'){
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
  }, 300);
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
  /* a slow tick keeps a rich dropdown's face in step when another control
     changes its native value (the quote presets do this to each other) */
  if(!_richSyncTimer) _richSyncTimer = setInterval(function(){
    if(document.hidden) return;
    refreshRichLabels();
  }, 500);
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      overlay.classList.add('open','open-anim');
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
  if(_closeTimer) clearTimeout(_closeTimer);
  _closeTimer = setTimeout(function(){
    overlay.classList.remove('open');
    overlay.style.display = 'none';
    _closeTimer = null;
  },300);
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
    c.innerHTML = '<div class="cname">' + cs.name + '</div><div class="cprev">' + cs.prev + '</div>';
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
  if(builtOnce('glasstint')){ selectIn(g,'.swatch','data-color',gs(K.glassTint) || GLASS_TINTS[0]); return; }
  g.innerHTML = '';
  var cur = gs(K.glassTint) || GLASS_TINTS[0];
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
        showPeek(labels[id] + ' · ' + label + ' ' + v + ' px');
        commitPos();
      };
      inp.onpointerdown = function(){ startPeek(); };
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
function showPeek(text){
  var hud = $('peek-hud'), ov = $('overlay');
  if(ov) ov.classList.add('peek');
  if(hud){ hud.textContent = text; hud.classList.add('on'); }
}
function startPeek(){
  var ov = $('overlay'), hud = $('peek-hud');
  if(ov) ov.classList.add('peek');
  if(hud) hud.classList.add('on');
}
function endPeek(){
  var ov = $('overlay'), hud = $('peek-hud');
  if(ov) ov.classList.remove('peek');
  if(hud) hud.classList.remove('on');
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
    startPeek();
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
    startPeek();
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
  if(ih) ih.value = gs(K.hourFmt) || '12';
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
    if(!(csz > 0)) csz = 10;
    ias.value = csz;
    if(iasv) iasv.textContent = csz + 'px';
  }
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
  if(gti) gti.value = tintToHex(gs(K.glassTint) || 'rgba(255,255,255,1)');

  var blur  = parseInt(gs(K.glassBlur)  || '30',10);
  var alpha = parseInt(gs(K.glassAlpha) || '10',10);
  var bs = $('iglassblur'), as = $('iglassalpha');
  var bv = $('iglassblur-v'), av = $('iglassalpha-v');
  if(bs){ bs.value = blur;  if(bv) bv.textContent = blur + 'px'; }
  if(as){ as.value = alpha; if(av) av.textContent = alpha + '%'; }

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
renderGreeting();
updateTabName();
applyBrowserFav(gs(K.fav) || '');
renderSC();
applySearchEngine();
applyWidgetVisibility();
initStatus();
renderCalendar();
scheduleCalendar();
initPrayer();

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

measureBases();
applySizes();
applyPositions();

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
applyQuoteStyle();
startQuoteTimer();
startWeatherTimer();

/* Window resize: re-derive widget widths first (a saved size is clamped to
   the viewport, so shrinking used to leave the smaller inline width behind
   after maximising), then re-place from the saved coordinates. A second pass
   catches late layout work (fonts, scrollbars, zoom) that can still move a
   card by a pixel or two after the first frame. */
var _resizeTimer = null;
window.addEventListener('resize',function(){
  if(_resizeTimer) clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(function(){
    _resizeTimer = null;
    applySizes();
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
    showPeek('Wallpaper zoom ' + vz.value + '%');
  };
  if(vx) vx.oninput = function(){
    ss(K.videoX,vx.value);
    if(vxv) vxv.textContent = vx.value;
    applyVideoView();
    showPeek('Wallpaper left / right ' + vx.value);
  };
  if(vy) vy.oninput = function(){
    ss(K.videoY,vy.value);
    if(vyv) vyv.textContent = vy.value;
    applyVideoView();
    showPeek('Wallpaper up / down ' + vy.value);
  };
  /* same peek as the layout sliders: hide the panel while dragging so you
     can actually watch the wallpaper move */
  [vz,vx,vy].forEach(function(inp){
    if(!inp) return;
    inp.addEventListener('pointerdown',startPeek);
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
      ss(K.motion, b.getAttribute('data-motion') || 'slow');
      applyMotion();
    });
  }
  var mspd = $('imotionspeed'), mspdv = $('imotionspeed-v');
  if(mspd){
    mspd.oninput = function(){
      if(mspdv) mspdv.textContent = mspd.value + '%';
      ss(K.motionSpeed, mspd.value);
      applyMotion();
      peekUpdate('Drift speed ' + mspd.value + '%');
    };
    wirePeek(mspd, function(){ return 'Drift speed ' + mspd.value + '%'; });
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
  m.classList.add('open');
  m.setAttribute('aria-hidden','false');
  refreshRichLabels();
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ m.classList.add('in'); });
  });
}
function closeWin(id, instant){
  var m = $(id);
  if(!m) return;
  if(_richOpen) closeRich(_richOpen);
  if(_openWin === id) _openWin = null;
  m.classList.remove('in');
  m.setAttribute('aria-hidden','true');
  if(instant){ m.classList.remove('open'); return; }
  setTimeout(function(){
    if(!m.classList.contains('in')) m.classList.remove('open');
  }, 280);
}

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
                'How the glass feels','A wallpaper to start with'];

  /* choices are held in memory until Finish, so Back never loses them */
  var choice = {
    hour: gs(K.hourFmt) || '12',
    timeSrc: gs(K.timeSource) || 'device',
    engine: gs(K.searchEngine) || 'google',
    cat: gs(K.quoteCat) || 'general',
    wall: 'gradient',
    grad: gradientIndex(),
    motion: motionMode()
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
      c.style.background = item.css;
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
      ? 'Calm Gradient is soft and light on the battery.'
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
    var blur  = parseInt(gs(K.glassBlur)  || '30', 10);
    var alpha = parseInt(gs(K.glassAlpha) || '10', 10);
    var tint  = gs(K.glassTint) || 'rgba(255,255,255,1)';
    var bs = $('ob-glass-blur'), as = $('ob-glass-alpha');
    var bv = $('ob-glass-blur-v'), av = $('ob-glass-alpha-v');
    if(bs) bs.value = blur;
    if(as) as.value = alpha;
    if(bv) bv.textContent = blur + 'px';
    if(av) av.textContent = alpha + '%';
    var ci = $('ob-glass-tint');
    if(ci) ci.value = tintToHex(tint);
    buildObGlassSwatches(tint);
    var match = '';
    Object.keys(GLASS_PRESETS).forEach(function(k){
      var p = GLASS_PRESETS[k];
      if(p.blur === blur && p.alpha === alpha && p.tint === tint) match = k;
    });
    obGlassPreset(match);
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
    if(choice.hour !== (gs(K.hourFmt) || '12')){
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
    setTimeout(function(){ m.classList.remove('open'); }, 280);
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

  /* drift speed — same live feel, same peek */
  var mSpeed = $('ob-motion-speed'), mSpeedV = $('ob-motion-speed-v');
  if(mSpeed){
    mSpeed.oninput = function(){
      if(mSpeedV) mSpeedV.textContent = mSpeed.value + '%';
      ss(K.motionSpeed, mSpeed.value);
      applyMotion();
      peekUpdate('Drift speed ' + mSpeed.value + '%');
    };
    wireWinPeek(mSpeed, 'welcome-modal', function(){ return 'Drift speed ' + mSpeed.value + '%'; });
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
      refreshTimeSource();
      extSyncTimeSource();
    });
  });
})();

/* ── calendar window: browse January to December of the current year ── */
var _calWinMonth = null;
function renderCalWin(anim){
  var grid = $('calwin-grid');
  if(!grid) return;
  var now = wallNow();
  if(_calWinMonth == null) _calWinMonth = now.mon;
  var y = now.year, m = _calWinMonth;
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
    var today = (m === now.mon && d === now.date);
    out += '<span class="cal-day' + (today ? ' today' : '') + '">' + d + '</span>';
  }
  var cells = firstDow + daysInMonth, nextDay = 1;
  while(cells % 7 !== 0 || cells < 35){
    out += '<span class="cal-day other">' + (nextDay++) + '</span>';
    cells++;
  }
  grid.innerHTML = out;
  setText($('calwin-month'), MONTH_NAMES[m]);
  setText($('calwin-sub'), String(y));
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
  extSyncTimeSource();
  renderCalWin(true);
  openWin('calendar-modal');
}
(function(){
  var p = $('calwin-prev');
  if(p) p.onclick = function(){
    var m = (_calWinMonth == null) ? wallNow().mon : _calWinMonth;
    _calWinMonth = (m + 11) % 12;
    renderCalWin(true);
  };
  var n = $('calwin-next');
  if(n) n.onclick = function(){
    var m = (_calWinMonth == null) ? wallNow().mon : _calWinMonth;
    _calWinMonth = (m + 1) % 12;
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
    c.innerHTML = '<div class="cname">' + cs.name + '</div><div class="cprev">' + cs.prev + '</div>';
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
  var h = $('clockwin-hour');    if(h) h.value = gs(K.hourFmt) || '12';
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
  var ias = $('icalsize'), iasv = $('icalsize-v');
  if(ias) ias.oninput = function(){
    var v = parseInt(ias.value,10);
    if(!(v > 0)) return;
    ss(K.calSize, String(v));
    if(iasv) iasv.textContent = v + 'px';
    /* this option owns the whole card, so drop any hand-resized size that
       would otherwise pin the old width */
    var sizes = parseJSON(gs(K.sizes),{}) || {};
    if(sizes.calendar){ delete sizes.calendar; ss(K.sizes, JSON.stringify(sizes)); }
    var cel = $('calendar');
    if(cel){ cel.style.width = ''; cel.style.height = ''; cel.style.removeProperty('--ws'); }
    applyCalSize();
    renderCalendar();
    measureBases();
    applySizes();
    peekUpdate('Calendar size ' + v + 'px');
  };
  wirePeek(ias, function(){ return 'Calendar size ' + ias.value + 'px'; });

  var ics = $('iclocktime');
  wirePeek(ics, function(){ return 'Clock size ' + ics.value + 'px'; });

  var its = $('itimesource');
  if(its) its.onchange = function(){
    ss(K.timeSource, its.value);
    refreshTimeSource();
    extSyncTimeSource();
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
  var est = Math.min(240, sel.options.length * 34 + 22);
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

  syncRichItems(sel);
  updateRich(sel);
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
