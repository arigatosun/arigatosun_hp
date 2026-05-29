import 'server-only';

import { createAnonClient } from '@/lib/supabase/anon';
import type { Category, NewsDetail, NewsListItem } from '@/types/news';

// 公開ページは認証セッションを伴わない anon クライアントで読む。
// `createClient` (cookie-binding) を使うと、管理画面にログイン中の admin が
// 公開側を見たときに RLS の authenticated ポリシーが効いて下書きまで返ってしまう。

/**
 * 公開済みニュース一覧を取得。
 * RLS により anon は status='published' AND published_at <= now() のみ返る。
 */
export async function getPublishedNewsList(options?: {
  categorySlug?: string | null;
  limit?: number;
}): Promise<NewsListItem[]> {
  const supabase = createAnonClient();
  let query = supabase
    .from('news')
    .select(
      'id, slug, slug_year, title, thumbnail_url, thumbnail_alt, published_at, category:categories!inner(slug, label)',
    )
    .order('published_at', { ascending: false });

  if (options?.categorySlug && options.categorySlug !== 'all') {
    query = query.eq('categories.slug', options.categorySlug);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    slug: row.slug,
    slug_year: row.slug_year,
    title: row.title,
    thumbnail_url: row.thumbnail_url,
    thumbnail_alt: row.thumbnail_alt,
    published_at: row.published_at,
    category: row.category ?? null,
  }));
}

/**
 * 公開済み記事を `slug_year` と `slug` で取得。
 * RLS によって未公開記事は anon からは見えない（404 と同じ扱い）。
 */
export async function getPublishedNewsByYearSlug(
  year: number,
  slug: string,
): Promise<NewsDetail | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('news')
    .select(
      'id, slug, slug_year, title, thumbnail_url, thumbnail_alt, description, published_at, content, category:categories!inner(slug, label)',
    )
    .eq('slug_year', year)
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    slug_year: data.slug_year,
    title: data.title,
    thumbnail_url: data.thumbnail_url,
    thumbnail_alt: data.thumbnail_alt,
    description: data.description,
    published_at: data.published_at,
    category: data.category ?? null,
    content: data.content,
  };
}

/** カテゴリー一覧を表示順で取得。 */
export async function getCategories(): Promise<Category[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('categories')
    .select('id, slug, label, display_order')
    .order('display_order', { ascending: true });
  if (error || !data) return [];
  return data;
}

/**
 * generateStaticParams 用: 公開済み記事の (year, slug) 一覧。
 * ビルド時 (リクエスト外) は cookies() が使えないため、匿名クライアントを使用。
 * 未来日時の予約公開はビルド時点では未公開のため除外。
 */
export async function getPublishedNewsParams(): Promise<
  Array<{ year: string; slug: string }>
> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from('news')
    .select('slug, slug_year, published_at')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString());
  if (error || !data) return [];
  return data.map((row) => ({ year: String(row.slug_year), slug: row.slug }));
}
