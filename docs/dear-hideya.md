# ひでへ — このプロジェクトの始め方

久しぶり。

ブートキャンプでしゃべったような一緒に同時に開発はまだ実現せんかったけど、
俺の開発してた途中のプロジェクトをひでが最後まで完走させるっての最高にえもい。

ここに、最初の30分でやることだけまとめる。

---

## 0. 用意するもの

- Node.js 20+ / npm / git
- **Claude Code CLI**（必須）— このプロジェクトは Claude Code 前提で設計されてる
- エディタは Cursor / VSCode ターミナルどちらでも

---

## 1. 30分でローカル起動

```bash
git clone https://github.com/arigatosun/arigatosun_hp.git
cd arigatosunWEB
npm install
npm run dev
```

`http://localhost:3000` が開けば OK。

---

## 2. 最初に読む順番（全部読もうとしなくていい）

最初は **CLAUDE.md だけ読めば OK**。あとは必要になったら参照する。

1. `CLAUDE.md`（プロジェクトルート） — 司令塔・全体目次（103行）
2. `.claude/rules/design-tokens.md` — 使える色・フォント変数
3. `.claude/rules/responsive.md` — このプロジェクトの根幹（Fluid-First）
4. `.claude/rules/coding-standards.md` — TSX / SCSS 書き方
5. `.claude/rules/component-creation.md` — 新規コンポーネント手順
6. `.claude/rules/design-to-implementation.md` — Figma → 実装フロー
7. `.claude/rules/asset-management.md` — 画像・3D 配置ルール
8. `.claude/rules/pre-commit-checklist.md` — コミット直前チェック

迷ったら CLAUDE.md の「ルーティング目次（IF-THEN）」を見る。
それで分からなければ Claude Code に **「`.claude/rules/xxx.md` を読んで○○について教えて」** と聞く。

---

## 3. 最初に試してほしいこと — `/capture-image`

Figma のスクショを Claude Code に貼って、自由文で「このセクション実装したい」と書くと、

1. セクション分解の視覚図（PC / SP の平面ボックス図）
2. クラス名提案
3. 余白・フォントの fluid() コード
4. SP 対応プラン
5. ファイル構成

を MD で出して、**修正点を伝える or "GO" と返すまで実装に走らない**。
「先に方針を整える → 手を動かす」のクセを強制するスキルを仕込んだ。

これを最初に体験すると、Claude Code の使い方が体感で分かる。

### やってみる手順

1. Figma で実装したいセクションを矩形選択して PNG コピー
2. Claude Code に画像をペースト + 「ヒーロー部分実装したい」とか
3. 8ブロック提案が返る
4. 気になる箇所だけ修正指示 or 「GO」

---

## 4. 詰まった時の流れ

1. まず Claude Code に聞く（`.claude/rules/` を Read させながら質問）
2. 30 分やってもダメなら DM
3. 「どこで詰まったか」「何を試したか」を 1〜2 行で書いてくれると即返せる

---

## 5. 自由に育てて欲しい

`.claude/rules/` も skills も hooks も、ひでが触ってる間に「もっとこうした方がいい」って思ったら **遠慮なく書き換えてOK**。司令塔は使う人に最適化されるべきだから、CLAUDE.md も skill も育てていって。

ハック集はこっちに置いといた → [`docs/CLAUDE_CODE_HACKS.md`](./CLAUDE_CODE_HACKS.md)

楽しんで。

— だいち
