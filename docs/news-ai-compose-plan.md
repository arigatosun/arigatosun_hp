# ニュース AI コンポーズ + SEO 最適化 実装プラン

> 目的: 「投稿者の負荷ゼロ（素材を投げるだけ）」×「SEOで勝てる土台」の両輪を実装する。
> 本文・構造化・SEOメタ生成は **Claude**、画像生成は **Gemini 3 Pro Image（通称 Nano Banana Pro）**。
> 最後は必ず人が確認して公開する Human-in-the-loop を堅持。

最終更新: 2026-05-29

---

## 0. 前提となる現状調査の結論

### カテゴリの公開側表示（調査済み）
- TOP `NewsSection`（`src/components/ui/NewsSection/NewsSection.tsx`）と一覧 `/news`（`src/app/(site)/news/page.tsx`）は **両方とも `categories` テーブルを動的取得**。ハードコードのカテゴリ定義は存在しない。
- 新カテゴリを admin で追加すると `display_order` 順でフィルタタブに自動出現し、`.eq('categories.slug', ...)` のフィルタも正しく動く。
- **結論: 新カテゴリ追加で公開側は自動対応する。公開側の追加改修は不要。**
- 注意1: `/news` は ISR `revalidate=60` のため反映に最大60秒ラグ → publish/カテゴリ追加時に `revalidatePath('/news','/')` を足して即時化（Phase 0）。
- 注意2: 記事0件のカテゴリも空タブとして出る → AI経路は「公開記事に紐づけて初めてカテゴリ作成」で空タブを防ぐ。

### SEO の現状（不足の事実確認）
| 項目 | 現状 |
|---|---|
| sitemap.xml / robots.ts | 無し |
| meta description | DBカラム無し / `generateMetadata` は title のみ |
| OGP (og:image/title/description) | 無し |
| JSON-LD 構造化データ | 無し |
| canonical | 無し |
| 画像 alt | サムネ `alt=""`、本文画像は `alt=ファイル名` |
| 元画像最適化 | 生ファイル保存（WebP/リサイズ無し） |
| ISR/SSG | `revalidate=60` + `generateStaticParams` あり（良い） |

---

## 1. データモデル変更（マイグレーション1本）

`news` テーブルに追加:
- `description text NULL` … メタディスクリプション兼抜粋（120字目安）
- `thumbnail_alt text NULL` … サムネイルの alt（画像SEO/a11y）

本文内画像の alt は TipTap JSON の image ノード `alt` 属性で保持（`setImage({ alt })` で対応済み）。

マイグレーション後に型を再生成:
```
supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > src/types/supabase.ts
```
（env に `SUPABASE_ACCESS_TOKEN` / `SUPABASE_PROJECT_REF` あり）

---

## 2. 追加する環境変数（Vercel + .env.local + .env.example）

- `NEXT_PUBLIC_SITE_URL` … canonical / OGP / sitemap のベースURL（例: https://arigatosun.com）
- `ANTHROPIC_API_KEY` … Claude（本文・構造化・SEOメタ生成）
- `GEMINI_API_KEY` … Gemini 3 Pro Image（画像生成）

## 3. 追加依存（**要承認: Ask first**）
- `@anthropic-ai/sdk` … Claude 呼び出し（prompt caching 利用）
- `@google/genai` … Gemini 画像生成
- `sharp` … アップロード画像の WebP 変換・リサイズ（Phase 0、判断次第で見送り可）

---

## Phase 0: SEO 土台 + スキーマ（Phase 1 と並列可。スキーマのみ先行必須）

**目的: AI機能と独立にSEOで効く土台を整える。AI生成の出力先（description/alt）もここで用意。**

1. マイグレーション: `news.description` / `news.thumbnail_alt` 追加 → 型再生成。
2. `src/app/sitemap.ts` 新設: 静的ルート + `getPublishedNewsParams()` から `/news/[year]/[slug]` を動的列挙（anon クライアント）。
3. `src/app/robots.ts` 新設: 全許可 + sitemap 参照 + `/admin` を Disallow。
4. `src/lib/news/queries.ts`: select に `description, thumbnail_alt` を追加。
5. 詳細ページ `src/app/(site)/news/[year]/[slug]/page.tsx` の `generateMetadata` 拡張:
   - `description`、`openGraph`（title/description/`type:'article'`/`publishedTime`/`images:[thumbnail_url]`/`url`）、`twitter`（summary_large_image）、`alternates.canonical`。
6. 詳細ページに JSON-LD（`NewsArticle` + `BreadcrumbList`）を `<script type="application/ld+json">` で出力。
7. 画像 alt 修正: サムネ/アイキャッチは `thumbnail_alt || title`、本文画像は TipTap の alt を使用。
8. `/news` 一覧の `generateMetadata` に description / canonical。
9. アップロード最適化（`upload.ts`）: sharp で長辺リサイズ + WebP 変換してから保存（sharp 承認後）。
10. オンデマンド再検証: `saveNews` の publish 経路に `revalidatePath('/news')` / `revalidatePath('/')` / 詳細パス、`saveCategory` に `revalidatePath('/news','/')` を追加。

**完了条件**: Lighthouse SEO 100 近辺、リッチリザルトテスト合格、SNSシェアでカード表示、新記事/新カテゴリが即時反映。

---

## Phase 1: AI 下書き生成（Claude）（Phase 0 スキーマに依存。まず画像なしで通す）

### Server Action: `src/app/admin/_actions/ai-compose.ts`
`generateNewsDraft(input)`:
- 入力: `rawText`（素材本文/メモ/議事録/箇条書き）、任意 `context`（対象読者・トーン・希望カテゴリ）、任意 `sourceUrl`。
- 既存カテゴリ一覧（id/slug/label）を取得して Claude に渡す。
- Claude を **structured output（tool use / JSON schema）** で呼び、以下を一括生成:
  ```
  {
    title,                       // SEO最適・32字目安
    slug,                        // 英語ケバブ・年内ユニーク考慮
    description,                 // メタ/抜粋・120字目安
    category: { existingId? } | { new: { slug, label } },
    bodyTiptap,                  // TipTap JSON（H2/H3/リスト/引用で構造化）
    thumbnail: { prompt, alt },  // 画像生成用プロンプト + alt
    inlineImages: [{ position, prompt, alt }],
    jsonLdHints                  // 公開日/要約など
  }
  ```
- **制約プロンプト（重要）**: 「素材に書かれた事実のみ使用。新事実を創作しない」「SEOベストプラクティス（見出し構造・自然なキーワード配置・title/description 文字数）」「本文は日本語、slug は英語」。
- prompt caching: システムプロンプト + カテゴリ一覧をキャッシュ。
- サーバー側で出力を再検証（slug 正規表現・文字数・カテゴリ存在）。

### UI: `src/app/admin/(authenticated)/news/ai/page.tsx`
- 素材テキストエリア + 任意コンテキスト入力 + 「AIで生成」ボタン。
- 生成結果を `NewsForm` にプリフィル（全項目編集可）。
- AIが新カテゴリ提案時: 「新カテゴリ『X』を作成して使用」チェック → 保存時にサーバーでカテゴリ作成（`display_order` も付与）してから記事に紐づけ（**人が承認して初めて作成**）。

### `NewsForm` 拡張
- `description` フィールド + `thumbnail_alt` フィールド追加。
- AI 初期値（title/slug/category/description/body JSON）を受け取れるよう props 拡張。
- 保存は既存 `saveNews` をそのまま通す（slug年内ユニーク・カテゴリFK・サムネURL検証・RLS を再利用）。

**完了条件**: 素材を貼って「生成」→ 全項目が埋まったフォーム → 「公開する」で公開（画像はまだ手動 or 空）。

---

## Phase 2: AI 画像生成（Nano Banana Pro）+ 差し替え（Phase 1 の画像仕様に依存・順次）

### Server Action: `src/app/admin/_actions/ai-image.ts`
`generateNewsImage(prompt, aspectRatio)`:
- `@google/genai` で Gemini 3 Pro Image（Nano Banana Pro）を呼び画像生成。
- 受け取った画像バイトを `news-images` バケットへ保存（`upload.ts` のパス規約を再利用）→ 公開URL返却。
- aspect ratio: サムネ（アイキャッチ比 ~16:9 / 640px系）/ 本文挿絵。

### UI（AIレビュー画面の各画像スロット）
- 生成画像プレビュー + 「再生成」（プロンプト編集可）+ 「実写に差し替え」（既存 `ImageUploader`）+ alt 編集。
- 本文内画像は AI 指定位置の TipTap プレースホルダに、生成/差し替え後の実URL + alt を流し込んでから保存。

### ガードレール
- AI画像は **コンセプト/抽象/装飾用途**。実在の人物・イベント写真の捏造はしない。実写が要るものは差し替え前提（UIに注意書き）。

**完了条件**: 「生成」一発でサムネ + 本文挿絵が入り、各々再生成/実写差し替え可能。確認 → 公開。

---

## Phase 3: 磨き込み

- プレビュー画面: `renderNewsContentToHtml` + 詳細レイアウトで公開前プレビュー。
- Claude ストリーミング表示（体感速度）。
- 段落単位の部分再生成（「この段落だけ書き直して」）。
- AI画像の最適化（WebP化/リサイズ）。
- コストガード / レート制限 / 生成ログ。

---

## 4. 依存グラフと並列可否（AI-native 見積もり）

```
Phase 0(スキーマ) ──┐(先行必須: AI生成の出力先)
                    ├─→ Phase 1(AI下書き) ──→ Phase 2(AI画像) ──→ Phase 3(磨き込み)
Phase 0(SEO土台) ───┘(Phase 1 と並列可: 別ファイル群)
```

- Phase 0 スキーマ → Phase 1 は順次必須。
- Phase 0 SEO土台 と Phase 1 は並列可能。
- Phase 1 → Phase 2 は順次必須（画像プレースホルダ仕様依存）。

### 工数（Claude セッション単位・並列考慮）
- Phase 0: スキーマ 0.5 + SEO土台 1.0（並列で約1セッション日）
- Phase 1: 1.5〜2 セッション
- Phase 2: 1.5 セッション
- Phase 3: 1 セッション
- 合計: 約 4〜5 セッション（Phase 0&1 は重ねられる）

---

## 5. リスクとガードレール

- **事実捏造防止**: プロンプト制約 + 人による最終確認（必須）。
- **AI画像の不適切利用**: 実写差し替え前提のUI + 用途の注意書き。
- **slug 衝突**: 既存の年内ユニーク検証で吸収（衝突時はサフィックス提案も検討）。
- **新カテゴリ乱立**: 人承認ゲートを必ず通す。
- **コスト**: 画像生成は課金。1記事あたりの概算を Phase 2 着手時に提示。
- **セキュリティ**: 全 AI 呼び出しはサーバー側（Server Action / Route Handler）。`ANTHROPIC_API_KEY` / `GEMINI_API_KEY` はクライアント露出禁止。`service_role` は従来通り `server-only`。

---

## 6. 着手前の未確定事項（最小）
- 依存追加（`@anthropic-ai/sdk` / `@google/genai` / `sharp`）の承認。
- `sharp` を入れるか（AI画像が WebP 主体なら最小化も可）。
- 画像生成のデフォルト方針（全記事で自動 or 必要時のみ）。

---

## 7. 実装状況（2026-05-29 完了）

| フェーズ | 状態 | 主な成果物 / コミット |
|---|---|---|
| Phase 0（SEO土台+スキーマ） | ✅ 完了 | sitemap/robots/OGP/JSON-LD/description・thumbnail_alt（`Phase 38`） |
| Phase 1（AI下書き生成） | ✅ 完了 | `ai-compose.ts`(Claude tool-use) / `ai-blocks.ts` / `/admin/news/ai` / NewsForm initialValues（`Phase 39`） |
| Phase 2（AI画像生成） | ✅ 完了 | `ai-image.ts`(Gemini Nano Banana Pro) / ImageUploader・Toolbar に AI生成ボタン（`Phase 40`） |
| Phase 3（仕上げ） | ✅ 完了（プレビュー） | `/admin/news/[id]/preview`（下書き実レンダリング確認） |

### 未実施（任意・将来）
- `sharp` による元画像の WebP 変換・リサイズ（依存リスク回避で見送り。Gemini 画像はそのまま保存）
- Claude 出力のストリーミング表示、段落単位の部分再生成、生成コストガード/レート制限

---

## 8. 運用 Runbook（本番稼働に必要な設定）

すべてサーバー側環境変数（Vercel）。クライアント露出禁止。

| 変数 | 用途 | 既定 |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI下書き生成（必須） | — |
| `ANTHROPIC_MODEL` | 使用モデル（任意） | `claude-sonnet-4-6` |
| `GEMINI_API_KEY` | AI画像生成（必須） | — |
| `GEMINI_IMAGE_MODEL` | 画像モデル（任意） | `gemini-3-pro-image-preview` |
| `NEXT_PUBLIC_SITE_URL` | canonical/OGP/sitemap 基準 | `https://arigatosun.com` |

> モデル名はプレビュー版のため変わる可能性あり。変わったら env で上書きするだけで対応可能。

### 使い方（投稿者向け）
1. 管理画面 → ニュース → 「✦ AIで作成」
2. 素材テキスト（＋任意の文脈/URL）を貼って「AIで生成」
3. タイトル/スラッグ/カテゴリ/説明文/本文が自動入力される。新カテゴリ提案時は承認して作成
4. サムネは「✦ AIで生成」（実写なら「画像をアップロード」）。本文画像はエディタの「✦AI画像」
5. 「プレビュー」で確認 → 「公開する」

### 設計上の安全機構
- AIは素材の再構成のみ（事実創作禁止をプロンプトで制約）＋ 公開は必ず人が確認
- AI出力も既存 `saveNews`（slug年内ユニーク・カテゴリFK・サムネURL検証・RLS）を通過
- 全API呼び出しはサーバー側 Server Action（キー秘匿）
