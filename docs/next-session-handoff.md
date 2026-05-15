# 次セッション向けハンドオフ — アリガトサンWEB

> 作業日: 2026-05-15（Phase 4）
> **自宅PCから再開する時は、まずこのドキュメントを読む**

---

## 経緯サマリ

当初は外部メンバー（ヒデヤ三藤）への引き継ぎを準備していたが、本人実装に方針変更。
「爆速 × ピクセルパーフェクト」を目標に、エージェント主導の自律開発フローへ移行中。

---

## Phase 4 で完了したこと

### A. 自律開発インフラ整備
- `.claude/rules/figma-mcp-workflow.md` 新設（Figma URL → MCP 自動取得の単一ソース）
- `.claude/skills/capture-image/SKILL.md` を 4 フェーズ化（フェーズ0 = Figma MCP 自動連携を追加）
- `CLAUDE.md` のルーティング目次に Figma MCP 行を追加

### B. ABOUT/MEMBER 詳細ページ 試運転実装
- `MemberHeroBlock` 新規作成（`src/components/ui/member-detail/MemberHeroBlock/` の3点セット）
- `src/app/about/member/[slug]/page.tsx` の Hero 部分を新コンポーネントに差し替え
- Figma実測値（写真293×293、氏名 font-size 28、letter-spacing 3.64 等）と DOM実測値が**完全一致**を確認

### C. レビュー手順の確立
- playwright で ad-hoc スクリプトを書いてDOM実測値・スクショを抽出できることを実証
- 既存の `pp:capture` / `pp:compare` は Hero(TOP) 専用、メンバー系は別途検証スクリプトで進める方針

---

## 残作業（ABOUT/MEMBER 詳細ページ、優先度順）

| # | コンポーネント名 | 役割 | Figma nodeId（参考） |
|---|---|---|---|
| 1 | `MemberSocialLinks` | INSTAGRAM / X リンク（Hero右上想定） | `1601:67770` |
| 2 | `MemberIntroText` | 自己紹介本文（"関わる人へ〜"の引用+段落） | `1578:64878-79` |
| 3 | `MemberCareerSection` | 経歴・スキル一覧 | `1578:64876-80` |
| 4 | `MemberProjectGrid` | 関わったプロジェクト3列グリッド | `1644:176303` 系 |
| 5 | `RelatedMembersStrip` | 他メンバー一覧（既存 MemberSection slider 流用検討） | `1705:44906` |

> 親フレーム: ABOUT~MEMBER(各詳細ページ)~1 = `1578:63922`（PC 1920×3927）

### 関連する重要修正（並行 or 先行で着手したい）

- **3Dキャラの被り**: GlobalCanvas が写真エリアにオーバーレイされている（Figmaにない）。ABOUT/MEMBER詳細では非表示 or z-index調整を検討
- **既存 `page.module.scss` の整理**: 旧クラス（`photoArea` / `photo` / `photoPlaceholder` / `infoHeader` / `infoHeaderLeft` / `role` / `name` / `divider`）が未使用で残っている。クリーンアップ
- **`Member` 型の拡張**: `roleJp` を Member 型に持たせると詳細ページのハードコード（roleJpMap）が消える

---

## サイト全体の残実装（低優先、別タスク）

- `NEXT_PUBLIC_WORDPRESS_API_URL` 環境変数設定（NEWS が実API化）
- `/api/contact` のメール送信実装確認（Resend は dependencies 入り）
- `/service/[serviceId]/page.tsx` 新設（リンクは張られているが本体なし）
- SEO メタデータ（og:image / og:title）
- 3D GLB ファイルサイズ最適化（Draco 圧縮検討）
- 既存 ESLint エラー4件の解消（HeroAnimation / MemberSection / NewsSection / RevealText）

---

## 自宅PC再開時の初回プロンプト（コピペ用）

```
アリガトサンWEBの開発を再開します。前回（2026-05-15）の続き。

まず docs/next-session-handoff.md を読んで、残作業の優先順位と前回の経緯を把握してください。
その後、以下の順で進めたい：

1. dev サーバーをポート3030で起動（他プロジェクトと衝突回避のため）
2. http://localhost:3030/about/member/shuto-nakamura を確認
3. 3Dキャラが写真エリアに被ってる問題を先に解消するか、次のサブセクション（MemberSocialLinks）から着手するか提案して

Figmaデスクトップアプリで「アリガトサン_Webサイト」ファイルを開いて、
Preferences > Enable local MCP server を ON にしておきます。
```

---

## 技術ノート

### Figma MCP 自動連携の使い方

1. Figma デスクトップアプリで対象ファイルを開く（**Webブラウザ版ではダメ**）
2. Preferences > Enable local MCP server を ON
3. `capture-image` スキル発動時に Figma URL を渡す
4. スキルが自動で `mcp__figma-dev-mode__get_design_context` / `get_variable_defs` を呼ぶ

### Figma MCP の注意点

- ページ全体の `get_metadata` は出力が巨大（437k〜746k 文字）→ ファイル保存され、Agent経由で解析する
- セクション単位（子ノード）の `get_design_context` は軽量、こちらを直接使う
- URLの `node-id=1234-5678` を `1234:5678` に変換して指定
- セッションアクティビティが「未送信」だと `nodeId` 省略呼び出しが効かない → URL方式で nodeId 明示が確実

### ピクセルパーフェクト検証（playwright ad-hoc）

- `scripts/_*.ts` （アンダーバー始まり）は `.gitignore` で除外済みの試運転用スロット
- `page.evaluate` には **IIFE文字列** `(() => {...})()` を渡す（tsx の `__name` ヘルパー注入を回避）
- viewport 別に複数 context を立てて、スクショと computed style を抽出する

### MemberHeroBlock の仮置き値（要 Figma 親グループ実測）

| プロパティ | 仮置き値 | 状態 |
|---|---|---|
| `gap`（写真↔テキスト） | 60px | 目視OK、Figma親グループ取れたら上書き |
| `padding-inline` | 200px | サイト基準と推測 |
| 氏名↔区切り線 `margin-top` | 40px | 仮置き、自然に見える |

---

## ドキュメント参照リンク

- 司令塔: `CLAUDE.md`
- 残作業の元データ: `memory/` 配下（ローカルPC固有、自宅PCでは別途要再構築）
- ピクセルパーフェクト計画: `scripts/pixel-perfect/` ディレクトリ + 既存 PoC
- Figma MCP ワークフロー: `.claude/rules/figma-mcp-workflow.md`
- capture-image スキル: `.claude/skills/capture-image/SKILL.md`
