/**
 * Line Breakdown Extractor
 *
 * 指定セクション内のテキストブロック（h2/h3/p）について、ブラウザ実レンダリングの
 * 「視覚的な行」を Range API で抽出し、行ごとの文字列＋文字数を出力する。
 *
 * 目的: 改行（明示改行 + 自然な折り返し）の実装結果を一覧化し、Figma スクショとの
 * 目視照合を高速化する。pp:compare（幾何の数値ゲート）では拾えない「行の割れ方」を可視化する。
 *
 * 使い方:
 *   npm run pp:lines -- --section work-detail \
 *     --selector '[data-section="work-detail"]' \
 *     --url http://localhost:3100/works/care-go
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUTPUT_DIR = join(__dirname, '..', 'output');

function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (key: string): string | undefined => {
    const idx = argv.indexOf(`--${key}`);
    return idx === -1 ? undefined : argv[idx + 1];
  };
  return {
    section: get('section') ?? 'hero',
    selector: get('selector'),
    url: get('url') ?? 'http://localhost:3000',
    width: Number(get('width') ?? 1920),
    output: get('output'),
  };
}

type Block = { tag: string; cls: string; lines: { text: string; chars: number }[] };

// ブラウザ内で評価するソース（文字列で渡す＝tsx/esbuild の関数変換による __name 注入を回避）。
// window.__PP_SEL__ のセレクタ配下の h2/h3/p について、文字ごとの矩形 top で視覚行をグルーピングする。
const EXTRACTOR_SRC = `(() => {
  const sel = window.__PP_SEL__;
  const root = document.querySelector(sel);
  if (!root) return { error: 'not found: ' + sel, blocks: [] };

  function localClass(el) {
    const list = Array.prototype.slice.call(el.classList);
    for (let i = 0; i < list.length; i++) {
      const c = list[i];
      const t = c.match(/-module-scss-module__[A-Za-z0-9_-]+__([A-Za-z0-9_-]+)$/);
      if (t) return t[1];
      const w = c.match(/^[A-Za-z0-9]+_([A-Za-z0-9]+)__[A-Za-z0-9_-]+$/);
      if (w) return w[1];
    }
    return el.classList[0] || '';
  }

  function visualLines(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    const lines = [];
    let curTop = null;
    let cur = '';
    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';
      for (let i = 0; i < text.length; i++) {
        const range = document.createRange();
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const r = range.getClientRects()[0];
        if (!r) { cur += text[i]; continue; }
        const top = Math.round(r.top);
        if (curTop === null) curTop = top;
        if (Math.abs(top - curTop) > 3) { lines.push(cur); cur = ''; curTop = top; }
        cur += text[i];
      }
    }
    if (cur) lines.push(cur);
    return lines
      .map(function (t) { return t.replace(/\\s+$/, ''); })
      .filter(function (t) { return t.length > 0; })
      .map(function (t) { return { text: t, chars: Array.from(t).length }; });
  }

  const blocks = [];
  const els = root.querySelectorAll('h2, h3, p');
  els.forEach(function (el) {
    const txt = (el.textContent || '').trim();
    if (!txt) return;
    blocks.push({ tag: el.tagName.toLowerCase(), cls: localClass(el), lines: visualLines(el) });
  });
  return { blocks: blocks };
})()`;

function buildReport(section: string, url: string, width: number, blocks: Block[]): string {
  const out: string[] = [];
  out.push(`# Line Breakdown — \`${section}\``);
  out.push('');
  out.push(`- **URL**: ${url}`);
  out.push(`- **Viewport**: ${width}px（PC レイアウト基準）`);
  out.push(`- **Blocks**: ${blocks.length}`);
  out.push('');
  out.push('> 各ブロックの「実装での視覚行」を行ごとに表示（L<n>(文字数): 行テキスト）。');
  out.push('> Figma スクショと「行の割れ方」を突き合わせる用。pp:compare（幾何）では拾えない改行の可視化。');
  out.push('');
  blocks.forEach((b, i) => {
    out.push(`## ${i + 1}. \`${b.cls || b.tag}\` (${b.lines.length}行)`);
    b.lines.forEach((l, j) => {
      out.push(`- L${j + 1}(${l.chars}字): ${l.text}`);
    });
    out.push('');
  });
  return out.join('\n');
}

async function main() {
  const args = parseArgs();
  const selector = args.selector ?? `section[data-section="${args.section}"]`;
  console.log(`[lines] section=${args.section} selector=${selector} url=${args.url} width=${args.width}`);

  const browser = await chromium.launch({ args: ['--font-render-hinting=none'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: args.width, height: 1080 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(args.url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page
      .waitForFunction(() => !/[0-9]+\s*%/.test(document.body.innerText), { timeout: 20000 })
      .catch(() => {});
    const H = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y <= H; y += 600) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(40);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    const exists = await page.evaluate((s) => Boolean(document.querySelector(s)), selector);
    if (!exists) throw new Error(`selector not found: ${selector}`);
    await page.evaluate((s) => ((window as unknown as { __PP_SEL__: string }).__PP_SEL__ = s), selector);

    const result = (await page.evaluate(EXTRACTOR_SRC)) as { error?: string; blocks: Block[] };
    if (result.error) throw new Error(result.error);
    const blocks = result.blocks;

    const report = buildReport(args.section, args.url, args.width, blocks);
    const outPath = args.output ?? join(DEFAULT_OUTPUT_DIR, `lines-${args.section}.md`);
    if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, report, 'utf-8');

    console.log(`[lines] ✓ ${blocks.length} blocks, ${blocks.reduce((s, b) => s + b.lines.length, 0)} lines`);
    console.log(`[lines] ✓ output: ${outPath}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[lines] ✗ error:', err.message);
  process.exit(1);
});
