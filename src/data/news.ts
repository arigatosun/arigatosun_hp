// ニュースデータ。現状は表示確認用の静的プレースホルダー。
// WordPress 連携時は getNewsList / getNewsBySlug の中身を fetch に差し替えるだけでよい。

export type NewsBodyBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; paragraphs: string[] };

export type NewsEntry = {
  slug: string;
  title: string;
  date: string;
  category: string; // 例: 'INFOMATION'
  thumbnail: string; // 空文字はプレースホルダー表示
  body: NewsBodyBlock[];
};

const PLACEHOLDER_TITLE = 'ここに実績項目のタイトルが入ります。'.repeat(4);

const BODY_PARAGRAPH = [
  `${'ここに文章が入ります。'.repeat(10)} ${'ここに文章が入ります。'.repeat(2)}`,
  `${'ここに文章が入ります。'.repeat(10)} ${'ここに文章が入ります。'.repeat(2)}`,
];

const PLACEHOLDER_BODY: NewsBodyBlock[] = [
  {
    type: 'heading',
    text: '文章内タイトルはこのサイズです。文章内タイトルはこのサイズです。',
  },
  { type: 'paragraph', paragraphs: BODY_PARAGRAPH },
  {
    type: 'heading',
    text: '文章内タイトルはこのサイズです。文章内タイトルはこのサイズです。',
  },
  { type: 'paragraph', paragraphs: BODY_PARAGRAPH },
];

// 表示確認用の仮ニュース8件（Figma の "1/2" 表示 ＝ 1ページ8件）
const NEWS_ENTRIES: readonly NewsEntry[] = Array.from(
  { length: 8 },
  (_, i) => ({
    slug: `news-${i + 1}`,
    title: PLACEHOLDER_TITLE,
    date: '2026.10/10',
    category: 'INFOMATION',
    thumbnail: '',
    body: PLACEHOLDER_BODY,
  }),
);

/** ニュース一覧を取得する（WordPress 連携時はここを fetch に差し替え）。 */
export async function getNewsList(): Promise<readonly NewsEntry[]> {
  return NEWS_ENTRIES;
}

/** slug からニュース1件を取得する（WordPress 連携時はここを fetch に差し替え）。 */
export async function getNewsBySlug(
  slug: string,
): Promise<NewsEntry | undefined> {
  return NEWS_ENTRIES.find((entry) => entry.slug === slug);
}
