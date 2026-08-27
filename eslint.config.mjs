import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // worktree 配下の .next/ 等まで lint しないように再帰指定
    "**/.next/**",
    ".claude/worktrees/**",
    "coverage/**",
    "test-results/**",
    "output/playwright/**",
    "artifacts/webmcp-eval/**",
    // 開発用スクリプト（出荷対象外。Node/CommonJS 混在のため本体規約とは別管理）
    "scripts/**",
  ]),
]);

export default eslintConfig;
