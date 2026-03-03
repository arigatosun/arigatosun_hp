# 合同会社アリガトサン コーポレートサイト — 開発ガイド

## 技術スタック

| カテゴリ | 技術 | 用途 |
|---|---|---|
| フレームワーク | Next.js 16 (App Router) | メインフレームワーク |
| 言語 | TypeScript | 型安全な開発 |
| スタイリング | SCSS Modules + CSS変数 | コンポーネントスコープCSS |
| レスポンシブ | clamp() + Fluid Design | ビューポート連動スケーリング |
| 3D | React Three Fiber + Three.js + drei | 3Dキャラクター表示・アニメーション |
| アニメーション | GSAP | スクロール・UIアニメーション |
| 3Dデータ | glTF / GLB | 3Dモデル形式 |
| CMS | WordPress REST API | ニュースページのみ（後日実装） |
| パッケージ管理 | npm | 依存管理 |

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動
npm start

# ESLint実行
npm run lint
```

---

## ディレクトリ構造

```
src/
├── app/                    # Next.js App Router（ページ）
│   ├── layout.tsx          # ルートレイアウト（Header/Footer含む）
│   ├── page.tsx            # TOPページ
│   ├── page.module.scss    # TOPページスタイル
│   ├── about/              # アバウトページ
│   ├── service/            # サービスページ
│   ├── works/              # 実績ページ
│   ├── news/               # ニュースページ（WordPress連携）
│   └── contact/            # お問い合わせページ
├── components/
│   ├── layout/             # レイアウトコンポーネント
│   │   ├── Header/         # ヘッダー・ナビゲーション
│   │   └── Footer/         # フッター
│   ├── ui/                 # 汎用UIコンポーネント
│   │   └── Button/         # ボタン
│   └── three/              # 3D関連コンポーネント
│       └── Scene/          # Three.jsシーン基盤
├── styles/                 # グローバルスタイル・SCSS設計システム
│   ├── globals.scss        # リセット・ベーススタイル
│   ├── _fluid.scss         # ★ Fluid Design mixin（clamp()自動生成）
│   ├── _variables.scss     # デザイントークン（カラー・フォント等）
│   ├── _typography.scss    # タイポグラフィ定義
│   └── _breakpoints.scss   # ブレイクポイント定義
├── lib/                    # ユーティリティ・API連携
├── types/                  # TypeScript型定義
└── public/
    ├── models/             # 3D glTF/GLBファイル
    ├── images/             # 画像素材
    └── fonts/              # Webフォント
```

---

## Fluid Design — clamp() mixin の使い方

### 概要

このプロジェクトでは、レスポンシブ対応に **CSS `clamp()` 関数** を活用しています。
従来のメディアクエリによる段階的な切り替えではなく、ビューポート幅に応じて値が **滑らかに変化** します。

参考ツール: https://min-max-calculator.9elements.com/

### 基本的な使い方

`_fluid.scss` で定義されている `fluid` mixin を使います。

```scss
@use '@/styles/fluid' as *;

.heading {
  // font-size: 24px（モバイル320px時）→ 48px（PC 1200px時）
  @include fluid(font-size, 24, 48);

  // margin-bottom: 16px → 32px
  @include fluid(margin-bottom, 16, 32);

  // padding: 20px → 60px
  @include fluid(padding, 20, 60);
}
```

**引数の説明:**

| 引数 | 意味 | 例 |
|---|---|---|
| 第1引数 | CSSプロパティ名 | `font-size`, `padding`, `gap` 等 |
| 第2引数 | 最小値（px）— モバイルのデザイン値 | `16` |
| 第3引数 | 最大値（px）— PCのデザイン値 | `24` |
| 第4引数（任意） | 最小ビューポート幅（デフォルト: 320px） | `375` |
| 第5引数（任意） | 最大ビューポート幅（デフォルト: 1200px） | `1440` |

### 出力例

```scss
// 入力
@include fluid(font-size, 16, 24);

// 出力される CSS
font-size: clamp(1rem, 0.636rem + 0.909vw, 1.5rem);
```

### 複数プロパティを一括指定

```scss
@use '@/styles/fluid' as *;

.card {
  @include fluid-props((
    font-size: (14, 18),
    padding: (16, 32),
    gap: (12, 24),
    border-radius: (8, 16)
  ));
}
```

### CSS変数として使う（fluid-value関数）

```scss
@use '@/styles/fluid' as *;

:root {
  --space-section: #{fluid-value(40, 120)};
}

.section {
  padding: var(--space-section) 0;
}
```

### カスタムビューポート範囲

デフォルトは 320px〜1200px ですが、個別に変更も可能です:

```scss
// 375px 〜 1440px の範囲で計算
@include fluid(font-size, 16, 32, 375, 1440);
```

---

## Figmaデザインからの実装フロー

### 1. Figmaでデザイン値を確認

Figma上で対象要素を選択し、以下の値をメモ:
- font-size（px）
- line-height（px）
- padding / margin（px）
- width / gap（px）

### 2. PC版の値を「最大値」として記録

現在はPC版のみデザインが完成しているため、PC版の値を `fluid` mixin の **第3引数（max）** に使用します。

### 3. モバイル版の値を推定または後で調整

モバイル版デザインが未完成の場合、以下の目安で最小値を設定:

| プロパティ | PC値に対するモバイル比率の目安 |
|---|---|
| 見出し font-size | 50〜60% |
| 本文 font-size | 85〜90% |
| padding / margin | 40〜60% |
| gap | 50〜70% |

**例:**
```scss
// PC: font-size 48px → モバイル推定: 48 × 0.55 ≈ 26px
@include fluid(font-size, 26, 48);
```

モバイル版デザインが完成したら、第2引数（min）をデザイン値に差し替えるだけです。

### 4. SCSSファイルにコーディング

```scss
@use '@/styles/fluid' as *;
@use '@/styles/breakpoints' as *;

.component {
  // Fluid（フォント・余白等）
  @include fluid(font-size, 14, 18);
  @include fluid(padding, 16, 32);

  // レイアウト切り替えにはブレイクポイントを使用
  display: flex;
  flex-direction: column;

  @include pc {
    flex-direction: row;
  }
}
```

---

## ブレイクポイント（レイアウト切り替え用）

`clamp()` ではカバーできないレイアウト構造の変更にはブレイクポイントを使用します。

```scss
@use '@/styles/breakpoints' as *;

.layout {
  // スマートフォン（〜767px）
  @include sp {
    flex-direction: column;
  }

  // タブレット（768px〜1023px）
  @include tab {
    grid-template-columns: repeat(2, 1fr);
  }

  // PC（1024px〜）
  @include pc {
    grid-template-columns: repeat(3, 1fr);
  }

  // 任意の幅
  @include min(1440px) {
    max-width: 1400px;
  }
}
```

**使い分けの原則:**

| 用途 | 使う手法 |
|---|---|
| フォントサイズ | `@include fluid()` |
| 余白（padding/margin/gap） | `@include fluid()` |
| 幅（width/max-width） | `@include fluid()` |
| カラム数の切り替え | `@include sp / tab / pc` |
| 要素の表示/非表示 | `@include sp / pc` |
| flex-direction の変更 | `@include sp / pc` |

---

## コンポーネント作成ルール

### ファイル構成

```
ComponentName/
├── ComponentName.tsx          # コンポーネント本体
├── ComponentName.module.scss  # スタイル
└── index.ts                   # re-export
```

### SCSS Modules でのimport

```scss
// 各.module.scssファイルの先頭に必要なものだけimport
@use '@/styles/fluid' as *;
@use '@/styles/breakpoints' as *;
```

### コンポーネントのimport

```tsx
// index.ts による re-export でシンプルにimport
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
```

---

## デザイントークン（CSS変数）

`_variables.scss` で定義済み。グローバルに利用可能:

```scss
// カラー
color: var(--color-primary);        // #E63625 ブランドレッド
background: var(--color-black);     // #1A1A1A
color: var(--color-text-muted);     // #737373

// フォント
font-family: var(--font-primary);   // 日本語フォント
font-family: var(--font-en);        // 英語フォント

// トランジション
transition: opacity var(--transition-fast);   // 150ms
transition: all var(--transition-base);       // 300ms

// z-index
z-index: var(--z-header);   // 100
z-index: var(--z-modal);    // 300
```
