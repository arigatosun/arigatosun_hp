---
paths:
  - "src/styles/**"
  - "src/**/*.module.scss"
---

# デザイントークン（Figma実測値）

> CSS変数の正のリスト。`#xxxxxx` 直書きは禁止、必ずここから引く。
> 新しいトークンを追加する時は `src/styles/_variables.scss` を先に編集する。

---

## カラー

### ブランド・基本
| 用途 | CSS変数 | 値 |
|---|---|---|
| ブランドレッド | `--color-primary` | `#DA2719` |
| ブランドレッド ダーク | `--color-primary-dark` | `#B82010` |
| オープニング背景レッド | `--color-opening-red` | `#E81D1B` |
| テキストブラック | `--color-black` | `#140700` |
| 背景ホワイト | `--color-white` | `#FFFFFF` |
| 背景グレージュ | `--color-bg` | `#F5F6F7` |

### テキスト・グレー系（用途別）
| 用途 | CSS変数 | 値 |
|---|---|---|
| 説明文・キャプション | `--color-text-secondary` | `#808080` |
| プレースホルダー背景 | `--color-placeholder` | `#D9D9D9` |
| 微黒（純黒の代替） | `--color-text-soft-black` | `#050505` |
| リンク標準青 | `--color-link-blue` | `#00F` |
| テキスト（汎用alias） | `--color-text` | `var(--color-black)` |
| テキスト弱化 | `--color-text-muted` | `var(--color-gray-500)` |

> `--color-gray-500` (`#737373`) はパレット上のミドルグレー。
> Figma準拠のキャプション色は必ず `--color-text-secondary` (`#808080`) を使う。

### グレースケール（パレット）
`--color-gray-100` 〜 `--color-gray-900` の9段階。`_variables.scss` 参照。

### 透過バリエーション
| 用途 | CSS変数 |
|---|---|
| ブランドレッド 75% | `--color-primary-rgba-75` |
| ブランドレッド 55% | `--color-primary-rgba-55` |
| ブランドレッド 25% | `--color-primary-rgba-25` |
| 黒 30% | `--color-black-rgba-30` |
| 黒 15% | `--color-black-rgba-15` |

---

## フォント

| 用途 | CSS変数 | 内容 |
|---|---|---|
| メイン（日英共通） | `--font-primary` | `mozaic-geo-variable` + 日本語フォールバック |
| 英語専用 | `--font-en` | `mozaic-geo-variable` + Helvetica系 |
| 日本語フォールバック | `--font-jp` | `Noto Sans JP` 系 |
| Mono | `--font-mono` | JetBrains Mono 系 |

> font-family名は Adobe Fonts の指定に合わせて **小文字・ハイフン区切り**: `mozaic-geo-variable`
> 読み込み: `src/styles/fonts.css` で `@import url('https://use.typekit.net/vpb8rae.css')`
> ローカルにフォントファイルは置かない（CDN利用）

---

## フォントウェイト

| 値 | CSS変数 |
|---|---|
| 300 | `--font-weight-light` |
| 400 | `--font-weight-regular` |
| 500 | `--font-weight-medium` |
| 700 | `--font-weight-bold` |
| 900 | `--font-weight-black` |

---

## 共通テキストスタイル（Header / ナビ等の英語ラベル）

```scss
font-family: var(--font-en);
font-size: 14px;
font-weight: var(--font-weight-light);
letter-spacing: 1.12px;
```

---

## ボーダー半径・トランジション・z-index

| 用途 | CSS変数 |
|---|---|
| border-radius 小 | `--border-radius-sm` (4px) |
| border-radius 中 | `--border-radius-md` (8px) |
| border-radius 大 | `--border-radius-lg` (16px) |
| border-radius 円 | `--border-radius-full` (9999px) |
| transition 速 | `--transition-fast` (150ms) |
| transition 標準 | `--transition-base` (300ms) |
| transition 遅 | `--transition-slow` (500ms) |
| z-index header | `--z-header` (100) |
| z-index overlay | `--z-overlay` (200) |
| z-index modal | `--z-modal` (300) |
| z-index toast | `--z-toast` (400) |

---

## 追加ルール

- 新しいカラー・フォント・スペーシング値が必要になったら、まず `_variables.scss` に追加してから CSS 変数経由で使う
- ハードコードされたカラーコードや px 値を見つけたら、変数化を検討する
- 既存トークンで足りる場合は新規追加せず再利用する
