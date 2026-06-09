// 作品データのアクセス層。
// 現状は静的データを返すだけ。WordPress 連携時は WORKS_DATA を fetch 化（または廃止）し、
// getAllWorks / getWorkBySlug の中身だけ差し替えれば利用側（ページ・コンポーネント）は無修正。
import type { WorkItem } from '@/types/work';

// 静的データ（暫定ソース。WordPress 連携時に置き換え）
const WORKS_DATA: readonly WorkItem[] = [
  {
    id: 'choritz',
    client: '頂立輸入代行会社',
    title: '数値では測れない想いや姿勢を、ブランドの核心へ宿す。| 社名からVIまで、一気通貫のブランド構築',
    categories: ['DESIGN / BRANDING'],
    details: [
      { label: 'D / B：', value: '会社名・タグライン・ロゴ・VI設計・WEB' },
    ],
    term: '2025.12 ~ 2026.4',
    image: '/images/sections/works/choritz.png',
    imageWidth: 920,
    imageHeight: 518,
  },
  {
    id: 'mente',
    client: 'Men’te',
    // 改行方針:
    //   - 「|」直後は >=1920px だけ強制改行し Figma(3555:112339) に厳密一致させる
    //     （breakAfterPipeAtMax）。1920px 未満（MacBook 等）は自然折り返しで幅に追従。
    //   - 「立ち上げ支援」前は \n で固定（語割れ防止・全幅共通）。
    // WorksSection 側で \n → <br>/ブロック行、フラグ → レスポンシブ <br> に変換。
    title:
      '諦めきれなかった構想が、サービスとして動き出す。| 構想整理から要件定義・開発・改善まで、一気通貫の\n立ち上げ支援',
    breakAfterPipeAtMax: true,
    categories: ['AI / DEVELOPMENT', 'DESIGN / BRANDING'],
    details: [
      { label: 'D / B：', value: 'ロゴデザイン、VI設計' },
      { label: 'AI / D：', value: '要件定義、アプリ開発、UI/UX、リリース、運用改善' },
    ],
    term: '2025.12 ~ 2026.4',
    // 一覧カード専用画像（920×520）。カード規格ちょうどなのでトリミング不要。
    image: '/images/works/mente/card.png',
    imageWidth: 920,
    imageHeight: 520,
  },
  {
    id: 'logo-archive',
    client: 'VARIOUS CLIENTS',
    title: '独自の核を構築する。| ロゴ・VIのプロジェクトアーカイブ。',
    categories: ['DESIGN / BRANDING'],
    details: [
      { label: 'D / B：', value: 'ロゴデザイン' },
    ],
    term: '',
    image: '/images/sections/works/logo-archive.png',
    imageWidth: 920,
    imageHeight: 520,
  },
  {
    id: 'nest',
    client: 'NEST',
    title: 'デジタルでは生まれない温もりと偶然性を、シンボルとして可視化する。| 拡張を見据えたロゴ・VI設計',
    categories: ['DESIGN / BRANDING'],
    details: [
      { label: 'D / B：', value: 'ロゴ・VI 設計' },
    ],
    term: 'NEST BIWAKO : 2024.7 ~ 2024.9 / NEST AMANO HASHIDATE : 2026.2',
    image: '/images/sections/works/nest.png',
    imageWidth: 920,
    imageHeight: 520,
  },
  // work-5 以降は今後の実装枠（プレースホルダ）。実データができ次第コメントを外す。
  /*
  {
    id: 'work-5',
    client: '全日本漬物協同組合連合会',
    title: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
    categories: ['DESIGN / BRANDING'],
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
    categories: ['DESIGN / BRANDING'],
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
    categories: ['DESIGN / BRANDING'],
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
    categories: ['DESIGN / BRANDING'],
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
    categories: ['DESIGN / BRANDING'],
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
    categories: ['DESIGN / BRANDING'],
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
