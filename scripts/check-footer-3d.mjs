import { chromium } from 'playwright';

const URL = 'http://localhost:3000/';
const widths = [375, 768, 1024, 1440];

const browser = await chromium.launch();

for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  try {
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    const m = await page.evaluate(() => {
      const f = document.querySelector('footer');
      const fr = f.getBoundingClientRect();
      // .sitCharacter container
      const sit = f.querySelector('canvas')?.parentElement;
      const sr = sit?.getBoundingClientRect();
      const canvas = f.querySelector('canvas');
      const cr = canvas?.getBoundingClientRect();
      const cs = sit ? getComputedStyle(sit) : null;
      return {
        footer: { top_page: fr.top + window.scrollY, height: fr.height, width: fr.width },
        sitContainer: sr ? {
          top_in_footer: sr.top - fr.top,
          left_in_footer: sr.left - fr.left,
          width: sr.width,
          height: sr.height,
          computed_top: cs?.top,
          computed_marginLeft: cs?.marginLeft,
          computed_width: cs?.width,
          computed_height: cs?.height,
        } : null,
        canvas: cr ? {
          top_in_footer: cr.top - fr.top,
          left_in_footer: cr.left - fr.left,
          width: cr.width,
          height: cr.height,
        } : null,
        // 視覚的: contactArea (button) との位置関係
      };
    });
    console.log(`\n=== vw=${w} ===`);
    console.log(JSON.stringify(m, null, 2));

    // Overlay annotation to mark canvas boundaries
    await page.evaluate(() => {
      const f = document.querySelector('footer');
      const fr = f.getBoundingClientRect();
      const canvas = f.querySelector('canvas');
      if (!canvas) return;
      const cr = canvas.getBoundingClientRect();
      const overlay = document.createElement('div');
      overlay.style.cssText = `position:absolute;left:${cr.left}px;top:${window.scrollY + cr.top}px;width:${cr.width}px;height:${cr.height}px;border:2px dashed lime;pointer-events:none;z-index:99999;box-sizing:border-box;`;
      const tag = document.createElement('div');
      tag.style.cssText = `position:absolute;left:0;top:-22px;background:#000;color:lime;font:11px/1.4 monospace;padding:2px 6px;`;
      tag.textContent = `canvas ${Math.round(cr.width)}x${Math.round(cr.height)}`;
      overlay.appendChild(tag);
      document.body.appendChild(overlay);
    });
    await page.waitForTimeout(300);
    await footer.screenshot({ path: `scripts/footer-3d-${w}.png` });
  } catch (e) {
    console.error(`vw=${w} ERR`, e.message);
  } finally {
    await ctx.close();
  }
}

await browser.close();
