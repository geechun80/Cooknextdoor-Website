const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const OUT = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Load local file
  const localPath = 'file:///' + path.join(__dirname, 'index.html').replace(/\\/g, '/');
  await page.goto(localPath, { waitUntil: 'networkidle0', timeout: 15000 });

  // Wait for chatbot fade-in
  await new Promise(r => setTimeout(r, 1200));

  // Click toggle to open
  await page.click('#cnd-chatbot-toggle');
  await new Promise(r => setTimeout(r, 500));

  // Full viewport screenshot
  await page.screenshot({ path: path.join(OUT, 'chatbot-open-local.png'), fullPage: false });
  console.log('Saved: screenshots/chatbot-open-local.png');

  // Widget only
  const win = await page.$('#cnd-chatbot-window');
  if (win) {
    await win.screenshot({ path: path.join(OUT, 'chatbot-widget-local.png') });
    console.log('Saved: screenshots/chatbot-widget-local.png');
  }

  await browser.close();
}

run().catch(e => { console.error(e.message); process.exit(1); });
