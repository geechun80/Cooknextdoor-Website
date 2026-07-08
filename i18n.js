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

      /* ── Community & Social (index) ───────────── */
      'community.liveDefault': 'Fresh home-cooked meals added every week',
      'community.h2':          'Loved by the <span>neighbourhood.</span>',
      'community.sub':         'See what neighbours are cooking, watch how it works, and follow along for daily home-cooked inspiration.',
      'community.watchLabel':  '▶ Watch the vibe',
      'community.reel1':       'Meet CookNextDoor',
      'community.reel2':       'Guide for eaters',
      'community.reel3':       'Guide for cooks',
      'community.reelMore':    'More on TikTok →',
      'community.followLabel': '✦ Follow the community',
      'community.fbSub':       'Community page',
      'community.waSub':       'Join the chat',
      'community.cta':         '🍳 Share your first dish →',

      /* ── Invite & Earn (index + invite.js) ────── */
      'invite.tag':      '🎁 Invite & earn',
      'invite.h2':       'Bring a neighbour,<br/><span>earn your badge.</span>',
      'invite.p':        'CookNextDoor grows one neighbour at a time. Share your invite link — every person you bring levels up your community badge, from 🌱 Newcomer to 👑 Founding Neighbour.',
      'invite.btn':      '🎁 Invite your neighbours →',
      'invite.title':    'Invite your neighbours 🎁',
      'invite.sub':      'Share CookNextDoor with people nearby. Every neighbour you bring grows the community — and levels up your badge.',
      'invite.copy':     'Copy',
      'invite.share':    '📤 Share',
      'invite.welcomeT': 'A neighbour invited you!',
      'invite.welcomeS': 'Discover home-cooked food within 1 km — free to browse.',

      /* ── Leaderboard (index) ──────────────────── */
      'lb.tag':      '🏆 Community stars',
      'lb.h2':       'This week\'s <span>top cooks.</span>',
      'lb.sub':      'The neighbours sharing the most home-cooked food near you. Keep a weekly streak going to climb the ranks 🔥',
      'lb.emptyT':   'The leaderboard is waiting for its first star',
      'lb.emptyS':   'Be the first cook in your neighbourhood to list a dish — and claim the top spot.',
      'lb.emptyBtn': '🍳 Start cooking →',

      /* ── Trust journey (index) ────────────────── */
      'trust.tag': '🛡️ How trust works',
      'trust.h2':  'From your neighbour\'s kitchen<br/><span style="color:#E3EF26;">to your table.</span>',
      'trust.sub': 'Five simple steps keep every meal safe, personal, and commission-free.',
      'trust.s1T': 'Verified neighbours',
      'trust.s1D': 'Every cook has a public profile with community ratings and reviews.',
      'trust.s2T': 'Hygiene & allergies',
      'trust.s2D': 'Good home-hygiene practices — and you can ask about ingredients before pickup.',
      'trust.s3T': 'Reserve in a tap',
      'trust.s3D': 'Reserve your portion instantly — the cook is notified right away.',
      'trust.s4T': 'Self-pickup, 1 km',
      'trust.s4D': 'Stroll over and collect it fresh. No drivers, no fees, no cold food.',
      'trust.s5T': 'Pay direct & enjoy',
      'trust.s5D': 'PayNow, PayLah or cash — every cent goes to your neighbour.',

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

      'index.sticker1':     '✦ 0% commission',
      'index.sticker2':     '📍 Within 1 km',
      'index.sticker3':     '🤝 Self pickup',
      'index.ficLabel1':    'Nasi Briyani',
      'index.ficLabel2':    'Singapore Laksa',
      'index.marq1':        'Zero Commission',
      'index.marq2':        'Home Cooked',
      'index.marq3':        'Self Pickup Only',
      'index.marq4':        'Hyperlocal 1km',
      'index.marq5':        'Real Neighbors',
      'index.marq6':        'Reduce Food Waste',
      'index.marq7':        'PayNow & PayLah',

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
      'mood.shareTitle':      '📸 Share your food mood',
      'mood.shareSub':        'Post your match to your story or send it to a friend — dare them to find theirs.',
      'mood.shareBtn':        '📤 Share my result',
      'mood.shareModalTitle': 'Share your food mood 🎉',
      'mood.shareLoading':    'Creating your card…',
      'mood.shareNative':     '📤 Share',
      'mood.shareSave':       '⬇ Save image',
      'mood.shareCopy':       '🔗 Copy link',
      'mood.moodH2':    'Pick your <span>mood</span>',
      'mood.moodP':     'How are you feeling right now?',
      'mood.happy':     'Happy',        'mood.happyDesc':   'Good vibes, celebrating',
      'mood.comfort':   'Need Comfort', 'mood.comfortDesc': 'Sad, stressed, rough day',
      'mood.tired':     'Tired',        'mood.tiredDesc':   'Low energy, need fuel',
      'mood.excited':   'Excited',      'mood.excitedDesc': 'Adventurous, try new things',
      'mood.healthy':   'Healthy',      'mood.healthyDesc': 'Post-workout, eating clean',
      'mood.romantic':  'Romantic',     'mood.romanticDesc':'Date night, special dinner',
      'mood.spicy':     'Spicy Craving','mood.spicyDesc':   'Want heat and bold flavors',
      'mood.sweet':     'Sweet Tooth',  'mood.sweetDesc':   'Dessert mood, treats',
      'mood.curious':   'Curious',      'mood.curiousDesc': 'Open to anything new',
      'mood.sad':       'Sad',          'mood.sadDesc':     'Need a mood boost',
      'mood.pickBtn':   'Pick my cravings →',
      'mood.cravingH2': 'What are you craving?',
      'mood.cravingP':  "Pick ingredients or food styles — or type what you're thinking.",
      'mood.cravingPh': 'Type an ingredient or dish... (e.g. noodles, rice, chicken)',
      'mood.changeMood':'← Change mood',
      'mood.findFood':  '🍜 Find my food →',
      'mood.loaderText':'Matching your mood...',
      'mood.loaderSub': 'Searching nearby home cooks within 1 km',

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

      /* ── cook-profile.html ────────────────────── */
      'profile.navBack':         '← Home',
      'profile.notFound':        'Cook not found',
      'profile.notFoundSub':     "This cook profile doesn't exist or may have been removed. Browse other neighborhood cooks on our home page.",
      'profile.backToHome':      '← Back to home',
      'profile.within1km':       'within 1 km pickup',
      'profile.availablePickup': 'Available for pickup',
      'profile.aboutH3':         'About this cook',
      'profile.availableNowH3':  '🍽️ Available now',
      'profile.reviewsH3':       '⭐ Reviews',
      'profile.noReviews':       'No reviews yet — be the first to share your experience!',
      'profile.leaveReview':     'Leave a review',
      'profile.reviewPh':        'Share your experience with this cook…',
      'profile.submitReview':    'Submit review',
      'profile.pickupH3':        '📦 How pickup works',
      'profile.pickup1':         "Exact address and pickup instructions are shared only after you reserve — protecting the cook's privacy.",
      'profile.pickup2':         'Pay directly to the cook via PayNow, PayLah, or cash. CookNextDoor charges zero commission.',
      'profile.pickup3':         'After reserving, coordinate pickup time directly with the cook via chat or phone.',
      'profile.dashTitle':       '👨‍🍳 Your cook dashboard',
      'profile.addDish':         '🍽️ Add New Dish',
      'profile.editProfile':     '✏️ Edit profile',
      'profile.changePhoto':     '📷 Change profile photo',
      'profile.copyLink':        '🔗 Copy link',
      'profile.shareWA':         '💬 Share on WhatsApp',
      'profile.reserveWA':       '💬 Reserve via WhatsApp →',
      'profile.editDishTitle':   '✏️ Edit Dish',
      'profile.editDateLabel':   'Pickup date',
      'profile.editTimeLabel':   'Pickup time',
      'profile.editPortionsLabel':'Portions available',
      'profile.editPortionsPh':  'e.g. 2 portions',
      'profile.editPriceLabel':  'Price per portion',
      'profile.editPricePh':     'e.g. $4',
      'profile.saveChanges':     'Save changes',
      'profile.perPortion':      'per portion',
      'profile.portionsUnit':    'portions',
      'profile.perPortionShort': '/ portion',
      'profile.zeroComm':        'Zero commission · Pay directly via PayNow, PayLah or cash',
      'profile.reserveTitle':    'Reserve a pickup',
      'profile.reserveSub':      "Message this cook on WhatsApp to ask about availability, confirm your portion, and arrange a pickup time and spot. It's that simple — no middleman.",
      'profile.msgWA':           '💬 Message on WhatsApp',
      'profile.reserveFooter':   'Pay directly via PayNow, PayLah or cash — CookNextDoor takes zero commission.',
      'profile.newHere':         'New here? Create a free account →',
      'profile.appealTitle':     'Submit your explanation',
      'profile.appealPh':        'Explain the situation, what happened, and how you\'ll improve. Our team will review your response within 2–3 business days.',
      'profile.appealBtn':       '📨 Send explanation to admin',
      'profile.editBtn':         '✏️ Edit',
      'profile.removeBtn':       '🗑️ Remove',
      'profile.reserveWABtn':    '💬 Reserve via WhatsApp',
      'profile.removeConfirm':   'Remove this dish listing? It will no longer appear to neighbours.',
      'profile.removing':        '⏳ Removing…',
      'profile.removedOk':       '✅ Dish removed from listings.',
      'profile.removeFail':      '❌ Remove failed — try again.',
      'profile.saving':          'Saving…',
      'profile.savedOk':         '✅ Dish updated successfully.',
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

      /* ── Community & Social (index) ───────────── */
      'community.liveDefault': '每周都有新鲜家常菜上架',
      'community.h2':          '深受<span>街坊邻里</span>喜爱。',
      'community.sub':         '看看邻居们在做什么菜，了解运作方式，并关注我们获取每日家常菜灵感。',
      'community.watchLabel':  '▶ 观看短片',
      'community.reel1':       '认识 CookNextDoor',
      'community.reel2':       '食客指南',
      'community.reel3':       '厨师指南',
      'community.reelMore':    '更多请看 TikTok →',
      'community.followLabel': '✦ 关注社区',
      'community.fbSub':       '社区主页',
      'community.waSub':       '加入群聊',
      'community.cta':         '🍳 分享你的第一道菜 →',

      /* ── Invite & Earn (index + invite.js) ────── */
      'invite.tag':      '🎁 邀请赢徽章',
      'invite.h2':       '邀请邻居，<br/><span>赢取你的徽章。</span>',
      'invite.p':        'CookNextDoor 靠邻里一个个加入而成长。分享你的邀请链接——每邀请一位邻居，你的社区徽章就会升级，从 🌱 新人一路到 👑 创始邻居。',
      'invite.btn':      '🎁 邀请你的邻居 →',
      'invite.title':    '邀请你的邻居 🎁',
      'invite.sub':      '把 CookNextDoor 分享给附近的人。每邀请一位邻居，社区就会壮大——你的徽章也会升级。',
      'invite.copy':     '复制',
      'invite.share':    '📤 分享',
      'invite.welcomeT': '一位邻居邀请了你！',
      'invite.welcomeS': '发现 1 公里内的家常美食——免费浏览。',

      /* ── Leaderboard (index) ──────────────────── */
      'lb.tag':      '🏆 社区之星',
      'lb.h2':       '本周<span>顶尖厨师。</span>',
      'lb.sub':      '在你附近分享最多家常菜的邻居。保持每周连续上架，冲上排行榜 🔥',
      'lb.emptyT':   '排行榜正在等待第一位明星厨师',
      'lb.emptyS':   '成为你社区第一位上架菜品的厨师——抢占榜首。',
      'lb.emptyBtn': '🍳 开始烹饪 →',

      /* ── Trust journey (index) ────────────────── */
      'trust.tag': '🛡️ 信任如何建立',
      'trust.h2':  '从邻居的厨房，<br/><span style="color:#E3EF26;">到你的餐桌。</span>',
      'trust.sub': '五个简单步骤，让每一餐都安全、贴心、零佣金。',
      'trust.s1T': '认证邻居',
      'trust.s1D': '每位厨师都有公开主页，附社区评分与评价。',
      'trust.s2T': '卫生与过敏原',
      'trust.s2D': '良好的家庭卫生习惯，取餐前可随时咨询食材。',
      'trust.s3T': '一键预订',
      'trust.s3D': '即时预订您的份额——厨师会立刻收到通知。',
      'trust.s4T': '1公里内自取',
      'trust.s4D': '步行取餐，新鲜到手。无外送员、无运费、无冷掉的饭菜。',
      'trust.s5T': '直接付款，开动',
      'trust.s5D': 'PayNow、PayLah或现金——每一分钱都归邻居所有。',

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

      'index.sticker1':     '✦ 0% 佣金',
      'index.sticker2':     '📍 1公里内',
      'index.sticker3':     '🤝 自取',
      'index.ficLabel1':    '印度香饭',
      'index.ficLabel2':    '新加坡叻沙',
      'index.marq1':        '零佣金',
      'index.marq2':        '家常烹饪',
      'index.marq3':        '仅限自取',
      'index.marq4':        '超本地 1公里',
      'index.marq5':        '真实邻居',
      'index.marq6':        '减少食物浪费',
      'index.marq7':        'PayNow & PayLah',

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
      'mood.shareTitle':      '📸 分享你的食物心情',
      'mood.shareSub':        '把你的配对发到动态，或发给朋友——看看他们的食物心情是什么。',
      'mood.shareBtn':        '📤 分享我的结果',
      'mood.shareModalTitle': '分享你的食物心情 🎉',
      'mood.shareLoading':    '正在生成你的卡片…',
      'mood.shareNative':     '📤 分享',
      'mood.shareSave':       '⬇ 保存图片',
      'mood.shareCopy':       '🔗 复制链接',
      'mood.moodH2':    '选择您的<span>心情</span>',
      'mood.moodP':     '您现在感觉如何？',
      'mood.happy':     '开心',          'mood.happyDesc':   '心情好，正在庆祝',
      'mood.comfort':   '需要安慰',      'mood.comfortDesc': '难过、压力大、日子不好过',
      'mood.tired':     '疲惫',          'mood.tiredDesc':   '精力不足，需要补充能量',
      'mood.excited':   '兴奋',          'mood.excitedDesc': '想探索新事物，充满冒险精神',
      'mood.healthy':   '健康',          'mood.healthyDesc': '运动后，想吃得清淡健康',
      'mood.romantic':  '浪漫',          'mood.romanticDesc':'约会之夜，特别晚餐',
      'mood.spicy':     '想吃辣',        'mood.spicyDesc':   '想要刺激、浓烈的口味',
      'mood.sweet':     '嗜甜',          'mood.sweetDesc':   '甜品心情，想吃零食',
      'mood.curious':   '好奇',          'mood.curiousDesc': '对新事物保持开放',
      'mood.sad':       '难过',          'mood.sadDesc':     '需要改善心情',
      'mood.pickBtn':   '选好了，继续 →',
      'mood.cravingH2': '你想吃什么？',
      'mood.cravingP':  '选择食材或口味风格——或直接输入你的想法。',
      'mood.cravingPh': '输入食材或菜名...（例如：面条、米饭、鸡肉）',
      'mood.changeMood':'← 重新选择心情',
      'mood.findFood':  '🍜 找到我的美食 →',
      'mood.loaderText':'正在匹配你的心情...',
      'mood.loaderSub': '正在搜索1公里内的家庭厨师',

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

      /* ── cook-profile.html ────────────────────── */
      'profile.navBack':         '← 首页',
      'profile.notFound':        '未找到厨师',
      'profile.notFoundSub':     '此厨师档案不存在或已被删除。在我们的主页浏览其他邻居厨师。',
      'profile.backToHome':      '← 返回首页',
      'profile.within1km':       '1公里内自取',
      'profile.availablePickup': '可自取',
      'profile.aboutH3':         '关于这位厨师',
      'profile.availableNowH3':  '🍽️ 现在可取',
      'profile.reviewsH3':       '⭐ 评价',
      'profile.noReviews':       '暂无评价 — 成为第一个分享体验的人！',
      'profile.leaveReview':     '留下评价',
      'profile.reviewPh':        '分享您与这位厨师的体验…',
      'profile.submitReview':    '提交评价',
      'profile.pickupH3':        '📦 如何自取',
      'profile.pickup1':         '预订后才会分享确切地址和取餐说明 — 保护厨师的隐私。',
      'profile.pickup2':         '通过PayNow、PayLah或现金直接支付给厨师。CookNextDoor零佣金。',
      'profile.pickup3':         '预订后，直接通过聊天或电话与厨师协调取餐时间。',
      'profile.dashTitle':       '👨‍🍳 您的厨师控制台',
      'profile.addDish':         '🍽️ 添加新菜肴',
      'profile.editProfile':     '✏️ 编辑资料',
      'profile.changePhoto':     '📷 更换头像',
      'profile.copyLink':        '🔗 复制链接',
      'profile.shareWA':         '💬 分享到WhatsApp',
      'profile.reserveWA':       '💬 通过WhatsApp预约 →',
      'profile.editDishTitle':   '✏️ 编辑菜肴',
      'profile.editDateLabel':   '取餐日期',
      'profile.editTimeLabel':   '取餐时间',
      'profile.editPortionsLabel':'可用份数',
      'profile.editPortionsPh':  '例：2份',
      'profile.editPriceLabel':  '每份价格',
      'profile.editPricePh':     '例：$4',
      'profile.saveChanges':     '保存更改',
      'profile.perPortion':      '每份',
      'profile.portionsUnit':    '份',
      'profile.perPortionShort': '/ 份',
      'profile.zeroComm':        '零佣金 · 直接通过PayNow、PayLah或现金支付',
      'profile.reserveTitle':    '预约取餐',
      'profile.reserveSub':      '在WhatsApp上联系这位厨师，询问是否有空，确认份数，安排取餐时间和地点。就这么简单 — 没有中间商。',
      'profile.msgWA':           '💬 发WhatsApp消息',
      'profile.reserveFooter':   '直接通过PayNow、PayLah或现金支付 — CookNextDoor零佣金。',
      'profile.newHere':         '新用户？创建免费账号 →',
      'profile.appealTitle':     '提交您的说明',
      'profile.appealPh':        '请说明情况、发生了什么以及您将如何改进。我们的团队将在2-3个工作日内审核您的回复。',
      'profile.appealBtn':       '📨 发送说明给管理员',
      'profile.editBtn':         '✏️ 编辑',
      'profile.removeBtn':       '🗑️ 删除',
      'profile.reserveWABtn':    '💬 WhatsApp预约',
      'profile.removeConfirm':   '删除此菜肴列表？它将不再显示给邻居。',
      'profile.removing':        '⏳ 删除中…',
      'profile.removedOk':       '✅ 菜肴已从列表中删除。',
      'profile.removeFail':      '❌ 删除失败 — 请重试。',
      'profile.saving':          '保存中…',
      'profile.savedOk':         '✅ 菜肴更新成功。',
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
