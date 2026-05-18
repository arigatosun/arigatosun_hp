# 外部開発者向け 開発フロー ガイドライン

> 合同会社アリガトサン コーポレートサイト（`arigatosun_hp`）の開発に参加する開発者向けオンボーディング。
> このドキュメントを上から順に読めば、環境構築 → 最初の PR まで一気通貫で進められる。

---

## 0. プロジェクト概要

- **目的**: 合同会社アリガトサンのコーポレートサイト
- **本番想定 URL**: 未定（運用フェーズで追記）
- **デザインソース**: Figma（URL は別途共有）
- **リポジトリ**: https://github.com/arigatosun/arigatosun_hp
- **メインブランチ**: `main`（直接コミット運用は管理者のみ、外部開発者は必ず PR 経由）

### 技術スタック

| 区分 | 採用技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| スタイル | SCSS Modules + CSS変数 + `clamp()` ベース Fluid Design |
| 3D | React Three Fiber + Three.js + drei |
| アニメーション | GSAP (ScrollTrigger 含む) |
| CMS | WordPress REST API（NEWS セクションのみ、後日連携） |
| パッケージマネージャ | **npm**（yarn / pnpm 不可、lockfile 統一のため） |

---

## 1. 必須ツール

| ツール | バージョン | 用途 |
|---|---|---|
| Node.js | 20 LTS 以上 | ランタイム |
| npm | Node 同梱版 | 依存管理 |
| git | 2.40+ | バージョン管理 |
| Claude Code CLI | 最新 | **必須**。本プロジェクトは Claude Code 前提で設計・運用 |
| Figma デスクトップアプリ | 最新 | Dev Mode MCP サーバー利用のため |
| エディタ | VSCode / Cursor 推奨 | TypeScript + SCSS 拡張前提 |

> Claude Code を使わずに開発することは禁止していないが、`.claude/rules/*.md` に蓄積した規約と `/capture-image` 等のスキルを使わないと品質維持コストが跳ね上がる。**原則 Claude Code 前提**で進めてほしい。

---

## 2. 環境構築（初回 30 分）

```bash
git clone https://github.com/arigatosun/arigatosun_hp.git
cd arigatosun_hp
npm install
npm run dev
```

`http://localhost:3000` が開けば OK。

### 環境変数

`.env.local` をルートに作成（必要な値は管理者から個別共有）：

```
NEXT_PUBLIC_WORDPRESS_API_URL=    # NEWS 連携時に設定（未設定でもビルドは通る）
```

> `.env*` は **絶対にコミットしない**。`.gitignore` 済みだが、`git add -A` を避け `git add <file>` で明示的にステージする習慣をつける。

### Claude Code 初期セットアップ

1. リポジトリルートで `claude` を起動
2. 起動時に `CLAUDE.md`（プロジェクト司令塔）が自動読込される
3. `.claude/rules/*.md` は会話中に必要に応じて参照される
4. `.mcp.json` に `figma-dev-mode` SSE サーバーが登録済み。Figma デスクトップアプリの **Preferences > Enable Dev Mode MCP Server** をオンにする

---

## 3. 開発の絶対ルール（破ったら全部やり直し）

`CLAUDE.md` の「最重要ルール」と同一。**ここを読まずに実装したコードは PR で差し戻される**。

### 3-1. Fluid-First レスポンシブ

スケーラブルな値（**font-size / margin / padding / width / height / 位置**）は必ず `@include fluid()` を使う。

```scss
// ❌ NG
.title { font-size: 48px; margin-top: 80px; }

// ✅ OK
.title {
  @include fluid(font-size, 24px, 48px);
  @include fluid(margin-top, 40px, 80px);
}
```

- Figma 値 = `max`
- min 値は `.claude/rules/responsive.md` の算出テーブルから引く
- 例外（border-width / border-radius / 8px 以下の微小値 / vw・% 等）も同ファイルに明記済み

### 3-2. 色は CSS 変数経由

`#xxxxxx` 直書きは禁止。新色が必要なときは `src/styles/_variables.scss` に定義してから使う。トークン一覧は `.claude/rules/design-tokens.md`。

### 3-3. コンポーネントは 3 点セット

```
src/components/ui/MyComponent/
├── MyComponent.tsx
├── MyComponent.module.scss   # 先頭2行: @use '@/styles/fluid' as *; @use '@/styles/breakpoints' as *;
└── index.ts
```

### 3-4. 2 カラム横並びには SP 縦積み必須

```scss
.row {
  display: flex;
  gap: 40px;

  @include sp {
    flex-direction: column;
    gap: 24px;
  }
}
```

---

## 4. ディレクトリ要点

```
src/
├── app/                # App Router ページ
├── components/
│   ├── layout/         # Header, Footer 等のサイト共通
│   ├── ui/             # セクション + 汎用UI
│   └── three/          # React Three Fiber 関連
├── data/               # 静的データ（後日 CMS 差し替え予定）
├── lib/                # ユーティリティ
├── styles/             # _variables / _fluid / _breakpoints / globals / fonts.css
└── types/              # 共通型定義
public/
├── images/             # セクション別画像
└── models/             # 3D モデル (.glb)
.claude/
├── rules/              # コーディング規約 (Claude 司令塔の参照先)
└── skills/             # カスタムスキル（capture-image 等）
docs/                   # 人間向け詳細資料
```

---

## 5. ブランチ戦略

| ブランチ | 用途 | 命名例 |
|---|---|---|
| `main` | 安定版。管理者以外は直接 push しない | — |
| `feature/*` | 機能実装 | `feature/about-member-detail` |
| `fix/*` | バグ修正 | `fix/header-mobile-overflow` |
| `chore/*` | ビルド・設定・ドキュメント | `chore/update-readme` |

### フロー

```bash
git checkout main && git pull
git checkout -b feature/<short-name>
# ... 実装 ...
git push -u origin feature/<short-name>
gh pr create   # または GitHub UI から
```

- `git push --force` 禁止
- レビュー指摘対応は **追加コミット**（amend / force-push しない）
- マージ済みブランチはレビュアー側で削除

---

## 6. コミット規約

- 言語: **日本語**
- フォーマット: `Phase X: 実装内容の要約` または `<種別>: <要約>`
- 1 コミット 1 論点（巨大コミット禁止）
- `.env*`、`node_modules`、`.next`、`.DS_Store` をコミットしない

良い例：

```
Phase 6: MemberDetail SNS ブロックを Figma 準拠で右上配置に修正
fix: Header のモバイル overflow を fluid() 化で解消
chore: pre-commit hook の eslint 対象拡張
```

避ける例：

```
update
fix bug
WIP
```

---

## 7. Figma → 実装フロー（推奨パス）

### A. Claude Code + `/capture-image` スキル（推奨）

1. Figma で対象セクションを矩形選択 → PNG コピー、または該当 Frame の URL をコピー
2. Claude Code に画像 or URL を貼り付け、「このセクション実装したい」と書く
3. `/capture-image` が自動起動し、**Figma Dev Mode MCP** から実測値（width / padding / font-size / 色変数）を取得
4. 8 ブロックの構造化提案（セクション分解 / クラス名 / 寸法表 / SP 対応 / ファイル構成 / コンテンツ照合 等）が返る
5. 修正点を伝える、または `GO` と返事
6. 実装 → ローカル確認 → コミット

詳細は `.claude/rules/figma-mcp-workflow.md` と `.claude/skills/capture-image/SKILL.md`。

### B. 手動フロー

1. Figma の右パネルで PC 値（W / H / font / 余白）を読む
2. `.claude/rules/responsive.md` の算出テーブルで min を決める
3. `@include fluid()` で SCSS を書く
4. SP レイアウト切替を `@include sp` で書く
5. 320 / 375 / 768 / 1200px で目視確認

詳細は `.claude/rules/design-to-implementation.md`。

---

## 8. 品質チェック（PR 前 必須）

`.claude/rules/pre-commit-checklist.md` を完全準拠。要点：

### ビルド・Lint

```bash
npm run lint    # エラー 0
npm run build   # 成功（型・SCSS エラー含めゼロ）
```

### レスポンシブ目視確認（4 ポイント）

| 幅 | 想定 |
|---|---|
| 320px | 最小スマホ |
| 375px | 標準スマホ |
| 768px | タブレット境界 |
| 1200px | PC 上限 |

DevTools のデバイスツールバー（Ctrl+Shift+M）で切り替え、変更セクションをスクロールして「重なり / はみ出し / 横スクロール発生 / 画像潰れ」が無いか確認。

### コード自己点検

- [ ] スケーラブル値に固定 px が無い
- [ ] 色が `var(--color-xxx)` 経由
- [ ] 横並びに `@include sp` 対応がある
- [ ] `.module.scss` 先頭に `@use fluid` / `@use breakpoints`
- [ ] `console.log` / 死んだコメント / 未使用 import を削除

---

## 9. Pull Request 運用

### PR テンプレート（手動でこの構成で書く）

```markdown
## 概要
<1〜3 行で「何を」「なぜ」変えたか>

## 変更点
- 〜を追加
- 〜を修正

## 影響範囲
- 触ったページ / コンポーネント

## 動作確認
- [ ] 320 / 375 / 768 / 1200px で目視確認
- [ ] npm run lint / npm run build がエラー 0
- [ ] Figma との見た目差分を比較

## スクリーンショット
<PC / SP それぞれ 1 枚以上>

## 関連
- Figma: <該当 Frame の URL>
- Issue: #
```

### レビューサイクル

1. PR 起票（Draft でも可）
2. 管理者 1 名以上の Approve でマージ可
3. 指摘は GitHub のレビューコメントで返す。**完了コメントを付ける**（「f3a2b1c で対応しました」等）
4. マージは原則 **Squash and merge**。コミット粒度が綺麗なら Rebase merge も可（管理者判断）

---

## 10. 詰まったときの優先順位

1. **`CLAUDE.md`** のルーティング目次から該当 `.claude/rules/*.md` を読む
2. それで分からなければ **Claude Code** に「`.claude/rules/<該当ファイル>.md` を読んだ上で X を教えて」と聞く
3. それでも分からなければ `docs/` 配下の詳細資料（`DEVELOPMENT.md` / `RESPONSIVE_GUIDE.md` 等）
4. それでも詰まったらリポジトリ管理者に DM
   - 報告フォーマット: **「何をやろうとして」「どこで詰まって」「何を試したか」を 3 行以内**

---

## 11. やってはいけないこと（NG リスト）

- `main` への直接 push
- `git push --force`（任意のブランチで）
- `.env*` のコミット
- 固定 px でスケーラブル値を書く
- `#xxxxxx` 直書き
- `git add -A` / `git add .` の常用（無関係ファイル混入リスク）
- Figma の生成コードをそのままコピペ（プロジェクト規約と整合しない）
- 「動いたから OK」での PR（4 幅レスポンシブ確認なしは差し戻し）
- レビュー指摘への amend / force-push 対応

---

## 12. 連絡

| 用途 | 連絡先 |
|---|---|
| リポジトリ管理者 | k2@arigatosun.com |
| 緊急 | DM（別途共有） |

---

## 付録: 参照ドキュメント早見表

| 知りたいこと | ファイル |
|---|---|
| 全体司令塔・目次 | `CLAUDE.md` |
| fluid() の min 値算出 | `.claude/rules/responsive.md` |
| デザイントークン | `.claude/rules/design-tokens.md` |
| TSX / SCSS 規約 | `.claude/rules/coding-standards.md` |
| 新規コンポーネント手順 | `.claude/rules/component-creation.md` |
| Figma → 実装フロー | `.claude/rules/design-to-implementation.md` |
| Figma MCP 詳細 | `.claude/rules/figma-mcp-workflow.md` |
| アセット配置・命名 | `.claude/rules/asset-management.md` |
| コミット前チェック | `.claude/rules/pre-commit-checklist.md` |
| 環境・スタック詳説 | `docs/DEVELOPMENT.md` |
| レスポンシブ設計思想 | `docs/RESPONSIVE_GUIDE.md` |
| 3D 演出仕様 | `docs/3D-ARIGATOKUN-RUNNER.md` |
