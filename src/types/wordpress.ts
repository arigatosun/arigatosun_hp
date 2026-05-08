// WordPress REST API 型定義
// NewsSection / news ページ / lib/wordpress で共有

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

/** アプリ内で使う統一型（WordPress 由来データを正規化したもの） */
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

/** ニュースカテゴリ（フロント側で管理する選択肢） */
export type NewsCategory = {
  label: string;
  value: string;
  id: number;
};
