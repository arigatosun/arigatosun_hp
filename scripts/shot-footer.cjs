// フッター3Dの前後比較用スクショ。usage: node shot-footer.cjs <url> <outPath>
const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2] || 'http://localhost:3000/contact';
  const out = process.argv[3] || 'shot.png';
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.goto(url, { waitUntil: 'load', timeout: 60000 });
  // フッターをマウントさせるため最下部までスクロール
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  // 3D の DL + 初回レンダリング待ち（rest pose 固定: マウス未操作で deadzone 内）
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  const footer = await page.$('footer');
  if (footer) await footer.screenshot({ path: out });
  else await page.screenshot({ path: out });
  console.log('saved', out);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
