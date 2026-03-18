# 合同会社アリガトサン コーポレートサイト

## プロジェクト概要
- Next.js 16 (App Router) + TypeScript
- SCSS Modules + CSS変数 + clamp() Fluid Design
- React Three Fiber + Three.js（3Dキャラクター演出）
- GSAP（アニメーション）
- WordPress REST API（ニュースページのみ、後日実装）

## 最重要: Fluid-First レスポンシブ開発

**PC UIを実装する = レスポンシブ対応込み。固定pxは使わない。**

SCSSでスケーラブルな値を書く際は必ず `@include fluid(プロパティ, min, max)` を使用する。
Figmaのデザイン値 = max（PC値）、min（SP値）は `.Codex/rules/responsive.md` の算出テーブルに従う。
2カラム横並びには必ず `@include sp` での縦積み対応を含める。

## フォント設定
- **メインフォント**: `mozaic-geo-variable`（Adobe Fonts / TypeKit CDN経由）
- **読み込み方法**: `src/styles/fonts.css` で `@import url('https://use.typekit.net/vpb8rae.css')` として読み込み
- **layout.tsx** で `import '@/styles/fonts.css'` として最初に読み込む
- font-family名は **小文字ハイフン区切り**: `mozaic-geo-variable`
- ローカルにフォントファイルは配置しない（CDN利用）

## デザイントークン（Figma確定値）
- テキストカラー: `#140700`（`--color-black`）
- ブランドレッド: `#DA2719`（`--color-primary`）
- 英語テキスト共通: font-size 14px / font-weight 300 / letter-spacing 1.12px
- ホバー: `color: var(--color-primary)` + `transition: color var(--transition-base)`

## CSS設計ルール
- フォント・余白・幅 → `@include fluid(プロパティ, min, max)` を使用
- レイアウト切り替え → `@include sp / tab / pc` を使用
- カラーは必ずCSS変数経由（ハードコード禁止）
- 詳細は `.Codex/rules/` 参照

## コンポーネント構成
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.scss
└── index.ts
```

## 開発コマンド
```bash
npm run dev    # 開発サーバー
npm run build  # ビルド
npm run lint   # ESLint
```
