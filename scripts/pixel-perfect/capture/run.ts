/**
 * Capture Agent
 *
 * Playwright で開発サーバーにアクセスし、指定セクション内の全要素について
 * - bounding rect
 * - computed style の主要プロパティ
 * - Next.js CSS Modules ハッシュからの元クラス名推定
 * を取得して JSON 出力する。
 *
 * 使い方:
 *   npm run pp:capture -- --section hero --url http://localhost:3000
 *
 * オプション:
 *   --section <name>      対象セクション名（出力ファイル名にも使用）
 *   --selector <css>      対象セクションのCSSセレクタ（省略時は section[data-section="<name>"]）
 *   --url <url>           対象URL（デフォルト: http://localhost:3000）
 *   --width <px>          ビューポート幅（デフォルト: 1920）
 *   --height <px>         ビューポート高さ（デフォルト: 1080）
 *   --output <path>       出力ファイルパス（省略時は output/snapshot-<section>.json）
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CaptureSnapshot, ElementSnapshot } from './types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const DEFAULT_OUTPUT_DIR = join(PROJECT_ROOT, 'scripts', 'pixel-perfect', 'output');

// ── 引数パース ────────────────────────────────────────────────────────────
function parseArgs(): {
  section: string;
  selector?: string;
  url: string;
  width: number;
  height: number;
  output?: string;
} {
  const argv = process.argv.slice(2);
  const get = (key: string): string | undefined => {
    const idx = argv.indexOf(`--${key}`);
    if (idx === -1) return undefined;
    return argv[idx + 1];
  };

  return {
    section: get('section') ?? 'hero',
    selector: get('selector'),
    url: get('url') ?? 'http://localhost:3000',
    width: Number(get('width') ?? 1920),
    height: Number(get('height') ?? 1080),
    output: get('output'),
  };
}

// ── Next.js / Turbopack CSS Modules ハッシュ名のパース ──────────────────────
// Turbopack の命名規約: <filename>-module-scss-module__<hash>__<localname>
// 例: page-module-scss-module__rcUngW__heroLogo → { module: "page.module.scss", className: "heroLogo" }
//
// Webpack時代の命名規約 (フォールバック): <filename>_<localname>__<hash>
// 例: page_heroLogo__abc123 → { module: "page.module.scss", className: "heroLogo" }
function parseNextCssModuleHash(className: string): { module: string; className: string } | null {
  // Turbopack: <name>-module-scss-module__<hash>__<className>
  const turbo = className.match(/^([A-Za-z0-9-]+)-module-scss-module__[A-Za-z0-9_-]+__([A-Za-z0-9_-]+)$/);
  if (turbo) {
    // <name> の "-" は元のファイル名にはない場合があるが、複数モジュール名があり得るのでそのまま
    return {
      module: `${turbo[1]}.module.scss`,
      className: turbo[2],
    };
  }
  // Webpack 時代の命名規約
  const webpack = className.match(/^([A-Za-z0-9]+)_([A-Za-z0-9]+)__[A-Za-z0-9_-]+$/);
  if (webpack) {
    return {
      module: `${webpack[1]}.module.scss`,
      className: webpack[2],
    };
  }
  return null;
}

// ── ブラウザ内で実行するスナップショット取得関数 ─────────────────────────
function buildBrowserSnapshotFunction() {
  return () => {
    const sectionSelector = (window as unknown as { __PP_SECTION_SELECTOR__: string }).__PP_SECTION_SELECTOR__;
    const root = document.querySelector(sectionSelector) as HTMLElement | null;
    if (!root) {
      return { error: `Section not found: ${sectionSelector}`, elements: [] };
    }

    // 対象セクション内の全要素を収集
    const all: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))];

    const elements: Array<Record<string, unknown>> = [];
    let id = 0;

    for (const el of all) {
      // canvas / R3F は除外（座標逆引き不可のため）
      if (el.tagName === 'CANVAS') continue;

      const rect = el.getBoundingClientRect();
      // 非表示要素はスキップ
      if (rect.width === 0 && rect.height === 0) continue;

      const cs = window.getComputedStyle(el);

      const classNames = Array.from(el.classList);
      const text = (el.textContent ?? '').trim().slice(0, 50);

      elements.push({
        id: id++,
        tag: el.tagName,
        classNames,
        rect: {
          x: Math.round(rect.x * 100) / 100,
          y: Math.round(rect.y * 100) / 100,
          width: Math.round(rect.width * 100) / 100,
          height: Math.round(rect.height * 100) / 100,
        },
        computed: {
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          marginTop: cs.marginTop,
          marginRight: cs.marginRight,
          marginBottom: cs.marginBottom,
          marginLeft: cs.marginLeft,
          paddingTop: cs.paddingTop,
          paddingRight: cs.paddingRight,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          width: cs.width,
          height: cs.height,
          display: cs.display,
          position: cs.position,
          transform: cs.transform,
          gap: cs.gap,
        },
        textPreview: text || undefined,
      });
    }

    return { elements };
  };
}

// ── メイン ─────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();
  const sectionSelector = args.selector ?? `section[data-section="${args.section}"]`;

  console.log(`[capture] section=${args.section}`);
  console.log(`[capture] selector=${sectionSelector}`);
  console.log(`[capture] url=${args.url}`);
  console.log(`[capture] viewport=${args.width}x${args.height}`);

  const browser = await chromium.launch({
    args: ['--font-render-hinting=none'],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: args.width, height: args.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // 対象URLにアクセス
    await page.goto(args.url, { waitUntil: 'networkidle', timeout: 60000 });

    // フォントロード完了を待つ（Adobe Fonts Typekit対策）
    await page.evaluate(() => document.fonts.ready);

    // GSAP/ScrollTrigger 強制停止（存在すれば）
    await page.evaluate(() => {
      const w = window as unknown as { gsap?: { globalTimeline?: { pause: () => void } } };
      if (w.gsap?.globalTimeline) {
        w.gsap.globalTimeline.pause();
      }
    });

    // 視覚的安定性のための追加待機
    await page.waitForTimeout(500);

    // 対象セクションが存在するか確認
    const exists = await page.evaluate((sel) => Boolean(document.querySelector(sel)), sectionSelector);
    if (!exists) {
      throw new Error(
        `Section selector not found in DOM: "${sectionSelector}". ` +
        `Try --selector "<css>" to specify manually.`,
      );
    }

    // セクションセレクタをページコンテキストに渡す
    await page.evaluate((sel) => {
      (window as unknown as { __PP_SECTION_SELECTOR__: string }).__PP_SECTION_SELECTOR__ = sel;
    }, sectionSelector);

    // スナップショット取得
    const result = await page.evaluate(buildBrowserSnapshotFunction());

    if ('error' in result && result.error) {
      throw new Error(result.error as string);
    }

    // Node.js 側でクラス名から元のCSSモジュール推定を付加
    const elements: ElementSnapshot[] = (result.elements as ElementSnapshot[]).map((el) => {
      const hints = el.classNames
        .map(parseNextCssModuleHash)
        .filter((h): h is { module: string; className: string } => h !== null);
      return {
        ...el,
        cssModuleHints: hints.map((h) => h.module),
        originalClassNames: hints.map((h) => h.className),
      };
    });

    const snapshot: CaptureSnapshot = {
      section: args.section,
      viewportWidth: args.width,
      viewportHeight: args.height,
      capturedAt: new Date().toISOString(),
      url: args.url,
      sectionSelector,
      elements,
    };

    // 出力
    const outputPath = args.output ?? join(DEFAULT_OUTPUT_DIR, `snapshot-${args.section}.json`);
    if (!existsSync(dirname(outputPath))) {
      mkdirSync(dirname(outputPath), { recursive: true });
    }
    writeFileSync(outputPath, JSON.stringify(snapshot, null, 2), 'utf-8');

    console.log(`[capture] ✓ ${elements.length} elements captured`);
    console.log(`[capture] ✓ output: ${outputPath}`);

    // 統計情報
    const withHints = elements.filter((e) => e.cssModuleHints.length > 0).length;
    console.log(`[capture] CSS Modules hints: ${withHints}/${elements.length} elements`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error('[capture] ✗ error:', err.message);
  process.exit(1);
});
