import { chromium } from 'playwright';

const URL = 'http://localhost:3000/';
const OUT = 'scripts/footer-check.png';

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);

const footer = page.locator('footer').first();
await footer.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);

const box = await footer.boundingBox();
console.log('footer box', box);

// Detailed metrics
const metrics = await page.evaluate(() => {
  const f = document.querySelector('footer');
  const r = f.getBoundingClientRect();
  const btn = f.querySelector('a[href="/contact"]');
  const btnR = btn.getBoundingClientRect();
  const logo = f.querySelector('img[alt*="アリガトサン"]');
  const logoR = logo ? logo.getBoundingClientRect() : null;
  const title = f.querySelector('h3');
  const titleR = title ? title.getBoundingClientRect() : null;
  const imgs = [...f.querySelectorAll('img')].filter(i => !i.alt.includes('アリガトサン')).map(i => ({alt: i.alt, ...i.getBoundingClientRect().toJSON()}));
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    footer: { top: r.top + window.scrollY, height: r.height },
    button: {
      top_in_footer: btnR.top - r.top,
      center_x: btnR.left + btnR.width / 2,
      dx_from_center: (btnR.left + btnR.width / 2) - window.innerWidth / 2,
      width: btnR.width,
      height: btnR.height,
    },
    logo: logoR ? { top_in_footer: logoR.top - r.top, height: logoR.height } : null,
    title: titleR ? { top_in_footer: titleR.top - r.top } : null,
    project_images: imgs.map(i => ({alt: i.alt, top_in_footer: i.top - r.top, height: i.height})),
  };
});
console.log(JSON.stringify(metrics, null, 2));

await footer.screenshot({ path: OUT });
console.log('saved', OUT);

// Center vertical guide line + horizontal markers for visual reference
const annotated = 'scripts/footer-check-annotated.png';
await page.evaluate(() => {
  const f = document.querySelector('footer');
  if (!f) return;
  const r = f.getBoundingClientRect();
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:absolute;left:0;top:${window.scrollY + r.top}px;width:100%;height:${r.height}px;pointer-events:none;z-index:99999;`;
  // center vertical line (red)
  const v = document.createElement('div');
  v.style.cssText = `position:absolute;left:50%;top:0;width:1px;height:100%;background:rgba(255,0,0,0.7);`;
  overlay.appendChild(v);
  // Contact button center horizontal & vertical highlight
  const btn = f.querySelector('a[href="/contact"]');
  if (btn) {
    const br = btn.getBoundingClientRect();
    const cx = br.left + br.width / 2;
    const cy = br.top + br.height / 2;
    const hh = document.createElement('div');
    hh.style.cssText = `position:absolute;left:0;top:${cy - r.top}px;width:100%;height:1px;background:rgba(0,128,255,0.7);`;
    overlay.appendChild(hh);
    const vv = document.createElement('div');
    vv.style.cssText = `position:absolute;left:${cx}px;top:0;width:1px;height:100%;background:rgba(0,128,255,0.7);`;
    overlay.appendChild(vv);
    const tag = document.createElement('div');
    tag.style.cssText = `position:absolute;left:${cx + 8}px;top:${cy - r.top - 24}px;background:#000;color:#fff;font:12px/1.4 monospace;padding:2px 6px;`;
    tag.textContent = `btn center=(${cx.toFixed(1)}, ${cy.toFixed(1)})  viewport_center_x=${(window.innerWidth/2).toFixed(1)}  dx=${(cx - window.innerWidth/2).toFixed(1)}`;
    overlay.appendChild(tag);
  }
  document.body.appendChild(overlay);
});
await page.waitForTimeout(300);
await footer.screenshot({ path: annotated });
console.log('saved', annotated);

await browser.close();
