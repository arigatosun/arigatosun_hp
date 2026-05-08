---
paths:
  - "src/**/*.module.scss"
  - "src/styles/**"
---

# Fluid-First レスポンシブ設計ルール

> Claude が SCSS を書く時の **実行指針**。
> 設計思想・背景・計算ツールの解説は `docs/RESPONSIVE_GUIDE.md` を参照。

---

## 絶対原則

**SCSS でスケーラブルな値に固定px を書くことは禁止。必ず `@include fluid(プロパティ, min, max)` を使う。**

- PC値（Figmaデザイン値）= **max**
- SP値（320px時）= **min**（下記テーブルから算出）
- fluid 計算範囲: 320px 〜 1200px。1200px以上は max 値でクランプ

---

## 固定px禁止対象

- `font-size` `line-height` `letter-spacing`
- `margin` `padding`（8px以下を除く）
- `width` `height` `gap`（8px以下を除く）
- `position: absolute` の `top` / `right` / `bottom` / `left`

## 固定px許可（例外）

- `border-width` / `border-radius` / `box-shadow`
- 8px 以下の微小値（gap: 4px, margin-top: 4px 等）
- `opacity` / `z-index` / `transform` 値
- vw / vh / % / em / rem 等の相対単位（既に書かれている場合）

---

## min値（320px時）の算出テーブル

| 種別 | PC値(max)の例 | min値の目安 |
|---|---|---|
| 大見出し font-size | 38〜44px | **PC値 × 0.50〜0.55**（20〜24px） |
| 中見出し font-size | 24〜34px | **PC値 × 0.55〜0.60**（14〜20px） |
| 本文 font-size | 20〜26px | **14px**（最小可読サイズ） |
| ラベル font-size | 20px | **14px** |
| 小テキスト font-size | 14〜16px | **12〜14px** |
| letter-spacing | 任意 | **PC値 × 0.45〜0.55** |
| line-height (px指定時) | 任意 | **PC値 × 0.50〜0.55** |
| セクション左padding | 200px | **20px** |
| セクション間 margin-top | 200〜410px | **PC値 × 0.30**（60〜120px） |
| セクション内 大余白 | 100〜240px | **PC値 × 0.35**（40〜80px） |
| セクション内 中余白 | 40〜80px | **PC値 × 0.40〜0.50**（16〜40px） |
| gap 大 | 40〜140px | **PC値 × 0.30**（12〜40px） |
| gap 小 | 16〜32px | **PC値 × 0.50**（8〜16px） |
| ボタン width | 380px | **240px** |
| ボタン height | 72px | **52px** |
| absolute 位置 | 任意 | **PC値 × 0.40〜0.55** |

> 迷ったら **テキスト系は 0.50、余白系は 0.40〜0.50** を起点に微調整。

---

## ブレイクポイント

| 名称 | 範囲 | mixin |
|---|---|---|
| SP（スマホ） | 〜767px | `@include sp` |
| TAB（タブレット） | 768〜1023px | `@include tab` |
| PC（デスクトップ） | 1024px〜 | `@include pc` |

`fluid()` でスケーリングは済ませた上で、**構造変更のみ** mixin で行う。

---

## レイアウト切り替えパターン

### 2カラム → 1カラム（横並び要素には必ず SP 対応を書く）
```scss
.twoColumn {
  display: flex;
  @include fluid(gap, 20, 60);

  @include sp {
    flex-direction: column;
  }
}
```

### sticky / absolute 配置 → SP時は relative に解除
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

### 横スクロール演出 → SP時は縦積み
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

### グリッド列数の切り替え
```scss
.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);

  @include sp {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## ファイル先頭の必須インポート

```scss
@use '@/styles/fluid' as *;
@use '@/styles/breakpoints' as *;
```

すべての `.module.scss` の先頭2行に必須。

---

## 参考資料

- 設計思想・clamp() 計算ツール紹介 → `docs/RESPONSIVE_GUIDE.md`
- 実装フローと Figma → 値の落とし方 → `.claude/rules/design-to-implementation.md`
