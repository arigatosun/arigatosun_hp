// 作品詳細ページ（/works/[slug]）のリッチコンテンツ。
// 現状は CHORITZ ブランディング案件の1デザインのみ。WordPress 連携時は
// getWorkDetailBySlug の中身を fetch に差し替えれば利用側は無修正で済む。
import type { WorkDetailContent } from '@/types/work';

const CHORITZ = '/images/works/choritz';

// ヒーロー写真コラージュ・座標は 1920×760 ヒーロー基準の Figma 実測値
const CHORITZ_DETAIL: WorkDetailContent = {
  slug: 'work-1',
  pattern: 'detail',
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
  // gap = 直前要素からの上余白（Figma 実測 px・1920 基準）
  blocks: [
    {
      type: 'lead',
      gap: 240,
      heading: '数値では測れない想いや姿勢を、ブランドの核心へ宿す。',
      subheading: '社名からVIまで、一気通貫のブランド構築',
      body: [
        '自社プロジェクト「KUSOMEGANE」でのやり取りをきっかけに',
        '朱さんからWebサイト制作のご相談をいただいたことが、このプロジェクトのはじまりでした。',
      ],
    },
    {
      type: 'textSection',
      gap: 240,
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
      gap: 240,
      level: 'main',
      heading: '■ネーミング制作',
      body: ['複数の案を提案し、選ばれたのがCHORITZです。読み：チョウリツ。'],
    },
    {
      type: 'namingCard',
      gap: 60,
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
      gap: 80,
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
      gap: 80,
      level: 'sub',
      heading: '＜視覚的なひっかかり＞',
      body: [
        '視覚的な特徴として、あえて少しのひっかかりを文字面と末尾の「Z」で作っています。',
        '直接のやり取りが多い朱さんには名前を説明できる時間がある。そのひっかかりが記憶に残るための違和感として機能します。',
        'ヒアリングだけでは汲み取れない、実際に仕事をする朱さんの姿勢や想いも含めて、',
        '朱さんの働き方や動きにしっかりとフィットするようにネーミング設計を行っています。',
      ],
    },
    { type: 'textSection', gap: 260, level: 'main', heading: '■タグライン制作' },
    {
      type: 'showcaseCard',
      gap: 40,
      background: 'white',
      card: { w: 1520, h: 480 },
      graphic: { src: `${CHORITZ}/tagline.svg`, w: 400, h: 106 },
    },
    {
      type: 'paragraph',
      gap: 80,
      body: [
        'CHORITZが何者かを一目で伝えるタグラインです。',
        'これらのサービスを求めている人が見た瞬間に、自分に関係する会社だと認識できることを第一に考えました。',
        'また、柔らかい赤系というカラーの印象に対して、サービス内容を明確に言語化することで誠実さを強め、',
        '安心感を補強する役割も担っています。その姿勢をそのまま言葉にしています。',
      ],
    },
    { type: 'textSection', gap: 260, level: 'main', heading: '■ロゴデザイン' },
    {
      type: 'showcaseCard',
      gap: 40,
      background: 'pink',
      card: { w: 1520, h: 660 },
      graphic: { src: `${CHORITZ}/choritz-logo.svg`, w: 310.5, h: 159.71 },
    },
    {
      type: 'paragraph',
      gap: 80,
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
      gap: 80,
      cardHeight: 840,
      images: Array.from(
        { length: 15 },
        (_, i) => `${CHORITZ}/prop-${i + 1}.jpg`,
      ),
      imageRatio: { w: 297, h: 167 },
      caption: '＜ロゴデザイン初回提案書(一部抜粋)＞',
    },
    {
      type: 'imageGrid',
      gap: 80,
      cardHeight: 690,
      images: Array.from(
        { length: 8 },
        (_, i) => `${CHORITZ}/guide-${i + 1}.jpg`,
      ),
      imageRatio: { w: 299, h: 211 },
      caption: '＜ロゴデザイン簡易ガイドライン(一部抜粋)＞',
    },
    {
      type: 'textSection',
      gap: 260,
      level: 'main',
      heading: '■WEBサイトデザイン',
      body: [
        'ネーミングとロゴが決定したのち、設計したブランドのらしさをWebへと展開していきました。',
      ],
    },
    {
      type: 'mockupCard',
      gap: 60,
      src: `${CHORITZ}/web-mockup-1.jpg`,
      w: 1520,
      h: 810,
    },
    {
      type: 'paragraph',
      gap: 80,
      body: [
        'CHORITZというブランドの主張が強くなりすぎると、サービスの強みが届きづらくなる。',
        '海外とのやり取り、リスクや責任感のある仕事だからこそ、誠実に、また正確に仕事を行えることをしっかりと届けることが重要だと考え、',
        '見やすさを重点に置いた最小限の装飾と構成で進行していきました。',
        '朱さんの仕事への想いと親しみやすさが両立できるカラー設定は、ロゴ設計の段階で決まっていたものをそのままWebへと引き継いでいます。',
      ],
    },
    {
      type: 'mockupCard',
      gap: 80,
      src: `${CHORITZ}/web-mockup-2.jpg`,
      w: 1520,
      h: 810,
    },
    {
      type: 'paragraph',
      gap: 180,
      body: [
        '文字情報や素材共有だけでは受け取れない、朱さんのまだ言葉になっていなかった想いや姿勢。',
        'それらを汲み取れたのは、KUSOMEGANEでのやり取りを通じて積み重ねてきた関係性があったからこそです。',
        'データや数値では測れない部分が、CHORITZならではの独自の強みとして宿っています。',
      ],
    },
    { type: 'divider', gap: 180 },
    {
      type: 'textSection',
      gap: 180,
      level: 'main',
      heading: '■名刺デザイン',
      body: [
        'ただ情報を整理する、ビジュアルとして装飾するだけでなく、CHORITZだからこそ落とし込めるブランド設計。',
        'そういった部分に強く共感してくださり、Webサイトが世に出たあとすぐに名刺展開の依頼をいただきました。',
      ],
    },
    {
      type: 'mockupCard',
      gap: 170,
      src: `${CHORITZ}/namecard-mockup.png`,
      // w/h は Figma フレーム「Group 880」実測（アスペクト比）。
      // 書き出し PNG の余白超過分は object-fit: cover で切り落とす。
      w: 1503,
      h: 711,
    },
    {
      type: 'paragraph',
      gap: 180,
      body: [
        'ネーミングからはじまり、ロゴ・VI・Web・名刺まで一気通貫で設計したブランドは、',
        '朱さんの根本にある時間が経っても変わらない本質的な部分をデザインとビジュアルに落とし込み、',
        '時代の流れの中でもイメージを崩さず訴求し続けられる設計を目指しています。',
      ],
    },
    { type: 'divider', gap: 180 },
    {
      type: 'creditList',
      gap: 180,
      groups: [
        {
          label: 'CREDIT',
          lines: [
            'CLIENT : 頂立輸入代行会社',
            'PROJECT MANAGEMENT : RYO YOSHIKAWA',
            'BRANDING / DESIGN : YUGO NISHIMOTO',
            'WEB DEVELOPMENT : HIDEYA MIFUJI',
          ],
        },
        {
          label: 'SCOPE',
          lines: ['NAMING / TAGLINE / LOGO / VI / WEB / BUSINESS CARD'],
        },
        {
          label: 'TERM',
          lines: ['2025.12 ~ 2026.4'],
        },
      ],
    },
    { type: 'divider', gap: 180 },
    { type: 'relatedWorks', gap: 240 },
  ],
};

// ── パターンB: ロゴ・VI プロジェクトアーカイブ（スライダーカードのループ）──
const ARCHIVE = '/images/works/archive';

// 全エントリ共通の本文（Figma プレースホルダー。後で実データへ差し替え）
const ARCHIVE_BODY = [
  '頭文字「IGC」をベースに構成されたシンボルマークです。「I」はゴルフピンとボールをモチーフに、日本らしい要素を加えることで、上質さと信頼感を表現。特別な体験や出会いの場としての輝きを象徴しています。また、「G」と「C」は一部を重ね合わせることで、ボールの軌道やスイングの美しさを連想させ、プレーヤーのスコア向上やゴルフへの愛着が右肩上がりに深まっていく様子を表現しています。全体として、上質さ・親しみ・成長のストーリーを兼ね備えた、クラブの理念を体現するデザインです。',
];

// CREDIT 行を組み立てる（CLIENT 以外は Figma プレースホルダー）
const archiveCredit = (client: string): string[] => [
  `<CREDIT> CLIENT : ${client}　|　PROJECT MANAGEMENT : RYO YOSHIKAWA　|　DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO`,
  '<SCOPE> LOGO / VI　<TERM> 2025.5 ~ 2025.8',
];

// スライダー画像は現状 Figma プレースホルダー1枚を共有（実画像は後日差し替え）
const archiveImages = [`${ARCHIVE}/slide-placeholder.png`];

const IGC_ARCHIVE: WorkDetailContent = {
  slug: 'work-2',
  pattern: 'archive',
  lead: {
    heading: '独自の核を構築する、ロゴ・VIのプロジェクトアーカイブ。',
    body: [
      'ブランドの核となるロゴとVIを中心に手がけたプロジェクトのアーカイブです。',
      'そのブランドにしかない核を見つけ、形にし、どこに展開されても機能し続けるシンボルとして設計すること。',
      'どんなプロジェクトでも、その向き合い方は変わりません。',
    ],
  },
  entries: [
    {
      heading: '■ゴルフショップ「 IMANISHI GOLF CLUB 」のロゴ・VI設計',
      body: ARCHIVE_BODY,
      credit: archiveCredit('IMANISHI GOLF CLUB'),
      images: archiveImages,
    },
    {
      heading: '■「PROOSEL QUEST」のロゴデザイン',
      body: ARCHIVE_BODY,
      credit: archiveCredit('株式会社 PROOSEL'),
      images: archiveImages,
    },
    {
      heading: '■会計サービス「ハロタロ」のブランディング',
      body: ARCHIVE_BODY,
      credit: archiveCredit('ハロタロ'),
      images: archiveImages,
    },
    {
      heading: '■歯科医と歯科助手を繋ぐ「 Thoot 」のロゴ・VI設計',
      body: ARCHIVE_BODY,
      credit: archiveCredit('Thoot'),
      images: archiveImages,
    },
    {
      heading: '■OEM・中国輸入代行会社「 CHORITZ 」のロゴ・VI設計',
      body: ARCHIVE_BODY,
      credit: archiveCredit('頂立輸入代行会社'),
      images: archiveImages,
    },
    {
      heading: '■理美容師検索予約アプリ「 Men’te 」のロゴ・VI設計',
      body: ARCHIVE_BODY,
      credit: archiveCredit('Men’te'),
      images: archiveImages,
    },
    {
      heading: '■「 MAISON ORICHAN 」のロゴ・VI設計',
      body: ARCHIVE_BODY,
      credit: archiveCredit('株式会社 BUBBIC'),
      images: archiveImages,
    },
    {
      heading: '■ヴィラ「 NEST 」のロゴ・VI設計',
      body: ARCHIVE_BODY,
      credit: archiveCredit('NEST'),
      images: archiveImages,
    },
    {
      heading: '■「 株式会社アリガトサン 」のブランディング',
      body: ARCHIVE_BODY,
      credit: archiveCredit('株式会社アリガトサン'),
      images: archiveImages,
    },
    {
      heading: '■「 全日本漬物協同組合連合会 」のロゴデザイン',
      body: ARCHIVE_BODY,
      credit: archiveCredit('全日本漬物協同組合連合会'),
      images: archiveImages,
    },
  ],
};

/**
 * slug から詳細ページデータを取得する。
 * work-2 はパターンB（アーカイブ）、それ以外はパターンA（CHORITZ 詳細）を返す。
 * 「順番は後で変わる」前提のため、この分岐の差し替えだけで割当を変更できる。
 */
export async function getWorkDetailBySlug(
  slug: string,
): Promise<WorkDetailContent | undefined> {
  if (slug === 'work-2') return { ...IGC_ARCHIVE, slug };
  return { ...CHORITZ_DETAIL, slug };
}
