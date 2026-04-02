/**
 * tools/fetch_news.js
 * Fetches Singapore & Malaysia home-cook / food-charity news via
 * Google News RSS (free, no API key needed) and saves results to
 * news-data.json at the project root.
 *
 * Run manually:   node tools/fetch_news.js
 * Scheduled:      set up via Claude Code scheduler (every 2–3 days)
 */

const https  = require('https');
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const { execSync } = require('child_process');

const OUT = path.join(__dirname, '..', 'news-data.json');

/* ── Search queries ─────────────────────────────────────── */
const QUERIES = [
  { q: 'Singapore "home cook" OR "home-based food" business',  cat: 'business',  region: 'SG' },
  { q: 'Singapore "home baker" OR "home chef" food',           cat: 'business',  region: 'SG' },
  { q: 'Malaysia "home cook" OR "home-based food" business',   cat: 'business',  region: 'MY' },
  { q: 'Singapore food charity community meal neighbour',       cat: 'charity',   region: 'SG' },
  { q: 'Malaysia food charity community cook donate',          cat: 'charity',   region: 'MY' },
  { q: 'Singapore hawker food culture heritage home recipe',   cat: 'culture',   region: 'SG' },
];

/* ── Helpers ────────────────────────────────────────────── */
function buildRssUrl(query, region) {
  const ceid   = region === 'MY' ? 'MY:en' : 'SG:en';
  const gl     = region === 'MY' ? 'MY' : 'SG';
  const params = new URLSearchParams({ q: query, hl: 'en', gl, ceid });
  return `https://news.google.com/rss/search?${params}`;
}

function fetchUrl(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 8) return reject(new Error('Too many redirects'));
    const get = url.startsWith('https') ? https : http;
    const req = get.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      }
    }, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
        // Must consume the redirect response body before following
        res.resume();
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return fetchUrl(loc, redirectCount + 1).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

/* ── RSS parser (no deps) ───────────────────────────────── */
function decodeHtml(s) {
  return s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
          .replace(/&#39;/g,"'").replace(/&apos;/g,"'").replace(/&quot;/g,'"')
          .replace(/&#(\d+);/g, (_,n) => String.fromCharCode(n));
}

function parseRSS(xml) {
  const items = [];
  const itemRx = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const block = m[1];

    const getTag = (tag) => {
      // Handles both plain text and CDATA sections
      const r = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
      const t = r.exec(block);
      return t ? t[1].trim() : '';
    };
    const getAttr = (tag, attr) => {
      const r = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
      const t = r.exec(block);
      return t ? t[1].trim() : '';
    };

    const title   = decodeHtml(getTag('title'));
    // Google News RSS puts URL inside <link> but after a text node; try guid too
    const link    = getTag('link') || getTag('guid') || getAttr('link','href');
    const pubDate = getTag('pubDate');

    // Source: Google News puts it in <source> tag OR as text in description's <font>
    let source = getTag('source');
    if (!source) {
      const fontM = /<font[^>]*>([^<]+)<\/font>/.exec(block);
      if (fontM) source = fontM[1].trim();
    }

    // Description: strip HTML tags, decode entities
    const desc = decodeHtml(getTag('description').replace(/<[^>]+>/g, ' ').replace(/\s+/g,' ')).trim().slice(0, 220);

    if (title && link) {
      items.push({ title, link, pubDate, source, desc });
    }
  }
  return items;
}

/* ── Dedup & clean ─────────────────────────────────────── */
function makeId(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
}

function isRelevant(title, desc) {
  const text = (title + ' ' + desc).toLowerCase();
  const MUST = ['cook','food','bake','meal','recipe','hawker','home-based','chef','kitchen','eat','culinary'];
  const BAD  = ['stock market','forex','property','real estate','car ','motor','travel','visa','covid','vaccine'];
  const hasMust = MUST.some(w => text.includes(w));
  const hasBad  = BAD.some(w => text.includes(w));
  return hasMust && !hasBad;
}

/* ── Main ───────────────────────────────────────────────── */
async function main() {
  console.log('🍳 CookNextDoor News Fetcher starting...\n');

  // Load existing data (to preserve articles not re-fetched)
  let existing = { lastUpdated: null, articles: [] };
  if (fs.existsSync(OUT)) {
    try { existing = JSON.parse(fs.readFileSync(OUT, 'utf8')); }
    catch(e) { console.warn('Could not parse existing news-data.json, starting fresh.'); }
  }
  const existingIds = new Set(existing.articles.map(a => a.id));

  const newArticles = [];
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  for (const { q, cat, region } of QUERIES) {
    const url = buildRssUrl(q, region);
    console.log(`📡 Fetching [${region}/${cat}]: ${q.slice(0,50)}...`);
    try {
      await sleep(800); // be polite to Google News
      const { status, body } = await fetchUrl(url);
      if (status !== 200) { console.warn(`   ↳ HTTP ${status}, skipping`); continue; }

      const items = parseRSS(body);
      console.log(`   ↳ Found ${items.length} items`);

      for (const item of items.slice(0, 6)) {
        const id = makeId(item.title);
        if (existingIds.has(id)) continue; // already have it
        if (!isRelevant(item.title, item.desc)) continue;

        // Parse date
        let isoDate = new Date().toISOString();
        try { isoDate = new Date(item.pubDate).toISOString(); } catch(e){}

        newArticles.push({
          id,
          title:       item.title,
          url:         item.link,
          source:      item.source || 'News',
          publishedAt: isoDate,
          summary:     item.desc || '',
          category:    cat,
          region,
          postedToFB:  false,
        });
        existingIds.add(id);
      }
    } catch(e) {
      console.warn(`   ↳ Error: ${e.message}`);
    }
  }

  // Merge: new articles first, then existing, keep max 60
  const merged = [
    ...newArticles,
    ...existing.articles,
  ].slice(0, 60);

  const output = {
    lastUpdated: new Date().toISOString(),
    totalArticles: merged.length,
    newThisRun: newArticles.length,
    articles: merged,
  };

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! ${newArticles.length} new articles added. Total: ${merged.length}`);
  console.log(`📄 Saved to: news-data.json`);

  if (newArticles.length > 0) {
    console.log('\n🆕 New articles:');
    newArticles.forEach(a => console.log(`   • [${a.region}/${a.category}] ${a.title.slice(0,70)}`));
  }

  // Auto-push to GitHub so cooknextdoor.org gets the fresh news
  if (newArticles.length > 0) {
    try {
      const ROOT = path.join(__dirname, '..');
      execSync('git add news-data.json', { cwd: ROOT, stdio: 'pipe' });
      const date = new Date().toLocaleDateString('en-SG', { day:'numeric', month:'short', year:'numeric' });
      execSync(`git commit -m "news: auto-update ${newArticles.length} new articles (${date})"`, { cwd: ROOT, stdio: 'pipe' });
      execSync('git push origin main', { cwd: ROOT, stdio: 'pipe' });
      console.log(`🚀 Pushed to GitHub — cooknextdoor.org will update in ~30 seconds`);
    } catch(e) {
      console.warn(`⚠️  Git push skipped: ${e.message.split('\n')[0]}`);
    }
  }
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
