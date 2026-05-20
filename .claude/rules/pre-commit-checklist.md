---
paths:
  - "**"
---

# コミット前 セルフチェックリスト

> `git commit` する前に必ず通すチェック。
> Claude が自動でチェックする時も人間が確認する時も同じ基準。

---

## ビルド・Lint

- [ ] `npm run lint` でエラー0
- [ ] `npm run build` で成功（型エラー・SCSSエラー含めゼロ）

---

## レスポンシブ目視確認（必須4ポイント）

ブラウザ DevTools で以下4幅を順に確認する。

| 幅 | 想定デバイス |
|---|---|
| **320px** | 最小スマホ（iPhone SE 1st 等） |
| **375px** | 標準スマホ（iPhone 12〜15 系） |
| **768px** | タブレット境界（SP 範囲内 — 768〜1023 は SP と同じレイアウト） |
| **1024px** | PC ブレイクポイント開始（SP→PC 切替境界） |
| **1200px** | PC 想定上限（fluid のクランプ点） |

**確認手順**:
1. `npm run dev` でローカル起動
2. F12 → デバイスツールバー（Ctrl+Shift+M）
3. 上記4幅に切り替え、変更したセクションをスクロール
4. 文字の重なり・はみ出し・横スクロール発生・画像つぶれが無いか目視

---

## CSS / SCSS

- [ ] スケーラブル値（font-size / margin / padding / width / height / 位置）に**固定px が無い**（`@include fluid()` を使った）
- [ ] カラーが `#xxxxxx` ベタ書きでなく `var(--color-xxx)` 経由
- [ ] 横並び要素には `@include sp { flex-direction: column; }` 等の SP 対応を入れた
- [ ] 各 `.module.scss` の先頭に `@use '@/styles/fluid' as *;` `@use '@/styles/breakpoints' as *;` がある

---

## セクション間の余白

- [ ] 上下の隣接セクションとの余白が **Figma の Group 間距離と一致**している（ブラウザ実測で照合・`.claude/rules/section-spacing.md`）

---

## コンポーネント構造

- [ ] 新規コンポーネントは `Component/Component.tsx + Component.module.scss + index.ts` の3点セット
- [ ] PascalCase 命名、SCSS Modules クラスは camelCase
- [ ] `'use client'` を必要な時だけ付けた（純表示なら不要）
- [ ] 配列・データはコンポーネント内に直書きせず `src/data/` から import

---

## クリーンアップ

- [ ] `console.log` を削除した（デバッグ用は本番に残さない）
- [ ] コメントアウトされた死んだコードを削除した
- [ ] 使っていない import / 変数を削除した（lint で出るはず）

---

## Git

- [ ] `.env*` をステージしていない（`git status` で確認）
- [ ] 不要な OS 由来ファイル（`.DS_Store` 等）が混ざっていない
- [ ] コミットメッセージは **日本語**、フォーマット `Phase X: 実装内容の要約`
- [ ] `git push --force` を使っていない（履歴破壊禁止）

---

## 迷った時の参照先

| 詰まったポイント | 読むファイル |
|---|---|
| fluid の min 値どう決める | `.claude/rules/responsive.md` |
| 色の変数名分からない | `.claude/rules/design-tokens.md` |
| 新規コンポーネント手順 | `.claude/rules/component-creation.md` |
| Figma 値どう変換 | `.claude/rules/design-to-implementation.md` |
| セクション間の上下余白 | `.claude/rules/section-spacing.md` |
| 画像どこに置く | `.claude/rules/asset-management.md` |
