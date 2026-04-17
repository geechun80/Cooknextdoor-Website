const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const outputDir = path.join(__dirname, 'food_images');

// Direct image URLs found from Commons search - try with Puppeteer's real browser headers
const targets = [
  { key: 'char-kway-teow', url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Wikimania_2023-Food-Char_Kway_Teow.jpg' },
  { key: 'chocolate-lava',  url: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Choco_lava_cake_and_chocolate_gelato_with_chocolate_sauce.jpg' },
  { key: 'egg-tart',        url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Chocolate_egg_tart.jpg' },
  { key: 'mee-rebus',       url: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Mee_Rebus_by_Banej%2C_Singapore_October_2017.jpg' },
  { key: 'mee-soto',        url: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Soto_Mie_Bogor_2.JPG' },
  { key: 'nonya-kueh',      url: 'https://upload.wikimedia.org/wikipedia/commons/3/37/Nonya_kueh.jpg' },
  { key: 'ondeh-ondeh',     url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Ondeh_ondeh_kueh.jpg' },
  { key: 'rendang',         url: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Randang_Jariang_2.jpg' },
];

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const item of targets) {
    const dest = path.join(outputDir, `${item.key}.jpg`);
    const existingSize = fs.existsSync(dest) ? fs.statSync(dest).size : 0;
    if (existingSize > 100000) {
      console.log(`✓ ${item.key}.jpg already OK`);
      continue;
    }

    console.log(`Fetching ${item.key}...`);
    try {
      const response = await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
      const buffer = await response.buffer();

      if (buffer.length > 10000) {
        fs.writeFileSync(dest, buffer);
        console.log(`  ✓ ${item.key}.jpg saved (${buffer.length} bytes)`);
      } else {
        console.log(`  ✗ Too small: ${buffer.length} bytes`);
        // Try via the Commons article page instead
        const articleUrl = `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(path.basename(item.url))}`;
        console.log(`  Trying via article: ${articleUrl}`);
        await page.goto(articleUrl, { waitUntil: 'networkidle2', timeout: 20000 });

        // Find original file download link
        const imgSrc = await page.evaluate(() => {
          const fullMedia = document.querySelector('#file a img, .fullMedia a, .mw-filepage-resolutioninfo a');
          if (fullMedia) return fullMedia.closest('a')?.href || fullMedia.src;
          const origLink = document.querySelector('a.internal');
          return origLink?.href || null;
        });

        if (imgSrc) {
          const resp2 = await page.goto(imgSrc, { timeout: 30000 });
          const buf2 = await resp2.buffer();
          if (buf2.length > 10000) {
            fs.writeFileSync(dest, buf2);
            console.log(`  ✓ ${item.key}.jpg saved via article (${buf2.length} bytes)`);
          } else {
            console.log(`  ✗ Still too small: ${buf2.length}`);
          }
        }
      }
    } catch (e) {
      console.log(`  ✗ Error: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  await browser.close();

  // Final report
  console.log('\n=== Final Status ===');
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.jpg'));
  let ok = 0, fail = 0;
  files.forEach(f => {
    const size = fs.statSync(path.join(outputDir, f)).size;
    const good = size > 50000;
    if (!good) { console.log(`  ✗ ${f}: ${(size/1024).toFixed(0)}KB`); fail++; }
    else ok++;
  });
  console.log(`${ok} OK, ${fail} still failing`);
}

main().catch(console.error);
