// WordPress REST API 連携

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';

// ── 型定義 ──

/** WordPress REST API の投稿レスポンス */
export type WPPost = {
  id: number;
  slug: string;
  date: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  categories: number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    'wp:term'?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
  };
};

/** WordPress REST API のカテゴリレスポンス */
export type WPCategory = {
  id: number;
  name: string;
  slug: string;
  count: number;
};

/** アプリ内で使う統一型 */
export type NewsItem = {
  id: number;
  slug: string;
  title: string;
  date: string;
  tag: string;
  thumbnail: string;
  excerpt: string;
  content: string;
};

// ── ユーティリティ ──

/** 日付を「2026.03/05」形式にフォーマット */
function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}/${day}`;
}

/** HTMLタグを除去 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/** WPPostをアプリ用のNewsItemに変換 */
function toNewsItem(post: WPPost): NewsItem {
  // _embeddedからサムネイルURL取得
  const media = post._embedded?.['wp:featuredmedia']?.[0];
  const thumbnail = media?.source_url || '';

  // _embeddedからカテゴリ名取得
  const terms = post._embedded?.['wp:term']?.[0];
  const category = terms?.[0];
  const tag = category ? `#${category.name.toUpperCase()}` : '';

  return {
    id: post.id,
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    date: formatDate(post.date),
    tag,
    thumbnail,
    excerpt: stripHtml(post.excerpt.rendered),
    content: post.content.rendered,
  };
}

// ── API関数 ──

/** 記事一覧を取得 */
export async function fetchPosts(options?: {
  category?: number;
  perPage?: number;
  page?: number;
}): Promise<NewsItem[]> {
  const params = new URLSearchParams({
    _embed: 'true',
    per_page: String(options?.perPage ?? 10),
    page: String(options?.page ?? 1),
  });

  if (options?.category) {
    params.set('categories', String(options.category));
  }

  const res = await fetch(`${API_URL}/posts?${params}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return [];

  const posts: WPPost[] = await res.json();
  return posts.map(toNewsItem);
}

/** スラッグで単一記事を取得 */
export async function fetchPostBySlug(slug: string): Promise<NewsItem | null> {
  const params = new URLSearchParams({
    _embed: 'true',
    slug,
  });

  const res = await fetch(`${API_URL}/posts?${params}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  const posts: WPPost[] = await res.json();
  if (posts.length === 0) return null;

  return toNewsItem(posts[0]);
}

/** カテゴリ一覧を取得 */
export async function fetchCategories(): Promise<WPCategory[]> {
  const res = await fetch(`${API_URL}/categories?per_page=100`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) return [];

  return res.json();
}
