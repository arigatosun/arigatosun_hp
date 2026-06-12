'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requireAdminUser } from './_lib/auth-guard';
import type { Json, TablesInsert, TablesUpdate } from '@/types/supabase';

export type NewsFormState =
  | { ok: false; error: string; fieldErrors?: Partial<Record<NewsField, string>> }
  | { ok: true; id: string }
  | { idle: true };

type NewsField =
  | 'title'
  | 'slug'
  | 'category_id'
  | 'thumbnail_url'
  | 'thumbnail_alt'
  | 'description'
  | 'content'
  | 'published_at';

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
const SLUG_MAX = 100;
const TITLE_MAX = 200;
const DESCRIPTION_MAX = 200;
const THUMBNAIL_ALT_MAX = 150;

interface ParsedForm {
  title: string;
  slug: string;
  category_id: string;
  thumbnail_url: string | null;
  thumbnail_alt: string | null;
  description: string | null;
  // jsonb に渡す値。TipTap の JSON object か、Phase B 互換のため空文字列も許容
  content: Json;
  publishedAt: string | null; // datetime-local 文字列 or null
  intent: 'draft' | 'publish';
}

// TipTap が出力する空のドキュメントを判定（empty paragraph 1個）
function isEmptyDoc(json: unknown): boolean {
  if (!json || typeof json !== 'object') return false;
  const doc = json as { type?: string; content?: Array<{ type?: string; content?: unknown }> };
  if (doc.type !== 'doc') return false;
  if (!doc.content || doc.content.length === 0) return true;
  if (doc.content.length === 1) {
    const first = doc.content[0];
    return first.type === 'paragraph' && (!first.content || (Array.isArray(first.content) && first.content.length === 0));
  }
  return false;
}

// formData の content は RichEditor が hidden input に JSON.stringify した文字列。
// パースに成功し object なら TipTap JSON として、失敗または非 object なら素文字列として扱う。
// news.content は NOT NULL なので、空コンテンツは {} を返す。
function parseContent(raw: string): Json {
  if (!raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return isEmptyDoc(parsed) ? {} : (parsed as Json);
    }
    if (typeof parsed === 'string') return parsed;
    return raw;
  } catch {
    return raw;
  }
}

function parseForm(formData: FormData): { value: ParsedForm } | { fieldErrors: Partial<Record<NewsField, string>> } {
  const fieldErrors: Partial<Record<NewsField, string>> = {};
  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim();
  const category_id = String(formData.get('category_id') ?? '').trim();
  const thumbnail_url_raw = String(formData.get('thumbnail_url') ?? '').trim();
  const thumbnail_alt_raw = String(formData.get('thumbnail_alt') ?? '').trim();
  const description_raw = String(formData.get('description') ?? '').trim();
  const content = parseContent(String(formData.get('content') ?? ''));
  const published_at_raw = String(formData.get('published_at') ?? '').trim();
  const intentValues = formData.getAll('intent').map((value) => String(value));
  const intent_raw = intentValues.at(-1) ?? 'draft';
  const intent: ParsedForm['intent'] = intent_raw === 'publish' ? 'publish' : 'draft';

  if (!title) {
    fieldErrors.title = 'タイトルを入力してください';
  } else if (title.length > TITLE_MAX) {
    fieldErrors.title = `タイトルは${TITLE_MAX}文字以内で入力してください`;
  }

  if (!slug) {
    fieldErrors.slug = 'スラッグを入力してください';
  } else if (slug.length > SLUG_MAX) {
    fieldErrors.slug = `スラッグは${SLUG_MAX}文字以内で入力してください`;
  } else if (!SLUG_PATTERN.test(slug)) {
    fieldErrors.slug = '半角英小文字・数字・ハイフンのみ使用できます（先頭末尾はハイフン不可）';
  }

  if (!category_id) {
    fieldErrors.category_id = 'カテゴリーを選択してください';
  }

  if (published_at_raw && Number.isNaN(Date.parse(published_at_raw))) {
    fieldErrors.published_at = '公開日時の形式が不正です';
  }

  if (description_raw.length > DESCRIPTION_MAX) {
    fieldErrors.description = `説明文（メタディスクリプション）は${DESCRIPTION_MAX}文字以内で入力してください`;
  }

  if (thumbnail_alt_raw.length > THUMBNAIL_ALT_MAX) {
    fieldErrors.thumbnail_alt = `代替テキストは${THUMBNAIL_ALT_MAX}文字以内で入力してください`;
  }

  // thumbnail_url は ImageUploader 経由で常に Supabase Storage の URL のみ。
  // 外部 URL を入れられないよう、自プロジェクトの news-images バケットに限定する。
  let thumbnail_url: string | null = null;
  if (thumbnail_url_raw) {
    const expectedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''}/storage/v1/object/public/news-images/`;
    if (expectedPrefix && thumbnail_url_raw.startsWith(expectedPrefix)) {
      thumbnail_url = thumbnail_url_raw;
    } else {
      fieldErrors.thumbnail_url = 'サムネイル画像は管理画面のアップローダーから設定してください';
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  return {
    value: {
      title,
      slug,
      category_id,
      thumbnail_url,
      thumbnail_alt: thumbnail_alt_raw || null,
      description: description_raw || null,
      content,
      publishedAt: published_at_raw || null,
      intent,
    },
  };
}

/**
 * 新規作成 / 更新 を兼ねた Server Action。
 * formData の intent: 'draft' | 'publish' | 'unpublish' で挙動が変わる。
 * 既存記事の id は formData.get('id') から（無ければ新規）。
 */
export async function saveNews(
  _prev: NewsFormState,
  formData: FormData,
): Promise<NewsFormState> {
  const { supabase } = await requireAdminUser();
  const id = (String(formData.get('id') ?? '').trim() || null) as string | null;
  const parsed = parseForm(formData);

  if ('fieldErrors' in parsed) {
    return { ok: false, error: '入力内容を確認してください', fieldErrors: parsed.fieldErrors };
  }

  const { value } = parsed;

  // intent に応じて status / published_at を決定
  // 'draft' → 必ず status=draft, published_at=null（公開済みなら取り下げ）
  // 'publish' → 必ず status=published, published_at=入力値 or now()
  let status: 'draft' | 'published';
  let published_at: string | null;

  if (value.intent === 'publish') {
    status = 'published';
    published_at = value.publishedAt
      ? new Date(value.publishedAt).toISOString()
      : new Date().toISOString();
  } else {
    status = 'draft';
    published_at = null;
  }

  if (id) {
    const update: TablesUpdate<'news'> = {
      title: value.title,
      slug: value.slug,
      category_id: value.category_id,
      thumbnail_url: value.thumbnail_url,
      thumbnail_alt: value.thumbnail_alt,
      description: value.description,
      content: value.content,
      status,
      published_at,
    };
    const { error } = await supabase.from('news').update(update).eq('id', id);
    if (error) {
      return { ok: false, error: formatPostgresError(error) };
    }
    revalidatePath('/admin/news');
    revalidatePath(`/admin/news/${id}/edit`);
    revalidatePublicNews(status, published_at, value.slug);
    redirect(`/admin/news/${id}/edit?saved=${value.intent === 'publish' ? 'published' : 'draft'}`);
  } else {
    // 新規: slug_year は DB トリガーで自動設定だが、型上は INSERT に slug_year が必須。
    // クライアントから渡さなくても DB 側で BEFORE INSERT が埋めるが、生成された型は
    // slug_year を required にしているため一時的にダミー値を渡す（トリガーで上書きされる）。
    const insert: TablesInsert<'news'> = {
      title: value.title,
      slug: value.slug,
      category_id: value.category_id,
      thumbnail_url: value.thumbnail_url,
      thumbnail_alt: value.thumbnail_alt,
      description: value.description,
      content: value.content,
      status,
      published_at,
      slug_year: 0, // DB トリガー (news_set_slug_year) で上書きされる
    };
    const { data, error } = await supabase.from('news').insert(insert).select('id').single();
    if (error || !data) {
      return { ok: false, error: error ? formatPostgresError(error) : '作成に失敗しました' };
    }
    revalidatePath('/admin/news');
    revalidatePublicNews(status, published_at, value.slug);
    redirect(`/admin/news/${data.id}/edit?created=1`);
  }
}

export async function deleteNews(formData: FormData): Promise<void> {
  const { supabase } = await requireAdminUser();
  const id = String(formData.get('id') ?? '').trim();
  if (!id) {
    redirect('/admin/news?error=削除対象が指定されていません');
  }

  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) {
    redirect(`/admin/news?error=${encodeURIComponent(formatPostgresError(error))}`);
  }
  revalidatePath('/admin/news');
  // 公開側（一覧 / TOP）からも即時に消す
  revalidatePath('/news');
  revalidatePath('/');
  redirect('/admin/news?deleted=1');
}

/**
 * 公開側（ニュース一覧 / TOP NewsSection / 詳細）の ISR キャッシュを即時更新する。
 * 既定の revalidate=60 を待たずに反映させるため、保存・公開のたびに呼ぶ。
 */
function revalidatePublicNews(
  status: 'draft' | 'published',
  publishedAt: string | null,
  slug: string,
): void {
  revalidatePath('/news');
  revalidatePath('/');
  if (status === 'published' && publishedAt) {
    const year = new Date(publishedAt).getFullYear();
    revalidatePath(`/news/${year}/${slug}`);
  }
}

function formatPostgresError(error: { code?: string; message: string }): string {
  if (error.code === '23505') {
    return '同じ年に同じスラッグの記事が既に存在します';
  }
  if (error.code === '23503') {
    return '指定したカテゴリーが見つかりません';
  }
  if (error.code === '23514') {
    return '入力値が制約に違反しています（公開済み記事には公開日時が必要です）';
  }
  // 想定外エラーは内部メッセージを URL に露出させずサーバーログにだけ残す
  console.error('[news action] unexpected DB error', error);
  return 'データベースエラーが発生しました。時間をおいて再度お試しください。';
}
