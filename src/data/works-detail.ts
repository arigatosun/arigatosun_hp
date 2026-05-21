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
      blur: true,
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

// MAISON ORICHAN / NEST は Figma 上で IGC のプレースホルダー本文のままのため、
// 同じ文言を共有用に切り出している。
const ARCHIVE_PLACEHOLDER_BODY = [
  '頭文字「IGC」をベースに構成されたシンボルマークです。「I」はゴルフピンとボールをモチーフに、日本らしい要素を加えることで、上質さと信頼感を表現。特別な体験や出会いの場としての輝きを象徴しています。また、「G」と「C」は一部を重ね合わせることで、ボールの軌道やスイングの美しさを連想させ、プレーヤーのスコア向上やゴルフへの愛着が右肩上がりに深まっていく様子を表現しています。全体として、上質さ・親しみ・成長のストーリーを兼ね備えた、クラブの理念を体現するデザインです。',
];

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
      body: [
        '頭文字「IGC」を基点に構成したシンボルマーク。「I」はゴルフピンとボールをモチーフとし、日の丸を想起させる赤で日本らしさを織り込むことで、上質さと信頼感、そして特別な出会いの場としての輝きを表現した。「G」と「C」を一部重ね合わせた構成は、ボールの軌道とスイングの美しさを連想させ、右肩上がりにスコアとゴルフへの愛着が高まっていくクラブの物語を象徴している。',
      ],
      credit: [
        '<CREDIT> CLIENT : IMANISHI GOLF CLUB　|　PROJECT MANAGEMENT : RYO YOSHIKAWA　|　DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI　<TERM> 2025.5 ~ 2025.8',
      ],
      images: [`${ARCHIVE}/logo-imanishi-golf-club.png`],
    },
    {
      heading: '■会計サービス「ハロタロ」のブランディング',
      body: [
        '美容院とその利用者の関係を、より良く軽快につなぐサービス「ハロタロ」のロゴ・VI設計。 ロゴマークは、発信と双方の良い出会い、そして関西発であることを、ビリケン様の目をモチーフに表現。明るく陽気で親しみやすいかたちへ落とし込んだ。 新規サービスとしての信頼感を持たせるため、ロゴタイプは真面目でシンプルな書体を一から制作している。',
      ],
      credit: [
        '<CREDIT> CLIENT : ハロタロ　|　PROJECT MANAGEMENT : RYO YOSHIKAWA　|　DESIGN DIRECTION / DESIGN / COPY WRITING : YUGO NISHIMOTO',
        '<SCOPE> TAG LINE / LOGO　<TERM> 2024.6 ~ 2024.8',
      ],
      images: [`${ARCHIVE}/logo-halotaro-v2.png`],
    },
    {
      heading: '■歯科医と歯科助手を繋ぐ「 Thoot 」のロゴ・VI設計',
      body: [
        '歯科医と歯科衛生士がつながり、連携をより円滑に、輝かせるサービス「Thoot（スート）」のロゴ・VI設計。 マークは円のモチーフのみで構成することで、つながることの円滑な印象と親しみやすさ、そしてシンプルさゆえの清潔感と誠実さを表現。 青を歯科医、ピンクを歯科衛生士に見立て、動きのある配置によって両者の結びつきと、つながることへの期待感を併せ持たせた。',
      ],
      credit: [
        '<CREDIT> CLIENT : THOOT　|　PROJECT MANAGEMENT : RYO YOSHIKAWA　|　DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI　<TERM> 2024.5 ~ 2024.7',
      ],
      images: [`${ARCHIVE}/logo-thoot-v2.png`],
    },
    {
      heading: '■OEM・中国輸入代行会社「 CHORITZ 」のロゴ・VI設計',
      body: [
        '中国のものづくりと日本の利用者をつなぐ「CHORITZ」のロゴ・VI設計。 ロゴは頂立の「頂」をモチーフに構成し、CHORITZが中心となって双方の価値を調和させながら、より良いプロダクトを生み出していく姿勢を表現した。 カラーは代表者の名に由来する「朱」の赤系を採用し、想いと誠実さの感じられる印象へと落とし込んでいる。',
      ],
      credit: [
        '<CREDIT> CLIENT : 頂立輸入代行会社　|　PROJECT MANAGEMENT : RYO YOSHIKAWA　|　DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> NAMING / TAG LINE / LOGO　<TERM> 2025.12 ~ 2026.4',
      ],
      images: [`${ARCHIVE}/logo-choritz-v2.png`],
    },
    {
      heading: '■理美容師検索予約アプリ「 Men’te 」のロゴ・VI設計',
      body: [
        'シンプルなオリジナルフォントで構成した「Men’te」のロゴ・VI設計。 「メンズ」を想起させる「Men」を際立たせるため、「’」にのみ擬似金の装飾を加えた。 この「’」と、跳ねるように処理した「t」「e」によって、Men’teを通じて気分やモチベーションが前向きに高まっていく様子を表現している。',
      ],
      credit: [
        '<CREDIT> CLIENT : Men’te　|　PROJECT MANAGEMENT : RYO YOSHIKAWA　|　DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI　<TERM> 2025.8 ~ 2026.2',
      ],
      images: [`${ARCHIVE}/logo-mente-v2.png`],
    },
    {
      heading: '■「 MAISON ORICHAN 」のロゴ・VI設計',
      body: ARCHIVE_PLACEHOLDER_BODY,
      credit: [
        '<CREDIT> CLIENT : 株式会社 BUBBIC　|　PROJECT MANAGEMENT : RYO YOSHIKAWA　|　DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI　<TERM> 2025.10 ~ 2026.1',
      ],
      images: [`${ARCHIVE}/logo-maison-orichan.png`],
    },
    {
      heading: '■ヴィラ「 NEST 」のロゴ・VI設計',
      body: ARCHIVE_PLACEHOLDER_BODY,
      credit: [
        '<CREDIT> CLIENT : NEST　|　PROJECT MANAGEMENT : RYO YOSHIKAWA　|　DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI　<TERM> NEST BIWAKO : 2024.7 ~ 2024.9　｜　NEST AMANO HASHIDATE : 2026.2',
      ],
      images: [`${ARCHIVE}/logo-nest.png`],
    },
    {
      heading: '■「 株式会社アリガトサン 」のブランディング',
      body: [
        '自社「アリガトサン」のロゴ・VI設計。コンセプトは「ナシをアリにする」——非常識・不可能とされてきたことを実現し、正解とされる枠組みを疑い、不正解の中にも新たな美と価値を見出す思想を込めた。ロゴタイプはあえてアンバランスに組んだ文字を、絶妙な均衡で成り立つまで追求。AIを駆使する会社でありながら、機械的な計算では届かない最終的なバランスを、人の判断と執着に似た愛で成り立たせている。ロゴタイプの要素で太陽を象り、形も境遇も異なる9名の創業メンバーが一つの均衡を成す姿を、9本の放射線として落とし込んだ。',
      ],
      credit: [
        '<CREDIT> CLIENT : 株式会社アリガトサン　|　DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI　<TERM> 2026.1 ~ 2026.7',
      ],
      images: [`${ARCHIVE}/logo-arigatosun.png`],
    },
  ],
};

// ── パターンA: NEST ブランディング詳細ページ ──
const NEST = '/images/works/nest';

const NEST_DETAIL: WorkDetailContent = {
  slug: 'work-3',
  pattern: 'detail',
  hero: {
    // Figma の hero フレーム 2497:85745 実測 1920×820
    width: 1920,
    height: 820,
    band: 'none',
    // 1 枚画像（Figma の Mask group をそのまま書き出したコラージュ）でヒーロー全域を覆う。
    photos: [
      { src: `${NEST}/hero-collage-v3.png`, x: 0, y: 0, width: 1920, height: 820 },
    ],
  },
  blocks: [
    {
      type: 'lead',
      gap: 160,
      heading: 'デジタルでは生まれない温もりと偶然性を、シンボルとして可視化する。',
      subheading: '拡張を見据えたロゴ・VI設計',
      body: [
        'ヴィラブランド「NEST」のロゴ制作についてご相談をいただきました。',
        'NESTという名前はすでに決まっており、その名前が持つ世界観をどのようにビジュアルへ落とし込むかが、',
        'このプロジェクトの出発点でした。',
      ],
    },
    // 母体 NEST ロゴ（白/黒ペアが 1 枚に焼き込まれた書き出し画像 1520×560）
    {
      type: 'mockupCard',
      gap: 240,
      src: `${NEST}/nest-main-pair.png`,
      w: 1520,
      h: 560,
    },
    {
      type: 'textSection',
      gap: 80,
      level: 'main',
      heading: '■ロゴデザイン',
      body: [
        'NESTの「N」を、実際のハケ・ローラー・判子を使って描きました。',
        'デジタルで整えたラインではなく、手の温もりや偶然性が宿る質感をそのままロゴにしています。',
        '50回以上の試作と検証を重ね、最もNESTらしい一枚を選び出し、組み立てて設計していきました。',
        'NEST＝巣。家族や友人、恋人と過ごす特別な時間を提供する場所として、遊び心とこだわりが共存するサービスのシンボルを目指しました。',
      ],
    },
    // NEST 琵琶湖（白/黒ペア 1 枚画像 1520×1100）
    {
      type: 'mockupCard',
      gap: 260,
      src: `${NEST}/nest-biwako-pair.png`,
      w: 1520,
      h: 1100,
    },
    // NEST 天橋立（白/黒ペア 1 枚画像 1520×1100）
    {
      type: 'mockupCard',
      gap: 120,
      src: `${NEST}/nest-amanohashidate-pair.png`,
      w: 1520,
      h: 1100,
    },
    {
      type: 'textSection',
      gap: 80,
      level: 'main',
      heading: '■施設ごとのVI展開',
      body: [
        '母体ロゴはモノクロで設計し、各施設のアクセントカラーで個性を持たせました。',
        'NEST琵琶湖には湖面を想起させるブルー、NEST天橋立には温かみのあるオレンジを採用。',
        '共通のマークを持ちながら、施設ごとの空気感や独自性が色で伝わる設計です。',
        'また部屋名にも同様のロゴ展開を行い、「NEST琵琶湖 夢」「NEST天橋立 燈」のように、',
        'ブランドの世界観が施設の隅々まで一貫して宿るようにしています。',
      ],
    },
    // ロゴバリエーション大判画像（1520×942）
    {
      type: 'mockupCard',
      gap: 260,
      src: `${NEST}/logo-variations.png`,
      w: 1520,
      h: 942,
    },
    {
      type: 'caption',
      gap: 8,
      text: '＜資料名の説明＞',
    },
    {
      type: 'textSection',
      gap: 120,
      level: 'main',
      heading: '■2施設目「NEST天橋立」への展開',
      body: [
        'NEST天橋立への展開は、すでに設計されたVI体系をもとに数日で完成しました。',
        '最初の段階でルールを丁寧に設計しておくことで、新しい施設が加わった時も迷わず展開できる。',
        'ブランドの拡張性を最初から意識した設計が、スムーズな展開につながりました。',
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
            'CLIENT : NEST',
            'PROJECT MANAGEMENT : RYO YOSHIKAWA',
            'DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
            'PHOTOGRAPHY : HYOUGA HIROMORI , AIRU MATSUO',
          ],
        },
        {
          label: 'SCOPE',
          lines: ['LOGO / VI'],
        },
        {
          label: 'TERM',
          lines: [
            'NEST BIWAKO : 2024.7 ~ 2024.9',
            'NEST AMANO HASHIDATE : 2026.2',
          ],
        },
      ],
    },
    { type: 'divider', gap: 180 },
    { type: 'relatedWorks', gap: 240 },
  ],
};

/**
 * slug から詳細ページデータを取得する。
 * work-2 はパターンB（アーカイブ）、work-3 は NEST 詳細、それ以外は CHORITZ 詳細を返す。
 * 「順番は後で変わる」前提のため、この分岐の差し替えだけで割当を変更できる。
 */
export async function getWorkDetailBySlug(
  slug: string,
): Promise<WorkDetailContent | undefined> {
  if (slug === 'work-2') return { ...IGC_ARCHIVE, slug };
  if (slug === 'work-3') return { ...NEST_DETAIL, slug };
  return { ...CHORITZ_DETAIL, slug };
}
