const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function run() {
  const OUT = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Load live site
  await page.goto('https://cooknextdoor.org', { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for chatbot toggle to appear (fade-in delay is 0.5s)
  await new Promise(r => setTimeout(r, 1200));

  // Click the toggle button to open the chat window
  await page.click('#cnd-chatbot-toggle');

  // Wait for open animation to complete
  await new Promise(r => setTimeout(r, 500));

  // Screenshot: full viewport showing chatbot open
  await page.screenshot({
    path: path.join(OUT, 'chatbot-open.png'),
    fullPage: false,
  });
  console.log('Saved: screenshots/chatbot-open.png');

  // Screenshot: just the chatbot window cropped
  const win = await page.$('#cnd-chatbot-window');
  if (win) {
    await win.screenshot({ path: path.join(OUT, 'chatbot-widget.png') });
    console.log('Saved: screenshots/chatbot-widget.png');
  }

  await browser.close();
}

run().catch(e => { console.error(e.message); process.exit(1); });
