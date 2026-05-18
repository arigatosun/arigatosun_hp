# 次セッション向けハンドオフ — アリガトサンWEB

> 最終更新: 2026-05-16（Phase 5 中間コミット時点）
> **次セッション開始時は必ずこのドキュメントを読む**

---

## 経緯サマリ

当初は外部メンバー（ヒデヤ三藤）への引き継ぎを準備していたが、本人実装に方針変更。
「爆速 × ピクセルパーフェクト」を目標に、エージェント主導の自律開発フローへ移行中。

Phase 4 で **「Figma 寸法は取ったが写真と本文は既存データ流用してハーフ実装」** という重大な見落としが判明。
Phase 5 で ABOUT/MEMBER 詳細ページを **Figma 準拠で全面刷新** する作業中。

---

## Phase 5 中間コミットで完了したこと

### A. データ層拡張
- `src/types/member.ts` に Phase 5 拡張フィールド追加: `roleJp` / `quote` / `introParagraphs`
- `src/data/members.ts` の `shuto-nakamura` に Figma 準拠データ反映
- 写真ファイル `public/images/team/shuto-nakamura.png` を Figma の黒スーツ単体カットに **差し替え済み**（2.9MB）

### B. 新規コンポーネント 5 個（3点セット × 5 = 15 ファイル）
- `MemberQuoteText` — 引用文「関わる人へ想像以上の〜」(20px Noto Sans JP Regular)
- `MemberIntroText` — 自己紹介本文 9 段落（16px Noto Sans JP Regular）
- `MemberSocialLinks` — INSTAGRAM のみ（16px Mozaic Light, underline, #808080）
- `MemberCareerSection` — 経歴タイトル + 本文
- `MemberProjectGrid` — プロジェクト 3 列グリッド

### C. page.tsx 全面刷新
- 既存 `catchphrase / description / careerSection / projectsSection / infoHeader` 等の旧構造を破棄
- 新コンポーネント順序に置換: Hero → SocialLinks → Quote → Intro → Career → Projects → MemberSection slider

### D. 既知の不具合と一時対処
- **画像最適化キャッシュ問題**: Next.js dev で `/_next/image?url=...&w=...&q=...` の AVIF/WebP キャッシュが古い画像を返し続ける
- 一時対処: `MemberHeroBlock` の `<Image>` に `unoptimized` を付与（最適化バイパス）

---

## 残課題（次セッションで対応、優先度順）

| # | 課題 | 説明 |
|---|---|---|
| 1 | **INSTAGRAM の位置調整** | Figma では Hero ブロックの右上想定。現状は Hero の下に独立配置されている。`MemberSocialLinks` を `MemberHeroBlock` 内に取り込んで absolute 配置するのが正攻法 |
| 2 | **`unoptimized` の恒久対策** | `.next/cache/images` クリア or 画像ファイル名バージョニング (例: `shuto-nakamura-v2.png`) で対処。本番 build では一度クリアすれば解消するはず |
| 3 | **プロジェクトカード画像 6 枚** | Figma 上に CHOBITZ 等のサムネイル画像あり。MCP `localhost:3845/assets/*.png` から curl ダウンロード → `public/images/works/` に配置 → `members.ts` の `projects[].thumbnail` に追加 |
| 4 | **MemberRelatedStrip の画像** | Figma に10人分のメンバー写真あり（imgRectangle337/353/358/359/360/361/362/363/364/365）。各メンバーの photo に追加すれば既存 `MemberSection slider` で自動表示。「ARIGATO KUN」も Figma にあるが members.ts には居ない |
| 5 | **フルページスクショで全体確認** | playwright `fullPage: true` で経歴・プロジェクト含む全体確認、Figma と並べて差分検証 |
| 6 | **ピクセルパーフェクト微調整** | 各ブロック間の余白（margin-top）を Figma 実測値で再調整。現状は仮置き (24/40/80 px) |

---

## サイト全体の残実装（低優先、別タスク）

- [x] `NEXT_PUBLIC_WORDPRESS_API_URL` 環境変数設定（NEWS が実API化）— ✅ 完了 2026-05-18（`.env.local` に設定）
- [ ] `/api/contact` のメール送信実装確認（Resend は dependencies 入り）— `RESEND_API_KEY` は `.env.local` に設定済み・ビルド通過確認済み。実際のメール送信は未検証
- [ ] `/service/[serviceId]/page.tsx` 新設
- [ ] SEO メタデータ（og:image / og:title）
- [ ] 3D GLB ファイルサイズ最適化
- [x] 既存 ESLint エラー 4 件の解消 — ✅ 完了 2026-05-18（`react-hooks` 系 4 件 + 警告 8 件すべて解消）

---

## ⚠️ 本番デプロイ前の必須チェック

> 本番環境の動作確認のタイミングで必ず確認すること。

### next/image の画像ドメイン許可（remotePatterns）

NEWS のサムネイル / アイキャッチを `next/image` で表示している
（`src/app/news/page.tsx` / `src/app/news/[slug]/page.tsx` / `src/components/ui/NewsSection/NewsSection.tsx`）。

`next/image` は `next.config.ts` の `images.remotePatterns` に登録したドメインの画像しか表示できない。

- 現状の登録は `arigatosun-web.local`（ローカル開発用の WordPress）のみ。
- **本番の WordPress を別ドメインに置く場合、そのドメインを `remotePatterns` に追加しないと本番でニュース画像が表示されない。**
- 未登録のままだと `Invalid src prop ... hostname is not configured under images in your next.config.ts` というエラーになる。

対応は `next.config.ts` に1行追記するだけ:

```ts
images: {
  remotePatterns: [
    { protocol: 'http',  hostname: 'arigatosun-web.local' },   // ローカル用（残してOK）
    { protocol: 'https', hostname: '<本番WordPressドメイン>' }, // ← 本番ドメインを追加
  ],
},
```

---

## 次セッション再開時の初回プロンプト（コピペ用）

```
アリガトサンWEBの開発を再開します。Phase 5 続き。

最初に docs/next-session-handoff.md を読んで、これまでの経緯と残課題を把握してください。
そのあと以下を進める：

1. dev サーバーをポート3034で起動（npm run dev -- -p 3034 --webpack）
   ※ Turbopack はファイル変更で固まる事例があったので webpack 推奨
2. Figma MCP の疎通確認（mcp__figma-dev-mode__get_metadata で空打ち）
3. 残課題の #1（INSTAGRAM 位置）か #3（プロジェクト画像）から着手するか提案
4. capture-image スキルのフェーズ1 ⑧ コンテンツ照合チェックリストを必ず通すこと

Figma はデスクトップアプリで「アリガトサン_Webサイト」を開いて、
Preferences > Enable local MCP server を ON、ABOUT~MEMBER(各詳細ページ)~1 のフレームを
選択した状態にしてあります。
```

---

## 技術ノート

### Figma MCP の注意点

- ページ全体の `get_metadata` は出力が巨大（437k〜746k 文字）→ ファイル保存され、Agent経由で解析する
- セクション単位（子ノード）の `get_design_context` は軽量、こちらを直接使う
- URLの `node-id=1234-5678` を `1234:5678` に変換して指定
- **画像URLは揮発する**: `localhost:3845/assets/...` は Figma が動いてる間のみ。`public/` に保存すること
- セッションアクティビティが「未送信」だと `nodeId` 省略呼び出しが効かない → URL方式で nodeId 明示が確実

### MCP 接続が切れた時

Claude Code セッション中に Figma MCP が disconnect すると、`ToolSearch` でも `select:mcp__figma-dev-mode__*` が再認識されない。
→ **Claude Code を再起動** することでMCPツールが再読み込みされる。

### Next.js dev サーバーの罠

- **Turbopack はファイル変更で固まることがある** → `--webpack` を付ける（Next.js 16 でも有効）
- 起動失敗 `EADDRINUSE` のときはポート変更 (3030 → 3031 → 3032 → 3033 → 3034 と試した経緯あり)
- 起動失敗 `Unable to acquire lock at .next/dev/lock` → `rm -f .next/dev/lock` で削除
- **画像最適化キャッシュ問題**: 写真差し替え後も古い画像が表示される。`unoptimized` 一時付与 or `.next/cache/images` 削除 or 画像ファイル名バージョニングで対処

### ピクセルパーフェクト検証（playwright ad-hoc）

- `scripts/_*.ts` （アンダーバー始まり）は `.gitignore` で除外済みの試運転用スロット
- `scripts/_review-member-hero.ts` を再利用可能（URL を 3034 等に書き換える）
- `page.evaluate` には **IIFE文字列** `(() => {...})()` を渡す（tsx の `__name` ヘルパー注入を回避）
- `waitUntil: 'networkidle'` は来ないことがあるので `'domcontentloaded'` + `waitForTimeout(3000)` 推奨

### Figma 実測値（Phase 5 取得済み）

| 要素 | nodeId | スタイル |
|---|---|---|
| 写真 | 1705:44859 | 293×293, localhost:3845/assets/92c31c4...png |
| 役職「代表社員」 | 1578:63977 | 15px Noto Sans JP / 16px Mozaic Light, #808080 |
| 氏名 | 1578:63978 | 28px Mozaic Light, letter-spacing 3.64, black |
| INSTAGRAM | 1578:64875 | 16px Mozaic Light, #808080, underline, text-center |
| 引用文 | 1578:64878 | 20px Noto Sans JP Regular, letter-spacing 2.6, black |
| 自己紹介本文 | 1578:64879 | 16px Noto Sans JP Regular, letter-spacing 3.84, black |
| 経歴タイトル | 1578:64876 | 16px Noto Sans JP Regular, #808080 |
| 経歴本文 | 1578:64880 | 16px Noto Sans JP Regular, black（プレースホルダー） |
| プロジェクトタイトル | 1578:64877 | 16px Noto Sans JP Regular, #808080 |
| 他メンバー | 1705:44906 | 231×231 写真 + 14px 役職 + 18px 氏名 ×10人 |

---

## ドキュメント参照リンク

- 司令塔: `CLAUDE.md`
- 残作業の元データ: `memory/` 配下（ローカルPC固有、別マシンでは要再構築）
- Figma MCP ワークフロー: `.claude/rules/figma-mcp-workflow.md`
- capture-image スキル: `.claude/skills/capture-image/SKILL.md`（⑧コンテンツ照合チェックリスト追加済）
