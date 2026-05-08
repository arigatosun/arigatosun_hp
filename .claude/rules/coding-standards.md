---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.scss"
---

# コーディング規約

> TSX / SCSS / 命名 / フォント / テキストスタイルの実装ルール。
> レスポンシブ詳細は `responsive.md`、トークン詳細は `design-tokens.md`。

---

## TSX 規約

### コンポーネント命名
- ファイル・ディレクトリ・コンポーネント名はすべて **PascalCase**（例: `MemberSection`）
- props 型は `ComponentNameProps` という名前で同ファイル内に定義
  - ファイル横断で再利用される型のみ `src/types/` に切り出す

### import 順序
1. React / Next.js / 外部ライブラリ
2. `@/...` から始まるエイリアス import
3. 相対パス import（`./` `../`）
4. CSS Modules（`import styles from './X.module.scss'`）

### data の扱い
- 配列・オブジェクトのデータは **コンポーネント内に書かず** `src/data/` から `import` する（CMS差し替え対応）
- 型定義は data ファイル内 or `src/types/` に置く

### 'use client' の判断
- フック（`useState` `useEffect`）/ イベントハンドラ / GSAP / Three.js を使う時のみ宣言
- それ以外はサーバーコンポーネントのまま

---

## SCSS Modules 規約

### ファイル先頭の必須インポート（全 `.module.scss`）
```scss
@use '@/styles/fluid' as *;
@use '@/styles/breakpoints' as *;
```
CSS変数（`var(--color-xxx)` 等）はグローバル利用可能のためインポート不要。

### クラス名
- camelCase（CSS Modules の標準）
- ブロック単位でネストする（BEM風命名は避け、構造でスコープする）

### レスポンシブの書き分け
- フォント・余白・幅 → `@include fluid(プロパティ, min, max)`
- 構造変更 → `@include sp / tab / pc`
- 詳細ルールは `responsive.md`

---

## カラー指定

| 用途 | 必ず使うCSS変数 |
|---|---|
| テキスト通常時 | `var(--color-black)` |
| ホバー・アクティブ・強調 | `var(--color-primary)` |
| 背景 | `var(--color-white)` `var(--color-bg)` |
| 説明文・キャプション | `var(--color-text-secondary)` |
| プレースホルダー背景 | `var(--color-placeholder)` |
| リンク（標準青） | `var(--color-link-blue)` |
| 微黒（純黒の代替） | `var(--color-text-soft-black)` |
| ブランドレッド透過 | `var(--color-primary-rgba-75/55/25)` |

**禁止**: `#xxxxxx` の直書き、`rgba(218, 39, 25, ...)` の直書き。
新しい色が必要な時は `_variables.scss` に追加してから使う。

---

## フォント・テキストスタイル

### 英語テキスト（ナビゲーション、ラベル、ボタン等）
```scss
font-family: var(--font-en);             // 'mozaic-geo-variable'
font-weight: var(--font-weight-light);   // 300
letter-spacing: 1.12px;
```

### 日本語テキスト（本文、見出し等）
```scss
font-family: var(--font-primary);        // mozaic-geo-variable + 日本語フォールバック
```

### フォントウェイトは必ず変数経由
| 値 | 変数 |
|---|---|
| 300 | `var(--font-weight-light)` |
| 400 | `var(--font-weight-regular)` |
| 500 | `var(--font-weight-medium)` |
| 700 | `var(--font-weight-bold)` |
| 900 | `var(--font-weight-black)` |

---

## ホバーエフェクト

- リンク・ボタンのホバーは `color: var(--color-primary)` への変化を基本とする
- `transition: color var(--transition-base)` を必ず指定
- グローバルな `opacity` 変化は使わない（個別コンポーネントで制御）

---

## アンチパターン（やったら直す）

- ❌ `font-size: 24px;` のような固定px → ✅ `@include fluid(font-size, 14, 24);`
- ❌ `color: #140700;` → ✅ `color: var(--color-black);`
- ❌ `font-weight: 300;` → ✅ `font-weight: var(--font-weight-light);`
- ❌ コンポーネント内に配列データを直書き → ✅ `src/data/` から import
- ❌ `index.ts` を作らずに `import { default } from '.../X/X'` → ✅ `index.ts` でリエクスポート
