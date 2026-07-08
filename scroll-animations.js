/*!
 * CookNextDoor — scroll-animations.js
 * Reusable, self-contained scroll-animation layer (progressive enhancement).
 *
 * Add to any page with a single line before </body>:
 *     <script src="scroll-animations.js" defer></script>
 *
 * What it does (zero markup changes required):
 *   • Injects its own CSS (scroll-progress bar, card entrance, reduced-motion reset)
 *   • Scroll-progress bar + nav "scrolled" state (dependency-free, rAF-throttled)
 *   • Reveals content on scroll via GSAP + ScrollTrigger, loaded from CDN on demand
 *   • Falls back to a plain IntersectionObserver if GSAP can't load
 *   • Fully honors prefers-reduced-motion (no motion, and nothing is left hidden)
 *
 * Notes:
 *   • index.html ships its own tuned inline version — do NOT also include this there.
 *   • "Generic mode" auto-reveals headings, paragraphs and card grids inside
 *     `.section` / `.cta-band` blocks that start below the fold, so the hero/LCP
 *     is never hidden and there's no layout shift.
 */
(function () {
  'use strict';
  if (window._cndScrollAnim) return;          // idempotent
  window._cndScrollAnim = true;

  var GSAP_CORE = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
  var GSAP_ST   = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
  var EASE      = 'power3.out';
  var reduce    = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── 1. Inject enhancement CSS ───────────────────────────────
  var CSS =
    '.scroll-progress{position:fixed;top:0;left:0;height:3px;width:100%;transform:scaleX(0);' +
      'transform-origin:0 50%;background:linear-gradient(90deg,#E3EF26,#9ee27a,#E3EF26);' +
      'box-shadow:0 0 12px rgba(227,239,38,.55);z-index:9000;pointer-events:none;will-change:transform;}' +
    'nav .nav__logo img{transition:transform .3s ease;}' +
    'nav.scrolled .nav__logo img{transform:scale(.92);}' +
    '@keyframes cndCardIn{from{opacity:0;transform:translateY(28px) scale(.98);}to{opacity:1;transform:none;}}' +
    '.food-card--reveal{animation:cndCardIn .6s cubic-bezier(.16,.84,.44,1) both;}' +
    '@media (prefers-reduced-motion: reduce){' +
      '*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;' +
        'transition-duration:.001ms!important;scroll-behavior:auto!important;}' +
      '.scroll-progress{display:none;}}';
  var styleEl = document.createElement('style');
  styleEl.setAttribute('data-cnd', 'scroll-anim');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(function () {
    // ── 2. Scroll-progress bar + nav state (dependency-free) ──
    var bar = document.getElementById('scrollProgress');
    if (!bar) {
      bar = document.createElement('div');
      bar.className = 'scroll-progress';
      bar.id = 'scrollProgress';
      bar.setAttribute('aria-hidden', 'true');
      document.body.insertBefore(bar, document.body.firstChild);
    }
    var nav = document.querySelector('nav');
    var ticking = false;
    function onScroll() {
      ticking = false;
      var h = document.documentElement;
      var s = h.scrollTop || document.body.scrollTop;
      var max = h.scrollHeight - h.clientHeight;
      bar.style.transform = 'scaleX(' + (max > 0 ? s / max : 0) + ')';
      if (nav) nav.classList.toggle('scrolled', s > 10);
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    // ── 3. Reveal coordinator (GSAP takes over; IO is the fallback) ──
    window._cndRevealClaimed = false;
    function fallbackReveal() {
      var els = document.querySelectorAll('.fade-up:not(.visible)');
      if (!els.length) return;
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
      }, { threshold: 0.08 });
      els.forEach(function (el) { obs.observe(el); });
    }
    setTimeout(function () {
      if (!window._cndRevealClaimed) { window._cndRevealClaimed = true; fallbackReveal(); }
    }, 1600);

    // Motion reduced → do nothing further; nothing was hidden, so content is fully visible.
    if (reduce) { window._cndRevealClaimed = true; return; }

    // ── 4. Load GSAP on demand, then enhance ──
    loadScript(GSAP_CORE, function () { loadScript(GSAP_ST, initGsap); });
  });

  function loadScript(src, cb) {
    var s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = cb;
    s.onerror = function () { /* fallback IO already scheduled */ };
    document.head.appendChild(s);
  }

  // Elements that start below the fold and aren't inside chrome/overlays.
  function belowFold(nodeList) {
    var vh = window.innerHeight, out = [];
    Array.prototype.forEach.call(nodeList, function (el) {
      if (el.closest('nav,footer,[id*="modal" i],.cnd-vid-modal,.onboarding-modal')) return;
      if (el.getBoundingClientRect().top > vh * 0.85) out.push(el);
    });
    return out;
  }

  function initGsap() {
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') return;
    try {
      gsap.registerPlugin(ScrollTrigger);
      document.body.classList.add('gsap-mode');

      var owns = false;
      if (!window._cndRevealClaimed) { window._cndRevealClaimed = true; owns = true; }
      if (!owns) return; // fallback already ran; don't hide-then-show

      if (document.querySelector('.fade-up')) explicitReveal();
      else genericReveal();

      ScrollTrigger.refresh();
    } catch (err) {
      // Safety net: never leave content stuck hidden.
      try { gsap.set('[data-cnd-hidden]', { clearProps: 'all' }); } catch (e) {}
      document.querySelectorAll('.fade-up').forEach(function (el) { el.classList.add('visible'); });
    }
  }

  // Pages that opt in with explicit .fade-up markup.
  function explicitReveal() {
    gsap.set('.fade-up', { opacity: 0, y: 40 });
    ScrollTrigger.batch('.fade-up', {
      start: 'top 85%', once: true,
      onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.15, overwrite: true }); }
    });
    setupCounters('.stat-box .num, .why__stat-val, .hero__metric-val, .t-sold__num');
  }

  // Auto-reveal for pages with no .fade-up (about, news, blog, etc.).
  function genericReveal() {
    // 4a) Headings, paragraphs and CTAs inside content blocks
    var text = belowFold(document.querySelectorAll(
      '.section > h1, .section > h2, .section > h3, .section > h4, .section > p, ' +
      '.section > .btn, .section > .btn-cta, .cta-band'));
    if (text.length) {
      text.forEach(function (el) { el.setAttribute('data-cnd-hidden', ''); });
      gsap.set(text, { opacity: 0, y: 36 });
      ScrollTrigger.batch(text, {
        start: 'top 88%', once: true,
        onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.85, ease: EASE, stagger: 0.1, overwrite: true }); }
      });
    }

    // 4b) Card grids — stagger the cards within each parent
    var cardSel = '.value-card, .team-card, .stat-box, .story-card, .t-card, .faq-item, .food-card, .card';
    var groups = new Map();
    Array.prototype.forEach.call(document.querySelectorAll(cardSel), function (el) {
      if (el.closest('nav,footer,[id*="modal" i]')) return;
      var p = el.parentNode;
      if (!groups.has(p)) groups.set(p, []);
      groups.get(p).push(el);
    });
    groups.forEach(function (items, parent) {
      // Skip grids that begin above the fold so nothing pops after being seen.
      if (parent.getBoundingClientRect().top <= window.innerHeight * 0.85) return;
      items.forEach(function (el) { el.setAttribute('data-cnd-hidden', ''); });
      gsap.from(items, {
        opacity: 0, y: 30, duration: 0.7, ease: EASE, stagger: 0.1,
        scrollTrigger: { trigger: parent, start: 'top 85%', once: true }
      });
    });

    // 4c) Count-up on numeric stats
    setupCounters('.stat-box .num, .num');
  }

  function setupCounters(selector) {
    gsap.utils.toArray(selector).forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter: function () { countUp(el); }
      });
    });
  }

  function countUp(el) {
    var raw = el.textContent.trim();
    var m = raw.match(/^([^\d]*)(\d[\d,]*)(.*)$/);
    if (!m) return;
    var prefix = m[1], suffix = m[3];
    var target = parseFloat(m[2].replace(/,/g, ''));
    if (!target) return;                      // skip pure-zero values (0%, $0…)
    var o = { v: 0 };
    gsap.to(o, {
      v: target, duration: 1.6, ease: 'power2.out',
      onUpdate: function () { el.textContent = prefix + Math.round(o.v).toLocaleString() + suffix; },
      onComplete: function () { el.textContent = raw; }
    });
  }
})();
