---
paths:
  - "src/**/*.module.scss"
  - "src/styles/**"
---

# Fluid-First レスポンシブ設計ルール（自動適用）

## 絶対原則

**SCSSでスケーラブルな値に固定pxを書くことは禁止。必ず `@include fluid(プロパティ, min, max)` を使う。**

PC値（Figmaデザイン値）= max、SP値 = min（下記テーブルから算出）。
fluid計算範囲: 320px〜1200px。1200px以上はmax値でクランプ = PC表示そのまま。

### 固定px禁止対象
- font-size, line-height, letter-spacing
- margin, padding（8px以下を除く）
- width, height, gap（8px以下を除く）
- position: absoluteの top/right/bottom/left

### 固定px許可（例外）
- border-width, border-radius, box-shadow
- 8px以下の微小値（gap: 4px, margin-top: 4px等）
- opacity, z-index, transform値
- vw/vh/%/em 等の相対単位で既に書かれている値

---

## min値（320px時）の算出テーブル

| 種別 | PC値(max)の例 | min値の目安 |
|---|---|---|
| 大見出し font-size | 38〜44px | **PC値 × 0.50〜0.55**（20〜24px） |
| 中見出し font-size | 24〜34px | **PC値 × 0.55〜0.60**（14〜20px） |
| 本文 font-size | 20〜26px | **14px**（最小可読サイズ） |
| ラベル font-size | 20px | **14px** |
| 小テキスト font-size | 14〜16px | **12〜14px**（そのままor微縮小） |
| letter-spacing | 任意 | **PC値 × 0.45〜0.55** |
| line-height | 任意 | **PC値 × 0.50〜0.55** |
| セクション左padding | 200px | **20px** |
| セクション間 margin-top | 200〜410px | **PC値 × 0.30**（60〜120px） |
| セクション内 大余白 | 100〜240px | **PC値 × 0.35**（40〜80px） |
| セクション内 中余白 | 40〜80px | **PC値 × 0.40〜0.50**（16〜40px） |
| gap 大 | 40〜140px | **PC値 × 0.30**（12〜40px） |
| gap 小 | 16〜32px | **PC値 × 0.50**（8〜16px） |
| ボタン width | 380px | **240px** |
| ボタン height | 72px | **52px** |
| absolute位置 | 任意 | **PC値 × 0.40〜0.55** |

---

## レイアウト切り替えルール

fluid()で値のスケーリングを処理した上で、構造変更は `@include sp / tab / pc` で行う。

### 2カラム → 1カラム（横並び要素には必ずSP対応を書く）
```scss
.twoColumn {
  display: flex;
  @include fluid(gap, 20, 60);

  @include sp {
    flex-direction: column;
  }
}
```

### sticky/absolute配置 → SP時はrelativeに
```scss
.positioned {
  position: absolute;
  @include fluid(top, 200, 465);

  @include sp {
    position: relative;
    top: auto;
    right: auto;
    left: auto;
  }
}
```

### 横スクロール → SP時は縦積み
```scss
.horizontalScroll {
  display: flex;
  will-change: transform;

  @include sp {
    flex-direction: column;
    will-change: auto;
  }
}
```

---

## ファイル先頭の必須インポート

すべての `.module.scss` に必ず記載:
```scss
@use '@/styles/fluid' as *;
@use '@/styles/breakpoints' as *;
```
