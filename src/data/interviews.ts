// TOP ページ「インタビュー（CLIENT INTERVIEW）」セクションのデータ。
// 横に最大3つ表示。heading / body は明示改行を string[] で保持（Figma の <p> 区切り準拠）。
// WordPress / CMS 連携時はこの配列を fetch 化すれば利用側は無修正。

export type InterviewItem = {
  /** 詳細ページの識別子（/interview/<slug>）。年内ユニーク。 */
  slug: string;
  /** クライアント名（例: 株式会社YKT Innovation 様）。 */
  client: string;
  /** 見出し。配列 = 明示改行（要素間に <br>）。 */
  heading: string[];
  /** 本文抜粋。配列 = 明示改行。 */
  body: string[];
  /** SP 用の本文抜粋。未指定なら body を使う。 */
  bodySp?: string[];
  /** カード画像（480×293 基準・object-cover）。 */
  image: string;
  imageAlt?: string;
};

export const INTERVIEWS: InterviewItem[] = [
  {
    slug: 'ykt-innovation',
    client: '株式会社YKT Innovation 様',
    heading: ['訪問介護の書類作成を10時間から1時間へ。AI SaaS「ケアGO」を現場起点で開発した舞台裏'],
    body: [
      '課題から生まれたアイデアが、現場で動く事業になるまで。',
      '弊社代表とリードエンジニアが岡田さまを訪ねてお聞きした、',
      '開発の舞台裏。',
    ],
    bodySp: [
      '課題から生まれたアイデアが、現場で動く事業になるまで。弊社代表とリードエンジニアが岡田さまを訪ねてお聞きした、開発の舞台裏。',
    ],
    image: '/images/sections/interview/ykt.jpg',
  },
  {
    slug: 'nj-mente',
    client: '株式会社NJ 様',
    heading: ['開発だけをする会社ではなく、一緒に整理しながら共に進んでくれる会社。'],
    body: [
      '男性美容への想いから生まれたMen’teが、サービスとして動き出すまで。過去の開発で感じた不安を越え、構想を共に整理しながら形にしていった過程をお聞きしました。',
    ],
    image: '/images/sections/interview/nj.jpg',
  },
];

/** slug から1件取得（無ければ undefined）。 */
export function getInterviewBySlug(slug: string): InterviewItem | undefined {
  return INTERVIEWS.find((i) => i.slug === slug);
}
