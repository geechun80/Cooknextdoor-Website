/*!
 * CookNextDoor — app-shell.js
 * App-like mobile UX (progressive enhancement, self-contained).
 *
 * Add before </body>:  <script src="app-shell.js" defer></script>
 *
 * Provides:
 *   • A sticky, thumb-reachable bottom tab bar on mobile (≤768px), with the
 *     current page highlighted and iOS safe-area padding.
 *   • A dismissible PWA "Add to Home Screen" prompt — uses beforeinstallprompt
 *     on Chrome/Android, and an instructional hint on iOS Safari (which has no
 *     install event). Hidden when already running as an installed app.
 *   • Nudges the chatbot launcher up on mobile so it clears the tab bar.
 *
 * Not added to the task/wizard pages (cook-register, cook-list-dish, user-auth).
 */
(function () {
  'use strict';
  if (window._cndAppShell) return;
  window._cndAppShell = true;

  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  function tabSvg(paths) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var TABS = [
    { icon: tabSvg('<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
      label: 'Home', href: 'index.html',          file: 'index.html',        hash: '' },
    { icon: tabSvg('<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M9 8V6"/><path d="M15 8V6"/><path d="M12 7V4"/>'),
      label: 'Food', href: 'index.html#listings', file: 'index.html',        hash: '#listings' },
    { icon: tabSvg('<path d="M7 3h10v7a5 5 0 0 1-10 0Z"/><path d="M9.5 7h.01"/><path d="M14.5 7h.01"/><path d="M10 10.5c.7.7 3.3.7 4 0"/><path d="M7 5 4 7"/><path d="m17 5 3 2"/>'),
      label: 'Mood', href: 'food-mood.html',      file: 'food-mood.html',    hash: '' },
    { icon: tabSvg('<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/>'),
      label: 'Cook', href: 'cook-register.html',  file: 'cook-register.html',hash: '' },
    { icon: tabSvg('<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>'),
      label: 'News', href: 'news.html',           file: 'news.html',         hash: '' }
  ];

  var CSS =
    ':root{--cnd-tabbar-h:60px;}' +
    '.cnd-tabbar{position:fixed;left:0;right:0;bottom:0;top:auto;height:auto;z-index:900;display:none;' +
      'background:rgba(6,35,29,0.92);backdrop-filter:blur(20px) saturate(1.3);-webkit-backdrop-filter:blur(20px) saturate(1.3);' +
      'border-top:1px solid rgba(227,239,38,0.14);border-bottom:none;padding-bottom:env(safe-area-inset-bottom);box-shadow:0 -4px 24px rgba(0,0,0,0.35);}' +
    '.cnd-tabbar__inner{display:flex;height:var(--cnd-tabbar-h);max-width:640px;margin:0 auto;}' +
    '.cnd-tab{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-decoration:none;' +
      'color:rgba(255,255,255,0.55);font-family:"Poppins",sans-serif;font-weight:600;font-size:0.62rem;letter-spacing:0.02em;' +
      'transition:color 0.2s;position:relative;-webkit-tap-highlight-color:transparent;}' +
    '.cnd-tab__icon{font-size:1.25rem;line-height:1;transition:transform 0.2s;display:flex;align-items:center;justify-content:center;}' +
    '.cnd-tab__icon svg{width:21px;height:21px;display:block;}' +
    '.cnd-tab:active .cnd-tab__icon{transform:scale(0.86);}' +
    '.cnd-tab.active{color:#E3EF26;}' +
    '.cnd-tab.active::before{content:"";position:absolute;top:0;left:50%;transform:translateX(-50%);width:26px;height:3px;border-radius:0 0 3px 3px;background:#E3EF26;}' +
    '.cnd-install{position:fixed;left:12px;right:12px;bottom:calc(var(--cnd-tabbar-h) + env(safe-area-inset-bottom) + 12px);z-index:950;' +
      'display:none;align-items:center;gap:12px;background:#0C342C;border:1px solid rgba(227,239,38,0.28);border-radius:16px;padding:12px 14px;box-shadow:0 12px 40px rgba(0,0,0,0.45);}' +
    '.cnd-install.show{display:flex;}' +
    '.cnd-install__icon{width:40px;height:40px;border-radius:10px;background:#E3EF26;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}' +
    '.cnd-install__txt{flex:1;min-width:0;}' +
    '.cnd-install__t{font-family:"Poppins",sans-serif;font-weight:700;font-size:0.85rem;color:#fff;}' +
    '.cnd-install__s{font-size:0.72rem;color:rgba(255,255,255,0.55);line-height:1.4;}' +
    '.cnd-install__btn{background:#E3EF26;color:#06231D;border:none;border-radius:100px;padding:9px 16px;font-family:"Poppins",sans-serif;font-weight:700;font-size:0.78rem;cursor:pointer;flex-shrink:0;}' +
    '.cnd-install__x{background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.15rem;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1;}' +
    '@media(max-width:768px){.cnd-tabbar{display:block;}body{padding-bottom:calc(var(--cnd-tabbar-h) + env(safe-area-inset-bottom));}}' +
    '@media(min-width:769px){.cnd-install{left:20px;right:auto;bottom:20px;max-width:360px;}}' +
    // lift the chatbot launcher + window above the tab bar on mobile
    '@media(max-width:768px){' +
      '.cnd-chatbot-toggle{bottom:calc(var(--cnd-tabbar-h,60px) + env(safe-area-inset-bottom) + 14px)!important;}' +
      '.cnd-chatbot-window{bottom:calc(var(--cnd-tabbar-h,60px) + env(safe-area-inset-bottom) + 76px)!important;max-height:calc(100vh - var(--cnd-tabbar-h,60px) - 96px)!important;}}';

  function onReady(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  onReady(function () {
    var style = document.createElement('style');
    style.setAttribute('data-cnd', 'app-shell');
    style.textContent = CSS;
    document.head.appendChild(style);

    buildTabBar();
    setupInstall();
    keepChatbotLifted();
  });

  // The chatbot widget loads late and re-asserts its own bottom offset, so we
  // watch for it and keep its launcher/window above the tab bar with an inline
  // !important override (beats the widget's own styles, survives its remounts).
  function keepChatbotLifted() {
    if (window.innerWidth > 768) return;
    var LIFT_T = 'calc(var(--cnd-tabbar-h,60px) + env(safe-area-inset-bottom) + 14px)';
    var LIFT_W = 'calc(var(--cnd-tabbar-h,60px) + env(safe-area-inset-bottom) + 76px)';
    function apply() {
      var t = document.querySelector('.cnd-chatbot-toggle');
      if (t && t.style.getPropertyValue('bottom') !== LIFT_T) t.style.setProperty('bottom', LIFT_T, 'important');
      var w = document.querySelector('.cnd-chatbot-window');
      if (w && w.style.getPropertyValue('bottom') !== LIFT_W) w.style.setProperty('bottom', LIFT_W, 'important');
    }
    apply();
    try {
      var mo = new MutationObserver(apply);
      mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    } catch (e) {}
  }

  function currentActiveIndex() {
    var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (!path) path = 'index.html';
    var hash = location.hash;
    var best = -1, bestScore = 0;
    TABS.forEach(function (t, i) {
      var s = 0;
      if (t.file === path) s += 2;
      if (t.hash && t.hash === hash) s += 2;
      if (t.file === path && !t.hash && !hash) s += 1; // prefer plain Home on plain index
      if (s > bestScore) { bestScore = s; best = i; }
    });
    return best;
  }

  function buildTabBar() {
    var active = currentActiveIndex();
    var nav = document.createElement('nav');
    nav.className = 'cnd-tabbar';
    nav.setAttribute('aria-label', 'Primary');
    var inner = document.createElement('div');
    inner.className = 'cnd-tabbar__inner';
    TABS.forEach(function (t, i) {
      var a = document.createElement('a');
      a.className = 'cnd-tab' + (i === active ? ' active' : '');
      a.href = t.href;
      if (i === active) a.setAttribute('aria-current', 'page');
      a.innerHTML = '<span class="cnd-tab__icon" aria-hidden="true">' + t.icon + '</span><span>' + t.label + '</span>';
      inner.appendChild(a);
    });
    nav.appendChild(inner);
    document.body.appendChild(nav);
  }

  // ── PWA install prompt ──────────────────────────────────────
  var deferredPrompt = null;

  function dismissed() {
    return standalone || localStorage.getItem('cnd_installed') === '1' || localStorage.getItem('cnd_install_dismissed') === '1';
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  }

  function buildBanner() {
    if (document.getElementById('cndInstall')) return document.getElementById('cndInstall');
    var el = document.createElement('div');
    el.className = 'cnd-install';
    el.id = 'cndInstall';
    el.innerHTML =
      '<div class="cnd-install__icon">📲</div>' +
      '<div class="cnd-install__txt"><div class="cnd-install__t">Install CookNextDoor</div>' +
      '<div class="cnd-install__s" id="cndInstallSub">Add to your home screen for one-tap access.</div></div>' +
      '<button class="cnd-install__btn" id="cndInstallBtn">Install</button>' +
      '<button class="cnd-install__x" id="cndInstallX" aria-label="Dismiss">✕</button>';
    document.body.appendChild(el);
    document.getElementById('cndInstallX').addEventListener('click', function () {
      localStorage.setItem('cnd_install_dismissed', '1'); el.classList.remove('show');
    });
    return el;
  }

  function showAndroidBanner() {
    var el = buildBanner();
    var btn = document.getElementById('cndInstallBtn');
    btn.style.display = '';
    btn.onclick = async function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try {
        var choice = await deferredPrompt.userChoice;
        if (choice && choice.outcome !== 'accepted') localStorage.setItem('cnd_install_dismissed', '1');
      } catch (e) {}
      deferredPrompt = null;
      el.classList.remove('show');
    };
    el.classList.add('show');
  }

  function showIosHint() {
    var el = buildBanner();
    document.getElementById('cndInstallBtn').style.display = 'none';
    document.getElementById('cndInstallSub').textContent = 'Tap the Share button, then “Add to Home Screen”.';
    el.classList.add('show');
  }

  function setupInstall() {
    if (dismissed()) return;

    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;
      if (!dismissed()) setTimeout(showAndroidBanner, 1800);
    });
    window.addEventListener('appinstalled', function () {
      localStorage.setItem('cnd_installed', '1');
      var el = document.getElementById('cndInstall');
      if (el) el.classList.remove('show');
    });

    // iOS Safari never fires beforeinstallprompt — show a hint instead.
    if (isIOS() && !standalone) setTimeout(showIosHint, 2600);
  }

})();
