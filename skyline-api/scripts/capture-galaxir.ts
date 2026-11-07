import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function capture() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const outPath = path.resolve(__dirname, '..', '..', 'assets', 'galaxir-preview.png');

  console.log('[Screenshot] Launching Chrome at:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,900'],
    defaultViewport: {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2, // Retina sharpness!
    },
  });

  try {
    const page = await browser.newPage();
    console.log('[Screenshot] Navigating to https://galaxir.vercel.app/ ...');
    await page.goto('https://galaxir.vercel.app/', { waitUntil: 'networkidle2', timeout: 30000 });

    console.log('[Screenshot] Page loaded. Waiting 7 seconds for intro animation to finish...');
    await new Promise((resolve) => setTimeout(resolve, 7000));

    console.log('[Screenshot] Capturing crisp portfolio view...');
    await page.screenshot({
      path: outPath,
      type: 'png',
    });

    console.log('[Screenshot] Successfully saved to:', outPath);
    const stats = fs.statSync(outPath);
    console.log(`[Screenshot] File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('[Screenshot] Error:', err);
  process.exit(1);
});
