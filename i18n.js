/**
 * CookNextDoor i18n  —  EN / 中文 (Simplified Chinese)
 * • Auto-detects navigator.language on first visit
 * • Saves preference to localStorage ('cnd_lang')
 * • Injects EN | 中文 toggle into nav (or topbar)
 * • data-i18n="key"      → textContent replacement
 * • data-i18n-html="key" → innerHTML  replacement (for headings with <em>/<span>)
 * • data-i18n-ph="key"   → placeholder replacement
 */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     TRANSLATIONS
  ───────────────────────────────────────────────────────────── */
  var T = {
    en: {
      /* ── Nav (shared) ─────────────────────────── */
      'nav.browse':           'Browse food',
      'nav.howItWorks':       'How it works',
      'nav.whyUs':            'Why us',
      'nav.foodMood':         '🎭 Food Mood',
      'nav.news':             '📰 News',
      'nav.findFood':         'Find food',
      'nav.startCooking':     'Start cooking',
      'nav.home':             'Home',
      'nav.about':            'About',
      'nav.aboutUs':          'About us',
      'nav.contact':          'Contact',
      'nav.browseFoodNearMe': 'Browse food near me',
      'nav.backHome':         '← Back to home',

      /* ── Footer ───────────────────────────────── */
      'footer.tagline':     'A free hyperlocal platform where neighborhood home cooks share extra food with people just around the corner.',
      'footer.product':     'Product',
      'footer.company':     'Company',
      'footer.legal':       'Legal',
      'footer.copyright':   '© 2026 CookNextDoor. Made with ❤️ for neighbors.',
      'footer.howItWorks':  'How it works',
      'footer.findFood':    'Find food',
      'footer.startCooking':'Start cooking',
      'footer.foodMood':    '🎭 Food Mood',
      'footer.news':        '📰 News',
      'footer.meetupGuide': 'Meetup guide',
      'footer.aboutUs':     'About us',
      'footer.blog':        'Blog',
      'footer.press':       'Press',
      'footer.contact':     'Contact',
      'footer.terms':       'Terms',
      'footer.privacy':     'Privacy',
      'footer.cookies':     'Cookies',

      /* ── Support strip (all pages) ────────────── */
      'support.title': '☕ Keep CookNextDoor free',
      'support.desc':  'No ads. No commissions. 100% community-supported. Every contribution helps keep the platform running.',
      'support.btn':   '🙏 Support us',

      /* ── Donation modal ───────────────────────── */
      'donate.title':  'Support CookNextDoor',
      'donate.scan':   'Scan with PayNow or PayLah!\nAny amount is deeply appreciated 🙏',
      'donate.mobile': '📱 Tap to pay on mobile →',

      /* ── index.html ───────────────────────────── */
      'index.heroTag':  '🏘️ Hyperlocal · 1km · 0% commission',
      'index.heroH1':   'Real food,<br/><em>real neighbors.</em>',
      'index.heroSub':  'Discover home-cooked meals from people just around the corner — or share your own. No fees. No delivery. Just community.',
      'index.browseFoodBtn': '🍜 Browse food near me',
      'index.metricCommission': 'Commission',
      'index.metricRadius':     'Radius',
      'index.metricToStart':    'To start',
      'index.metricToPost':     'To post',

      'index.listingsTag':    '📍 Near you now',
      'index.listingsH2':     "What's cooking <span>next door?</span>",
      'index.listingsSeeAll': 'See all listings →',
      'index.searchPh':       'Search dishes, cooks or neighbourhood…',
      'index.nearMe':         '📍 Near me',
      'index.pillAll':        'All',
      'index.pillRice':       '🍛 Rice & Curry',
      'index.pillNoodles':    '🍜 Noodles',
      'index.pillHealthy':    '🥗 Healthy',
      'index.pillBento':      '🍱 Bento',
      'index.pillDesserts':   '🍰 Desserts',
      'index.emptyTitle':     'No food listed yet in your area',
      'index.emptyDesc':      "We're growing our community of home cooks. Be the first in your neighbourhood to share a dish!",
      'index.emptyBtn':       '🍳 Start cooking',

      'index.howTag':         'Simple process',
      'index.howH2':          'Simple steps,<br/><em>real food.</em>',
      'index.howSub':         "Whether you're hungry or you've cooked too much — it takes under 2 minutes to get started.",
      'index.tabBuyers':      '🛒 I want food',
      'index.tabCooks':       '🍳 I want to sell',
      'index.buyStep1Title':  'Discover nearby food',
      'index.buyStep1Desc':   'See home-cooked meals listed by neighbors within 1 km, updated in real time.',
      'index.buyStep2Title':  'Reserve a portion',
      'index.buyStep2Desc':   'Tap to reserve — the cook gets notified instantly. No middlemen, no waiting.',
      'index.buyStep3Title':  'Pick up & pay direct',
      'index.buyStep3Desc':   'Collect your meal and pay via PayNow, PayLah, or cash. Simple and direct.',
      'index.cookStep1Title': 'Post your extra food',
      'index.cookStep1Desc':  'Cooked too much? Snap a photo, set your price and portions in 60 seconds.',
      'index.cookStep2Title': 'Get reservations',
      'index.cookStep2Desc':  'Neighbors see your listing and reserve portions. You get notified instantly.',
      'index.cookStep3Title': 'Earn — keep 100%',
      'index.cookStep3Desc':  'They pick up and pay you directly. Zero commission. Every cent is yours.',
      'index.vidEater':       'Eater guide',
      'index.vidCook':        'Cook guide',
      'index.vidIntro':       'Watch our intro',

      'index.whyTag':         'Why us',
      'index.whyH2':          'Built for neighbors,<br/><span>not corporations.</span>',
      'index.whyDesc':        'We take nothing. Every cent you earn goes directly to you. No delivery, no complex setup — just real food shared between real people.',
      'index.why1Title':      'Zero commission',
      'index.why1Desc':       'What you earn, you keep — always. No hidden fees, ever.',
      'index.why2Title':      'No delivery',
      'index.why2Desc':       'Self-pickup only. No drivers, no delays, no cold food.',
      'index.why3Title':      'Reduce waste',
      'index.why3Desc':       'Turn extra portions into meals for someone who needs them.',
      'index.why4Title':      'Community first',
      'index.why4Desc':       'Every purchase helps a real person in your neighborhood.',
      'index.stat1Label':     'Commission taken, ever',
      'index.stat2Label':     'Hyperlocal radius only',
      'index.stat3Label':     'To post your first listing',
      'index.stat4Label':     'To get started',

      'index.testTag':        'Real story',
      'index.testH2':         'Real food.<br/>Real neighbors.<br/>Real impact.',

      'index.appTag':         'Coming soon',
      'index.appH2':          "The app is on<br/>its way.",
      'index.appDesc':        "We're building the CookNextDoor app for iOS and Android — so finding food next door is as easy as opening your phone.",
      'index.appComingSoon':  'Coming soon',
      'index.appMapTitle':    'Live map view',
      'index.appMapDesc':     'See food listings on a real-time map near you',
      'index.appAlertTitle':  'Instant alerts',
      'index.appAlertDesc':   'Get notified when someone near you posts food',
      'index.appChatTitle':   'Direct chat',
      'index.appChatDesc':    'Message your cook to confirm pickup details',
      'index.appRatingTitle': 'Ratings',
      'index.appRatingDesc':  'Rate your experience and build community trust',
      'index.appBadge':       'COMING IN APP',

      'index.faqTag': 'Questions answered',
      'index.faqH2':  'Frequently asked <span style="color:#E3EF26;">questions</span>',
      'index.faqSub': 'Everything you need to know about CookNextDoor — whether you want to find food or start selling.',
      'index.faq1Q':  'Is there delivery on CookNextDoor?',
      'index.faq1A':  'No, CookNextDoor is a self-pickup only platform. You collect the food directly from the cook, who is within 1 km of you. This keeps things simple, personal, and free of delivery fees.',
      'index.faq2Q':  'How do I pay for food?',
      'index.faq2A':  'Payment is made directly to the cook at pickup — you can use PayNow, PayLah, or cash. There is no payment processor or platform fee involved. Every cent goes straight to the cook.',
      'index.faq3Q':  'Is it free to join?',
      'index.faq3A':  'Yes, completely free for everyone. Buyers pay nothing to browse or reserve food. Cooks pay zero commission — we take 0% of every sale. There are no subscription fees or hidden charges.',
      'index.faq4Q':  'How far away are the cooks from me?',
      'index.faq4A':  'CookNextDoor is hyperlocal — all listings are from home cooks within a 1 km radius of your location. This keeps pickup quick, usually a short walk or a couple of minutes by car.',
      'index.faq5Q':  'Is the food safe to eat?',
      'index.faq5A':  'Our cooks are real neighbours who cook for their own families and share extra portions. Each cook profile includes ratings and reviews from the community. We encourage cooks to follow good food hygiene practices, and buyers can always message the cook about ingredients or allergies before pickup.',
      'index.faq6Q':  'Can I sell home-cooked food on CookNextDoor?',
      'index.faq6A':  'Yes! If you cook at home and often have extra portions, you can register as a cook for free. Just create a profile, snap a photo of your dish, set your price, and your listing goes live to neighbours within 1 km. No commercial kitchen or licence is required — you keep 100% of what you earn.',
      'index.faq7Q':  'Is CookNextDoor available outside Singapore?',
      'index.faq7A':  "CookNextDoor is currently focused on Singapore and Malaysia. We are expanding neighbourhood by neighbourhood. If you don't see cooks in your area yet, sign up to be notified when someone lists food near you.",
      'index.faq8Q':  'How many portions can a cook sell?',
      'index.faq8A':  'Each listing is designed for small, home-scale portions — typically 3 to 5 servings. This is intentional: CookNextDoor is about sharing genuine home-cooked food, not running a commercial operation from home.',
      'index.faqContact': 'Still have questions? Contact us →',

      'index.ctaH2':          'Your next home-cooked<br/>meal is just next door.',
      'index.ctaSub':         'Join your neighbors — share food, reduce waste, and build community. One meal at a time.',
      'index.ctaFindFood':    '🍜 Find food near me',
      'index.ctaStartCooking':'🍳 Start cooking',
      'index.ctaWhatsApp':    '💬 Join WhatsApp community',

      'index.mapLabel': 'FIND FOOD NEAR YOU',
      'index.mapH2':    'Cooks on the map 📍',
      'index.mapDesc':  "Click any pin to see the cook's listings and get directions. All pickup within 1 km of your neighbourhood.",

      'index.onboardTitle': 'Find food near you',
      'index.onboardDesc':  'Enter your location or allow access to discover home-cooked meals within 1 km.',
      'index.onboardPh':    'Enter your area, street or postal code…',
      'index.onboardSearch':'🔍 Search',
      'index.onboardGPS':   '📍 Use my location',
      'index.onboardSkip':  'Skip for now',

      'index.notifyTitle':  '🔔 Get notified when new food is listed near you',
      'index.notifySub':    'A quick email when a home cook posts something new nearby — no spam, ever',
      'index.notifyPh':     'your@email.com',
      'index.notifyBtn':    'Notify me',

      'index.portionsSold': 'portions sold',
      'index.soldOut':      'Sold out in 15 min',
      'index.earningsKept': '100% earnings kept',
      'index.realStoryTag': 'Real story',
      'index.realStoryH2':  'Real food.<br/>Real neighbors.<br/>Real impact.',
      'index.quoteText':    '"I cooked extra curry for 5 people, posted it on CookNextDoor, and sold out in 15 minutes. My neighbors loved it and I made enough to cover ingredients — plus a little extra. No apps, no drivers, just real people."',
      'index.quoteAuthor':  'Auntie Siti, Tampines',
      'index.quoteMeta':    'Home cook · Listed 3× this week',

      'index.moodTag':      '✨ New feature',
      'index.moodH2':       "Not sure what to eat?<br/>Let your <em>mood</em> decide.",
      'index.moodP':        "Answer a few fun questions about how you're feeling and we'll match you with the perfect home-cooked meal nearby. Inspired by Google Arts & Culture.",
      'index.moodBtn':      '🎭 Try Food Mood →',
      'index.moodHappy':    'Happy',
      'index.moodTired':    'Tired',
      'index.moodSpicy':    'Spicy',
      'index.moodRomantic': 'Romantic',
      'index.moodHealthy':  'Healthy',
      'index.moodExcited':  'Excited',

      'index.appP':         "We're building the CookNextDoor app for iOS and Android — so finding food next door is as easy as opening your phone.",
      'index.appFeat1Title':'Live map view',
      'index.appFeat1Desc': 'See food listings on a real-time map near you',
      'index.appFeat2Title':'Instant alerts',
      'index.appFeat2Desc': 'Get notified when someone near you posts food',
      'index.appFeat3Title':'Direct chat',
      'index.appFeat3Desc': 'Message your cook to confirm pickup details',
      'index.appFeat4Title':'Ratings',
      'index.appFeat4Desc': 'Rate your experience and build community trust',
      'index.comingInApp':  'COMING IN APP',

      /* ── about.html ───────────────────────────── */
      'about.heroTag':   '🏠 Our story',
      'about.heroH1':    'Food that connects <span>neighbors.</span>',
      'about.heroP':     "CookNextDoor was born from a simple belief — the best meals come from someone's home, and the best communities are built one shared plate at a time.",
      'about.whyH2':     'Why we <span>exist</span>',
      'about.whyP1':     'Every day, home cooks prepare more food than they need. Every day, busy people crave a real home-cooked meal but have no way to find one. We built CookNextDoor to close that gap — a free, zero-commission platform that connects people within 1 km of each other.',
      'about.whyP2':     'This is not a restaurant marketplace. There is no delivery, no middleman, no commission. Just neighbors helping neighbors eat better, reduce food waste, and earn a little on the side doing what they love.',
      'about.whyP3':     'We launched in Singapore and Malaysia, starting with the belief that hyperlocal community is the future of food — authentic, affordable, and human.',
      'about.stat1Label':'Hyperlocal radius',
      'about.stat2Label':'Platform commission',
      'about.stat3Label':'Countries (SG + MY)',
      'about.valuesH2':  'Our <span>values</span>',
      'about.val1Title': 'Community first',
      'about.val1Desc':  'Every feature we build strengthens the neighbourhood bond. Profit comes second — always.',
      'about.val2Title': 'Zero waste',
      'about.val2Desc':  "Leftover portions become someone else's dinner. We turn food waste into community value.",
      'about.val3Title': 'Radically free',
      'about.val3Desc':  'No subscription, no commission, no hidden fees. Cooks keep every dollar they earn.',
      'about.val4Title': 'Home, not factory',
      'about.val4Desc':  'We celebrate home cooking with all its love, culture and imperfection — not factory food.',
      'about.val5Title': 'Trust & safety',
      'about.val5Desc':  'Verified cooks, transparent ratings, and a culture of respect between buyers and sellers.',
      'about.val6Title': 'Cultural diversity',
      'about.val6Desc':  'Singapore and Malaysia are food paradises. We celebrate every cuisine and every cook.',
      'about.teamH2':    'The <span>team</span>',
      'about.teamP':     'We are a small, passionate team of food lovers, builders, and community organisers based in Singapore.',
      'about.mem1Role':  'Founder & CEO',
      'about.mem2Name':  'Product Team',
      'about.mem2Role':  'Design & Engineering',
      'about.mem3Name':  'Community Team',
      'about.mem3Role':  'Growth & Partnerships',
      'about.ctaH2':     'Ready to join the community?',
      'about.ctaP':      'Find a home-cooked meal near you, or share your cooking with the neighbourhood.',
      'about.ctaBtn':    '🍜 Get started',

      /* ── contact.html ─────────────────────────── */
      'contact.heroTag': '💬 Get in touch',
      'contact.heroH1':  "We'd love to <span>hear from you.</span>",
      'contact.heroP':   'Whether you\'re a home cook, a food lover, press, or a potential partner — drop us a message.',
      'contact.ch1Label':'All enquiries',
      'contact.ch1Note': 'We reply within 1–2 business days',
      'contact.ch2Label':'Press & media',
      'contact.ch2Note': 'Interview requests & press kits',
      'contact.ch3Label':'Partnerships',
      'contact.ch3Note': 'Community orgs, brands & NGOs',
      'contact.ch4Label':'Bug reports & feedback',
      'contact.ch4Note': 'Technical issues & suggestions',
      'contact.ch5Label':'Based in',
      'contact.ch5Value':'Singapore 🇸🇬',
      'contact.ch5Note': 'Also serving Malaysia 🇲🇾',
      'contact.formTitle':'Send us a <span>message</span>',
      'contact.nameLabel':'Your name',
      'contact.namePh':   'Jane Tan',
      'contact.emailLabel':'Email address',
      'contact.emailPh':  'jane@email.com',
      'contact.topicLabel':'Topic',
      'contact.topicDefault':'Select a topic…',
      'contact.topic1':   'General question',
      'contact.topic2':   "I'm a home cook",
      'contact.topic3':   'Feedback & suggestion',
      'contact.topic4':   'Press / media',
      'contact.topic5':   'Partnership',
      'contact.msgLabel': 'Message',
      'contact.msgPh':    'Tell us what you need…',
      'contact.sendBtn':  '✉️ Send message',
      'contact.formNote': 'We aim to reply within 1–2 business days.',

      /* ── news.html ────────────────────────────── */
      'news.heroTag':     '📰 Community News',
      'news.heroH1':      'Home Cook &amp; Food<br/><span>Stories Near You</span>',
      'news.heroP':       'Latest news on home-based food businesses, food charity, and community cooking across Singapore &amp; Malaysia.',
      'news.filterAll':     '🗂 All',
      'news.filterBiz':     '🏠 Home Biz',
      'news.filterCharity': '🤝 Charity',
      'news.filterCulture': '🍜 Culture',
      'news.filterSG':      '🇸🇬 Singapore',
      'news.filterMY':      '🇲🇾 Malaysia',

      /* ── food-mood.html ───────────────────────── */
      'mood.introTag':  '🎭 AI-powered',
      'mood.introH1':   "What's your vibe?",
      'mood.introP':    "Tell us how you're feeling and we'll find the perfect home-cooked dish nearby.",
      'mood.startBtn':  '✨ Start vibing',
      'mood.moodH2':    'Pick your <span>mood</span>',
      'mood.moodP':     'How are you feeling right now?',

      /* ── meetup-guide.html ────────────────────── */
      'guide.backHome':    '← Back to home',
      'guide.heroTag':     '📋 Complete guide',
      'guide.heroH1':      'How pickup & payment<br/><em>actually works.</em>',
      'guide.heroP':       'No delivery. No platform. Just two neighbors arranging a simple food handoff — here\'s exactly how it goes from reservation to payment.',
      'guide.badge1':      'Self pickup only',
      'guide.badge2':      'Pay direct to cook',
      'guide.badge3':      'Verified members only',
      'guide.badge4':      'Rate after pickup',
      'guide.flowLabel':   'Step by step',
      'guide.flowH2':      'The complete <em>transaction flow</em>',
      'guide.flowP':       "Here's exactly what happens from the moment a buyer discovers food to the moment the cook gets paid.",
      'guide.tabFull':     'Full flow',
      'guide.tabBuyer':    '🛒 Buyer view',
      'guide.tabCook':     '🍳 Cook view',

      /* ── cook-register.html ───────────────────── */
      'cook.heroTag':    '🍳 For home cooks',
      'cook.nextBtn':    'Next →',
      'cook.backBtn':    '← Back',
      'cook.submitBtn':  'Publish my profile',
      'reg.h1':          '🍳 Become a <span style="color:var(--orange)">Neighborhood Cook</span>',
      'reg.sub':         'Share your home-cooked food with neighbors. It takes about 5 minutes to set up your profile.',

      /* ── user-auth.html ───────────────────────── */
      'auth.leftTag':     '🍜 Find food near you',
      'auth.leftH1':      'Home-cooked food,<br/><em>just next door.</em>',
      'auth.leftP':       'Join your neighborhood food community. Find authentic home-cooked meals from people right around you — no fees, no delivery.',
      'auth.welcomeH2':   'Welcome back 👋',
      'auth.welcomeSub':  'Sign in to find home-cooked food near you, or create a new account.',
      'auth.tabSignIn':   'Sign In',
      'auth.tabCreate':   'Create Account',
      'auth.googleBtn':   'Continue with Google',
      'auth.orEmail':     'or continue with email',
      'auth.emailLabel':  'Email address',
      'auth.emailPh':     'you@email.com',
      'auth.passwordLabel':'Password',
      'auth.passwordPh':  'Your password',
      'auth.forgotPw':    'Forgot password?',
      'auth.signInBtn':   'Sign In →',
      'auth.nameLabel':   'Full name',
      'auth.namePh':      'Your full name',
      'auth.regPwPh':     'Min. 8 characters',
      'auth.pwHelper':    'Use 8+ characters with letters and numbers',
      'auth.createBtn':   'Create Account →',
      'auth.terms':       'By continuing you agree to our <a href="terms.html">Terms of Service</a> and <a href="privacy.html">Privacy Policy</a>',
      'auth.signIn':      'Sign in',
      'auth.signUp':      'Create account',
      'auth.continueGoogle': 'Continue with Google',
      'auth.noAccount':   "Don't have an account?",
      'auth.hasAccount':  'Already have an account?',
      'auth.registerHere':'Register here',
      'auth.signInHere':  'Sign in',

      /* ── legal / info pages ───────────────────── */
      'terms.heroH1':   'Terms of Service',
      'privacy.heroH1': 'Privacy Policy',
      'cookies.heroH1': 'Cookie Policy',
      'press.heroH1':   'Press & Media',
      'blog.heroH1':    'Blog',
    },

    /* ═══════════════════════════════════════════════════════════
       SIMPLIFIED CHINESE
    ════════════════════════════════════════════════════════════ */
    zh: {
      /* ── Nav ────────────────────────────────────── */
      'nav.browse':           '浏览美食',
      'nav.howItWorks':       '如何使用',
      'nav.whyUs':            '我们的优势',
      'nav.foodMood':         '🎭 食物心情',
      'nav.news':             '📰 新闻',
      'nav.findFood':         '找美食',
      'nav.startCooking':     '开始烹饪',
      'nav.home':             '首页',
      'nav.about':            '关于',
      'nav.aboutUs':          '关于我们',
      'nav.contact':          '联系我们',
      'nav.browseFoodNearMe': '浏览附近美食',
      'nav.backHome':         '← 返回首页',

      /* ── Footer ─────────────────────────────────── */
      'footer.tagline':     '免费的超本地平台，让邻近家庭厨师与周围的人分享多余食物。',
      'footer.product':     '产品',
      'footer.company':     '公司',
      'footer.legal':       '法律',
      'footer.copyright':   '© 2026 CookNextDoor. 用❤️为邻居而建。',
      'footer.howItWorks':  '如何使用',
      'footer.findFood':    '找美食',
      'footer.startCooking':'开始烹饪',
      'footer.foodMood':    '🎭 食物心情',
      'footer.news':        '📰 新闻',
      'footer.meetupGuide': '见面指南',
      'footer.aboutUs':     '关于我们',
      'footer.blog':        '博客',
      'footer.press':       '媒体',
      'footer.contact':     '联系我们',
      'footer.terms':       '服务条款',
      'footer.privacy':     '隐私政策',
      'footer.cookies':     'Cookie政策',

      /* ── Support strip ──────────────────────────── */
      'support.title': '☕ 保持CookNextDoor免费',
      'support.desc':  '无广告。无佣金。100%社区支持。每一份贡献都有助于维持平台运营。',
      'support.btn':   '🙏 支持我们',

      /* ── Donation modal ─────────────────────────── */
      'donate.title':  '支持 CookNextDoor',
      'donate.scan':   '用PayNow或PayLah扫码！\n任何金额都深表感激 🙏',
      'donate.mobile': '📱 在手机上点击付款 →',

      /* ── index.html ─────────────────────────────── */
      'index.heroTag':  '🏘️ 超本地 · 1公里 · 0%佣金',
      'index.heroH1':   '真实食物，<br/><em>真实邻居。</em>',
      'index.heroSub':  '发现来自转角邻居的家常菜——或分享您自己的美食。无费用。无外送。纯粹社区精神。',
      'index.browseFoodBtn': '🍜 浏览附近美食',
      'index.metricCommission': '佣金',
      'index.metricRadius':     '半径',
      'index.metricToStart':    '入门费用',
      'index.metricToPost':     '发布时间',

      'index.listingsTag':    '📍 附近现有',
      'index.listingsH2':     '邻居在煮<span>什么？</span>',
      'index.listingsSeeAll': '查看全部 →',
      'index.searchPh':       '搜索菜肴、厨师或街区…',
      'index.nearMe':         '📍 附近',
      'index.pillAll':        '全部',
      'index.pillRice':       '🍛 饭/咖喱',
      'index.pillNoodles':    '🍜 面食',
      'index.pillHealthy':    '🥗 健康',
      'index.pillBento':      '🍱 便当',
      'index.pillDesserts':   '🍰 甜品',
      'index.emptyTitle':     '您所在区域暂无食物',
      'index.emptyDesc':      '我们正在扩大家庭厨师社区。率先在您的街区分享一道菜吧！',
      'index.emptyBtn':       '🍳 开始烹饪',

      'index.howTag':         '简单流程',
      'index.howH2':          '简单步骤，<br/><em>真实食物。</em>',
      'index.howSub':         '无论您饥肠辘辘还是煮多了——开始只需不到2分钟。',
      'index.tabBuyers':      '🛒 我想买食物',
      'index.tabCooks':       '🍳 我想出售',
      'index.buyStep1Title':  '发现附近食物',
      'index.buyStep1Desc':   '查看1公里内邻居提供的家常菜，实时更新。',
      'index.buyStep2Title':  '预订份量',
      'index.buyStep2Desc':   '点击预订——厨师立即收到通知。无中间商，无等待。',
      'index.buyStep3Title':  '自取并直接付款',
      'index.buyStep3Desc':   '取餐并通过PayNow、PayLah或现金付款。简单直接。',
      'index.cookStep1Title': '发布多余食物',
      'index.cookStep1Desc':  '煮多了？拍张照片，在60秒内设定价格和份量。',
      'index.cookStep2Title': '收到预订',
      'index.cookStep2Desc':  '邻居看到您的菜单并预订份量。您立即收到通知。',
      'index.cookStep3Title': '赚钱——全部归您',
      'index.cookStep3Desc':  '他们自取并直接付款给您。零佣金。每一分都是您的。',
      'index.vidEater':       '买家指南',
      'index.vidCook':        '厨师指南',
      'index.vidIntro':       '观看介绍',

      'index.whyTag':         '我们的优势',
      'index.whyH2':          '为邻居而建，<br/><span>而非企业。</span>',
      'index.whyDesc':        '我们分文不取。您赚的每一分钱直接归您所有。无外送，无复杂设置——只是真实的人分享真实的食物。',
      'index.why1Title':      '零佣金',
      'index.why1Desc':       '您赚的您保留——永远如此。绝无隐藏费用。',
      'index.why2Title':      '无外送',
      'index.why2Desc':       '仅限自取。无司机，无延误，无冷食。',
      'index.why3Title':      '减少浪费',
      'index.why3Desc':       '将多余份量变成需要者的一餐。',
      'index.why4Title':      '社区优先',
      'index.why4Desc':       '每次购买都帮助了您街区的真实邻居。',
      'index.stat1Label':     '永远零佣金',
      'index.stat2Label':     '仅限超本地半径',
      'index.stat3Label':     '发布首个菜单所需时间',
      'index.stat4Label':     '入门费用',

      'index.testTag':        '真实故事',
      'index.testH2':         '真实食物。<br/>真实邻居。<br/>真实影响。',

      'index.appTag':         '即将推出',
      'index.appH2':          '应用程序<br/>即将推出。',
      'index.appDesc':        '我们正在为iOS和Android构建CookNextDoor应用——让找到附近食物像打开手机一样简单。',
      'index.appComingSoon':  '即将推出',
      'index.appMapTitle':    '实时地图',
      'index.appMapDesc':     '在实时地图上查看附近的食物清单',
      'index.appAlertTitle':  '即时提醒',
      'index.appAlertDesc':   '当附近有人发布食物时立即通知您',
      'index.appChatTitle':   '直接聊天',
      'index.appChatDesc':    '与厨师联系确认取餐详情',
      'index.appRatingTitle': '评分',
      'index.appRatingDesc':  '评价您的体验并建立社区信任',
      'index.appBadge':       '应用中推出',

      'index.faqTag': '常见问题',
      'index.faqH2':  '常见 <span style="color:#E3EF26;">问题解答</span>',
      'index.faqSub': '关于CookNextDoor的一切——无论您是想找食物还是开始出售。',
      'index.faq1Q':  'CookNextDoor有外送服务吗？',
      'index.faq1A':  '没有，CookNextDoor是纯自取平台。您直接从1公里内的厨师处取餐。这样简单、亲切，且无外送费用。',
      'index.faq2Q':  '如何付款？',
      'index.faq2A':  '付款直接在取餐时给厨师——可用PayNow、PayLah或现金。无支付处理费或平台费。每一分钱直接给厨师。',
      'index.faq3Q':  '加入是免费的吗？',
      'index.faq3A':  '是的，对所有人完全免费。买家浏览或预订食物无需付费。厨师零佣金——我们每笔销售抽取0%。没有订阅费或隐藏费用。',
      'index.faq4Q':  '厨师离我有多远？',
      'index.faq4A':  'CookNextDoor是超本地平台——所有菜单均来自您1公里范围内的家庭厨师。取餐很快，通常步行片刻或开车几分钟。',
      'index.faq5Q':  '食物安全吗？',
      'index.faq5A':  '我们的厨师是真实的邻居，为自家人做饭并分享多余份量。每个厨师资料都有来自社区的评分和评价。我们鼓励厨师遵守食品卫生规范，买家在取餐前可随时向厨师询问食材或过敏原。',
      'index.faq6Q':  '我可以在CookNextDoor出售家常菜吗？',
      'index.faq6A':  '可以！如果您在家做饭且经常有多余份量，可免费注册为厨师。只需创建资料，拍一张菜肴照片，设定价格，您的菜单即可向1公里内的邻居上线。无需商业厨房或执照——您保留100%的收入。',
      'index.faq7Q':  'CookNextDoor在新加坡以外有吗？',
      'index.faq7A':  'CookNextDoor目前专注于新加坡和马来西亚。我们正在逐步扩展到更多街区。如果您所在区域还没有厨师，可以注册，当附近有人发布食物时会通知您。',
      'index.faq8Q':  '厨师可以出售多少份量？',
      'index.faq8A':  '每个菜单设计为小份的家庭规模——通常3至5份。这是有意为之：CookNextDoor是关于分享真正的家常菜，而非在家经营商业食品业务。',
      'index.faqContact': '还有问题？联系我们 →',

      'index.ctaH2':          '您的下一顿家常菜<br/>就在隔壁。',
      'index.ctaSub':         '加入您的邻居——分享食物、减少浪费、建立社区。一顿饭一次。',
      'index.ctaFindFood':    '🍜 在附近找食物',
      'index.ctaStartCooking':'🍳 开始烹饪',
      'index.ctaWhatsApp':    '💬 加入WhatsApp社群',

      'index.mapLabel': '在附近找食物',
      'index.mapH2':    '地图上的厨师 📍',
      'index.mapDesc':  '点击任意大头针查看厨师的菜单并获取路线。所有取餐均在您街区1公里范围内。',

      'index.onboardTitle': '在附近找食物',
      'index.onboardDesc':  '输入您的位置或允许定位，发现1公里内的家常菜。',
      'index.onboardPh':    '输入您的区域、街道或邮政编码…',
      'index.onboardSearch':'🔍 搜索',
      'index.onboardGPS':   '📍 使用我的位置',
      'index.onboardSkip':  '暂时跳过',

      'index.notifyTitle':  '🔔 新菜上架时第一时间通知你',
      'index.notifySub':    '当附近有厨师发布新菜品时，我们会发送一封简短邮件——绝不发垃圾邮件',
      'index.notifyPh':     '你的邮箱@example.com',
      'index.notifyBtn':    '立即订阅',

      'index.portionsSold': '份已售出',
      'index.soldOut':      '15分钟售罄',
      'index.earningsKept': '100%收入归自己',
      'index.realStoryTag': '真实故事',
      'index.realStoryH2':  '真实美食。<br/>真实邻居。<br/>真实影响。',
      'index.quoteText':    '"我为5个人多做了咖喱，发布在CookNextDoor上，15分钟就卖完了。邻居们很喜欢，我不仅收回了食材费用，还多赚了一点。没有App，没有司机，只是真实的人与人之间的联系。"',
      'index.quoteAuthor':  'Auntie Siti，淡滨尼',
      'index.quoteMeta':    '家庭厨师 · 本周已发布3次',

      'index.moodTag':      '✨ 新功能',
      'index.moodH2':       '不知道吃什么？<br/>让你的<em>心情</em>来决定。',
      'index.moodP':        '回答几个有趣的问题，告诉我们你的感受，我们将为你匹配附近最合适的家常菜。灵感来自Google艺术与文化。',
      'index.moodBtn':      '🎭 试试食物心情 →',
      'index.moodHappy':    '开心',
      'index.moodTired':    '疲倦',
      'index.moodSpicy':    '爱辣',
      'index.moodRomantic': '浪漫',
      'index.moodHealthy':  '健康',
      'index.moodExcited':  '兴奋',

      'index.appP':         '我们正在为iOS和Android打造CookNextDoor应用——让你找到隔壁美食就像打开手机一样简单。',
      'index.appFeat1Title':'实时地图',
      'index.appFeat1Desc': '在地图上实时查看附近的美食列表',
      'index.appFeat2Title':'即时提醒',
      'index.appFeat2Desc': '附近厨师发布新菜品时立即通知你',
      'index.appFeat3Title':'直接聊天',
      'index.appFeat3Desc': '与厨师沟通确认取餐细节',
      'index.appFeat4Title':'评分系统',
      'index.appFeat4Desc': '评价你的体验，帮助建立社区信任',
      'index.comingInApp':  '即将在APP推出',

      /* ── about.html ─────────────────────────────── */
      'about.heroTag':   '🏠 我们的故事',
      'about.heroH1':    '连接邻居的<span>食物。</span>',
      'about.heroP':     'CookNextDoor源于一个简单的信念——最美味的餐食来自家里，而最好的社区是在一次次共享的餐桌上建立的。',
      'about.whyH2':     '我们为何<span>存在</span>',
      'about.whyP1':     '每天，家庭厨师都会做出比所需更多的食物。每天，忙碌的人们渴望一顿真正的家常菜却无处寻觅。我们建立CookNextDoor来弥合这一差距——一个免费、零佣金的平台，连接1公里内的人们。',
      'about.whyP2':     '这不是餐厅市场。没有外送，没有中间商，没有佣金。只是邻居帮助邻居吃得更好、减少食物浪费，并从自己热爱的事情中赚取一些收入。',
      'about.whyP3':     '我们在新加坡和马来西亚起步，相信超本地社区是食物的未来——真实、实惠、人情味十足。',
      'about.stat1Label':'超本地半径',
      'about.stat2Label':'平台佣金',
      'about.stat3Label':'覆盖国家（新加坡+马来西亚）',
      'about.valuesH2':  '我们的<span>价值观</span>',
      'about.val1Title': '社区优先',
      'about.val1Desc':  '我们构建的每项功能都旨在加强街区联系。盈利永远排在第二位。',
      'about.val2Title': '零浪费',
      'about.val2Desc':  '剩余份量变成别人的晚餐。我们将食物浪费转化为社区价值。',
      'about.val3Title': '彻底免费',
      'about.val3Desc':  '无订阅费，无佣金，无隐藏费用。厨师保留全部收入。',
      'about.val4Title': '家庭，非工厂',
      'about.val4Desc':  '我们推崇蕴含爱、文化与真实感的家常烹饪——而非工厂食品。',
      'about.val5Title': '信任与安全',
      'about.val5Desc':  '经过验证的厨师、透明的评分，以及买卖双方之间尊重的文化。',
      'about.val6Title': '文化多样性',
      'about.val6Desc':  '新加坡和马来西亚是美食天堂。我们推崇每一种菜系和每一位厨师。',
      'about.teamH2':    '我们的<span>团队</span>',
      'about.teamP':     '我们是一支充满热情的小团队，由美食爱好者、开发者和社区组织者组成，总部在新加坡。',
      'about.mem1Role':  '创始人兼首席执行官',
      'about.mem2Name':  '产品团队',
      'about.mem2Role':  '设计与工程',
      'about.mem3Name':  '社区团队',
      'about.mem3Role':  '增长与合作',
      'about.ctaH2':     '准备加入社区了吗？',
      'about.ctaP':      '在您附近找一顿家常菜，或与街区分享您的厨艺。',
      'about.ctaBtn':    '🍜 开始体验',

      /* ── contact.html ───────────────────────────── */
      'contact.heroTag': '💬 联系我们',
      'contact.heroH1':  '很高兴<span>听到您的声音。</span>',
      'contact.heroP':   '无论您是家庭厨师、美食爱好者、媒体还是潜在合作伙伴——欢迎留言。',
      'contact.ch1Label':'所有咨询',
      'contact.ch1Note': '我们在1-2个工作日内回复',
      'contact.ch2Label':'媒体询问',
      'contact.ch2Note': '采访请求及新闻资料包',
      'contact.ch3Label':'合作伙伴',
      'contact.ch3Note': '社区组织、品牌及非政府组织',
      'contact.ch4Label':'错误报告与反馈',
      'contact.ch4Note': '技术问题及建议',
      'contact.ch5Label':'总部位于',
      'contact.ch5Value':'新加坡 🇸🇬',
      'contact.ch5Note': '同时服务马来西亚 🇲🇾',
      'contact.formTitle':'发送<span>消息</span>',
      'contact.nameLabel':'您的姓名',
      'contact.namePh':   '张三',
      'contact.emailLabel':'电子邮箱',
      'contact.emailPh':  'zhang@email.com',
      'contact.topicLabel':'主题',
      'contact.topicDefault':'请选择主题…',
      'contact.topic1':   '一般咨询',
      'contact.topic2':   '我是家庭厨师',
      'contact.topic3':   '反馈与建议',
      'contact.topic4':   '媒体/新闻',
      'contact.topic5':   '合作伙伴',
      'contact.msgLabel': '留言',
      'contact.msgPh':    '告诉我们您的需求…',
      'contact.sendBtn':  '✉️ 发送消息',
      'contact.formNote': '我们力求在1-2个工作日内回复。',

      /* ── news.html ──────────────────────────────── */
      'news.heroTag':     '📰 社区新闻',
      'news.heroH1':      '家厨美食<br/><span>你身边的故事</span>',
      'news.heroP':       '来自新加坡和马来西亚的家庭厨房资讯、慈善美食与社区烹饪最新动态。',
      'news.filterAll':     '🗂 全部',
      'news.filterBiz':     '🏠 家庭厨房',
      'news.filterCharity': '🤝 公益',
      'news.filterCulture': '🍜 饮食文化',
      'news.filterSG':      '🇸🇬 新加坡',
      'news.filterMY':      '🇲🇾 马来西亚',

      /* ── food-mood.html ─────────────────────────── */
      'mood.introTag':  '🎭 AI驱动',
      'mood.introH1':   '今天是什么心情？',
      'mood.introP':    '告诉我们您的感受，我们为您找到附近最合适的家常菜。',
      'mood.startBtn':  '✨ 开始体验',
      'mood.moodH2':    '选择您的<span>心情</span>',
      'mood.moodP':     '您现在感觉如何？',

      /* ── meetup-guide.html ──────────────────────── */
      'guide.backHome':    '← 返回首页',
      'guide.heroTag':     '📋 完整指南',
      'guide.heroH1':      '取餐与付款<br/><em>实际如何运作。</em>',
      'guide.heroP':       '无外送。无平台介入。只是两位邻居安排简单的食物交接——以下是从预订到付款的完整流程。',
      'guide.badge1':      '仅限自取',
      'guide.badge2':      '直接付款给厨师',
      'guide.badge3':      '仅限已验证会员',
      'guide.badge4':      '取餐后评分',
      'guide.flowLabel':   '逐步指南',
      'guide.flowH2':      '完整的<em>交易流程</em>',
      'guide.flowP':       '以下是从买家发现食物到厨师收款的完整过程。',
      'guide.tabFull':     '完整流程',
      'guide.tabBuyer':    '🛒 买家视角',
      'guide.tabCook':     '🍳 厨师视角',

      /* ── cook-register.html ─────────────────────── */
      'cook.heroTag':    '🍳 家庭厨师专区',
      'cook.nextBtn':    '下一步 →',
      'cook.backBtn':    '← 返回',
      'cook.submitBtn':  '发布我的主页',
      'reg.h1':          '🍳 成为一名<span style="color:var(--orange)">社区厨师</span>',
      'reg.sub':         '与邻居分享你的家常美食。设置个人主页大约只需5分钟。',

      /* ── user-auth.html ─────────────────────────── */
      'auth.leftTag':     '🍜 发现附近美食',
      'auth.leftH1':      '家常饭菜，<br/><em>就在你隔壁。</em>',
      'auth.leftP':       '加入你的社区美食圈。发现附近邻居烹制的正宗家常饭菜——零佣金，无需外送。',
      'auth.welcomeH2':   '欢迎回来 👋',
      'auth.welcomeSub':  '登录寻找附近的家常美食，或创建新账户。',
      'auth.tabSignIn':   '登录',
      'auth.tabCreate':   '创建账户',
      'auth.googleBtn':   '使用 Google 登录',
      'auth.orEmail':     '或使用邮箱继续',
      'auth.emailLabel':  '邮箱地址',
      'auth.emailPh':     '你的邮箱@example.com',
      'auth.passwordLabel':'密码',
      'auth.passwordPh':  '你的密码',
      'auth.forgotPw':    '忘记密码？',
      'auth.signInBtn':   '登录 →',
      'auth.nameLabel':   '全名',
      'auth.namePh':      '你的全名',
      'auth.regPwPh':     '至少8位字符',
      'auth.pwHelper':    '请使用8位以上包含字母和数字的密码',
      'auth.createBtn':   '创建账户 →',
      'auth.terms':       '继续即表示您同意我们的<a href="terms.html">服务条款</a>和<a href="privacy.html">隐私政策</a>',
      'auth.signIn':      '登录',
      'auth.signUp':      '创建账户',
      'auth.continueGoogle': '使用Google继续',
      'auth.noAccount':   '还没有账户？',
      'auth.hasAccount':  '已有账户？',
      'auth.registerHere':'立即注册',
      'auth.signInHere':  '登录',

      /* ── legal / info pages ─────────────────────── */
      'terms.heroH1':   '服务条款',
      'privacy.heroH1': '隐私政策',
      'cookies.heroH1': 'Cookie政策',
      'press.heroH1':   '媒体资源',
      'blog.heroH1':    '博客',
    }
  };

  /* ─────────────────────────────────────────────────────────────
     LANGUAGE DETECTION
  ───────────────────────────────────────────────────────────── */
  function detectLang() {
    var saved = localStorage.getItem('cnd_lang');
    if (saved === 'zh' || saved === 'en') return saved;
    var bl = ((navigator.language || navigator.userLanguage) || 'en').toLowerCase();
    return bl.startsWith('zh') ? 'zh' : 'en';
  }

  var currentLang = detectLang();

  /* ─────────────────────────────────────────────────────────────
     APPLY TRANSLATIONS
  ───────────────────────────────────────────────────────────── */
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('cnd_lang', lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    var tx = T[lang] || T.en;

    // Text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      if (tx[k] !== undefined) el.textContent = tx[k];
    });

    // Inner HTML (for headings with <em>/<span>/<br>)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-html');
      if (tx[k] !== undefined) el.innerHTML = tx[k];
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var k = el.getAttribute('data-i18n-ph');
      if (tx[k] !== undefined) el.placeholder = tx[k];
    });

    // Update switcher active state
    var enBtn = document.getElementById('i18n-btn-en');
    var zhBtn = document.getElementById('i18n-btn-zh');
    if (enBtn) enBtn.classList.toggle('i18n-active', lang === 'en');
    if (zhBtn) zhBtn.classList.toggle('i18n-active', lang === 'zh');

    // Body class for CSS hooks
    document.body.classList.toggle('lang-zh', lang === 'zh');
    document.body.classList.toggle('lang-en', lang !== 'zh');

    if (lang === 'zh') loadZhFont();
  }

  function loadZhFont() {
    if (document.getElementById('cnd-noto-sc')) return;
    var l = document.createElement('link');
    l.id = 'cnd-noto-sc';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap';
    document.head.appendChild(l);
  }

  /* ─────────────────────────────────────────────────────────────
     SWITCHER INJECTION + STYLES
  ───────────────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('cnd-i18n-styles')) return;
    var s = document.createElement('style');
    s.id = 'cnd-i18n-styles';
    s.textContent = [
      '#i18n-switcher{',
        'display:inline-flex;align-items:center;gap:0;',
        'background:rgba(255,255,255,0.08);',
        'border:1px solid rgba(255,255,255,0.20);',
        'border-radius:100px;padding:3px;flex-shrink:0;',
      '}',
      '#i18n-switcher button{',
        'background:none;border:none;',
        'color:rgba(255,255,255,0.55);',
        'font-family:"Poppins","Noto Sans SC",sans-serif;',
        'font-weight:700;font-size:0.72rem;',
        'padding:4px 10px;border-radius:100px;',
        'cursor:pointer;',
        'transition:background 0.15s,color 0.15s;',
        'line-height:1.2;white-space:nowrap;',
      '}',
      '#i18n-switcher button:hover{color:#fff;}',
      '#i18n-switcher button.i18n-active{background:#E3EF26;color:#06231D;}',
      /* Chinese font override */
      '.lang-zh{font-family:"Noto Sans SC","Inter",sans-serif!important;}',
      '.lang-zh h1,.lang-zh h2,.lang-zh h3,.lang-zh h4{',
        'font-family:"Noto Sans SC","Poppins",sans-serif!important;',
        'letter-spacing:0!important;',
      '}',
      '@media(max-width:768px){#i18n-switcher{margin-right:6px;}}',
    ].join('');
    document.head.appendChild(s);
  }

  function injectSwitcher() {
    if (document.getElementById('i18n-switcher')) return;

    var wrap = document.createElement('div');
    wrap.id = 'i18n-switcher';
    wrap.setAttribute('role', 'group');
    wrap.setAttribute('aria-label', 'Language switcher');
    wrap.innerHTML =
      '<button id="i18n-btn-en" aria-label="English" onclick="window.__cndLang(\'en\')">EN</button>' +
      '<button id="i18n-btn-zh" aria-label="中文" onclick="window.__cndLang(\'zh\')">中文</button>';

    /* Try to inject into known nav containers, in priority order */
    var targets = [
      /* index.html: .nav__cta (put switcher before the first button) */
      { sel: '.nav__cta', method: 'prepend' },
      /* simple nav with .nav__links — append switcher after links */
      { sel: '.nav__links', method: 'after' },
      /* meetup-guide: .topbar — append at end */
      { sel: '.topbar', method: 'append' },
      /* fallback: any nav */
      { sel: 'nav', method: 'append' },
    ];

    for (var i = 0; i < targets.length; i++) {
      var el = document.querySelector(targets[i].sel);
      if (!el) continue;
      var m = targets[i].method;
      if (m === 'prepend') {
        el.insertBefore(wrap, el.firstChild);
      } else if (m === 'after') {
        el.parentNode.insertBefore(wrap, el.nextSibling);
      } else {
        el.appendChild(wrap);
      }
      break;
    }
  }

  /* ─────────────────────────────────────────────────────────────
     PUBLIC API
  ───────────────────────────────────────────────────────────── */
  window.__cndLang = function (lang) { applyLang(lang); };
  window.CND_i18n  = {
    t:       function (k) { return (T[currentLang] || T.en)[k] || k; },
    setLang: function (l) { applyLang(l); },
    getLang: function ()  { return currentLang; }
  };

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    injectSwitcher();
    applyLang(currentLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
