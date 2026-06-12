'use server';

import Anthropic from '@anthropic-ai/sdk';
import { requireAdminUser } from './_lib/auth-guard';
import { fetchUrlText } from './_lib/fetch-url';
import type { AiBlock } from '@/lib/news/ai-blocks';
import type { TablesInsert } from '@/types/supabase';

// 本文・構造化・SEOメタ生成に使う Claude モデル。env で上書き可。
const AI_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6';
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const SLUG_MAX = 100;
const TITLE_MAX = 200;
const DESCRIPTION_MAX = 200;

export type AiDraftCategory =
  | { mode: 'existing'; id: string; slug: string; label: string }
  | { mode: 'new'; slug: string; label: string };

export interface AiDraft {
  title: string;
  slug: string;
  description: string;
  body: AiBlock[];
  category: AiDraftCategory;
  thumbnailPrompt: string;
  thumbnailAlt: string;
  inlineImages: { prompt: string; alt: string }[];
}

export type AiDraftResult = { ok: true; draft: AiDraft } | { ok: false; error: string };

export interface GenerateNewsDraftInput {
  rawText: string;
  context?: string;
  sourceUrl?: string;
}

// 半角英小文字・数字・ハイフンのみの slug に正規化する。
function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX);
}

const SYSTEM_PROMPT = `あなたは日本語コーポレートサイトのニュース編集者 兼 SEO スペシャリストです。
投稿者が貼り付けた「素材」を、検索エンジンと読者に最適な形に再構成し、submit_news_draft ツールで提出してください。

厳守事項:
- 素材に書かれていない事実を創作しない。固有名詞・数値・日付・固有の主張は素材内のものだけを使う。情報が不足する箇所は一般的・無難な表現にとどめる。
- title は日本語・32文字前後・検索意図に沿う具体的な見出し。誇大表現は避ける。
- slug は内容を表す英語の短いフレーズ。半角英小文字・数字・ハイフンのみ（例: ai-development-partnership）。
- description は日本語120文字前後のメタディスクリプション。記事の要点を自然に要約する。
- body は heading(level 2/3) / paragraph / bulletList / orderedList / blockquote のブロック配列。見出しで構造化し、段落は読みやすい長さに分ける。先頭は paragraph のリード文から始める。
- category は素材の内容に最も合うものを選ぶ。提示された既存カテゴリ一覧に適切なものがあれば必ずその slug/label をそのまま使う。無い場合のみ新しい簡潔なカテゴリ（英語 slug + 表示用 label）を提案する。
- thumbnailPrompt は記事のサムネイルに使う画像生成用プロンプト（英語）。実在の人物・企業ロゴ・実イベントの捏造は避け、コンセプト的・抽象的・装飾的なビジュアルにする。thumbnailAlt はその画像の日本語代替テキスト。
- inlineImages は本文の理解を助ける補足画像があれば0〜2件提案する（prompt は英語、alt は日本語）。不要なら空配列。`;

const DRAFT_TOOL: Anthropic.Tool = {
  name: 'submit_news_draft',
  description: 'SEO最適化されたニュース記事の下書きを構造化して提出する。',
  input_schema: {
    type: 'object',
    properties: {
      title: { type: 'string', description: '日本語タイトル（32文字前後）' },
      slug: { type: 'string', description: '英語スラッグ。半角英小文字・数字・ハイフンのみ' },
      description: { type: 'string', description: '日本語メタディスクリプション（120文字前後）' },
      categorySlug: { type: 'string', description: 'カテゴリslug（既存があれば必ず流用）' },
      categoryLabel: { type: 'string', description: 'カテゴリ表示ラベル' },
      body: {
        type: 'array',
        description: '本文ブロック配列',
        items: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['heading', 'paragraph', 'bulletList', 'orderedList', 'blockquote'],
            },
            level: { type: 'number', enum: [2, 3], description: 'heading のときのレベル' },
            text: { type: 'string', description: 'heading/paragraph/blockquote の本文' },
            items: {
              type: 'array',
              items: { type: 'string' },
              description: 'bulletList/orderedList の項目',
            },
          },
          required: ['type'],
        },
      },
      thumbnailPrompt: { type: 'string', description: 'サムネ画像生成用プロンプト（英語）' },
      thumbnailAlt: { type: 'string', description: 'サムネ画像の日本語代替テキスト' },
      inlineImages: {
        type: 'array',
        description: '本文補足画像の提案（0〜2件）',
        items: {
          type: 'object',
          properties: {
            prompt: { type: 'string' },
            alt: { type: 'string' },
          },
          required: ['prompt', 'alt'],
        },
      },
    },
    required: [
      'title',
      'slug',
      'description',
      'categorySlug',
      'categoryLabel',
      'body',
      'thumbnailPrompt',
      'thumbnailAlt',
    ],
  },
};

/**
 * 素材テキストから SEO 最適化された記事下書きを生成する。
 * Claude の tool-use（強制ツール選択）で構造化出力を受け取り、サーバー側で再検証する。
 */
export async function generateNewsDraft(
  input: GenerateNewsDraftInput,
): Promise<AiDraftResult> {
  const { supabase } = await requireAdminUser();

  const raw = (input.rawText ?? '').trim();
  if (!raw) {
    return { ok: false, error: '素材テキストを入力してください' };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: 'ANTHROPIC_API_KEY が未設定です（サーバー環境変数を確認してください）' };
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, label')
    .order('display_order', { ascending: true });
  const categoryList = categories ?? [];

  const categoryHint =
    categoryList.length > 0
      ? categoryList.map((c) => `- ${c.slug} : ${c.label}`).join('\n')
      : '（既存カテゴリなし。新規提案してください）';

  // 参考URLが指定されていれば、ページ本文を実際に取得して素材に含める。
  // 取得失敗（非対応形式・到達不可・SSRF遮断など）は best-effort で無視し、
  // URL 自体はヒントとしてプロンプトに残す（生成自体は止めない）。
  let sourceSection = '';
  if (input.sourceUrl?.trim()) {
    const url = input.sourceUrl.trim();
    const fetched = await fetchUrlText(url);
    sourceSection = fetched.ok
      ? `\n## 参考URL（${url}）から自動取得した本文（素材として利用可・要約に活用）\n${fetched.text}`
      : `\n## 参考URL\n${url}\n（注: ページ本文の自動取得に失敗しました: ${fetched.error}。URLは参考程度に）`;
  }

  const userText = [
    '## 既存カテゴリ一覧',
    categoryHint,
    '',
    '## 投稿者の素材',
    raw,
    input.context ? `\n## 補足コンテキスト（対象読者・トーン・希望カテゴリ等）\n${input.context}` : '',
    sourceSection,
  ].join('\n');

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 4096,
      // システムプロンプト + ツール定義をプロンプトキャッシュ（呼び出しごとに使い回す固定部分）
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: [{ ...DRAFT_TOOL, cache_control: { type: 'ephemeral' } } as Anthropic.Tool],
      tool_choice: { type: 'tool', name: 'submit_news_draft' },
      messages: [{ role: 'user', content: userText }],
    });
  } catch (err) {
    console.error('[ai-compose] Anthropic API error', err);
    const msg = err instanceof Error ? err.message : '生成に失敗しました';
    return { ok: false, error: `AI生成に失敗しました: ${msg}` };
  }

  const toolUse = message.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === 'submit_news_draft',
  );
  if (!toolUse) {
    return { ok: false, error: 'AIが構造化出力を返しませんでした。もう一度お試しください' };
  }

  const out = toolUse.input as Record<string, unknown>;

  const title = String(out.title ?? '').trim().slice(0, TITLE_MAX);
  if (!title) return { ok: false, error: 'タイトルの生成に失敗しました' };

  let slug = sanitizeSlug(String(out.slug ?? ''));
  if (!slug || !SLUG_PATTERN.test(slug)) {
    slug = sanitizeSlug(String(out.slug ?? '')) || `news-${Date.now()}`;
  }

  const description = String(out.description ?? '').trim().slice(0, DESCRIPTION_MAX);
  const body = Array.isArray(out.body) ? (out.body as AiBlock[]) : [];

  // カテゴリ: 既存 slug に一致すれば流用、なければ新規提案
  const catSlug = sanitizeSlug(String(out.categorySlug ?? ''));
  const catLabel = String(out.categoryLabel ?? '').trim() || catSlug;
  const existing = categoryList.find((c) => c.slug === catSlug);
  const category: AiDraftCategory = existing
    ? { mode: 'existing', id: existing.id, slug: existing.slug, label: existing.label }
    : { mode: 'new', slug: catSlug || sanitizeSlug(catLabel) || 'news', label: catLabel || 'お知らせ' };

  const inlineImagesRaw = Array.isArray(out.inlineImages) ? out.inlineImages : [];
  const inlineImages = inlineImagesRaw
    .map((i) => {
      const o = i as Record<string, unknown>;
      return { prompt: String(o.prompt ?? '').trim(), alt: String(o.alt ?? '').trim() };
    })
    .filter((i) => i.prompt)
    .slice(0, 2);

  return {
    ok: true,
    draft: {
      title,
      slug,
      description,
      body,
      category,
      thumbnailPrompt: String(out.thumbnailPrompt ?? '').trim(),
      thumbnailAlt: String(out.thumbnailAlt ?? '').trim(),
      inlineImages,
    },
  };
}

export type CreateCategoryResult =
  | { ok: true; id: string; slug: string; label: string }
  | { ok: false; error: string };

/**
 * AI が提案した新カテゴリを、人の承認後に作成して id を返す（リダイレクトしない版）。
 * 既存 saveCategory はフォーム用に redirect するため、AI フロー用に分離。
 */
export async function createCategory(
  slugInput: string,
  labelInput: string,
): Promise<CreateCategoryResult> {
  const { supabase } = await requireAdminUser();
  const slug = sanitizeSlug(slugInput);
  const label = (labelInput ?? '').trim();

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return { ok: false, error: 'スラッグは半角英小文字・数字・ハイフンのみです' };
  }
  if (!label) {
    return { ok: false, error: 'カテゴリのラベルを入力してください' };
  }

  // 表示順は末尾に追加
  const { data: maxRow } = await supabase
    .from('categories')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const display_order = (maxRow?.display_order ?? 0) + 1;

  const insert: TablesInsert<'categories'> = { slug, label, display_order };
  const { data, error } = await supabase
    .from('categories')
    .insert(insert)
    .select('id, slug, label')
    .single();

  if (error || !data) {
    if (error?.code === '23505') {
      return { ok: false, error: '同じスラッグのカテゴリーが既に存在します' };
    }
    console.error('[ai-compose] createCategory error', error);
    return { ok: false, error: 'カテゴリーの作成に失敗しました' };
  }

  return { ok: true, id: data.id, slug: data.slug, label: data.label };
}
