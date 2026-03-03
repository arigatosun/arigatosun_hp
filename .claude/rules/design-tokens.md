---
paths:
  - "src/styles/**"
  - "src/**/*.module.scss"
---

# デザイントークン（Figma実測値）

## 確定済みの値（変更禁止）

### カラー
| 用途 | CSS変数 | 値 |
|---|---|---|
| テキスト | `--color-black` | `#140700` |
| ブランドレッド | `--color-primary` | `#DA2719` |
| 背景 | `--color-white` | `#FFFFFF` |

### フォント
| 用途 | CSS変数 | フォント名 |
|---|---|---|
| 英語・メインフォント | `--font-en` | `mozaic-geo-variable`（Adobe Fonts CDN経由） |
| 日本語フォールバック | `--font-jp` | `Noto Sans JP` 等 |

> font-family名は Adobe Fonts の指定に合わせて **小文字・ハイフン区切り** で記述する。
> CDN読み込み: `https://use.typekit.net/vpb8rae.css`（layout.tsx の `<head>` に設定済み）

### 共通テキストスタイル（Header/ナビゲーション等）
- font-size: `14px`
- font-weight: `300`（`--font-weight-light`）
- letter-spacing: `1.12px`

## 追加ルール
- 新しいカラーやフォントを追加する場合は `_variables.scss` に定義してからCSS変数経由で使用する
- ハードコードされたカラーコードを見つけたら変数化を検討する
