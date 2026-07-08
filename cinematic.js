/*!
 * CookNextDoor — cinematic.js
 * Phase 1 "Cinematic Arrival" layer: steam particles over the hero,
 * mouse parallax on the Ken Burns backdrop, and a custom lime cursor
 * (grows on buttons, 🥄 over food, 📍 over the map).
 *
 * Self-contained progressive enhancement. Include with:
 *     <script src="cinematic.js" defer></script>
 *
 * Everything here is decorative motion — it bails out entirely under
 * prefers-reduced-motion, and the cursor only activates on fine pointers.
 */
(function () {
  'use strict';
  if (window._cndCinematic) return;
  window._cndCinematic = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var fine = window.matchMedia('(pointer: fine)').matches;

  function onReady(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(function () {
    steam();
    if (fine) { parallax(); cursor(); }
  });

  /* ── Steam particles rising over the hero backdrop ────────── */
  function steam() {
    var host = document.querySelector('.hero-cinema');
    if (!host) return;
    var cv = document.createElement('canvas');
    host.appendChild(cv);
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    var W, H, DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    function size() {
      W = host.clientWidth; H = host.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    size();
    window.addEventListener('resize', size);

    var N = (W < 700) ? 12 : 22, ps = [];
    function spawn(p) {
      p.x = Math.random() * W;
      p.y = H * 0.55 + Math.random() * H * 0.45;
      p.r = 14 + Math.random() * 34;
      p.vy = 0.25 + Math.random() * 0.5;
      p.vx = (Math.random() - 0.5) * 0.15;
      p.max = 0.05 + Math.random() * 0.06;
      p.ph = Math.random() * 6.28;
      p.life = 0;
      p.span = 380 + Math.random() * 300;
      return p;
    }
    for (var i = 0; i < N; i++) { var p = spawn({}); p.life = Math.random() * p.span; ps.push(p); }

    var running = true;
    try {
      new IntersectionObserver(function (es) { running = es[0].isIntersecting; }, { threshold: 0 }).observe(host);
    } catch (e) {}

    (function tick() {
      requestAnimationFrame(tick);
      if (!running || document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        p.life++;
        if (p.life > p.span) spawn(p);
        p.y -= p.vy;
        p.x += p.vx + Math.sin((p.life + p.ph) * 0.02) * 0.3;
        var t = p.life / p.span;
        var a = p.max * (t < 0.25 ? t / 0.25 : (1 - t) / 0.75);
        if (a <= 0) continue;
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, 'rgba(255,255,255,' + a.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fill();
      }
    })();
  }

  /* ── Mouse parallax on the Ken Burns stage ─────────────────── */
  function parallax() {
    var stage = document.querySelector('.hero-cinema__stage');
    var hero = document.querySelector('.hero');
    if (!stage || !hero) return;
    var tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 16;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 10;
    });
    hero.addEventListener('mouseleave', function () { tx = 0; ty = 0; });
    (function tick() {
      requestAnimationFrame(tick);
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      stage.style.transform = 'translate(' + (-cx).toFixed(2) + 'px,' + (-cy).toFixed(2) + 'px)';
    })();
  }

  /* ── Custom cursor: lime dot + ring, 🥄 over food, 📍 over map ── */
  function cursor() {
    var css =
      'body.cnd-cur, body.cnd-cur *{cursor:none!important}' +
      'body.cnd-cur input, body.cnd-cur textarea, body.cnd-cur select{cursor:auto!important}' +
      '#cndCurDot{position:fixed;left:0;top:0;width:6px;height:6px;border-radius:50%;background:#E3EF26;' +
        'z-index:99999;pointer-events:none;transform:translate(-50%,-50%);opacity:0;}' +
      '#cndCurRing{position:fixed;left:0;top:0;width:34px;height:34px;border-radius:50%;' +
        'border:1.5px solid rgba(227,239,38,0.75);z-index:99998;pointer-events:none;' +
        'display:flex;align-items:center;justify-content:center;font-size:16px;line-height:1;' +
        'transform:translate(-50%,-50%);transition:width .22s,height .22s,background .22s,border-color .22s;' +
        'background:rgba(227,239,38,0);opacity:0;}' +
      '#cndCurRing.grow{width:52px;height:52px;background:rgba(227,239,38,0.12);}' +
      '#cndCurRing.icon{width:54px;height:54px;background:rgba(6,35,29,0.78);border-color:#E3EF26;}';
    var st = document.createElement('style');
    st.setAttribute('data-cnd', 'cursor');
    st.textContent = css;
    document.head.appendChild(st);

    var dot = document.createElement('div'); dot.id = 'cndCurDot';
    var ring = document.createElement('div'); ring.id = 'cndCurRing';
    ring.setAttribute('aria-hidden', 'true'); dot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(dot); document.body.appendChild(ring);

    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, active = false;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!active) { active = true; document.body.classList.add('cnd-cur'); }
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';

      var t = e.target;
      if (!t || !t.closest) return;
      var field = t.closest('input,textarea,select');
      if (field) { dot.style.opacity = '0'; ring.style.opacity = '0'; return; }
      dot.style.opacity = '1'; ring.style.opacity = '1';

      var food = t.closest('.food-card__img,.food-hero-img,.t-img,.fic__thumb,.reel,.phone-card__img');
      var mapEl = t.closest('#cook-map');
      var inter = t.closest('a,button,.btn,[onclick],.pill,.how-tab,summary,label');
      if (food)       { ring.className = 'icon'; ring.textContent = '🥄'; }
      else if (mapEl) { ring.className = 'icon'; ring.textContent = '📍'; }
      else if (inter) { ring.className = 'grow'; ring.textContent = ''; }
      else            { ring.className = '';     ring.textContent = ''; }
    });

    document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; ring.style.opacity = '0'; });

    (function tick() {
      requestAnimationFrame(tick);
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
    })();
  }
})();
