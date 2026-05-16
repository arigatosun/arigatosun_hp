# 次セッション向けハンドオフ — アリガトサンWEB

> 最終更新: 2026-05-16（Phase 4 訂正版）
> **自宅PC・別マシンから再開する時は、まずこのドキュメントを読む**

---

## 経緯サマリ

当初は外部メンバー（ヒデヤ三藤）への引き継ぎを準備していたが、本人実装に方針変更。
「爆速 × ピクセルパーフェクト」を目標に、エージェント主導の自律開発フローへ移行中。

---

## 🚨 Phase 4 のレビュー結果に重大な訂正（2026-05-16 判明）

前回ハンドオフ時点では「MemberHeroBlock 実装は Figma 準拠で完成」と報告したが、**重大な見落とし** が判明：

### 1. メンバー写真の齟齬
- **Figma**: 黒スーツの中村秀人さん単独カット
- **実装**: ベージュスーツ + 赤いアリガトくんマスコットが横にいるカット（既存 `public/images/team/shuto-nakamura.png` を流用）
- 原因: 私（Claude）が Figma MCP で寸法情報は取ったが、**画像ファイル自体を Figma からダウンロードせず既存パスを使った**
- レビュー時にも「写真の被写体に赤いキャラが含まれている＝仕様」と誤判定

### 2. 本文・SNSリンクの齟齬
- 自己紹介本文: Figma は「世は大AI時代。〜唯一無二の存在であることを誓います。」という実コンテンツ / 既存データは `"ここに簡易的な説明文が入ります"` のプレースホルダー
- 引用文: Figma に「関わる人へ想像以上の価値を提供し続け、唯一無二の存在であれ。」がある / 既存 `catchphrase` は「『できない理由』をゼロにする。」で別物
- SNS: Figma には INSTAGRAM のみ（右上配置） / 既存実装は INSTAGRAM + X が「区切り線の下」に表示

### 3. 「3Dキャラ被り解消」タスクは存在しなかった
- 前回ハンドオフで「GlobalCanvasが写真にオーバーレイ」としていたのは誤読
- 実際: `GlobalCanvas` は `app/page.tsx`（TOP）のみで呼ばれている。メンバー詳細ページには来ない
- 写真の中の赤いキャラは「写真自体の被写体の一部」（前述の写真齟齬）

### 反省

`capture-image` スキルのフェーズ1で「寸法だけでなく、画像・テキスト本文・リンク有無も照合する」が抜けていた。
→ **`SKILL.md` の ⑧ に「コンテンツ照合チェックリスト」を追加済み**（2026-05-16）。次回以降は必ずこれを通す。

---

## 方針転換: ABOUT/MEMBER 詳細ページは Figma 準拠で**全面刷新**

既存 `src/app/about/member/[slug]/page.tsx` のコンテンツ構造（`catchphrase` / `description` / `careerSection` / `projectsSection` / `MemberSection` slider）はそのまま流用せず、**Figma 通りに作り直す**。

### 大きな作業項目（次セッション開始時）

| # | やること | 状態 |
|---|---|---|
| 0 | Figma MCP 再接続（Claude Code 再起動で実施） | 必須 |
| 1 | Figma から ABOUT~MEMBER(各詳細ページ)~1 の全サブセクションを順次 `get_design_context` で取得 | — |
| 2 | `Member` 型 と `members.ts` を Figma 準拠に拡張（引用文 / 紹介文 / 経歴(構造化) / SNSは INSTAGRAM のみ / プロジェクトに画像つき） | — |
| 3 | Figma の写真を MCP 経由でダウンロード → `public/images/team/shuto-nakamura.png` を**上書き** | — |
| 4 | 既存 `page.tsx` を破棄して、Figma 準拠の新ページに置換 | — |
| 5 | サブセクションを capture-image スキルフローで順次実装 | — |

### サブセクション分割（前回 Agent 解析より、要 Figma 側で再確認）

| # | コンポーネント名 | 役割 | Figma nodeId（参考） |
|---|---|---|---|
| 1 | `MemberHeroBlock` | 写真 + 役職 + 氏名 + 区切り線（**写真差し替え必須**） | `1705:44859` 周辺 |
| 2 | `MemberSocialLinks` | INSTAGRAM 等のSNS（Figma上は右上想定） | `1601:67770` |
| 3 | `MemberQuoteText` | 「関わる人へ想像以上の〜」引用文 | （要再確認） |
| 4 | `MemberIntroText` | 自己紹介本文（実コンテンツ） | `1578:64878-79` |
| 5 | `MemberCareerSection` | 経歴（Figmaではプレースホルダーのまま） | `1578:64876-80` |
| 6 | `MemberProjectGrid` | 関わったプロジェクト 3列×2行 | `1644:176303` 系 |
| 7 | `RelatedMembersStrip` | 他メンバー横並び（既存 `MemberSection` slider 流用検討） | `1705:44906` |

> 親フレーム: `1578:63922`（PC 1920×3927、background `#F5F6F7`）

---

## サイト全体の残実装（低優先、別タスク）

- `NEXT_PUBLIC_WORDPRESS_API_URL` 環境変数設定（NEWS が実API化）
- `/api/contact` のメール送信実装確認（Resend は dependencies 入り）
- `/service/[serviceId]/page.tsx` 新設
- SEO メタデータ（og:image / og:title）
- 3D GLB ファイルサイズ最適化
- 既存 ESLint エラー4件の解消（HeroAnimation / MemberSection / NewsSection / RevealText）

---

## 自宅PC再開時の初回プロンプト（コピペ用）

```
アリガトサンWEBの開発を再開します。

最初に docs/next-session-handoff.md を読んで、Phase 4 のレビュー訂正と方針転換
（ABOUT/MEMBER 詳細ページの Figma 準拠 全面刷新）を把握してください。
そのあと以下を進めて：

1. dev サーバーをポート3030で起動
2. http://localhost:3030/about/member/shuto-nakamura で現状確認
3. Figma MCP の疎通確認（mcp__figma-dev-mode__get_metadata で空打ち）
4. 疎通OKなら、ABOUT~MEMBER(各詳細ページ)~1 (nodeId=1578:63922) のサブセクションを順次取得して
   再設計プランをユーザーに提示

Figmaデスクトップアプリで「アリガトサン_Webサイト」を開いて、
Preferences > Enable local MCP server を ON、ABOUT~MEMBER(各詳細ページ)~1 のフレームを
選択した状態にしておきます。
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
- **画像URLは揮発する**: `localhost:3845/assets/...` は Figma が動いてる間のみ。`public/` に保存すること
- セッションアクティビティが「未送信」だと `nodeId` 省略呼び出しが効かない → URL方式で nodeId 明示が確実

### MCP 接続が切れた時

Claude Code セッション中に Figma MCP がdisconnectすると、`ToolSearch` でも `select:mcp__figma-dev-mode__*` が再認識されない。
→ **Claude Code を再起動** することでMCPツールが再読み込みされる。

### ピクセルパーフェクト検証（playwright ad-hoc）

- `scripts/_*.ts` （アンダーバー始まり）は `.gitignore` で除外済みの試運転用スロット
- `page.evaluate` には **IIFE文字列** `(() => {...})()` を渡す（tsx の `__name` ヘルパー注入を回避）
- viewport 別に複数 context を立てて、スクショと computed style を抽出する

### MemberHeroBlock の仮置き値（要 Figma 親グループ実測）

| プロパティ | 仮置き値 | 状態 |
|---|---|---|
| `gap`（写真↔テキスト） | 60px | 全面刷新時に Figma 値で上書き |
| `padding-inline` | 200px | 同上 |
| 氏名↔区切り線 `margin-top` | 40px | 同上 |

---

## ドキュメント参照リンク

- 司令塔: `CLAUDE.md`
- 残作業の元データ: `memory/` 配下（ローカルPC固有、別マシンでは要再構築）
- ピクセルパーフェクト計画: `scripts/pixel-perfect/` ディレクトリ
- Figma MCP ワークフロー: `.claude/rules/figma-mcp-workflow.md`
- capture-image スキル: `.claude/skills/capture-image/SKILL.md`（⑧コンテンツ照合チェックリスト追加済）
