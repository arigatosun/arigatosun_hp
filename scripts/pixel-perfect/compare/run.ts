/**
 * Comparator / Reporter
 *
 * Capture Agent が出力した snapshot JSON と、
 * Figma 正解値（fixtures または Phase 2 で MCP 出力）を比較して、
 * 差分のある要素を Markdown / コンソールに出力する。
 *
 * 使い方:
 *   npm run pp:compare -- --section hero
 *   npm run pp:compare -- --section hero --fixture custom.json
 *
 * オプション:
 *   --section <name>      対象セクション名
 *   --snapshot <path>     snapshot JSON のパス（省略時は output/snapshot-<section>.json）
 *   --fixture <path>      Figma 正解値 JSON のパス（省略時は fixtures/<section>.json）
 *   --threshold <px>      差分閾値 (デフォルト: 2)
 *   --output <path>       Markdown レポート出力先（省略時は output/diff-<section>-<timestamp>.md）
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { grepSCSSLine } from './grep.ts';
import type { CaptureSnapshot, ElementSnapshot } from '../capture/types.ts';
import type { FigmaSpec, FigmaElementSpec, DiffEntry } from './types.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const PIXEL_PERFECT_ROOT = join(PROJECT_ROOT, 'scripts', 'pixel-perfect');
const SRC_ROOT = join(PROJECT_ROOT, 'src');

// ── 引数パース ────────────────────────────────────────────────────────────
function parseArgs() {
  const argv = process.argv.slice(2);
  const get = (key: string): string | undefined => {
    const idx = argv.indexOf(`--${key}`);
    if (idx === -1) return undefined;
    return argv[idx + 1];
  };

  return {
    section: get('section') ?? 'hero',
    snapshot: get('snapshot'),
    fixture: get('fixture'),
    threshold: Number(get('threshold') ?? 2),
    output: get('output'),
  };
}

// ── CSS文字列 → 数値変換 ──────────────────────────────────────────────────
// 例: "20px" → 20, "1.4px" → 1.4, "normal" → null
function cssNumber(value: string | undefined): number | null {
  if (!value) return null;
  const m = value.match(/^(-?\d+(?:\.\d+)?)px$/);
  if (!m) return null;
  return Number(m[1]);
}

// ── 要素マッチング ────────────────────────────────────────────────────────
// FigmaSpec の key と Capture の originalClassNames を突き合わせて要素を探す
function findElementByKey(
  snapshot: CaptureSnapshot,
  key: string,
): ElementSnapshot | undefined {
  return snapshot.elements.find((e) => e.originalClassNames.includes(key));
}

// ── 差分計算 ──────────────────────────────────────────────────────────────
function computeDiffs(
  spec: FigmaElementSpec,
  el: ElementSnapshot,
  threshold: number,
): DiffEntry[] {
  const diffs: DiffEntry[] = [];

  const properties: Array<{
    key: keyof FigmaElementSpec['expected'];
    actual: () => number | null;
  }> = [
    { key: 'width', actual: () => cssNumber(el.computed.width) },
    { key: 'height', actual: () => cssNumber(el.computed.height) },
    { key: 'fontSize', actual: () => cssNumber(el.computed.fontSize) },
    { key: 'lineHeight', actual: () => cssNumber(el.computed.lineHeight) },
    { key: 'letterSpacing', actual: () => cssNumber(el.computed.letterSpacing) },
    { key: 'marginTop', actual: () => cssNumber(el.computed.marginTop) },
    { key: 'marginRight', actual: () => cssNumber(el.computed.marginRight) },
    { key: 'marginBottom', actual: () => cssNumber(el.computed.marginBottom) },
    { key: 'marginLeft', actual: () => cssNumber(el.computed.marginLeft) },
    { key: 'paddingTop', actual: () => cssNumber(el.computed.paddingTop) },
    { key: 'paddingRight', actual: () => cssNumber(el.computed.paddingRight) },
    { key: 'paddingBottom', actual: () => cssNumber(el.computed.paddingBottom) },
    { key: 'paddingLeft', actual: () => cssNumber(el.computed.paddingLeft) },
  ];

  for (const p of properties) {
    const expected = spec.expected[p.key];
    if (expected === undefined) continue;
    const actual = p.actual();
    if (actual === null) continue;

    const delta = actual - expected;
    if (Math.abs(delta) >= threshold) {
      diffs.push({
        key: spec.key,
        cssModuleHints: el.cssModuleHints,
        property: p.key,
        expected,
        actual,
        delta,
        unit: 'px',
      });
    }
  }

  return diffs;
}

// ── レポート生成 ──────────────────────────────────────────────────────────
function buildMarkdownReport(
  spec: FigmaSpec,
  snapshot: CaptureSnapshot,
  results: Array<{
    spec: FigmaElementSpec;
    el: ElementSnapshot | undefined;
    diffs: DiffEntry[];
  }>,
  threshold: number,
): string {
  const lines: string[] = [];
  lines.push(`# Pixel Perfect Diff Report`);
  lines.push('');
  lines.push(`- **Section**: \`${spec.section}\``);
  lines.push(`- **Captured At**: ${snapshot.capturedAt}`);
  lines.push(`- **Viewport**: ${snapshot.viewportWidth}x${snapshot.viewportHeight}`);
  lines.push(`- **URL**: ${snapshot.url}`);
  lines.push(`- **Source**: ${spec.source}`);
  lines.push(`- **Threshold**: ±${threshold}px`);
  lines.push('');

  const totalDiffs = results.reduce((sum, r) => sum + r.diffs.length, 0);
  const matched = results.filter((r) => r.el).length;
  const okElements = results.filter((r) => r.el && r.diffs.length === 0).length;
  const ngElements = results.filter((r) => r.el && r.diffs.length > 0).length;
  const missing = results.filter((r) => !r.el).length;

  lines.push(`## Summary`);
  lines.push('');
  lines.push(`- **Total Specs**: ${results.length}`);
  lines.push(`- **Matched in DOM**: ${matched}`);
  lines.push(`- **OK (no diff)**: ${okElements}`);
  lines.push(`- **NG (has diff)**: ${ngElements}`);
  lines.push(`- **Missing in DOM**: ${missing}`);
  lines.push(`- **Total Diff Entries**: ${totalDiffs}`);
  lines.push('');

  for (const r of results) {
    if (!r.el) {
      lines.push(`## ✗ \`${r.spec.key}\` — DOMで見つかりません`);
      if (r.spec.description) {
        lines.push(`> ${r.spec.description}`);
      }
      lines.push('');
      continue;
    }

    if (r.diffs.length === 0) {
      lines.push(`## ✓ \`${r.spec.key}\` — 差分なし`);
      lines.push('');
      continue;
    }

    lines.push(`## ✗ \`${r.spec.key}\` (${r.diffs.length} 件の差分)`);
    if (r.spec.description) {
      lines.push(`> ${r.spec.description}`);
    }
    if (r.el.cssModuleHints.length > 0) {
      const hint = r.el.cssModuleHints[0];
      const grep = grepSCSSLine(SRC_ROOT, hint, r.spec.key);
      if (grep) {
        lines.push(`- **File**: \`${grep.file}\`:${grep.line}`);
      } else {
        lines.push(`- **File**: \`${hint}\` (行番号未特定)`);
      }
    }
    lines.push('');
    lines.push('| プロパティ | 実装 | Figma | 差分 |');
    lines.push('|---|---|---|---|');
    for (const d of r.diffs) {
      const sign = d.delta > 0 ? '+' : '';
      lines.push(`| ${d.property} | ${d.actual}px | ${d.expected}px | ${sign}${d.delta.toFixed(2)}px |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ── コンソール出力 ────────────────────────────────────────────────────────
function printConsole(
  results: Array<{
    spec: FigmaElementSpec;
    el: ElementSnapshot | undefined;
    diffs: DiffEntry[];
  }>,
) {
  const RED = '\x1b[31m';
  const GREEN = '\x1b[32m';
  const YELLOW = '\x1b[33m';
  const DIM = '\x1b[2m';
  const RESET = '\x1b[0m';

  for (const r of results) {
    if (!r.el) {
      console.log(`${YELLOW}? ${r.spec.key}${RESET} ${DIM}— DOMで見つかりません${RESET}`);
      continue;
    }
    if (r.diffs.length === 0) {
      console.log(`${GREEN}✓ ${r.spec.key}${RESET} ${DIM}— 差分なし${RESET}`);
      continue;
    }
    const hint = r.el.cssModuleHints[0] ?? '(unknown)';
    console.log(`${RED}✗ ${r.spec.key}${RESET} ${DIM}(${hint})${RESET}`);
    for (const d of r.diffs) {
      const sign = d.delta > 0 ? '+' : '';
      console.log(
        `    ${d.property}: 実装 ${d.actual}px → Figma ${d.expected}px (${sign}${d.delta.toFixed(2)}px)`,
      );
    }
  }
}

// ── メイン ─────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();

  const snapshotPath = args.snapshot ?? join(PIXEL_PERFECT_ROOT, 'output', `snapshot-${args.section}.json`);
  const fixturePath = args.fixture ?? join(PIXEL_PERFECT_ROOT, 'fixtures', `${args.section}.json`);

  if (!existsSync(snapshotPath)) {
    console.error(`[compare] ✗ snapshot not found: ${snapshotPath}`);
    console.error(`[compare]   先に \`npm run pp:capture -- --section ${args.section}\` を実行してください。`);
    process.exit(1);
  }
  if (!existsSync(fixturePath)) {
    console.error(`[compare] ✗ fixture not found: ${fixturePath}`);
    console.error(`[compare]   ${fixturePath} に Figma 正解値 JSON を配置してください。`);
    console.error(`[compare]   サンプル: scripts/pixel-perfect/fixtures/hero.example.json`);
    process.exit(1);
  }

  const snapshot: CaptureSnapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));
  const spec: FigmaSpec = JSON.parse(readFileSync(fixturePath, 'utf-8'));

  console.log(`[compare] section=${spec.section}`);
  console.log(`[compare] threshold=±${args.threshold}px`);
  console.log(`[compare] specs=${spec.elements.length}, snapshot elements=${snapshot.elements.length}`);
  console.log('');

  const results = spec.elements.map((s) => {
    const el = findElementByKey(snapshot, s.key);
    const diffs = el ? computeDiffs(s, el, args.threshold) : [];
    return { spec: s, el, diffs };
  });

  printConsole(results);

  const md = buildMarkdownReport(spec, snapshot, results, args.threshold);
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const outputPath = args.output ?? join(PIXEL_PERFECT_ROOT, 'output', `diff-${spec.section}-${ts}.md`);
  if (!existsSync(dirname(outputPath))) {
    mkdirSync(dirname(outputPath), { recursive: true });
  }
  writeFileSync(outputPath, md, 'utf-8');

  console.log('');
  console.log(`[compare] ✓ report: ${outputPath}`);

  // 差分があれば exit code 1
  const totalDiffs = results.reduce((sum, r) => sum + r.diffs.length, 0);
  if (totalDiffs > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[compare] ✗ error:', err.message);
  process.exit(1);
});
