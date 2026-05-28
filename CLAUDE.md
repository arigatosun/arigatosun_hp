# 株式会社アリガトサン コーポレートサイト

> Claude Code 司令塔ファイル。ここはルーティング目次に徹する。
> 詳細ルールは `.claude/rules/*.md` を参照すること。

---

## プロジェクト核心

- Next.js 16 (App Router) + TypeScript + SCSS Modules
- 3D: React Three Fiber + Three.js + drei
- アニメーション: GSAP（スクロール連動含む）
- ニュースのみ後日 WordPress REST API 連携
- パッケージ管理: npm

---

## 最重要ルール（破ったら全部やり直し）

**1. スケーラブルな値（フォント・余白・幅・absolute位置）は必ず `@include fluid(プロパティ, min, max)` で書く。固定px禁止。**
- Figma値 = max。min は `.claude/rules/responsive.md` の算出テーブルから引く。
- 例外（border-width / border-radius / 8px以下の微小値 / vw・% 等）も `responsive.md` に明記。

**2. 色は必ず CSS 変数（`var(--color-xxx)`）経由。`#xxxxxx` 直書き禁止。**
- 既存トークン一覧は `.claude/rules/design-tokens.md`。
- 新色が必要な時は `src/styles/_variables.scss` に定義してから使う。

**3. コンポーネントは `Component/Component.tsx + .module.scss + index.ts` の3点セット。**
- `.module.scss` の先頭2行は `@use '@/styles/fluid' as *;` `@use '@/styles/breakpoints' as *;`。

**4. 2カラム横並び要素には必ず `@include sp` での縦積み対応を含める。**

---

## ルーティング目次（IF-THEN）

| やりたいこと | 読むファイル |
|---|---|
| レスポンシブ・fluid()・min値の計算 | `.claude/rules/responsive.md` |
| 色・フォント・トランジション等のトークン参照 | `.claude/rules/design-tokens.md` |
| TSX / SCSS のコーディング規約・命名 | `.claude/rules/coding-standards.md` |
| 新しいコンポーネントを追加する | `.claude/rules/component-creation.md` |
| Figma デザインを実装に落とすフロー | `.claude/rules/design-to-implementation.md` |
| Figma URL から実測値を MCP で取得する手順 | `.claude/rules/figma-mcp-workflow.md` |
| セクション間（上下）の余白を Figma と合わせる | `.claude/rules/section-spacing.md` |
| 画像 / 3D 等のアセット配置・命名 | `.claude/rules/asset-management.md` |
| コミット前のセルフチェック | `.claude/rules/pre-commit-checklist.md` |

---

## 開発コマンド

```bash
npm run dev    # 開発サーバー
npm run build  # プロダクションビルド
npm run lint   # ESLint
```

---

## ディレクトリ要点

```
src/
├── app/                # App Router ページ
├── components/
│   ├── layout/         # Header, Footer 等のサイト共通レイアウト
│   ├── ui/             # セクション + 汎用UIコンポーネント
│   └── three/          # React Three Fiber 関連
├── data/               # 静的データ（CMS差し替え予定）
├── lib/                # ユーティリティ
├── styles/             # _variables.scss / _fluid.scss / _breakpoints.scss / globals.scss / fonts.css
└── types/              # 共通型定義
public/
├── images/             # セクション別画像
└── models/             # 3D モデル（.glb）
```

---

## コミットルール（要点のみ）

- 日本語で書く。フォーマット: `Phase X: 実装内容の要約`
- `.env*` は絶対にコミットしない
- `git push --force` 禁止
- 詳細チェックリストは `.claude/rules/pre-commit-checklist.md`

---

## 詳細ガイド（人間向け、参考程度に）

Claude が毎回読む必要はない。実装で迷った時の補足資料。

- `docs/DEVELOPER_ONBOARDING.md` — **外部開発者向け開発フロー ガイドライン**（依頼時に最初に共有）
- `docs/DEVELOPMENT.md` — 開発環境・技術スタック詳説
- `docs/RESPONSIVE_GUIDE.md` — レスポンシブ設計の背景思想
- `docs/3D-ARIGATOKUN-RUNNER.md` — 3D演出仕様
- `docs/SERVICE_SECTION_PLAN.md` — Service セクション設計

---

## 困った時の優先順位

1. まず `.claude/rules/` の該当ファイルを読む
2. それで分からなければ `docs/` の該当ファイル
3. それでも分からなければユーザー（Hideさん向け案内: 不明点はそのまま質問してOK）に確認
