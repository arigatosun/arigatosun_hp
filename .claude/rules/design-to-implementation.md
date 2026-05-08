---
paths:
  - "src/components/**"
  - "src/app/**"
  - "src/styles/**"
---

# Figma → 実装 落とし込みフロー

> Figma の値をどう SCSS に変換するかの実装手順。
> 計算ルール本体は `responsive.md`、トークンは `design-tokens.md` 参照。

---

## 全体フロー

1. Figma で対象要素を選択し、PC値（width / height / font-size / 余白 / 位置）を読む
2. その値を `@include fluid(プロパティ, min, max)` の **max** に入れる
3. min は `responsive.md` の算出テーブルから決める（起点: `PC値 × 0.40〜0.55`）
4. レイアウト構造（横並び / グリッド / 固定配置）は `@include sp/tab/pc` で切替
5. 色・フォントは `var(--xxx)` から引く（`design-tokens.md`）
6. 実装後 `npm run dev` で 320 / 375 / 768 / 1200px の4ポイントを目視確認

---

## Figma 値の読み取り方

| Figmaの欄 | 拾う値 | 落とし先 |
|---|---|---|
| 右パネル `W / H` | width / height | `@include fluid(width, min, max)` |
| `Position X / Y` | top / right / left | `@include fluid(top, min, max)` |
| Typography `Size` | font-size | `@include fluid(font-size, min, max)` |
| Typography `Line height` | line-height | px指定なら fluid、% / 倍率なら直書き可 |
| Typography `Letter spacing` | letter-spacing | `@include fluid(letter-spacing, min, max)` |
| Auto Layout `Gap` / `Padding` | gap / padding | `@include fluid(gap, min, max)` |
| Fill / Stroke の HEX | カラー | `var(--color-xxx)`（無ければ `_variables.scss` に追加） |

> Figma実測の HEX が **既存トークンと一致**したら必ず変数を使う。新色っぽくても先に `design-tokens.md` を確認。

---

## min 値の決め方

`responsive.md` の算出テーブル参照（このファイルでは複製しない）。
ざっくり起点:

- テキスト系 → `PC値 × 0.50`（最低 12〜14px）
- 余白系 → `PC値 × 0.40〜0.50`
- absolute 位置 → `PC値 × 0.40〜0.55`
- セクション間 margin → `PC値 × 0.30`

迷ったら起点で書いて、SP実機で目視微調整。

---

## レイアウト切替の基本パターン

### 1. 2カラム横並び（横並び要素には**必ず** SP 縦積み）

```scss
.row {
  display: flex;
  align-items: center;
  @include fluid(gap, 20, 80);

  @include sp { flex-direction: column; align-items: stretch; }
}
```

### 2. グリッド列数の切替

```scss
.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  @include fluid(gap, 16, 40);

  @include sp { grid-template-columns: repeat(2, 1fr); }
}
```

### 3. absolute 配置 → SP は relative に解除

```scss
.floatItem {
  position: absolute;
  @include fluid(top, 80, 200);
  @include fluid(right, 24, 80);

  @include sp { position: relative; inset: auto; }
}
```

### 4. GSAP 横スクロール（vw 直書き許容ケース）

横スクロール量・コンテンツ幅は **vw / % 指定**でOK（fluid 化すると逆に演出が壊れる）。

```scss
.scroller {
  display: flex;
  width: 300vw;          // 横スクロール量はvw直書きOK
  will-change: transform;

  @include sp { flex-direction: column; width: 100%; will-change: auto; }
}
```

---

## Figma に SP デザインがある / ない

**ある場合**:
1. PC max + SP min を Figma から両方拾う
2. 構造変更（縦積み / グリッド列数 / 非表示）は SP デザインに従う

**ない場合（PCのみ）**:
1. PC値を max に入れ、min は `responsive.md` の係数で決める
2. 構造のデフォ判断:
   - 横並び2カラム以上 → SP 縦積み
   - グリッド 4列以上 → SP 2列
   - 装飾・サイドナビ → SP `display: none`
   - sticky / absolute → SP は relative

迷ったら `/capture-image` スキルにスクショを渡して構造提案を受けてから実装する。

---

## アンチパターン（悪い → 良い）

### 1. 固定px

```scss
// ❌
.title { font-size: 38px; margin-bottom: 80px; }
// ✅
.title { @include fluid(font-size, 20, 38); @include fluid(margin-bottom, 32, 80); }
```

### 2. カラーべた書き

```scss
// ❌
.label { color: #140700; border-bottom: 1px solid #DA2719; }
// ✅
.label { color: var(--color-black); border-bottom: 1px solid var(--color-primary); }
```

### 3. 横並びに SP 対応なし

```scss
// ❌
.twoCol { display: flex; gap: 60px; }
// ✅
.twoCol {
  display: flex;
  @include fluid(gap, 20, 60);
  @include sp { flex-direction: column; }
}
```

### 4. line-height の px 固定

```scss
// ❌
.body { font-size: 20px; line-height: 32px; }
// ✅
.body { @include fluid(font-size, 14, 20); line-height: 1.6; }
```

### 5. absolute 位置を px 固定で SP 崩壊

```scss
// ❌
.deco { position: absolute; top: 200px; right: 80px; }
// ✅
.deco {
  position: absolute;
  @include fluid(top, 80, 200);
  @include fluid(right, 24, 80);
  @include sp { position: relative; inset: auto; }
}
```

---

## 関連ルール

- 値の計算テーブル → `responsive.md`
- 色・フォント変数一覧 → `design-tokens.md`
- コンポーネント追加手順 → `component-creation.md`
- 画像・3Dアセット配置 → `asset-management.md`
