/**
 * download_food_mood_images.js
 * Creates food_mood_images/ folder, copies from food_images/ where available,
 * and downloads missing images from Wikipedia (with rate-limit delay).
 */
const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

const DEST = path.join(__dirname, 'food_mood_images');
const SRC  = path.join(__dirname, 'food_images');

if (!fs.existsSync(DEST)) fs.mkdirSync(DEST);

const COPY_MAP = [
  'bak-kut-teh.jpg','bento.jpg','biryani.jpg','butter-prawns.jpg',
  'char-kway-teow.jpg','chicken-rice.jpg','chicken-soup.jpg','chocolate-lava.jpg',
  'congee.jpg','egg-tart.jpg','fishball-noodle.jpg','fish-head-curry.jpg',
  'kaya-toast.jpg','kueh-lapis.jpg','laksa.jpg','mee-rebus.jpg','mee-soto.jpg',
  'murtabak.jpg','nasi-lemak.jpg','nonya-kueh.jpg','ondeh-ondeh.jpg','otak-otak.jpg',
  'pandan-cake.jpg','papaya-salad.jpg','popiah.jpg','prawn-mee.jpg','rendang.jpg',
  'roti-john.jpg','satay.jpg','tau-huey.jpg','thosai.jpg','tom-yum.jpg','yong-tau-foo.jpg',
];

const DOWNLOAD_MAP = [
  { file: 'wonton-mee.jpg',    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Wonton_noodle_soup.jpg/800px-Wonton_noodle_soup.jpg' },
  { file: 'economic-rice.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Economic_bee_hoon_with_vegetables.jpg/800px-Economic_bee_hoon_with_vegetables.jpg' },
  { file: 'falafel.jpg',       url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Falafels_2.jpg/800px-Falafels_2.jpg' },
  { file: 'sushi.jpg',         url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Sushi_platter.jpg/800px-Sushi_platter.jpg' },
  { file: 'kimchi-jjigae.jpg', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Kimchi_jjigae.jpg/800px-Kimchi_jjigae.jpg' },
  { file: 'quinoa-bowl.jpg',   url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Vegan_Quinoa_Bowl_%2844040185371%29.jpg/800px-Vegan_Quinoa_Bowl_%2844040185371%29.jpg' },
  { file: 'carbonara.jpg',     url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/800px-Espaguetis_carbonara.jpg' },
  { file: 'steamed-fish.jpg',  url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Steamed_fish.jpg/800px-Steamed_fish.jpg' },
  { file: 'mala.jpg',          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mala_hot_pot.jpg/800px-Mala_hot_pot.jpg' },
  { file: 'devil-curry.jpg',   url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Curry_devil.jpg/800px-Curry_devil.jpg' },
  { file: 'chendol.jpg',       url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Chendol_%28Chinese_style%29.jpg/800px-Chendol_%28Chinese_style%29.jpg' },
  { file: 'sayur-lodeh.jpg',   url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Lodeh.jpg/800px-Lodeh.jpg' },
];

// Copy existing
COPY_MAP.forEach(name => {
  const src  = path.join(SRC, name);
  const dest = path.join(DEST, name);
  if (!fs.existsSync(dest) && fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✓ Copied  ${name}`);
  } else if (fs.existsSync(dest)) {
    console.log(`↩ Already exists ${name}`);
  } else {
    console.warn(`⚠ Missing in food_images: ${name}`);
  }
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

function downloadFile(url, dest, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    const file = fs.createWriteStream(dest);
    const get  = url.startsWith('https') ? https : http;
    const req  = get.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 CookNextDoor/1.0',
        'Accept': 'image/webp,image/apng,image/*,*/*',
        'Referer': 'https://en.wikipedia.org/'
      }
    }, res => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
        file.close();
        try { fs.unlinkSync(dest); } catch(e){}
        return downloadFile(res.headers.location, dest, redirectCount + 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch(e){}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
      file.on('error', err => { try { fs.unlinkSync(dest); } catch(e){} reject(err); });
    });
    req.on('error', err => { try { fs.unlinkSync(dest); } catch(e){} reject(err); });
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

(async () => {
  let ok = 0, fail = 0;
  for (const { file, url } of DOWNLOAD_MAP) {
    const dest = path.join(DEST, file);
    if (fs.existsSync(dest)) {
      console.log(`↩ Skipped (exists): ${file}`);
      ok++;
      continue;
    }
    try {
      await sleep(1500); // 1.5s between requests to avoid 429
      await downloadFile(url, dest);
      console.log(`✓ Downloaded ${file}`);
      ok++;
    } catch (e) {
      console.error(`✗ Failed ${file}: ${e.message}`);
      fail++;
    }
  }
  console.log(`\nDownloads: ${ok} ok, ${fail} failed`);
  console.log(`food_mood_images/ is ready.`);
})();
