// 開発用の仮ニュースデータ。
// WordPress API が記事を返さない間のフォールバック表示用で、
// API 接続後は実記事が優先される（NewsSection 参照）。
import type { NewsItem } from '@/types/wordpress';

const MOCK_TITLE =
  'ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。ここに実績項目のタイトルが入ります。';

// slug は src/data/news.ts の NEWS_ENTRIES（`news-1`〜`news-8`）と整合させ、
// TOP の NewsSection から直接 /news/<slug> 詳細ページへ遷移できるようにする。
export const NEWS_MOCK: readonly NewsItem[] = [
  { id: -1, slug: 'news-1', title: MOCK_TITLE, date: '2026.10/10', tag: '#INFORMATION', thumbnail: '', excerpt: '', content: '' },
  { id: -2, slug: 'news-2', title: MOCK_TITLE, date: '2026.10/10', tag: '#INFORMATION', thumbnail: '', excerpt: '', content: '' },
  { id: -3, slug: 'news-3', title: MOCK_TITLE, date: '2026.10/10', tag: '#INFORMATION', thumbnail: '', excerpt: '', content: '' },
  { id: -4, slug: 'news-4', title: MOCK_TITLE, date: '2026.10/10', tag: '#INFORMATION', thumbnail: '', excerpt: '', content: '' },
] as const;
