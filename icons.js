/*!
 * CookNextDoor — icons.js
 * Premium icon system: one SVG sprite (lucide-style stroke icons, currentColor,
 * 2px stroke) + an automatic swap that replaces *leading UI emojis* in chrome
 * elements (tags, buttons, nav links, social cards…) with sprite icons.
 *
 * Include on every page AFTER i18n.js:  <script src="icons.js" defer></script>
 *
 * Design rules:
 *  • Only the FIRST text node's leading emoji is swapped — body copy is untouched.
 *  • Emojis that carry meaning stay: food-category pills, Food-Mood faces,
 *    badge tiers (🌱→👑), medals (🥇🥈🥉), phone-mockup app UI.
 *  • Survives language switches and live Firestore renders (MutationObserver).
 */
(function () {
  'use strict';
  if (window._cndIcons) return;
  window._cndIcons = true;

  /* ── Sprite: 24×24 stroke icons ─────────────────────────────── */
  var ICONS = {
    'home':      '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    'houses':    '<path d="m2 12 5-4 5 4v7H2z"/><path d="M12 19h10v-8l-5-4-3 2.4"/><path d="M6 19v-4h2v4"/>',
    'bowl':      '<path d="M4 11h16a8 8 0 0 1-16 0Z"/><path d="M9 8V6"/><path d="M15 8V6"/><path d="M12 7V4"/>',
    'chef-hat':  '<path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/>',
    'map-pin':   '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    'newspaper': '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>',
    'mask':      '<path d="M7 3h10v7a5 5 0 0 1-10 0Z"/><path d="M9.5 7h.01"/><path d="M14.5 7h.01"/><path d="M10 10.5c.7.7 3.3.7 4 0"/><path d="M7 5 4 7"/><path d="m17 5 3 2"/>',
    'gift':      '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
    'trophy':    '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    'shield':    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    'salad':     '<path d="M7 21h10"/><path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z"/><path d="m13 12 4-4"/><path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2"/><path d="M15.5 9.5 18 6c1-1.5 3-1 3 1 0 1.5-1 2.5-2.5 2.5"/>',
    'sparkles':  '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
    'message':   '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    'camera':    '<rect width="20" height="20" x="2" y="2" rx="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
    'music':     '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    'bell':      '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    'star':      '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    'clock':     '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    'search':    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    'coffee':    '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/><path d="M6 2v2"/>',
    'heart':     '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    'share':     '<path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/>',
    'download':  '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    'link':      '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    'smartphone':'<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    'wallet':    '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M21 12a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h4a1 1 0 0 0 1-1z"/>',
    'utensils':  '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    'apple':     '<path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5"/>',
    'play':      '<polygon points="6 3 20 12 6 21 6 3"/>',
    /* food categories */
    'rice':      '<path d="M4 12h16a8 8 0 0 1-16 0Z"/><path d="M8 12a4 4 0 0 1 8 0"/><path d="M12 4v2.5"/><path d="m8.5 5 1 2"/><path d="m15.5 5-1 2"/>',
    'noodles':   '<path d="M4 13h16a8 8 0 0 1-16 0Z"/><path d="M8 13V8"/><path d="M12 13V7"/><path d="M16 13V8"/><path d="m5 5 14-3"/>',
    'bento':     '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14"/><path d="M12 12h9"/>',
    'cake':      '<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/>',
    'chili':     '<path d="M14 4c0-1.1.9-2 2-2"/><path d="M14 4c4 0 7 3 7 7 0 5-5.5 11-13 11-2.7 0-4.7-.9-6-2 4 0 7-2 9-5s3-7 3-11Z"/>',
    'leaf':      '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    'party':     '<path d="M5.8 11.3 2 22l10.7-3.8"/><path d="M11 13.3c1.9 1.9 2.8 4.1 2 5-.9.8-3.1-.1-5-2-1.9-1.9-2.8-4.1-2-5 .9-.8 3.1.1 5 2Z"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="m22 2-5 2"/><path d="m17 7 4-1"/><path d="m14 11 6-2"/>',
    /* community badges */
    'sprout':    '<path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11C12 7 9 5 4 5c0 4 2 6 8 6Z"/><path d="M12 8c0-3 2.5-5 7-5 0 4-2.5 6-7 6"/>',
    'users':     '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    'flame':     '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    'crown':     '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.52l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
    'medal':     '<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15"/><path d="M11 12 5.12 2.2"/><path d="m13 12 5.88-9.8"/><path d="M8 7h8"/><circle cx="12" cy="17" r="5"/><path d="M12 18v-2h-.5"/>',
    /* mood faces — one consistent line-face family */
    'face-happy':  '<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>',
    'face-sleepy': '<circle cx="11" cy="13" r="8"/><path d="M8 12h2"/><path d="M13 12h2"/><path d="M10 16.5h2.5"/><path d="M17 3h4l-4 4h4"/>',
    'face-love':   '<circle cx="11" cy="13" r="8"/><path d="M8 15.5s1.2 1.5 3 1.5 3-1.5 3-1.5"/><path d="M8.5 10.5h.01"/><path d="M13.5 10.5h.01"/><path d="M20.2 3.4c-.7-1.1-2.3-.7-2.5.5-.2-1.2-1.8-1.6-2.5-.5-.5.9.1 1.8 1.2 2.7l1.3 1 1.3-1c1.1-.9 1.7-1.8 1.2-2.7Z"/>',
    'face-plead':  '<circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.6"/><circle cx="15" cy="10" r="1.6"/><path d="M10.5 15.5h3"/>',
    'face-star':   '<circle cx="12" cy="12" r="9"/><path d="M9 7.5v3"/><path d="M7.5 9h3"/><path d="M15 7.5v3"/><path d="M13.5 9h3"/><path d="M8.5 14.5s1.4 2 3.5 2 3.5-2 3.5-2"/>',
    'face-curious':'<circle cx="12" cy="12" r="9"/><circle cx="15" cy="10" r="2.5"/><path d="M15 12.5V15"/><path d="M8 9.5h2"/><path d="M9.5 15.5h4"/>',
    'face-sad':    '<circle cx="12" cy="12" r="9"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><path d="M9 9h.01"/><path d="M15 9h.01"/>'
  };

  /* ── Leading emoji → icon name ──────────────────────────────── */
  var MAP = {
    '🏘️': 'houses', '🏠': 'home', '🏡': 'home',
    '🍜': 'noodles', '🍳': 'chef-hat', '👩‍🍳': 'chef-hat', '👨‍🍳': 'chef-hat',
    '📍': 'map-pin', '📰': 'newspaper', '🎭': 'mask', '🎁': 'gift',
    '🏆': 'trophy', '🛡️': 'shield', '🥗': 'salad', '✨': 'sparkles',
    '💬': 'message', '📸': 'camera', '🎵': 'music', '🔔': 'bell',
    '⭐': 'star', '⏰': 'clock', '🔍': 'search', '☕': 'coffee',
    '🙏': 'heart', '📤': 'share', '⬇': 'download', '🔗': 'link',
    '📱': 'smartphone', '📲': 'smartphone', '💰': 'wallet',
    '🍽️': 'utensils', '🍎': 'apple', '▶': 'play',
    '🍛': 'rice', '🍱': 'bento', '🍰': 'cake', '🌶️': 'chili',
    '💪': 'leaf', '🎉': 'party', '🌱': 'sprout', '🤝': 'users',
    '🔥': 'flame', '👑': 'crown', '🗺️': 'map',
    '😄': 'face-happy', '😊': 'face-happy', '😴': 'face-sleepy',
    '🥰': 'face-love', '🥺': 'face-plead', '🤩': 'face-star',
    '🧐': 'face-curious', '😔': 'face-sad'
  };
  // longest keys first so ZWJ/VS16 sequences match before their prefixes
  var KEYS = Object.keys(MAP).sort(function (a, b) { return b.length - a.length; });

  /* ── Where to swap / where never to ─────────────────────────── */
  var TARGETS = '[data-i18n], .tag, .btn, .loc-btn, .social-btn, .app-btn__icon, ' +
    '.app-feature-card__icon, .onboarding-card__icon, .cnd-install__icon, ' +
    '.cnd-ref-banner__icon, .no-res-icon, .food-card__cook, .food-card__dist, ' +
    '.food-card__pickup, .lb-hood, .reel__badge, .how-tab, .btn-nav, .btn-cta, .cnd-tab__icon, ' +
    '.pill, .mood-card, .mood-emoji, .mood-pill, .mood-recap, ' +
    '.invite-badge__e, .cnd-badge-emoji, .tchip, .lb-streak';
  var EXCLUDE = '.quote-avatar, .loader-emoji, .phone-screen, .lb-rank, ' +
    '.c-tag, .try-pill, .marquee-track span, .bg-foods';

  function svgFor(name, solo) {
    var s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('class', 'cnd-ico' + (solo ? ' cnd-ico--solo' : ''));
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = ICONS[name];
    return s;
  }

  function swapEl(el) {
    if (el.closest && el.closest(EXCLUDE)) return;
    // find first non-empty text node
    for (var n = el.firstChild; n; n = n.nextSibling) {
      if (n.nodeType === 3) {
        var txt = n.nodeValue;
        var lead = txt.replace(/^\s+/, '');
        if (!lead) continue;
        for (var i = 0; i < KEYS.length; i++) {
          var k = KEYS[i];
          if (lead.indexOf(k) === 0) {
            var rest = lead.slice(k.length).replace(/^\s+/, '');
            el.insertBefore(svgFor(MAP[k], rest === ''), n);
            n.nodeValue = rest;
            return;
          }
        }
        return; // first real text node had no mapped emoji — leave element alone
      }
      if (n.nodeType === 1 && n.tagName !== 'SVG') return; // element content first — skip
    }
  }

  function swapAll(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var els = scope.querySelectorAll(TARGETS);
    for (var i = 0; i < els.length; i++) swapEl(els[i]);
  }

  function init() {
    var css = '.cnd-ico{width:1em;height:1em;display:inline-block;vertical-align:-0.125em;' +
      'margin-right:0.4em;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:2;' +
      'stroke-linecap:round;stroke-linejoin:round;}' +
      '.cnd-ico--solo{margin-right:0;}' +
      '.social-btn .cnd-ico,.app-feature-card__icon .cnd-ico,.app-btn__icon .cnd-ico,' +
      '.onboarding-card__icon .cnd-ico,.cnd-install__icon .cnd-ico,.no-res-icon .cnd-ico{vertical-align:middle;}';
    var st = document.createElement('style');
    st.setAttribute('data-cnd', 'icons');
    st.textContent = css;
    document.head.appendChild(st);

    swapAll(document);

    // Re-swap after language switches and live content renders (debounced).
    var t = null;
    try {
      new MutationObserver(function () {
        clearTimeout(t);
        t = setTimeout(function () { swapAll(document); }, 250);
      }).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
