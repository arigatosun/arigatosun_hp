/**
 * SCSSモジュールファイル内で「.<className> {」のパターンを検索し
 * 該当するファイルパスと行番号を返す。
 *
 * Capture Agent が推定した CSS Module ヒント (例: "page.module.scss")
 * と元クラス名 (例: "heroLogo") を受け取り、src/ 配下を再帰探索する。
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function grepSCSSLine(
  srcRoot: string,
  moduleHint: string,
  className: string,
): { file: string; line: number } | null {
  // src/ 配下から moduleHint と一致するファイルを探す
  const candidates = findFiles(srcRoot, moduleHint);
  if (candidates.length === 0) return null;

  // .className のパターンを検索
  const pattern = new RegExp(`^\\s*\\.${escapeRegex(className)}\\s*[{,:]`);

  for (const file of candidates) {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        // Windows パス → POSIX 表記に揃え、src/ 配下からの相対パスに変換
        const posix = file.replace(/\\/g, '/');
        const srcPosix = srcRoot.replace(/\\/g, '/');
        const rel = posix.startsWith(srcPosix)
          ? 'src' + posix.slice(srcPosix.length)
          : posix;
        return { file: rel, line: i + 1 };
      }
    }
  }
  return null;
}

function findFiles(root: string, fileName: string): string[] {
  const result: string[] = [];
  const stack: string[] = [root];

  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        // node_modules や .next は探索しない
        if (entry === 'node_modules' || entry === '.next' || entry.startsWith('.')) continue;
        stack.push(full);
      } else if (entry === fileName) {
        result.push(full);
      }
    }
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
