import { chromium } from 'playwright';

const URL = 'http://localhost:3000/';
const widths = [320, 375, 390, 500, 600, 768, 900, 1023, 1024, 1100, 1200, 1440, 1920];

const browser = await chromium.launch();

for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const m = await page.evaluate(() => {
      const f = document.querySelector('footer');
      const r = f.getBoundingClientRect();
      const btn = f.querySelector('a[href="/contact"]');
      const br = btn.getBoundingClientRect();
      const cs = getComputedStyle(btn);
      const area = btn.parentElement;
      const ar = area.getBoundingClientRect();
      const acs = getComputedStyle(area);
      return {
        viewport_w: window.innerWidth,
        footer: { left: r.left, width: r.width },
        contactArea: {
          left: ar.left,
          width: ar.width,
          paddingLeft: acs.paddingLeft,
          paddingRight: acs.paddingRight,
          paddingTop: acs.paddingTop,
        },
        button: {
          left: br.left,
          width: br.width,
          height: br.height,
          centerX: br.left + br.width / 2,
          dx_from_viewport_center: (br.left + br.width / 2) - window.innerWidth / 2,
          transform: cs.transform,
          fontSize: cs.fontSize,
          maxWidth: cs.maxWidth,
        },
        overflowsFooter: br.right > r.right || br.left < r.left,
      };
    });
    console.log(`vw=${w}`, JSON.stringify(m));
    await footer.screenshot({ path: `scripts/footer-${w}.png` });
  } catch (e) {
    console.error(`vw=${w} ERR`, e.message);
  } finally {
    await ctx.close();
  }
}

await browser.close();
