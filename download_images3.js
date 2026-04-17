const https = require('https');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'food_images');

// Foods still needing images (those with <50KB or missing)
// Using alternative search terms and article titles
const foods = [
  { key: 'bento',          article: 'Bento', altFile: 'Bento_(5260528474).jpg' },
  { key: 'char-kway-teow', article: 'Char_kway_teow', altFile: 'Char_Kuey_Teow.jpg' },
  { key: 'chocolate-lava', article: 'Chocolate_lava_cake', altFile: 'Chocolate_molten_lava_cake.jpg' },
  { key: 'egg-tart',       article: 'Egg_tart', altFile: 'Egg_tarts_in_Hong_Kong.jpg' },
  { key: 'mee-rebus',      article: 'Mee_rebus', altFile: 'Mee_rebus_by_Banej.jpg' },
  { key: 'mee-soto',       article: 'Soto_mee', altFile: 'Soto_Mie.jpg' },
  { key: 'nonya-kueh',     article: 'Kuih', altFile: 'Nonya_kueh_4.jpg' },
  { key: 'ondeh-ondeh',    article: 'Klepon', altFile: 'Klepon_cut.jpg' },
  { key: 'rendang',        article: 'Rendang', altFile: 'Rendang_Padang.jpg' },
];

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'CookNextDoor/1.0 (educational project; contact: admin@example.com)' }
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        return httpsGet(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function searchCommonsForFood(query) {
  // Search Wikimedia Commons for images matching a food query
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query + ' food')}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url|size|mime&format=json`;
  try {
    const res = await httpsGet(url);
    const json = JSON.parse(res.body);
    if (!json.query?.pages) return null;

    const pages = Object.values(json.query.pages);
    // Filter to only JPEG/PNG images and pick the largest
    const valid = pages
      .filter(p => p.imageinfo && p.imageinfo[0].mime &&
                   (p.imageinfo[0].mime.includes('jpeg') || p.imageinfo[0].mime.includes('png')))
      .sort((a, b) => (b.imageinfo[0].size || 0) - (a.imageinfo[0].size || 0));

    return valid.length > 0 ? valid[0].imageinfo[0].url : null;
  } catch (e) {
    return null;
  }
}

async function getFileUrl(filename) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url&format=json&redirects=1`;
  try {
    const res = await httpsGet(url);
    const json = JSON.parse(res.body);
    const pages = Object.values(json.query.pages);
    return pages[0]?.imageinfo?.[0]?.url || null;
  } catch (e) {
    return null;
  }
}

// Alternative direct URLs to try for each food
const directUrls = {
  'bento':          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Spaghetti_bolognese_%28hozinja%29.jpg/1px-x.jpg',  // placeholder
  'char-kway-teow': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Char_kway_teow.jpg/1200px-Char_kway_teow.jpg',
  'chocolate-lava': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Chocolate_Fondant.jpg/1200px-Chocolate_Fondant.jpg',
  'egg-tart':       'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Egg_tart.jpg/1200px-Egg_tart.jpg',
  'mee-rebus':      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Mee_Rebus_by_Banej%2C_Singapore_October_2017.jpg/1200px-Mee_Rebus_by_Banej%2C_Singapore_October_2017.jpg',
  'mee-soto':       'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Soto_Mie_Bogor_2.JPG/1200px-Soto_Mie_Bogor_2.JPG',
  'nonya-kueh':     'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Nonya_kueh_4.jpg/1200px-Nonya_kueh_4.jpg',
  'ondeh-ondeh':    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Klepon_Khas_Tulungagung.jpg/1200px-Klepon_Khas_Tulungagung.jpg',
  'rendang':        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Rendang_daging_sapi_asli_Padang.JPG/1200px-Rendang_daging_sapi_asli_Padang.JPG',
};

function downloadBinary(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Referer': 'https://commons.wikimedia.org/',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      }
    }, (res) => {
      console.log(`    HTTP ${res.statusCode} Content-Type: ${res.headers['content-type']}`);
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

    if (existingSize > 100000) {
      console.log(`✓ ${food.key}.jpg OK (${existingSize} bytes)`);
      continue;
    }

    console.log(`\nProcessing: ${food.key}`);

    // Strategy 1: Try Commons search
    console.log(`  1. Searching Commons for "${food.key}"...`);
    let imgUrl = await searchCommonsForFood(food.key.replace(/-/g, ' '));

    if (imgUrl) {
      console.log(`     Found: ${imgUrl.substring(0, 80)}`);
    } else {
      // Strategy 2: Try the alt file
      if (food.altFile) {
        console.log(`  2. Trying alt file: ${food.altFile}`);
        imgUrl = await getFileUrl(food.altFile);
      }
    }

    if (imgUrl && !imgUrl.includes('.svg')) {
      try {
        const size = await downloadBinary(imgUrl, dest);
        if (size > 10000) {
          console.log(`  ✓ Saved ${food.key}.jpg (${size} bytes)`);
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
      } catch (e) {
        console.log(`  Download failed: ${e.message}`);
      }
    }

    console.log(`  → All strategies failed for ${food.key}`);
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n=== Final Status ===');
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg'));
  let ok = 0, fail = 0;
  files.forEach(f => {
    const size = fs.statSync(path.join(outputDir, f)).size;
    const good = size > 50000;
    if (!good) {
      console.log(`  ✗ ${f}: ${(size/1024).toFixed(0)}KB`);
      fail++;
    } else {
      ok++;
    }
  });
  console.log(`${ok} OK, ${fail} still failing`);
}

main().catch(console.error);
