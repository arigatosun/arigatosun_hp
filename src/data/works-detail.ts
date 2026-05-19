// 作品詳細ページ（/works/[slug]）のリッチコンテンツ。
// 現状は CHORITZ ブランディング案件の1デザインのみ。WordPress 連携時は
// getWorkDetailBySlug の中身を fetch に差し替えれば利用側は無修正で済む。
import type { WorkDetailContent } from '@/types/work';

const CHORITZ = '/images/works/choritz';

// ヒーロー写真コラージュ・座標は 1920×760 ヒーロー基準の Figma 実測値
const CHORITZ_DETAIL: WorkDetailContent = {
  slug: 'work-1',
  hero: {
    photos: [
      { src: `${CHORITZ}/rect-220.jpg`, x: 561, y: -37, width: 302, height: 197 },
      { src: `${CHORITZ}/rect-4684.jpg`, x: 1319, y: -27, width: 564, height: 377 },
      { src: `${CHORITZ}/rect-4683.jpg`, x: -28.8, y: 112.46, width: 518.17, height: 399.36 },
      { src: `${CHORITZ}/rect-216.jpg`, x: 220.65, y: 571.74, width: 446.285, height: 299.52 },
      { src: `${CHORITZ}/rect-217.jpg`, x: 1478.61, y: 527.81, width: 507.187, height: 333.466 },
      { src: `${CHORITZ}/rect-215.jpg`, x: 956.28, y: 603.08, width: 315.494, height: 190.694 },
    ],
    logo: {
      wordmark: `${CHORITZ}/logo-2.svg`,
      mark: `${CHORITZ}/logo-1.svg`,
    },
  },
  blocks: [
    {
      type: 'lead',
      heading: '数値では測れない想いや姿勢を、ブランドの核心へ宿す。',
      subheading: '社名からVIまで、一気通貫のブランド構築',
      body: [
        '自社プロジェクト「KUSOMEGANE」でのやり取りをきっかけに',
        '朱さんからWebサイト制作のご相談をいただいたことが、このプロジェクトのはじまりでした。',
      ],
    },
    {
      type: 'textSection',
      level: 'main',
      heading: '■ヒアリングと現状把握',
      body: [
        'Web制作にあたり具体的な話を進めていく中で、正式なロゴはなく名前も定まったものがないという話が出てきました。',
        'KUSOMEGANEでのやり取りの頃から朱さんとは個人名でやり取りをしていたため、',
        '新たにWebへ誘導できたとしても覚えてもらいづらい。',
        'しっかりと記憶に残るシンボルとなるネーミングとロゴをまずは作ることを提案しました。',
      ],
    },
    {
      type: 'textSection',
      level: 'main',
      heading: '■ネーミング制作',
      body: ['複数の案を提案し、選ばれたのがCHORITZです。読み：チョウリツ。'],
    },
    {
      type: 'namingCard',
      rows: [
        {
          label: '＜表示名（対外）＞',
          note: '→ Web・営業資料・名刺・LPなどで使う表記',
          visual: {
            src: `${CHORITZ}/card-display-name.svg`,
            w: 491.166,
            h: 37.6405,
          },
        },
        {
          label: '＜正式名称＞',
          note: '→ 会社概要、提案書、説明文などで使用',
          visual: { src: `${CHORITZ}/card-logo.svg`, w: 238.902, h: 27.1897 },
        },
      ],
    },
    {
      type: 'textSection',
      level: 'sub',
      heading: '＜名前に込めた意味＞',
      body: [
        '朱さんのお名前を企業・サービス名として活用する案として作成しました。',
        '輸入からOEMにおいて上流から関わり、最後(Z)まで責任を持って伴走する姿勢をイメージとして伝えることを意図しています。',
        'また日本企業らしい「企業感＝信頼感」を重視し、堅実で安心して任せられる印象につながるネーミングです。',
      ],
    },
    {
      type: 'textSection',
      level: 'sub',
      heading: '＜視覚的なひっかかり＞',
      body: [
        '視覚的な特徴として、あえて少しのひっかかりを文字面と末尾の「Z」で作っています。',
        '直接のやり取りが多い朱さんには名前を説明できる時間がある。そのひっかかりが記憶に残るための違和感として機能します。',
        'ヒアリングだけでは汲み取れない、実際に仕事をする朱さんの姿勢や想いも含めて、',
        '朱さんの働き方や動きにしっかりとフィットするようにネーミング設計を行っています。',
      ],
    },
    { type: 'textSection', level: 'main', heading: '■タグライン制作' },
    {
      type: 'showcaseCard',
      background: 'white',
      card: { w: 1520, h: 480 },
      graphic: { src: `${CHORITZ}/tagline.svg`, w: 400, h: 106 },
    },
    {
      type: 'paragraph',
      body: [
        'CHORITZが何者かを一目で伝えるタグラインです。',
        'これらのサービスを求めている人が見た瞬間に、自分に関係する会社だと認識できることを第一に考えました。',
        'また、柔らかい赤系というカラーの印象に対して、サービス内容を明確に言語化することで誠実さを強め、',
        '安心感を補強する役割も担っています。その姿勢をそのまま言葉にしています。',
      ],
    },
    { type: 'textSection', level: 'main', heading: '■ロゴデザイン' },
    {
      type: 'showcaseCard',
      background: 'pink',
      card: { w: 1520, h: 660 },
      graphic: { src: `${CHORITZ}/choritz-logo.svg`, w: 310.5, h: 159.71 },
    },
    {
      type: 'paragraph',
      body: [
        '「頂」の字をモチーフに構成したマークは、',
        'CHORITZが中心（軸）となり、中国と日本を繋ぎながらより良いものを生み出していく様を表現しています。',
        'カラーは朱さんのお名前から赤系を採用。競合には誠実さや信頼感を訴求する青系ロゴも多く見られる中、',
        '朱さん自身の誠実な印象もしっかりと表現したかったため、赤でありながらその両立を目指しました。',
        '競合の赤よりも柔らかめのトーンを選んだのも、温かみや推進力を保ちながら信頼感を成立させるための判断です。',
      ],
    },
    {
      type: 'imageGrid',
      images: Array.from(
        { length: 15 },
        (_, i) => `${CHORITZ}/prop-${i + 1}.jpg`,
      ),
      imageRatio: { w: 297, h: 167 },
      caption: '＜ロゴデザイン初回提案書(一部抜粋)＞',
    },
    {
      type: 'imageGrid',
      images: Array.from(
        { length: 8 },
        (_, i) => `${CHORITZ}/guide-${i + 1}.jpg`,
      ),
      imageRatio: { w: 299, h: 211 },
      caption: '＜ロゴデザイン簡易ガイドライン(一部抜粋)＞',
    },
  ],
};

/**
 * slug から詳細ページデータを取得する。
 * 現状はデザインが CHORITZ の1件のみのため、全 work で暫定共有する。
 */
export async function getWorkDetailBySlug(
  slug: string,
): Promise<WorkDetailContent | undefined> {
  return { ...CHORITZ_DETAIL, slug };
}
