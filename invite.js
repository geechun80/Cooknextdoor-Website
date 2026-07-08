/*!
 * CookNextDoor — invite.js
 * Referral / reward loop (self-contained, progressive enhancement).
 *
 * Add before </body>:  <script src="invite.js" defer></script>
 *
 * Provides:
 *   • A per-visitor invite link  index.html?ref=<id>  (anonymous, no login needed)
 *   • openInviteModal(): share sheet (Web Share + WhatsApp/Telegram/X/Facebook/copy)
 *     with a QR code and earnable community badges (🌱→👑) that level up as you share.
 *   • ?ref= landing: a warm, dismissible welcome banner for the invited neighbour,
 *     and best-effort logging to a Firestore `referrals` collection (non-blocking —
 *     silently ignored if security rules don't allow it yet).
 *
 * Honest by design: badges are driven by invites you actually share from this
 * device (localStorage). Verified-signup rewards can be layered on later from the
 * logged `referrals` data.
 */
(function () {
  'use strict';
  if (window._cndInvite) return;
  window._cndInvite = true;

  var FB_CONFIG = {
    apiKey: "AIzaSyC3ynPUHYnPQ9msdLJNB5l-gM--CogrXAQ",
    authDomain: "cooknextdoor-eedbe.firebaseapp.com",
    projectId: "cooknextdoor-eedbe",
    storageBucket: "cooknextdoor-eedbe.firebasestorage.app",
    messagingSenderId: "924339275437",
    appId: "1:924339275437:web:a97a0a2ba0089dd58e824"
  };

  var TIERS = [
    { n: 0,  badge: '🌱', name: 'Newcomer' },
    { n: 1,  badge: '🤝', name: 'Neighbour' },
    { n: 3,  badge: '🔥', name: 'Connector' },
    { n: 5,  badge: '⭐', name: 'Community Builder' },
    { n: 10, badge: '👑', name: 'Founding Neighbour' }
  ];

  // ── Identity + counters (localStorage) ──────────────────────
  function myRef() {
    var r = localStorage.getItem('cnd_myref');
    if (!r) { r = 'n' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); localStorage.setItem('cnd_myref', r); }
    return r;
  }
  function inviteURL() { return location.origin + '/index.html?ref=' + encodeURIComponent(myRef()); }
  function shares() { return parseInt(localStorage.getItem('cnd_invites_shared') || '0', 10); }
  function bumpShares() { var n = shares() + 1; localStorage.setItem('cnd_invites_shared', String(n)); return n; }
  function tierFor(n) { var t = TIERS[0]; for (var i = 0; i < TIERS.length; i++) if (n >= TIERS[i].n) t = TIERS[i]; return t; }
  function nextTier(n) { for (var i = 0; i < TIERS.length; i++) if (TIERS[i].n > n) return TIERS[i]; return null; }
  function inviteText() { return "I'm on CookNextDoor — home-cooked food from neighbours within 1 km, zero commission. Join me:"; }

  // ── CSS ─────────────────────────────────────────────────────
  var CSS =
    '.cnd-ref-banner{position:fixed;top:90px;left:50%;transform:translateX(-50%) translateY(-12px);z-index:250;opacity:0;' +
      'display:flex;align-items:center;gap:12px;max-width:min(520px,calc(100vw - 24px));' +
      'background:#0C342C;border:1px solid rgba(227,239,38,0.30);border-radius:16px;padding:12px 16px;box-shadow:0 16px 44px rgba(0,0,0,0.45);' +
      'transition:opacity .35s ease,transform .35s ease;pointer-events:none;}' +
    '.cnd-ref-banner.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto;}' +
    '.cnd-ref-banner__icon{font-size:1.5rem;flex-shrink:0;}' +
    '.cnd-ref-banner__t{font-family:"Poppins",sans-serif;font-weight:700;font-size:0.86rem;color:#fff;line-height:1.3;}' +
    '.cnd-ref-banner__s{font-size:0.74rem;color:rgba(255,255,255,0.6);}' +
    '.cnd-ref-banner__x{background:none;border:none;color:rgba(255,255,255,0.4);font-size:1.05rem;cursor:pointer;padding:2px 4px;flex-shrink:0;line-height:1;}' +
    '.cnd-invite-modal{display:none;position:fixed;inset:0;z-index:4200;background:rgba(0,0,0,0.82);backdrop-filter:blur(10px);align-items:center;justify-content:center;padding:20px;}' +
    '.cnd-invite-modal.open{display:flex;}' +
    '.cnd-invite-card{background:#0C342C;border:1px solid rgba(227,239,38,0.20);border-radius:24px;max-width:420px;width:100%;padding:26px 22px;position:relative;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,0.55);max-height:94vh;overflow-y:auto;}' +
    '.cnd-invite-card__close{position:absolute;top:14px;right:14px;background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.6);cursor:pointer;width:32px;height:32px;border-radius:50%;font-size:1rem;}' +
    '.cnd-invite-card h3{font-family:"Poppins",sans-serif;font-weight:900;font-size:1.3rem;color:#fff;margin:0 0 6px;}' +
    '.cnd-invite-card p.sub{font-size:0.85rem;color:rgba(255,255,255,0.6);margin:0 0 18px;line-height:1.5;}' +
    '.cnd-badge-row{display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);border-radius:16px;padding:14px;margin-bottom:16px;text-align:left;}' +
    '.cnd-badge-emoji{font-size:2.2rem;line-height:1;flex-shrink:0;}' +
    '.cnd-badge-name{font-family:"Poppins",sans-serif;font-weight:800;font-size:0.95rem;color:#E3EF26;}' +
    '.cnd-badge-meta{font-size:0.74rem;color:rgba(255,255,255,0.55);margin-top:2px;}' +
    '.cnd-badge-bar{height:6px;border-radius:100px;background:rgba(255,255,255,0.1);overflow:hidden;margin-top:8px;}' +
    '.cnd-badge-bar > span{display:block;height:100%;background:linear-gradient(90deg,#E3EF26,#9ee27a);border-radius:100px;transition:width .5s ease;}' +
    '.cnd-invite-qr{background:#fff;border-radius:14px;padding:10px;display:inline-block;margin-bottom:14px;}' +
    '.cnd-invite-qr img{width:150px;height:150px;display:block;border-radius:4px;}' +
    '.cnd-invite-link{display:flex;gap:8px;margin-bottom:14px;}' +
    '.cnd-invite-link input{flex:1;min-width:0;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.14);color:rgba(255,255,255,0.85);border-radius:12px;padding:11px 12px;font-family:"Inter",sans-serif;font-size:0.78rem;outline:none;}' +
    '.cnd-invite-copy{background:#E3EF26;color:#06231D;border:none;border-radius:12px;padding:0 16px;font-family:"Poppins",sans-serif;font-weight:700;font-size:0.8rem;cursor:pointer;flex-shrink:0;}' +
    '.cnd-invite-share{display:grid;grid-template-columns:1fr 1fr;gap:8px;}' +
    '.cnd-invite-share button,.cnd-invite-share a{display:flex;align-items:center;justify-content:center;gap:6px;color:#fff;text-decoration:none;border:none;cursor:pointer;font-family:"Poppins",sans-serif;font-weight:700;font-size:0.8rem;padding:11px;border-radius:12px;transition:transform .2s,filter .2s;}' +
    '.cnd-invite-share button:hover,.cnd-invite-share a:hover{transform:translateY(-2px);filter:brightness(1.08);}' +
    '.cnd-invite-share .sh-native{grid-column:1 / -1;background:#E3EF26;color:#06231D;}' +
    '.cnd-invite-tiers{display:flex;justify-content:space-between;gap:4px;margin-top:16px;}' +
    '.cnd-invite-tiers .tchip{flex:1;text-align:center;font-size:1.1rem;opacity:0.35;filter:grayscale(1);transition:opacity .3s,filter .3s;}' +
    '.cnd-invite-tiers .tchip.on{opacity:1;filter:none;}' +
    '.cnd-invite-tiers .tchip small{display:block;font-size:0.54rem;color:rgba(255,255,255,0.5);font-family:"Poppins",sans-serif;font-weight:600;margin-top:2px;filter:grayscale(1);}';

  function injectCSS() {
    var s = document.createElement('style');
    s.setAttribute('data-cnd', 'invite');
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ── Modal ───────────────────────────────────────────────────
  function buildModal() {
    if (document.getElementById('cndInviteModal')) return;
    var m = document.createElement('div');
    m.className = 'cnd-invite-modal';
    m.id = 'cndInviteModal';
    m.addEventListener('click', function (e) { if (e.target === m) closeInviteModal(); });
    m.innerHTML =
      '<div class="cnd-invite-card">' +
        '<button class="cnd-invite-card__close" aria-label="Close" onclick="closeInviteModal()">✕</button>' +
        '<h3 data-i18n="invite.title">Invite your neighbours 🎁</h3>' +
        '<p class="sub" data-i18n="invite.sub">Share CookNextDoor with people nearby. Every neighbour you bring grows the community — and levels up your badge.</p>' +
        '<div class="cnd-badge-row">' +
          '<div class="cnd-badge-emoji" id="cndBadgeEmoji">🌱</div>' +
          '<div style="flex:1;min-width:0;">' +
            '<div class="cnd-badge-name" id="cndBadgeName">Newcomer</div>' +
            '<div class="cnd-badge-meta" id="cndBadgeMeta">0 invites shared</div>' +
            '<div class="cnd-badge-bar"><span id="cndBadgeBar" style="width:0%"></span></div>' +
          '</div>' +
        '</div>' +
        '<div class="cnd-invite-qr"><img id="cndInviteQR" alt="Invite QR code" width="150" height="150"/></div>' +
        '<div class="cnd-invite-link"><input id="cndInviteLink" readonly value=""/><button class="cnd-invite-copy" onclick="cndInviteCopy(this)" data-i18n="invite.copy">Copy</button></div>' +
        '<div class="cnd-invite-share">' +
          '<button class="sh-native" id="cndInviteNative" onclick="cndInviteShare(\'native\')" data-i18n="invite.share">📤 Share</button>' +
          '<a href="#" id="cndShWA" target="_blank" rel="noopener" style="background:#25D366;" onclick="cndInviteShare(\'wa\')">💬 WhatsApp</a>' +
          '<a href="#" id="cndShTG" target="_blank" rel="noopener" style="background:#229ED9;" onclick="cndInviteShare(\'tg\')">✈️ Telegram</a>' +
          '<a href="#" id="cndShTW" target="_blank" rel="noopener" style="background:#111;" onclick="cndInviteShare(\'tw\')">𝕏 Post</a>' +
          '<a href="#" id="cndShFB" target="_blank" rel="noopener" style="background:#1877F2;" onclick="cndInviteShare(\'fb\')">f Facebook</a>' +
        '</div>' +
        '<div class="cnd-invite-tiers" id="cndInviteTiers"></div>' +
      '</div>';
    document.body.appendChild(m);

    var tiersEl = document.getElementById('cndInviteTiers');
    tiersEl.innerHTML = TIERS.map(function (t) {
      return '<div class="tchip" data-n="' + t.n + '">' + t.badge + '<small>' + t.n + '</small></div>';
    }).join('');
  }

  function refreshModal() {
    var n = shares();
    var t = tierFor(n), nx = nextTier(n);
    var url = inviteURL();
    document.getElementById('cndBadgeEmoji').textContent = t.badge;
    document.getElementById('cndBadgeName').textContent = t.name;
    var meta = document.getElementById('cndBadgeMeta');
    var bar = document.getElementById('cndBadgeBar');
    if (nx) {
      meta.textContent = n + ' shared · ' + (nx.n - n) + ' more to ' + nx.badge + ' ' + nx.name;
      var span = t.n, need = nx.n - t.n, prog = Math.max(0, Math.min(1, (n - t.n) / need));
      bar.style.width = (prog * 100) + '%';
    } else {
      meta.textContent = n + ' shared · top badge unlocked 🎉';
      bar.style.width = '100%';
    }
    document.getElementById('cndInviteLink').value = url;
    document.getElementById('cndInviteQR').src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=' + encodeURIComponent(url);
    var txt = inviteText();
    document.getElementById('cndShWA').href = 'https://wa.me/?text=' + encodeURIComponent(txt + ' ' + url);
    document.getElementById('cndShTG').href = 'https://t.me/share/url?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(txt);
    document.getElementById('cndShTW').href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(txt) + '&url=' + encodeURIComponent(url);
    document.getElementById('cndShFB').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    document.getElementById('cndInviteNative').style.display = navigator.share ? '' : 'none';
    Array.prototype.forEach.call(document.querySelectorAll('#cndInviteTiers .tchip'), function (c) {
      c.classList.toggle('on', n >= parseInt(c.getAttribute('data-n'), 10));
    });
  }

  window.openInviteModal = function () {
    buildModal();
    refreshModal();
    document.getElementById('cndInviteModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  window.closeInviteModal = function () {
    var m = document.getElementById('cndInviteModal');
    if (m) m.classList.remove('open');
    document.body.style.overflow = '';
  };

  window.cndInviteCopy = function (btn) {
    var url = inviteURL();
    var done = function () { var o = btn.textContent; btn.textContent = '✓'; bumpShares(); refreshModal(); setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done).catch(done);
    else { var i = document.getElementById('cndInviteLink'); i.select(); try { document.execCommand('copy'); } catch (e) {} done(); }
  };

  window.cndInviteShare = function (kind) {
    if (kind === 'native') {
      if (navigator.share) {
        navigator.share({ title: 'CookNextDoor', text: inviteText(), url: inviteURL() }).then(function () { bumpShares(); refreshModal(); }).catch(function () {});
      }
      return;
    }
    // social anchors navigate via their href; just count the intent
    bumpShares(); refreshModal();
  };

  // ── Referral landing (?ref=) ────────────────────────────────
  function handleReferral() {
    var params = new URLSearchParams(location.search);
    var ref = params.get('ref');
    if (!ref) return;
    if (ref === myRef()) return;                          // don't self-refer
    if (!localStorage.getItem('cnd_referred_by')) localStorage.setItem('cnd_referred_by', ref);

    // Warm welcome banner (once per visitor)
    if (!localStorage.getItem('cnd_ref_greeted')) {
      showRefBanner();
      localStorage.setItem('cnd_ref_greeted', '1');
    }
    logReferral(ref);
  }

  function showRefBanner() {
    var b = document.createElement('div');
    b.className = 'cnd-ref-banner';
    b.innerHTML =
      '<span class="cnd-ref-banner__icon">🎁</span>' +
      '<div style="flex:1;min-width:0;"><div class="cnd-ref-banner__t" data-i18n="invite.welcomeT">A neighbour invited you!</div>' +
      '<div class="cnd-ref-banner__s" data-i18n="invite.welcomeS">Discover home-cooked food within 1 km — free to browse.</div></div>' +
      '<button class="cnd-ref-banner__x" aria-label="Dismiss">✕</button>';
    document.body.appendChild(b);
    b.querySelector('.cnd-ref-banner__x').addEventListener('click', function () { b.classList.remove('show'); setTimeout(function () { b.remove(); }, 400); });
    requestAnimationFrame(function () { b.classList.add('show'); });
    setTimeout(function () { if (b.parentNode) { b.classList.remove('show'); setTimeout(function () { b.remove(); }, 400); } }, 9000);
  }

  // Best-effort log to Firestore `referrals` — silently ignored if rules deny.
  function logReferral(ref) {
    if (localStorage.getItem('cnd_ref_logged_' + ref)) return;
    Promise.all([
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js')
    ]).then(function (mods) {
      var appMod = mods[0], fs = mods[1];
      var apps = appMod.getApps();
      var app = apps.length ? apps[0] : appMod.initializeApp(FB_CONFIG);
      var db = fs.getFirestore(app);
      return fs.addDoc(fs.collection(db, 'referrals'), {
        ref: ref, ts: fs.serverTimestamp(), page: location.pathname
      });
    }).then(function () {
      localStorage.setItem('cnd_ref_logged_' + ref, '1');
    }).catch(function () { /* rules may deny — non-blocking */ });
  }

  function onReady(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }
  onReady(function () {
    injectCSS();
    handleReferral();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.closeInviteModal && window.closeInviteModal(); });
})();
