// 作品データのアクセス層。
// 現状は静的データを返すだけ。WordPress 連携時は WORKS_DATA を fetch 化（または廃止）し、
// getAllWorks / getWorkBySlug の中身だけ差し替えれば利用側（ページ・コンポーネント）は無修正。
import type { WorkItem } from '@/types/work';

// 静的データ（暫定ソース。WordPress 連携時に置き換え）
const WORKS_DATA: readonly WorkItem[] = [
  {
    id: 'work-1',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-2',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'AI / D：', value: 'プロジェクトマネジメント、システム実装' },
      { label: 'D / B：', value: 'ディレクション、ロゴデザイン' },
      { label: 'IP / C：', value: 'キャラクター設計' },
    ],
    term: '2024.7 - 2024.10',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-3',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'AI / D：', value: 'プロジェクトマネジメント、システム実装' },
      { label: 'D / B：', value: 'ディレクション、ロゴデザイン' },
      { label: 'IP / C：', value: 'キャラクター設計' },
    ],
    term: '2024.7 - 2024.10',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-4',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-5',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-6',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-7',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-8',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-9',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
  {
    id: 'work-10',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもら\nえるカタチへ。|最優秀賞から生まれたキャラクター\nデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/works-1.png',
    imageWidth: 868,
    imageHeight: 675,
  },
] as const;

/**
 * 作品一覧を取得する。ページ / コンポーネントは必ずこの関数経由でアクセスすること。
 * WordPress 連携時はこの中身を REST API の fetch に差し替える（戻り値の型は不変）。
 */
export async function getAllWorks(): Promise<readonly WorkItem[]> {
  return WORKS_DATA;
}

/** slug（= work id）から単一の作品を取得する。該当なしは undefined。 */
export async function getWorkBySlug(
  slug: string,
): Promise<WorkItem | undefined> {
  return WORKS_DATA.find((work) => work.id === slug);
}
