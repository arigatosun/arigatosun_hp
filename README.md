# 合同会社アリガトサン コーポレートサイト

合同会社アリガトサンのコーポレートサイト。Next.js (App Router) で構築。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router) + TypeScript
- **スタイル**: SCSS Modules + CSS 変数 + clamp() による Fluid Design
- **3D**: React Three Fiber + Three.js + drei
- **アニメーション**: GSAP（スクロール連動含む）
- **メール送信**: Resend（お問い合わせフォーム）
- **CMS**: WordPress REST API（NEWS ページのみ、後日連携）
- **パッケージ管理**: npm

## セットアップ

Node.js 20+ が必要。

```bash
git clone https://github.com/arigatosun/arigatosun_hp.git
cd arigatosun_hp
npm install
```

### 環境変数

プロジェクトルートに `.env.local` を作成する（値は管理者から共有）。

```
RESEND_API_KEY=                  # お問い合わせフォームのメール送信。未設定だとビルド失敗
NEXT_PUBLIC_WORDPRESS_API_URL=   # NEWS 連携用。未設定でもビルドは通る
```

> `.env*` は `.gitignore` 済み。絶対にコミットしないこと。

### 開発サーバー

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) で表示される。

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint |
| `npm run pp:capture` / `pp:compare` | ピクセルパーフェクト検証（スクショ取得・比較） |

## ドキュメント

このプロジェクトは Claude Code 前提で設計されている。実装前に以下を参照する。

- **`CLAUDE.md`** — プロジェクト司令塔・全体目次。まずここを読む
- **`docs/dear-hideya.md`** — 前任者からの引き継ぎレター（読む順番つき）
- **`docs/DEVELOPER_ONBOARDING.md`** — 開発フロー（環境構築〜ブランチ戦略〜PR 運用）
- **`docs/next-session-handoff.md`** — 現在の進捗・残課題
- **`.claude/rules/`** — 実装ルール（レスポンシブ / デザイントークン / コーディング規約 等）
- `docs/` — 領域別の仕様書・設計資料

## 開発の最重要ルール

- スケーラブルな値（フォント・余白・幅・absolute 位置）は固定 px 禁止。必ず `@include fluid(プロパティ, min, max)` を使う
- 色は CSS 変数（`var(--color-xxx)`）経由。`#xxxxxx` 直書き禁止
- コンポーネントは `Component.tsx + Component.module.scss + index.ts` の 3 点セット
- 詳細は `CLAUDE.md` および `.claude/rules/` を参照
