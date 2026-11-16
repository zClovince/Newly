/* ══════════════════════════════════════════
   NEWLY — FIRST PAINT BOOTSTRAP
   Runs synchronously from <head>, before the page is painted. Its only job is
   to make the very first frame the right colour: the chosen wave gradient
   instead of black. The wallpaper itself (video or gradient) then loads behind
   the frosted loading veil in newtab.html, which fades away once the page is
   ready.

   localStorage is synchronous and available here, which is the whole trick.
   Plain ES5, no libraries, no inline script (CSP is script-src 'self').
   ══════════════════════════════════════════ */
(function(){
  var root = document.documentElement;
  var t0 = (window.performance && window.performance.now)
    ? window.performance.now() : Date.now();
  window.__ntBootT0 = t0;

  /* Keep in sync with GRADIENTS in script.js. These are only the pre-paint
     wash; the main script replaces --boot-grad with the exact band ramp as
     soon as it boots, so the veil and the real field never disagree. */
  var GRADS = [
    'linear-gradient(125deg,#8f79d4 0%,#5c44b0 13%,#3f2a86 25%,#2a1c5e 38%,#221850 50%,#1a1340 63%,#0f0c26 75%,#0b0920 88%,#070912 100%)',
    'linear-gradient(125deg,#4a68c4 0%,#2b459c 13%,#1c2f72 25%,#122150 38%,#101c44 50%,#0c1638 63%,#070d24 75%,#050a18 88%,#03050c 100%)',
    'linear-gradient(125deg,#33b394 0%,#2b9a80 13%,#17786a 25%,#0f574a 38%,#0a3d36 50%,#072b26 63%,#041d18 75%,#031712 88%,#02110d 100%)',
    'linear-gradient(125deg,#d1666b 0%,#a63b56 13%,#7d274a 25%,#5a1a3c 38%,#4a1636 50%,#3d1230 63%,#250b1f 75%,#1c0918 88%,#140812 100%)',
    'linear-gradient(125deg,#4cc6bd 0%,#2fb0b0 13%,#2196a2 25%,#176b82 38%,#0f4a5f 50%,#0a3145 63%,#061f2e 75%,#041721 88%,#030f19 100%)',
    'linear-gradient(125deg,#6c6c7a 0%,#5a5a68 13%,#4a4a56 25%,#33333c 38%,#232329 50%,#18181d 63%,#101013 75%,#0c0c0f 88%,#08080a 100%)'
  ];

  function ls(k){
    try{ return localStorage.getItem(k); }catch(e){ return null; }
  }

  var gi = parseInt(ls('nt_gradient'), 10);
  if(!(gi >= 0 && gi < GRADS.length)) gi = 0;
  try{ root.style.setProperty('--boot-grad', GRADS[gi]); }catch(e){}

  /* ceiling: never let the veil become a splash screen, whatever the main
     script is doing */
  function forceDone(){
    if(document.body) document.body.classList.add('booted');
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      window.setTimeout(forceDone, 700);
    });
  } else {
    window.setTimeout(forceDone, 700);
  }
})();
