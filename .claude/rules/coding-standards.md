---
paths:
  - "src/**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.scss"
---

# コーディング規約

## フォント・テキストスタイル

### 英語テキスト（ナビゲーション、ラベル、ボタン等）
```scss
font-family: var(--font-en);      // 'Mozaic GEO Variable'
font-weight: var(--font-weight-light); // 300
letter-spacing: 1.12px;
```

### 日本語テキスト（本文、見出し等）
```scss
font-family: var(--font-primary);  // 'Mozaic GEO Variable' + 日本語フォールバック
```

## カラー

- テキスト通常時: `var(--color-black)` → `#140700`
- ホバー・アクティブ時: `var(--color-primary)` → `#DA2719`
- 背景: `var(--color-white)` → `#FFFFFF`
- すべてのカラーはCSS変数経由で指定する。ハードコードしない。

## レスポンシブ（最重要）

**固定pxでスケーラブルな値を書くことは禁止。**
Figmaの値は `@include fluid(プロパティ, min, max)` で書く。
詳細な値の算出ルールは `.claude/rules/responsive.md` に定義済み。

- フォントサイズ・余白・幅 → `@include fluid(プロパティ, min, max)`
- レイアウト構造の切り替え → `@include sp / tab / pc`
- 2カラム横並び → 必ずSP時の `flex-direction: column` も書く
- PC UIの実装 = レスポンシブ対応込みで行う（後から別途対応しない）

## ホバーエフェクト

- リンクのホバーは `color: var(--color-primary)` への変化を基本とする
- `transition: color var(--transition-base)` を指定する
- グローバルのopacity変化は使わない（コンポーネント側で制御）

## コンポーネント構造

```
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.scss
└── index.ts
```

## SCSS Modules のインポート

```scss
@use '@/styles/fluid' as *;
@use '@/styles/breakpoints' as *;
```
- この2行は全 `.module.scss` に必須
- CSS変数はグローバルに利用可能（インポート不要）
