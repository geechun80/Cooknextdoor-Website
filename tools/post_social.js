/**
 * tools/post_social.js
 * Reads news-data.json and posts new articles to:
 *   - Facebook Page (via Graph API)
 *
 * SETUP (one-time):
 *   1. Go to https://developers.facebook.com → create an App → get a Page Access Token
 *   2. Add to .env file:
 *        FB_PAGE_ACCESS_TOKEN=your_token_here
 *        FB_PAGE_ID=your_page_id_here
 *
 * Run: node tools/post_social.js
 *
 * The script only posts articles where postedToFB === false,
 * then marks them as postedToFB: true so they're never double-posted.
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

/* ── Load .env (simple parser, no deps) ── */
const ENV_PATH = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(ENV_PATH)) {
  fs.readFileSync(ENV_PATH, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_]+)\s*=\s*(.+)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g,'');
  });
}

const FB_TOKEN   = env.FB_PAGE_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN || '';
const FB_PAGE_ID = env.FB_PAGE_ID           || process.env.FB_PAGE_ID           || '';
const NEWS_FILE  = path.join(__dirname, '..', 'news-data.json');
const SITE_URL   = env.SITE_URL || 'https://cooknextdoor.com/news.html'; // update when live

/* ── Post caption generator ── */
function buildCaption(article) {
  const catEmoji = { business:'🏠', charity:'🤝', culture:'🍜' };
  const regionFlag = { SG:'🇸🇬', MY:'🇲🇾' };
  const emoji = catEmoji[article.category] || '📰';
  const flag  = regionFlag[article.region] || '';

  const lines = [
    `${emoji} ${flag} ${article.title}`,
    '',
    article.summary ? article.summary.slice(0, 180) + '...' : '',
    '',
    `🔗 Read more: ${article.url}`,
    '',
    '—',
    '🍳 CookNextDoor — hyperlocal home-cooked food, zero commission.',
    `📍 Find food near you: ${SITE_URL}`,
    '',
    '#CookNextDoor #HomeCook #HomeFood #SingaporeFood #MalaysiaFood #HomeBased #CommunityFood',
  ];

  return lines.filter((l,i) => !(l==='' && lines[i-1]==='') ).join('\n').trim();
}

/* ── Facebook Graph API post ── */
function postToFacebook(message, linkUrl) {
  return new Promise((resolve, reject) => {
    if (!FB_TOKEN || !FB_PAGE_ID) {
      return reject(new Error('FB_PAGE_ACCESS_TOKEN or FB_PAGE_ID not set in .env'));
    }

    const body = JSON.stringify({
      message,
      link: linkUrl,
      access_token: FB_TOKEN,
    });

    const req = https.request({
      hostname: 'graph.facebook.com',
      path:     `/v19.0/${FB_PAGE_ID}/feed`,
      method:   'POST',
      headers:  { 'Content-Type':'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.id) resolve(json.id);
          else reject(new Error(json.error?.message || 'Unknown FB error'));
        } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/* ── Main ── */
async function main() {
  if (!fs.existsSync(NEWS_FILE)) {
    console.error('❌ news-data.json not found. Run node tools/fetch_news.js first.');
    process.exit(1);
  }

  const data     = JSON.parse(fs.readFileSync(NEWS_FILE, 'utf8'));
  const unposted = (data.articles || []).filter(a => !a.postedToFB);

  console.log(`📢 CookNextDoor Social Poster`);
  console.log(`   Articles to post: ${unposted.length}\n`);

  if (unposted.length === 0) {
    console.log('✅ Nothing new to post. All articles already shared.');
    return;
  }

  if (!FB_TOKEN || !FB_PAGE_ID) {
    console.log('⚠️  Facebook credentials not configured.\n');
    console.log('   To enable posting, add these to your .env file:');
    console.log('     FB_PAGE_ACCESS_TOKEN=your_token');
    console.log('     FB_PAGE_ID=your_page_id\n');
    console.log('   Get your token at: https://developers.facebook.com\n');
    console.log('📋 Preview of what would be posted:\n');
    unposted.slice(0, 3).forEach((a, i) => {
      console.log(`── Post ${i+1} ────────────────────────────`);
      console.log(buildCaption(a));
      console.log('');
    });
    return;
  }

  // Post max 3 per run (avoid flooding followers)
  const batch = unposted.slice(0, 3);
  let posted = 0;

  for (const article of batch) {
    try {
      console.log(`📤 Posting: ${article.title.slice(0,60)}...`);
      const caption = buildCaption(article);
      const postId  = await postToFacebook(caption, article.url);
      console.log(`   ✅ Posted! FB post ID: ${postId}`);
      article.postedToFB = true;
      article.fbPostId   = postId;
      article.postedAt   = new Date().toISOString();
      posted++;
      // Pause 5s between posts
      await new Promise(r => setTimeout(r, 5000));
    } catch(e) {
      console.error(`   ❌ Failed: ${e.message}`);
    }
  }

  // Save updated data
  fs.writeFileSync(NEWS_FILE, JSON.stringify(data, null, 2));
  console.log(`\n✅ Done. Posted ${posted}/${batch.length} articles to Facebook.`);
  console.log(`   ${unposted.length - posted} articles still pending.`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
