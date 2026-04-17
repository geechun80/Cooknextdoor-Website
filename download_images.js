const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'food_images');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// Filenames to fetch from Wikimedia Commons
// Format: { key: 'local-filename', file: 'ExactFilenameOnCommons.jpg' }
const foods = [
  { key: 'biryani',        file: 'Hyderabadi_chicken_biryani.jpg' },
  { key: 'kueh-lapis',     file: 'Kue_Lapis.jpg' },
  { key: 'chicken-rice',   file: 'Hainanese_chicken_rice_-_Flickr_-_jules_stonesoup.jpg' },
  { key: 'bento',          file: 'Bento_box_2_small.jpg' },
  { key: 'yong-tau-foo',   file: 'Yong_Tau_Foo.jpg' },
  { key: 'egg-tart',       file: 'Egg_tart.jpg' },
  { key: 'rendang',        file: 'Rendang.jpg' },
  { key: 'ondeh-ondeh',    file: 'Ondeh_ondeh.jpg' },
  { key: 'chocolate-lava', file: 'Chocolate_lava_cake_cut_open.jpg' },
  { key: 'prawn-mee',      file: 'Prawn_mee_soup.jpg' },
  { key: 'mee-rebus',      file: 'Mee_rebus.jpg' },
  { key: 'nonya-kueh',     file: 'Nyonya_kueh_4.jpg' },
  { key: 'mee-soto',       file: 'Mee_Soto.jpg' },
  { key: 'fishball-noodle',file: 'Fishball_noodle.jpg' },
];

// Get image info from Wikimedia Commons API
async function getImageUrl(filename) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(filename);
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=File:${encoded}&prop=imageinfo&iiprop=url&format=json&redirects=1`;

    https.get(apiUrl, { headers: { 'User-Agent': 'CookNextDoor/1.0 (food image downloader)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const page = Object.values(pages)[0];
          if (page.imageinfo && page.imageinfo[0]) {
            resolve(page.imageinfo[0].url);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

// Download image from URL
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);

    const request = proto.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://en.wikipedia.org/',
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        downloadImage(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(dest);
        resolve(stats.size);
      });
    });
    request.on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
    file.on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  for (const food of foods) {
    const dest = path.join(outputDir, `${food.key}.jpg`);

    // Check if already downloaded successfully (>50KB)
    if (fs.existsSync(dest) && fs.statSync(dest).size > 50000) {
      console.log(`✓ ${food.key}.jpg already exists (${fs.statSync(dest).size} bytes)`);
      continue;
    }

    console.log(`Fetching URL for: ${food.file}`);
    const url = await getImageUrl(food.file);

    if (!url) {
      console.log(`  ✗ Could not find image for ${food.file}`);
      continue;
    }

    console.log(`  URL: ${url}`);

    try {
      const size = await downloadImage(url, dest);
      console.log(`  ✓ Downloaded ${food.key}.jpg (${size} bytes)`);
    } catch (err) {
      console.log(`  ✗ Failed: ${err.message}`);
    }

    // Small delay to be polite
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\nAll done! Checking results:');
  fs.readdirSync(outputDir).forEach(f => {
    const size = fs.statSync(path.join(outputDir, f)).size;
    const ok = size > 50000 ? '✓' : '✗';
    console.log(`  ${ok} ${f}: ${size} bytes`);
  });
}

main().catch(console.error);
