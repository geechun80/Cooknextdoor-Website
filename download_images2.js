const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'food_images');

// Map: local key → Wikipedia article title to extract first image from
const foods = [
  { key: 'biryani',         article: 'Biryani' },
  { key: 'chicken-rice',    article: 'Hainanese_chicken_rice' },
  { key: 'bento',           article: 'Bento' },
  { key: 'egg-tart',        article: 'Pastel_de_nata' },
  { key: 'rendang',         article: 'Rendang' },
  { key: 'ondeh-ondeh',     article: 'Klepon' },
  { key: 'chocolate-lava',  article: 'Chocolate_lava_cake' },
  { key: 'prawn-mee',       article: 'Prawn_noodles' },
  { key: 'mee-rebus',       article: 'Mee_rebus' },
  { key: 'nonya-kueh',      article: 'Kuih' },
  { key: 'mee-soto',        article: 'Soto_mie' },
  { key: 'fishball-noodle', article: 'Fish_ball' },
  { key: 'char-kway-teow',  article: 'Char_kway_teow' }, // re-download larger version
];

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'CookNextDoor/1.0 (educational food project)',
        ...headers
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return httpsGet(res.headers.location, headers).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    }).on('error', reject);
  });
}

async function getMainImageFromArticle(article) {
  // Use Wikipedia REST API to get page summary (includes thumbnail)
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(article)}`;
  try {
    const res = await httpsGet(url);
    if (res.status !== 200) return null;
    const json = JSON.parse(res.body);
    // originalimage has the full-res URL
    if (json.originalimage) return json.originalimage.source;
    if (json.thumbnail) return json.thumbnail.source.replace(/\/\d+px-/, '/800px-');
    return null;
  } catch (e) {
    return null;
  }
}

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://en.wikipedia.org/'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        return downloadBinary(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(fs.statSync(dest).size);
      });
    }).on('error', (e) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(e);
    });
  });
}

async function main() {
  for (const food of foods) {
    const dest = path.join(outputDir, `${food.key}.jpg`);
    const existingSize = fs.existsSync(dest) ? fs.statSync(dest).size : 0;

    // Only re-download if file is missing or too small (<100KB)
    if (existingSize > 100000) {
      console.log(`✓ ${food.key}.jpg already good (${existingSize} bytes)`);
      continue;
    }

    console.log(`Looking up: ${food.article}`);
    const imgUrl = await getMainImageFromArticle(food.article);

    if (!imgUrl) {
      console.log(`  ✗ No image found in article`);
      continue;
    }

    // Make sure it's a JPEG-compatible URL
    const dlUrl = imgUrl.includes('.svg') ? null : imgUrl;
    if (!dlUrl) {
      console.log(`  ✗ Image is SVG, skipping`);
      continue;
    }

    console.log(`  URL: ${dlUrl.substring(0, 90)}...`);
    try {
      const size = await downloadBinary(dlUrl, dest);
      console.log(`  ✓ ${food.key}.jpg saved (${size} bytes)`);
    } catch (e) {
      console.log(`  ✗ Download failed: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 400));
  }

  // Final report
  console.log('\n=== Final Status ===');
  const files = fs.readdirSync(outputDir);
  let ok = 0, fail = 0;
  files.forEach(f => {
    const size = fs.statSync(path.join(outputDir, f)).size;
    const good = size > 50000;
    console.log(`  ${good ? '✓' : '✗'} ${f}: ${(size/1024).toFixed(0)}KB`);
    good ? ok++ : fail++;
  });
  console.log(`\n${ok} OK, ${fail} need fixing`);
}

main().catch(console.error);
