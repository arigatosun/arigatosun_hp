# TOP ページ Figma 準拠 実装進捗

> TOP ページ各セクションを Figma デザインに合わせる作業の進捗トラッカー。
> どこが完了し、どこが未着手かを判断するための一覧。
> 最終更新: 2026-05-18

## 凡例

| 記号 | 意味 |
|---|---|
| ✅ | 完了（Figma 準拠・ブラウザ実測で一致確認済み） |
| 🔧 | 一部対応（残課題あり） |
| ⬜ | 未着手 |

---

## セクション別ステータス（ページ上から順）

| # | セクション | 状態 | ブランチ / PR | 内容・残課題 |
|---|---|---|---|---|
| 0 | ヘッダー / フッター（共通） | ✅ | `fix/header-footer` / **PR #1** | nav 文字 16px・gap 80px、CONTACT ボタン 380×72・枠線なし、フッター右カラム幅 等を Figma 準拠 |
| 1 | Hero（ロゴ＋キャラ＋ラベル＋情報） | ✅ | `feature/top-hero-figma` / **PR #4** | ロゴ 572×124、3Dキャラ 162×166、ラベル 18px/2.34、heroInfo 右余白60px を Figma 準拠 |
| 2 | About | ✅ | `feature/top-about-figma` / **PR #3** | 見出し 32/66/25.6・本文 20/62/3.6 に補正、テキスト白背景リベール演出を削除 |
| – | 赤モチーフ（ParallaxMotifs・ページ装飾） | ✅ | `feature/top-about-figma` / **PR #3** | Figma 書き出し17シェイプで全面リビルド。各シェイプ独立パララックス＋浮遊。開始位置調整済み |
| 3 | Service（ServiceSection） | ⬜ | — | **未着手**。差分監査でリード文 line-height のドリフト検出（54→44 が Figma） |
| 4 | Works（WorksSection） | ⬜ | — | **未着手**・未監査 |
| 5 | News（NewsSection） | ⬜ | — | **未着手**・未監査（記事本文は WordPress REST API 連携予定で動的） |
| 6 | LogoSlider（企業ロゴスライダー） | ⬜ | — | **未着手**・未監査 |
| 7 | MessageSection（RISE WITH THANKS） | ✅ | `feature/top-message-scroll-reveal` / **PR #2** | タイポを Figma 準拠（36/24 等）に補正、スクロール連動カラーリベール（白→赤）実装 |

---

## PR 一覧

| PR | タイトル | ブランチ | 状態 |
|---|---|---|---|
| #1 | ヘッダー/フッターを Figma 実測値に準拠 | `fix/header-footer` | レビュー待ち |
| #2 | MessageSection を Figma 準拠に修正＋スクロール連動カラーリベール | `feature/top-message-scroll-reveal` | レビュー待ち |
| #3 | About セクションと赤モチーフを Figma 準拠に修正 | `feature/top-about-figma` | レビュー待ち |
| #4 | Hero セクションを Figma 準拠に調整 | `feature/top-hero-figma` | レビュー待ち |

> PR #3 と #4 はともに `src/app/page.module.scss` を編集（編集箇所は About 系 / Hero 系で分離）。

---

## 残課題（差分監査で判明・未対応）

- **Service セクション**: リード文の line-height が Figma より広い（行間ドリフト）
- **3D キャラクター（footer / works）**: Figma 比 約2倍サイズで表示されている（Hero のキャラは PR #4 で対応済み）
- **`fluid()` の負値バグ**: footer の `.sitCharacter` `top: fluid(-184,-354)` は min>max のため `clamp` が常に min(-184) を返す。負値レンジを扱う際は要注意
- **Works / News / LogoSlider**: 未監査。着手時に Figma 実測との差分監査が必要

---

## 進め方の指針

- 1セクション = 1ブランチ = 1PR（`main` から分岐）
- 各セクションは `capture-image` フロー（Figma実測 → 構造化提案 → GO → 実装 → ブラウザ照合）で進める
- 詳細は `.claude/rules/figma-mcp-workflow.md` / `design-to-implementation.md` を参照
