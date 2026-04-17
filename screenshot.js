const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const URL = 'http://localhost:8080';
const OUT_DIR = path.join(__dirname, 'screenshots');

async function scrollToReveal(page) {
  // Scroll through the page gradually to trigger IntersectionObserver animations
  const height = await page.evaluate(() => document.body.scrollHeight);
  const step = 600;
  for (let y = 0; y < height; y += step) {
    await page.evaluate(pos => window.scrollTo(0, pos), y);
    await new Promise(r => setTimeout(r, 120));
  }
  // Scroll back to top for the screenshot
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 400));
}

async function takeScreenshots() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  const browser = await puppeteer.launch({ headless: 'new' });

  // ── Desktop full page ───────────────────────────────────
  console.log('📸 Taking desktop screenshot...');
  const desktop = await browser.newPage();
  await desktop.setViewport({ width: 1440, height: 900 });
  await desktop.goto(URL, { waitUntil: 'networkidle0' });
  await scrollToReveal(desktop);
  await desktop.screenshot({
    path: path.join(OUT_DIR, 'desktop-full.png'),
    fullPage: true,
  });
  console.log('✅ Desktop saved → screenshots/desktop-full.png');

  // ── Mobile full page ────────────────────────────────────
  console.log('📸 Taking mobile screenshot...');
  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 });
  await mobile.goto(URL, { waitUntil: 'networkidle0' });
  await scrollToReveal(mobile);
  await mobile.screenshot({
    path: path.join(OUT_DIR, 'mobile-full.png'),
    fullPage: true,
  });
  console.log('✅ Mobile saved  → screenshots/mobile-full.png');

  // ── Hero section only (viewport crop) ──────────────────
  console.log('📸 Taking hero screenshot...');
  const hero = await browser.newPage();
  await hero.setViewport({ width: 1440, height: 900 });
  await hero.goto(URL, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));
  await hero.screenshot({
    path: path.join(OUT_DIR, 'hero-section.png'),
    fullPage: false,
    clip: { x: 0, y: 0, width: 1440, height: 900 },
  });
  console.log('✅ Hero saved    → screenshots/hero-section.png');

  await browser.close();
  console.log('\n🎉 All screenshots done! Check the /screenshots folder.');
}

takeScreenshots().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
