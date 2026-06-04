// 作品データのアクセス層。
// 現状は静的データを返すだけ。WordPress 連携時は WORKS_DATA を fetch 化（または廃止）し、
// getAllWorks / getWorkBySlug の中身だけ差し替えれば利用側（ページ・コンポーネント）は無修正。
import type { WorkItem } from '@/types/work';

// 静的データ（暫定ソース。WordPress 連携時に置き換え）
const WORKS_DATA: readonly WorkItem[] = [
  {
    id: 'work-1',
    client: '頂立輸入代行会社',
    title: '数値では測れない想いや姿勢を、ブランドの核心へ宿す。| 社名からVIまで、一気通貫のブランド構築',
    details: [
      { label: 'D / B：', value: '会社名・タグライン・ロゴ・VI設計・WEB' },
    ],
    term: '2025.12 ~ 2026.4',
    image: '/images/sections/works/choritz.png',
    imageWidth: 920,
    imageHeight: 518,
  },
  {
    id: 'work-2',
    client: 'VARIOUS CLIENTS',
    title: '独自の核を構築する。| ロゴ・VIのプロジェクトアーカイブ。',
    details: [
      { label: 'D / B：', value: 'ロゴデザイン' },
    ],
    term: '',
    image: '/images/sections/works/logo-archive.png',
    imageWidth: 920,
    imageHeight: 520,
  },
  {
    id: 'work-3',
    client: 'NEST',
    title: 'デジタルでは生まれない温もりと偶然性を、シンボルとして可視化する。| 拡張を見据えたロゴ・VI設計',
    details: [
      { label: 'D / B：', value: 'ロゴ・VI 設計' },
    ],
    term: 'NEST BIWAKO : 2024.7 ~ 2024.9 / NEST AMANO HASHIDATE : 2026.2',
    image: '/images/sections/works/nest.png',
    imageWidth: 920,
    imageHeight: 520,
  },
  {
    id: 'work-4',
    client: 'Men’te',
    title:
      '諦めきれなかった構想が、サービスとして動き出す。| 構想整理から要件定義・開発・改善まで、一気通貫の立ち上げ支援',
    details: [
      { label: 'D / B：', value: '構想整理・要件定義・UI/UX・アプリ開発・ロゴ/VI' },
    ],
    term: '2025.12 ~ 2026.4',
    // 一覧カードは詳細ヒーロー画像を流用（カード枠で cover 表示）。
    image: '/images/works/mente/hero.png',
    imageWidth: 1920,
    imageHeight: 820,
  },
  // work-5 以降は今後の実装枠（プレースホルダ）。実データができ次第コメントを外す。
  /*
  {
    id: 'work-5',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/choritz.png',
    imageWidth: 920,
    imageHeight: 518,
  },
  {
    id: 'work-6',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/choritz.png',
    imageWidth: 920,
    imageHeight: 518,
  },
  {
    id: 'work-7',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/choritz.png',
    imageWidth: 920,
    imageHeight: 518,
  },
  {
    id: 'work-8',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/choritz.png',
    imageWidth: 920,
    imageHeight: 518,
  },
  {
    id: 'work-9',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/choritz.png',
    imageWidth: 920,
    imageHeight: 518,
  },
  {
    id: 'work-10',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
    details: [
      { label: 'D / B：', value: 'キャラクターデザイン、ポータルサイト設計・デザイン' },
    ],
    term: '2026.3 - 2026.4（ポータルサイトのみでの算出）',
    image: '/images/sections/works/choritz.png',
    imageWidth: 920,
    imageHeight: 518,
  },
  */
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
