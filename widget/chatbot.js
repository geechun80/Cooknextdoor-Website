(function () {
  'use strict';

  // ── Config ────────────────────────────────────────────────────────────────
  const API_URL = 'http://72.62.192.99:3001/api/chat/message';

  const SYSTEM_PROMPT = `You are the official AI assistant for CookNextDoor, a hyperlocal home-cooked food platform in Singapore.

Your ONLY job is to answer questions about CookNextDoor. You must REFUSE to answer anything unrelated to the platform.

=== WHAT YOU CAN HELP WITH ===
- How CookNextDoor works (no delivery, self-pickup, 1km radius)
- How to list food as a home cook
- How to find and order food nearby
- Payment methods (PayNow, PayLah, cash)
- Food safety, hygiene, and packaging tips
- Community guidelines and trust & safety
- Account setup, login issues, profile questions
- How to contact a cook or buyer

=== STRICT REFUSAL RULES ===
If someone asks about ANYTHING outside CookNextDoor (e.g., general cooking recipes, other apps, news, coding, politics, math, weather, jokes, etc.), you MUST respond with:
"I'm only able to help with questions about CookNextDoor. For [topic], please use a general assistant like ChatGPT or Google. Is there anything about CookNextDoor I can help you with?"

=== TONE ===
- Friendly, warm, community-focused
- Short and direct answers
- Use simple language (many users are not tech-savvy)
- Never be rude or dismissive

=== PLATFORM FACTS ===
- Free to use, zero commission
- No delivery — buyers pick up from the cook's location
- Only home cooks within 1km radius are shown
- Payments are direct between cook and buyer
- Available at cooknextdoor.org`;

  const SUGGESTIONS = [
    'How does CookNextDoor work?',
    'How do I list my food?',
    'How do I find food nearby?',
    'What payment methods are accepted?',
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isTyping = false;
  let messageHistory = [];

  // ── Styles ────────────────────────────────────────────────────────────────
  const STYLES = `
    @keyframes cndFadeIn {
      to { opacity: 1; }
    }

    /* ── Toggle button: middle-left, vertically centered ── */
    #cnd-chatbot-toggle {
      position: fixed;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2D6444, #F87B31);
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(45,100,68,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9998;
      opacity: 0;
      animation: cndFadeIn 0.4s ease 0.5s forwards;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    #cnd-chatbot-toggle:hover {
      transform: translateY(-50%) scale(1.08);
      box-shadow: 0 6px 28px rgba(45,100,68,0.65);
    }
    #cnd-chatbot-toggle svg {
      width: 26px;
      height: 26px;
      fill: white;
    }

    /* ── Chat window: opens to the right of the toggle button ── */
    #cnd-chatbot-window {
      position: fixed;
      left: 90px;
      top: 50%;
      width: 380px;
      height: 560px;
      max-height: calc(100vh - 40px);
      background: #0f1b2d;
      border-radius: 20px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.6);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(-50%) translateX(-12px) scale(0.97);
      opacity: 0;
      pointer-events: none;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #cnd-chatbot-window.open {
      transform: translateY(-50%) translateX(0) scale(1);
      opacity: 1;
      pointer-events: all;
    }

    /* Header */
    #cnd-chat-header {
      background: linear-gradient(135deg, #0a1628 0%, #1a2f50 100%);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    #cnd-chat-avatar {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2D6444, #F87B31);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      flex-shrink: 0;
    }
    #cnd-chat-header-info {
      flex: 1;
    }
    #cnd-chat-header-name {
      color: #ffffff;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.2;
    }
    #cnd-chat-header-status {
      color: #8ba7c9;
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 2px;
    }
    #cnd-chat-header-status::before {
      content: '';
      display: inline-block;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      flex-shrink: 0;
    }
    #cnd-chat-close {
      background: none;
      border: none;
      cursor: pointer;
      color: #8ba7c9;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: color 0.15s, background 0.15s;
    }
    #cnd-chat-close:hover {
      color: #fff;
      background: rgba(255,255,255,0.08);
    }

    /* Messages area */
    #cnd-chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.12) transparent;
    }
    #cnd-chat-messages::-webkit-scrollbar { width: 4px; }
    #cnd-chat-messages::-webkit-scrollbar-track { background: transparent; }
    #cnd-chat-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }

    /* Welcome screen */
    #cnd-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 24px 16px;
      gap: 12px;
    }
    #cnd-welcome-icon {
      font-size: 48px;
      line-height: 1;
    }
    #cnd-welcome-title {
      color: #ffffff;
      font-size: 17px;
      font-weight: 600;
    }
    #cnd-welcome-sub {
      color: #8ba7c9;
      font-size: 13px;
      line-height: 1.5;
      max-width: 280px;
    }
    #cnd-suggestions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      width: 100%;
      margin-top: 8px;
    }
    .cnd-suggestion-btn {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      color: #c8d9ef;
      padding: 10px 14px;
      border-radius: 10px;
      text-align: left;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.15s, border-color 0.15s;
    }
    .cnd-suggestion-btn:hover {
      background: rgba(255,255,255,0.1);
      border-color: rgba(45,100,68,0.5);
      color: #fff;
    }

    /* Message bubbles */
    .cnd-msg-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    .cnd-msg-row.user {
      flex-direction: row-reverse;
    }
    .cnd-msg-bubble-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2D6444, #F87B31);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      flex-shrink: 0;
    }
    .cnd-msg-bubble {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }
    .cnd-msg-row.bot .cnd-msg-bubble {
      background: rgba(255,255,255,0.07);
      color: #dde8f5;
      border-bottom-left-radius: 4px;
    }
    .cnd-msg-row.user .cnd-msg-bubble {
      background: linear-gradient(135deg, #2D6444, #3d7a5a);
      color: #ffffff;
      border-bottom-right-radius: 4px;
    }

    /* Typing indicator */
    #cnd-typing-indicator {
      display: none;
      gap: 8px;
      align-items: flex-end;
    }
    #cnd-typing-indicator.visible {
      display: flex;
    }
    .cnd-typing-dots {
      background: rgba(255,255,255,0.07);
      padding: 12px 16px;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .cnd-typing-dot {
      width: 6px;
      height: 6px;
      background: #8ba7c9;
      border-radius: 50%;
      animation: cndBounce 1.2s ease-in-out infinite;
    }
    .cnd-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .cnd-typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes cndBounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-5px); opacity: 1; }
    }

    /* Input area */
    #cnd-chat-input-area {
      padding: 12px 14px;
      background: rgba(0,0,0,0.3);
      border-top: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;
    }
    #cnd-input-row {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    #cnd-chat-input {
      flex: 1;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      color: #dde8f5;
      font-size: 14px;
      padding: 10px 14px;
      resize: none;
      max-height: 80px;
      min-height: 40px;
      outline: none;
      font-family: inherit;
      line-height: 1.4;
      transition: border-color 0.15s;
    }
    #cnd-chat-input::placeholder { color: #4e6a8a; }
    #cnd-chat-input:focus { border-color: rgba(45,100,68,0.5); }
    #cnd-send-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #2D6444, #F87B31);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s, transform 0.15s;
    }
    #cnd-send-btn:hover { opacity: 0.85; transform: scale(1.05); }
    #cnd-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
    #cnd-send-btn svg { width: 16px; height: 16px; fill: white; }
    #cnd-input-footer {
      color: #3d566e;
      font-size: 11px;
      text-align: center;
      margin-top: 8px;
    }

    /* ── Mobile: move to bottom-right corner ── */
    @media (max-width: 768px) {
      #cnd-chatbot-toggle {
        left: auto;
        right: 20px;
        top: auto;
        bottom: 20px;
        transform: none;
      }
      #cnd-chatbot-toggle:hover {
        transform: scale(1.08);
      }
      #cnd-chatbot-window {
        left: auto;
        right: 16px;
        top: auto;
        bottom: 88px;
        width: calc(100vw - 32px);
        max-height: calc(100vh - 120px);
        transform: translateY(16px) scale(0.97);
      }
      #cnd-chatbot-window.open {
        transform: translateY(0) scale(1);
      }
    }
  `;

  // ── DOM helpers ───────────────────────────────────────────────────────────
  function injectStyles() {
    const el = document.createElement('style');
    el.textContent = STYLES;
    document.head.appendChild(el);
  }

  function buildToggleBtn() {
    const btn = document.createElement('button');
    btn.id = 'cnd-chatbot-toggle';
    btn.setAttribute('aria-label', 'Open CookNextDoor chat');
    btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
    </svg>`;
    return btn;
  }

  function buildWindow() {
    const win = document.createElement('div');
    win.id = 'cnd-chatbot-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'CookNextDoor Assistant');
    win.innerHTML = `
      <div id="cnd-chat-header">
        <div id="cnd-chat-avatar">🍜</div>
        <div id="cnd-chat-header-info">
          <div id="cnd-chat-header-name">CookNextDoor Assistant</div>
          <div id="cnd-chat-header-status">Online — here to help</div>
        </div>
        <button id="cnd-chat-close" aria-label="Close chat">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div id="cnd-chat-messages">
        <div id="cnd-welcome">
          <div id="cnd-welcome-icon">🍳</div>
          <div id="cnd-welcome-title">How can I help you today?</div>
          <div id="cnd-welcome-sub">Ask me anything about CookNextDoor — listing food, finding meals nearby, payments, and more.</div>
          <div id="cnd-suggestions">
            ${SUGGESTIONS.map(s => `<button class="cnd-suggestion-btn">${s}</button>`).join('')}
          </div>
        </div>
        <div id="cnd-typing-indicator">
          <div class="cnd-msg-bubble-avatar">🍜</div>
          <div class="cnd-typing-dots">
            <div class="cnd-typing-dot"></div>
            <div class="cnd-typing-dot"></div>
            <div class="cnd-typing-dot"></div>
          </div>
        </div>
      </div>
      <div id="cnd-chat-input-area">
        <div id="cnd-input-row">
          <textarea id="cnd-chat-input" rows="1" placeholder="Ask about CookNextDoor…" maxlength="500"></textarea>
          <button id="cnd-send-btn" aria-label="Send">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
        <div id="cnd-input-footer">Platform questions only • Powered by Claude AI</div>
      </div>
    `;
    return win;
  }

  // ── Chat logic ────────────────────────────────────────────────────────────
  function appendMessage(role, text) {
    const messagesEl = document.getElementById('cnd-chat-messages');
    const welcome = document.getElementById('cnd-welcome');
    if (welcome) welcome.remove();

    const typing = document.getElementById('cnd-typing-indicator');

    const row = document.createElement('div');
    row.className = 'cnd-msg-row ' + role;

    const avatarEl = document.createElement('div');
    avatarEl.className = 'cnd-msg-bubble-avatar';
    avatarEl.textContent = role === 'bot' ? '🍜' : '👤';

    const bubble = document.createElement('div');
    bubble.className = 'cnd-msg-bubble';
    bubble.textContent = text;

    row.appendChild(avatarEl);
    row.appendChild(bubble);

    messagesEl.insertBefore(row, typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    return row;
  }

  function showTyping(show) {
    const el = document.getElementById('cnd-typing-indicator');
    const messages = document.getElementById('cnd-chat-messages');
    if (!el) return;
    if (show) {
      el.classList.add('visible');
      messages.scrollTop = messages.scrollHeight;
    } else {
      el.classList.remove('visible');
    }
  }

  async function sendMessage(text) {
    if (!text.trim() || isTyping) return;

    const input = document.getElementById('cnd-chat-input');
    const sendBtn = document.getElementById('cnd-send-btn');

    appendMessage('user', text.trim());
    messageHistory.push({ role: 'user', content: text.trim() });

    if (input) { input.value = ''; input.style.height = ''; }
    if (sendBtn) sendBtn.disabled = true;
    isTyping = true;
    showTyping(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          history: messageHistory.slice(-10),
          systemPrompt: SYSTEM_PROMPT,
        }),
      });

      if (!response.ok) throw new Error('Server error ' + response.status);

      const data = await response.json();
      const reply = (data.response || data.message || 'Sorry, I could not get a response. Please try again.').trim();

      showTyping(false);
      appendMessage('bot', reply);
      messageHistory.push({ role: 'assistant', content: reply });
    } catch (err) {
      showTyping(false);
      appendMessage('bot', 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.');
      console.error('[CookNextDoor chatbot]', err);
    } finally {
      isTyping = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    injectStyles();

    const toggleBtn = buildToggleBtn();
    const chatWindow = buildWindow();

    document.body.appendChild(toggleBtn);
    document.body.appendChild(chatWindow);

    // Toggle open/close
    toggleBtn.addEventListener('click', function () {
      isOpen = !isOpen;
      chatWindow.classList.toggle('open', isOpen);
      toggleBtn.setAttribute('aria-label', isOpen ? 'Close chat' : 'Open CookNextDoor chat');
      if (isOpen) {
        const input = document.getElementById('cnd-chat-input');
        if (input) setTimeout(function () { input.focus(); }, 280);
      }
    });

    // Close button
    document.getElementById('cnd-chat-close').addEventListener('click', function () {
      isOpen = false;
      chatWindow.classList.remove('open');
    });

    // Suggestion buttons
    chatWindow.querySelectorAll('.cnd-suggestion-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        sendMessage(btn.textContent);
      });
    });

    // Send on click
    document.getElementById('cnd-send-btn').addEventListener('click', function () {
      const input = document.getElementById('cnd-chat-input');
      if (input) sendMessage(input.value);
    });

    // Send on Enter (Shift+Enter for newline)
    document.getElementById('cnd-chat-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(this.value);
      }
    });

    // Auto-resize textarea
    document.getElementById('cnd-chat-input').addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 80) + 'px';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
