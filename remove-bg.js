const { Jimp } = require('jimp');
const path = require('path');

const INPUT  = path.join(__dirname, 'brand_assets', 'Cook next door logo.png');
const OUTPUT = path.join(__dirname, 'brand_assets', 'logo.png');

// Tolerance: how close to white/cream a pixel must be to be removed (0–255)
const TOLERANCE = 30;

async function removeBg() {
  const img = await Jimp.read(INPUT);
  const { width, height, data } = img.bitmap;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r >= 255 - TOLERANCE && g >= 255 - TOLERANCE && b >= 255 - TOLERANCE) {
        data[idx + 3] = 0; // transparent
      }
    }
  }

  await img.write(OUTPUT);
  console.log('✅ Background removed → brand_assets/logo.png');
}

removeBg().catch(err => console.error('❌ Error:', err.message));
