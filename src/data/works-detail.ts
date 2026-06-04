// 作品詳細ページ（/works/[slug]）のリッチコンテンツ。
// 現状は CHORITZ ブランディング案件の1デザインのみ。WordPress 連携時は
// getWorkDetailBySlug の中身を fetch に差し替えれば利用側は無修正で済む。
import type { WorkDetailContent } from '@/types/work';
import { getMemberBySlug } from './members';

const CHORITZ = '/images/works/choritz';

// ヒーロー写真コラージュ。
// - PC: 6 枚プレースホルダー（画像は後日差し替え）。座標は 1920×760 基準の Figma 実測値。
// - SP: ピンク帯 + 6 枚写真 + CHORITZ ロゴが一体になった焼き込み画像
//   (hero-sp-collage.png 780×1080 = 390×540 @2x) を 1 枚で全面描画。
//   ロゴと帯がすでに画像に含まれているため spLogo:false、border-radius 無効化。
const CHORITZ_DETAIL: WorkDetailContent = {
  slug: 'choritz',
  pattern: 'detail',
  hero: {
    spWidth: 390,
    spHeight: 540,
    spLogo: false,
    spFlatPhoto: true,
    // Figma SP: ヘッダー 80 + 白ギャップ 30 = ヒーロー上端 y=110。
    // 実装ヘッダーは 101 (fluid padding 含む) のため、視覚的にヘッダー:ギャップ = 8:3 比を
    // 保つため margin 58 (見た目ギャップ ≈ 37) に設定。
    spOffsetTop: 58,
    photos: [
      // PC 用 1 枚焼き込み画像 (Figma Group 1253 を 1920×760 で JPG 化)
      {
        src: `${CHORITZ}/hero-pc.jpg`,
        x: 0,
        y: 0,
        width: 1920,
        height: 760,
      },
    ],
    // SP 用 1 枚焼き込み画像（390×540 を full-bleed カバー）
    spPhotos: [
      {
        src: `${CHORITZ}/hero-sp-collage.png`,
        x: 0,
        y: 0,
        width: 390,
        height: 540,
      },
    ],
    // ロゴは PC / SP どちらの hero 画像にも焼き込み済みのため overlay は出さない
  },
  // gap = 直前要素からの上余白（Figma 実測 px・1920 基準）
  blocks: [
    {
      type: 'lead',
      gap: 240,
      // Figma SP: ヒーロー下 → リード見出し上のギャップ
      spGap: 80,
      heading: '数値では測れない想いや姿勢を、ブランドの核心へ宿す。',
      subheading: '社名からVIまで、一気通貫のブランド構築',
      body: [
        '自社プロジェクト「KUSOMEGANE」でのやり取りをきっかけに朱さんからWebサイト制作のご相談をいただいたことが、<br>このプロジェクトのはじまりでした。',
      ],
    },
    {
      type: 'textSection',
      gap: 240,
      // SP: 240 * 0.42 ≒ 101 だと余白が大きすぎるため明示縮小
      spGap: 60,
      level: 'main',
      heading: '■ヒアリングと現状把握',
      // Figma SP (2812:49934): 3 段落 / 自然 wrap (14px / lh 30 / ls 2.52)
      body: [
        'Web制作にあたり具体的な話を進めていく中で、正式なロゴはなく名前も定まったものがないという話が出てきました。',
        'KUSOMEGANEでのやり取りの頃から朱さんとは個人名でやり取りをしていたため、新たにWebへ誘導できたとしても覚えてもらいづらい。',
        'しっかりと記憶に残るシンボルとなる\nネーミングとロゴをまずは作ることを提案しました。',
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
      // SP: ラベル＋ロゴ＋会社名を 1 枚画像で表現 (Figma SP: 390×346 を full-bleed)
      spImage: {
        src: `${CHORITZ}/naming-card-sp.png`,
        w: 390,
        h: 346,
      },
    },
    {
      type: 'textSection',
      gap: 80,
      level: 'sub',
      heading: '＜名前に込めた意味＞',
      // Figma SP (2822:51218): 2 段落構成 (旧 3 段落の 2/3 を結合)
      body: [
        '朱さんのお名前を企業・サービス名として活用する案として作成しました。',
        '輸入からOEMにおいて上流から関わり、最後(Z)まで責任を持って伴走する姿勢をイメージとして伝えることを意図しています。<br>また日本企業らしい「企業感＝信頼感」を重視し、堅実で安心して任せられる印象につながるネーミングです。',
      ],
    },
    {
      type: 'textSection',
      gap: 80,
      level: 'sub',
      heading: '＜視覚的なひっかかり＞',
      body: [
        '視覚的な特徴として、あえて少しのひっかかりを文字面と末尾の「Z」で作っています。直接のやり取りが多い朱さんには名前を説明できる時間がある。そのひっかかりが記憶に残るための違和感として機能します。ヒアリングだけでは汲み取れない、実際に仕事をする朱さんの姿勢や想いも含めて、朱さんの働き方や動きにしっかりとフィットするようにネーミング設計を行っています。',
      ],
    },
    { type: 'textSection', gap: 260, level: 'main', heading: '■タグライン制作' },
    {
      type: 'showcaseCard',
      gap: 40,
      background: 'white',
      card: { w: 1520, h: 480 },
      // Figma SP「Group 1256」(780×668 = 2x) → 1x で 390×334。SP のみカードを縦長にして上下の余白を確保
      spCard: { w: 390, h: 334 },
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
      // Figma SP「Group 1257」(780×668 = 2x) → 1x で 390×334。SP のみカードを縦長に
      spCard: { w: 390, h: 334 },
      graphic: { src: `${CHORITZ}/choritz-logo.svg`, w: 310.5, h: 159.71 },
    },
    {
      type: 'paragraph',
      gap: 80,
      // Figma SP 2822:51375 準拠の 3 段落構成
      body: [
        '「頂」の字をモチーフに構成したマークは、CHORITZが中心（軸）となり、中国と日本を繋ぎながらより良いものを生み出していく様を表現しています。',
        'カラーは朱さんのお名前から赤系を採用。競合には誠実さや信頼感を訴求する青系ロゴも多く見られる中、朱さん自身の誠実な印象もしっかりと表現したかったため、赤でありながらその両立を目指しました。',
        '競合の赤よりも柔らかめのトーンを選んだのも、温かみや推進力を保ちながら信頼感を成立させるための判断です。',
      ],
    },
    {
      type: 'imageGrid',
      gap: 80,
      cardHeight: 840,
      // Figma 書き出しの合成画像を 1 枚でそのまま使用（PC=Group 1254 / SP=Group 1260）。
      // 背景・余白・ぼかしは画像に焼き込み済みのため、カード装飾なし(bare)＋CSS blur なしで全幅表示。
      bare: true,
      images: [`${CHORITZ}/prop-grid.png`],
      imageRatio: { w: 3040, h: 1680 },
      spImages: [`${CHORITZ}/prop-grid-sp.png`],
      spImageRatio: { w: 782, h: 572 },
      // Figma SP (3098:24658 内 2822:51407): カード高さ 286px
      spCardHeight: 286,
      caption: '＜ロゴデザイン初回提案書(一部抜粋)＞',
    },
    {
      type: 'imageGrid',
      gap: 80,
      cardHeight: 690,
      // Figma 書き出しの合成画像 (Group 1306) を 1 枚でそのまま使用。
      // 背景・余白は画像に焼き込み済みのため、カード装飾なし(bare)で全幅表示。PC/SP 共通。
      bare: true,
      images: [`${CHORITZ}/guide-grid.png`],
      imageRatio: { w: 3040, h: 1380 },
      spImages: [`${CHORITZ}/guide-grid.png`],
      spImageRatio: { w: 3040, h: 1380 },
      spCardHeight: 213,
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
      // Figma SP「Frame 627200」(780×1440 = 2x) → 1x 390×720。SP は縦長の Web デザイン集合
      spSrc: `${CHORITZ}/web-mockup-1-sp.png`,
      spW: 780,
      spH: 1440,
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
      // Figma SP「Frame 627201」(780×416 = 2x) → 1x 390×208
      spSrc: `${CHORITZ}/web-mockup-2-sp.png`,
      spW: 780,
      spH: 416,
    },
    {
      type: 'paragraph',
      gap: 180,
      body: [
        '文字情報や素材共有だけでは受け取れない、朱さんのまだ言葉になっていなかった想いや姿勢。それらを汲み取れたのは、KUSOMEGANEでのやり取りを通じて積み重ねてきた関係性があったからこそです。データや数値では測れない部分が、CHORITZならではの独自の強みとして宿っています。',
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
      // Figma SP「Group 1272」(780×320) — 名刺＋デバイス集合の SP 用合成
      spSrc: `${CHORITZ}/namecard-mockup-sp.png`,
      spW: 780,
      spH: 320,
    },
    {
      type: 'paragraph',
      gap: 180,
      body: [
        'ネーミングからはじまり、ロゴ・VI・Web・名刺まで一気通貫で設計したブランドは、朱さんの根本にある時間が経っても変わらない本質的な部分をデザインとビジュアルに落とし込み、時代の流れの中でもイメージを崩さず訴求し続けられる設計を目指しています。',
      ],
    },
    // Figma SP (3098:24687): 段落末→divider 上 = 101px
    { type: 'divider', gap: 180, spGap: 101 },
    {
      type: 'creditList',
      gap: 180,
      // Figma SP (3098:24687): divider→CREDIT 上 = 51px
      spGap: 51,
      groups: [
        {
          label: 'CREDIT',
          lines: [
            'CLIENT : 頂立輸入代行会社',
            'PROJECT MANAGEMENT : RYO YOSHIKAWA',
            'BRANDING / DESIGN : YUGO NISHIMOTO',
            // hideya-mifuji が About で公開（members.ts の hidden 解除）された時だけ
            // このクレジットも自動で表示する。getMemberBySlug は hidden 中 undefined を返す。
            ...(getMemberBySlug('hideya-mifuji')
              ? ['WEB DEVELOPMENT : HIDEYA MIFUJI']
              : []),
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

// ── パターンB: ロゴ・VI プロジェクトアーカイブ（カード積み上げ）──
const ARCHIVE = '/images/works/archive';

const IGC_ARCHIVE: WorkDetailContent = {
  slug: 'logo-archive',
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
    // 1. IMANISHI GOLF CLUB（カード幅 SP 390, inner 242h ※Figma 実測で他より縦長）
    {
      heading: '■ゴルフショップ「 IMANISHI GOLF CLUB 」のロゴ・VI設計',
      body: [
        '頭文字「IGC」を基点に構成したシンボルマーク。「I」はゴルフピンとボールをモチーフとし、日の丸を想起させる赤で日本らしさを織り込むことで、上質さと信頼感、そして特別な出会いの場としての輝きを表現した。「G」と「C」を一部重ね合わせた構成は、ボールの軌道とスイングの美しさを連想させ、右肩上がりにスコアとゴルフへの愛着が高まっていくクラブの物語を象徴している。',
      ],
      credit: [
        '<CREDIT>',
        'CLIENT : IMANISHI GOLF CLUB | PROJECT MANAGEMENT : RYO YOSHIKAWA |  DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI',
        '<TERM> 2025.5 ~ 2025.8',
      ],
      images: [`${ARCHIVE}/logo-imanishi-golf-club.png`],
      cardAspect: '390 / 242',
    },
    // 2. ハロタロ（カード幅 SP 390）
    {
      heading: '■会計サービス「ハロタロ」のブランディング',
      body: [
        '美容院とその利用者の関係を、より良く軽快につなぐサービス「ハロタロ」のロゴ・VI設計。',
        'ロゴマークは、発信と双方の良い出会い、そして関西発であることを、ビリケン様の目をモチーフに表現。明るく陽気で親しみやすいかたちへ落とし込んだ。',
        '新規サービスとしての信頼感を持たせるため、ロゴタイプは真面目でシンプルな書体を一から制作している。',
      ],
      credit: [
        '<CREDIT>',
        'CLIENT : ハロタロ | PROJECT MANAGEMENT : RYO YOSHIKAWA | DESIGN DIRECTION / DESIGN / COPY WRITING : YUGO NISHIMOTO',
        '<SCOPE> TAG LINE / LOGO',
        '<TERM> 2024.6 ~ 2024.8',
      ],
      images: [`${ARCHIVE}/logo-halotaro-v2.png`],
    },
    // 3. Thoot（カード幅 SP 720 / full-bleed）
    {
      // SP 改行: 「Thoot」が単独で次行に来るよう「繋ぐ」直後で改行
      heading: '■歯科医と歯科助手を繋ぐ\n「 Thoot 」のロゴ・VI設計',
      body: [
        '歯科医と歯科衛生士がつながり、連携をより円滑に、輝かせるサービス「Thoot（スート）」のロゴ・VI設計。',
        'マークは円のモチーフのみで構成することで、つながることの円滑な印象と親しみやすさ、そしてシンプルさゆえの清潔感と誠実さを表現。',
        '青を歯科医、ピンクを歯科衛生士に見立て、動きのある配置によって両者の結びつきと、つながることへの期待感を併せ持たせた。',
      ],
      credit: [
        '<CREDIT>',
        'CLIENT : THOOT | PROJECT MANAGEMENT : RYO YOSHIKAWA | DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI',
        '<TERM> 2024.5 ~ 2024.7',
      ],
      images: [`${ARCHIVE}/logo-thoot-v2.png`],
      extended: true,
    },
    // 4. CHORITZ（カード幅 SP 390）
    {
      // SP 改行: 「CHORITZ」が単独で次行に来るよう「会社」直後で改行
      heading: '■OEM・中国輸入代行会社\n「 CHORITZ 」のロゴ・VI設計',
      body: [
        '中国のものづくりと日本の利用者をつなぐ「CHORITZ」のロゴ・VI設計。',
        'ロゴは頂立の「頂」をモチーフに構成し、CHORITZが中心となって双方の価値を調和させながら、より良いプロダクトを生み出していく姿勢を表現した。',
        'カラーは代表者の名に由来する「朱」の赤系を採用し、想いと誠実さの感じられる印象へと落とし込んでいる。',
      ],
      credit: [
        '<CREDIT>',
        'CLIENT : 頂立輸入代行会社 | PROJECT MANAGEMENT : RYO YOSHIKAWA | DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> NAMING / TAG LINE / LOGO',
        '<TERM> 2025.12 ~ 2026.4',
      ],
      images: [`${ARCHIVE}/logo-choritz-v2.png`],
    },
    // 5. Men'te（カード幅 SP 390）
    {
      // SP 改行: 「Men’te」が単独で次行に来るよう「アプリ」直後で改行
      heading: '■理美容師検索予約アプリ\n「 Men’te 」のロゴ・VI設計',
      body: [
        'シンプルなオリジナルフォントで構成した「Men’te」のロゴ・VI設計。',
        '「メンズ」を想起させる「Men」を際立たせるため、「’」にのみ擬似金の装飾を加えた。この「’」と、跳ねるように処理した「t」「e」によって、Men’teを通じて気分やモチベーションが前向きに高まっていく様子を表現している。',
      ],
      credit: [
        '<CREDIT>',
        'CLIENT : Men’te | PROJECT MANAGEMENT : RYO YOSHIKAWA | DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI',
        '<TERM> 2025.8 ~ 2026.2',
      ],
      images: [`${ARCHIVE}/logo-mente-v2.png`],
    },
    // 6. MAISON ORICHAN（カード幅 SP 720 / full-bleed）
    {
      heading: '■「 MAISON ORICHAN 」のロゴ・VI設計',
      body: [
        'MAISON ORICHANは、AIを活用してシャンパンのラベルを一人ひとりが自由にカスタマイズできるD2C ECサービス。ロゴタイプは、カスタマイズによって生まれる多様なデザインや、顧客それぞれが思い描く世界観の邪魔をしすぎないことを想定して作成した。サービスの特徴である「A」と「I」の文字にだけ別の処理を加えながら、全体をシンプルにまとめている。',
      ],
      credit: [
        '<CREDIT>',
        'CLIENT : 株式会社 BUBBIC | PROJECT MANAGEMENT : RYO YOSHIKAWA | DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI',
        '<TERM> 2025.10 ~ 2026.1',
      ],
      images: [`${ARCHIVE}/logo-maison-orichan.png`],
      extended: true,
    },
    // 7. NEST（カード幅 SP 720 / full-bleed）
    {
      heading: '■ヴィラ「 NEST 」のロゴ・VI設計',
      body: [
        'NESTの「N」を、実際のハケ・ローラー・判子を使って描いたロゴデザイン。',
        'デジタルで整えたラインではなく、手の温もりや偶然性が宿る質感をそのままロゴにしている。',
        'NEST＝巣。家族や友人、恋人と過ごす特別な時間を提供する場所として、遊び心とこだわりが共存するサービスのシンボルを目指した。',
      ],
      credit: [
        '<CREDIT> CLIENT : NEST | PROJECT MANAGEMENT : RYO YOSHIKAWA | DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI',
        '<TERM> NEST BIWAKO : 2024.7 ~ 2024.9 | NEST AMANO HASHIDATE : 2026.2',
      ],
      images: [`${ARCHIVE}/logo-nest.png`],
      extended: true,
    },
    // 8. 株式会社アリガトサン（カード幅 SP 720 / full-bleed）
    {
      heading: '■「 株式会社アリガトサン 」のブランディング',
      body: [
        '自社「アリガトサン」のロゴ・VI設計。コンセプトは「ナシをアリにする」——',
        '非常識・不可能とされてきたことを実現し、正解とされる枠組みを疑い、不正解の中にも新たな美と価値を見出す思想を込めた。ロゴタイプはあえてアンバランスに組んだ文字を、絶妙な均衡で成り立つまで追求。AIを駆使する会社でありながら、機械的な計算では届かない最終的なバランスを、人の判断と執着に似た愛で成り立たせている。ロゴタイプの要素で太陽を象り、形も境遇も異なる9名の創業メンバーが一つの均衡を成す姿を、9本の放射線として落とし込んだ。',
      ],
      credit: [
        '<CREDIT>',
        'CLIENT : 株式会社アリガトサン | DESIGN DIRECTION / DESIGN : YUGO NISHIMOTO',
        '<SCOPE> LOGO / VI',
        '<TERM> 2026.1 ~ 2026.7',
      ],
      images: [`${ARCHIVE}/logo-arigatosun.png`],
      extended: true,
    },
  ],
};

// ── パターンA: NEST ブランディング詳細ページ ──
const NEST = '/images/works/nest';

const NEST_DETAIL: WorkDetailContent = {
  slug: 'nest',
  pattern: 'detail',
  hero: {
    // PC: Figma フレーム 2497:85745 実測 1920×820 (既存 1 枚画像コラージュ)
    width: 1920,
    height: 820,
    band: 'none',
    photos: [
      { src: `${NEST}/hero-collage-v3.png`, x: 0, y: 0, width: 1920, height: 820 },
    ],
    // SP: Figma「Frame 627257」(780×1116) の縦長合成画像を 1 枚で hero に。
    // 旧プレースホルダー (10 枚コラージュ) はユーザー指示により撤回。
    // work-1 (CHORITZ) 同様、ヘッダー直下から余白を開けてヒーローを配置（上から 42.5px）
    spOffsetTop: 42.5,
    spWidth: 390,
    spHeight: 558,
    spPhotos: [
      { src: `${NEST}/hero-sp.png`, x: 0, y: 0, width: 390, height: 558 },
    ],
  },
  blocks: [
    {
      type: 'lead',
      gap: 160,
      heading: 'デジタルでは生まれない温もりと偶然性を、シンボルとして可視化する。',
      subheading: '拡張を見据えたロゴ・VI設計',
      // Figma SP 2833:234321 準拠の 2 段落構成
      body: [
        'ヴィラブランド「NEST」のロゴ制作についてご相談をいただきました。',
        'NESTという名前はすでに決まっており、その名前が持つ世界観をどのようにビジュアルへ落とし込むかが、<br>このプロジェクトの出発点でした。',
      ],
    },
    // 母体 NEST ロゴ。PC は焼き込み 1520×560 画像。
    // SP は Figma「Group 1140」(780×800) の白/黒 2 セル合成ロゴ。
    {
      type: 'mockupCard',
      gap: 240,
      src: `${NEST}/nest-main-pair.png`,
      w: 1520,
      h: 560,
      spSrc: `${NEST}/nest-main-pair-sp.png`,
      spW: 780,
      spH: 800,
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
        'NEST＝巣。家族や友人、恋人と過ごす特別な時間を提供する場所として、遊び心とこだわりが共存するサービスのシンボルを<br>目指しました。',
      ],
    },
    // NEST 琵琶湖。PC は 1520×1100。
    // SP は Figma「Group 1143」(780×760) 白/黒 2 列の BIWAKO ロゴ showcase。
    // full-bleed: SP は左右 padding なしで 390×380 サイズ感に合わせる (旧 pairSplit2 プレースホルダー比率)
    {
      type: 'mockupCard',
      gap: 260,
      src: `${NEST}/nest-biwako-pair.png`,
      w: 1520,
      h: 1100,
      spSrc: `${NEST}/nest-biwako-pair-sp.png`,
      spW: 390,
      spH: 380,
      spFullBleed: true,
    },
    // NEST 天橋立。PC は 1520×1100。
    // SP は Figma「Group 1275」(780×760) 白/黒 2 列の AMANO HASHIDATE ロゴ showcase。
    // full-bleed: SP は左右 padding なしで 390×380 (BIWAKO と統一)
    {
      type: 'mockupCard',
      gap: 120,
      src: `${NEST}/nest-amanohashidate-pair.png`,
      w: 1520,
      h: 1100,
      spSrc: `${NEST}/nest-amanohashidate-pair-sp.png`,
      spW: 390,
      spH: 380,
      spFullBleed: true,
    },
    {
      type: 'textSection',
      gap: 80,
      level: 'main',
      heading: '■施設ごとのVI展開',
      body: [
        '母体ロゴはモノクロで設計し、各施設のアクセントカラーで個性を持たせました。',
        'NEST琵琶湖には湖面を想起させるブルー、NEST天橋立には温かみのあるオレンジを採用。共通のマークを持ちながら、施設ごとの空気感や独自性が色で伝わる設計です。また部屋名にも同様のロゴ展開を行い、「NEST琵琶湖 夢」「NEST天橋立 燈」のように、ブランドの世界観が施設の隅々まで一貫して宿るようにしています。',
      ],
    },
    // ロゴバリエーション。PC は 1520×942。
    // SP は Figma「Group 1276」(2833:233518 上 794×586) のロゴガイドライン showcase。
    // full-bleed: Figma SP カード仕様 391×293 に合わせる
    {
      type: 'mockupCard',
      gap: 260,
      src: `${NEST}/logo-variations.png`,
      w: 1520,
      h: 942,
      spSrc: `${NEST}/logo-variations-sp.png`,
      spW: 391,
      spH: 293,
      spFullBleed: true,
      // PC / SP とも画像内右下にオーバーレイ (Figma SP 3103:52707 / PC 3103:52709)
      spCaption: '＜ロゴデザイン簡易ガイドライン(一部抜粋)＞',
    },
    {
      type: 'textSection',
      gap: 120,
      level: 'main',
      heading: '■2施設目「NEST天橋立」への展開',
      body: [
        'NEST天橋立への展開は、すでに設計されたVI体系をもとに数日で完成しました。最初の段階でルールを丁寧に設計しておくことで、<br>新しい施設が加わった時も迷わず展開できる。ブランドの拡張性を最初から意識した設計が、スムーズな展開につながりました。',
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

// ── パターンA: Men’te アプリ開発支援 詳細ページ ──
// Figma 3545:103333 (1920×14393)。画像は public/images/works/mente/ に順次配置。
// 未受領の枠は src を空文字にして寸法を保ったグレープレースホルダーで描画する。
const MENTE = '/images/works/mente';

const MENTE_DETAIL: WorkDetailContent = {
  slug: 'mente',
  pattern: 'detail',
  hero: {
    // PC: Figma 1920×820（ロゴ + スマホモックアップ。画像後日）
    width: 1920,
    height: 820,
    band: 'none',
    flatPhoto: true,
    photos: [{ src: `${MENTE}/hero.png`, x: 0, y: 0, width: 1920, height: 820 }],
    // SP: PC ヒーロー画像を流用し左寄せ cover で表示（中央クロップだと左の Men’te ロゴが切れる）
    spOffsetTop: 42.5,
    spWidth: 390,
    spHeight: 520,
    spPhotoLeft: true,
    spPhotos: [{ src: `${MENTE}/hero.png`, x: 0, y: 0, width: 390, height: 520 }],
  },
  blocks: [
    {
      type: 'lead',
      gap: 180,
      spGap: 80,
      heading: '諦めきれなかった構想が、サービスとして動き出す。',
      subheading: '構想整理から要件定義・開発・改善まで、一気通貫の立ち上げ支援',
      // Figma 3002:45793 準拠の明示改行（文ごと）
      body: [
        '美容師個人の力をもっと広げ、日本の男性の美意識を底上げしたい。',
        'そんな想いから生まれたMen’teは、男性ユーザーと美容師をつなぐ新しい美容サービスです。',
        '既存の予約媒体では表現しきれなかった美容師個人の魅力や提案力を活かし、ユーザーが自分に合った美容師と出会える体験を目指して開発されました。',
        '弊社では、サービス構想の整理から要件定義、画面設計、デザイン、アプリ開発、リリース後の改善まで伴走し、',
        'クライアントの頭の中にあった構想を実際に利用されるアプリとして形にしました。',
      ],
    },
    {
      type: 'textSection',
      gap: 200,
      spGap: 60,
      level: 'main',
      heading: '■美容師としての想いを、サービスの目的へ整理する。',
      // Figma 3002:45797 準拠の明示改行
      body: [
        'Men’teの出発点にあったのは、クライアント自身が美容師として働く中で感じていた課題意識でした。',
        '「日本の男性の美意識を底上げし、日本国民をカッコ良くする」。',
        'その想いを実現するためには、目の前の一人ひとりをカッコ良くするだけでは限界があります。',
        'より多くの男性に美容の価値を届け、同時に美容師個人がもっと活躍できる仕組みが必要だと考えたことが、Men’teの構想につながりました。',
        '既存の予約媒体では、美容師個人の魅力や提案力を十分に伝えきれない場面があります。',
        'Men’teでは、男性ユーザーが自分に合った美容師と出会い、美容師側も個人としての強みを発揮できる関係性を目指しました。',
      ],
    },
    {
      type: 'textSection',
      gap: 240,
      spGap: 60,
      level: 'main',
      heading: '■何を作るかではなく、誰がどう使うかから整理する。',
      // Figma 3031:44798 準拠の明示改行
      body: [
        '弊社が支援を開始した時点では、以前の開発資料をそのまま活用できない部分も多く、要件整理はゼロベースに近い状態からのスタートでした。',
        'そこでまず行ったのは、「何を作るか」だけでなく、「なぜ必要なのか」「誰がどのように使うのか」を整理することです。',
        '男性ユーザーは、どのように美容師を探し、どの情報を見て判断するのか。美容師は、どのような情報を登録し、',
        'どうすれば自分の魅力や技術を伝えやすくなるのか。',
        '管理側は、公開後にどのような情報を確認し、どのような改善に対応していく必要があるのか。',
        'クライアントの頭の中にあるイメージを丁寧に言語化し、ユーザー体験、画面構成、必要機能、運用時の管理方法へと落とし込んでいきました。',
        '開発中は、仕様の確認や進捗共有を細かく実施。今どこを作っているのか、次に何を決める必要があるのかを見える状態にしながら進行しました。',
      ],
    },
    // 図版「ゼロベースから使われるアプリへ具現化」。Figma arigatosun_web_works-04 (1520×823)
    { type: 'mockupCard', gap: 60, src: `${MENTE}/diagram-flow.png`, w: 1520, h: 823 },
    {
      type: 'textSection',
      gap: 240,
      spGap: 60,
      level: 'main',
      heading: '■サービスとして動かすための、画面・機能・管理導線を実装。',
    },
    // 図版「双方に迷わず伝わる体験を設計」。Figma arigatosun_web_works-03 (1520×824)
    { type: 'mockupCard', gap: 60, src: `${MENTE}/diagram-experience.png`, w: 1520, h: 824 },
    // 図版「選びやすい×選ばれやすいを予約体験の中心でつなぐ」。Figma arigatosun_web_works-02 (1520×773)
    { type: 'mockupCard', gap: 60, src: `${MENTE}/diagram-booking.png`, w: 1520, h: 773 },
    {
      type: 'paragraph',
      gap: 80,
      // Figma 3031:44825 準拠の明示改行
      body: [
        'Men’teは、ただ見た目のあるアプリを作れば成立するサービスではありません。',
        '男性ユーザーが美容師を探す導線。美容師が自身の魅力を発信する導線。運営側が公開後に状況を把握し、改善していく導線。',
        'それぞれがつながって、はじめてサービスとして動き出します。',
        '開発では、ユーザー登録・ログイン、美容師一覧・検索、美容師プロフィール詳細、問い合わせ・予約導線、美容師側の情報管理、',
        '管理・運用画面まで、利用開始から運用までを見据えた構成を設計しました。',
        'また、リリース後に細かな改善や機能追加が発生することも前提に、公開後も修正・改善を続けられる進め方を意識しています。',
      ],
    },
    {
      type: 'textSection',
      gap: 240,
      spGap: 60,
      level: 'main',
      heading: '■サービスの思想を、画面体験として伝える。',
      // Figma 3031:44829 準拠の明示改行
      body: [
        'Men’teで大切にしたのは、単に機能を並べることではなく、サービスの思想がユーザー体験として伝わることでした。',
        '男性ユーザーにとっては、自分に合う美容師を探しやすいこと。美容師にとっては、個人としての魅力や技術を伝えやすいこと。',
        'この両方を成立させるために、画面設計では情報の見やすさ、導線の分かりやすさ、プロフィールの伝わり方を重視しました。',
        'ロゴや基本トーンも、単なる装飾ではなく、サービスの入口として機能します。ユーザーが初めてMen’teに触れた瞬間に、',
        '清潔感、信頼感、相談しやすさを感じられるよう、ブランドの印象とアプリの使いやすさを接続していきました。',
      ],
    },
    {
      type: 'textSection',
      gap: 240,
      spGap: 60,
      level: 'main',
      heading: '■ロゴデザイン',
    },
    // ロゴデザイン。Figma arigatosun_web_works-06 (1520×651) + 画像内右下オーバーレイ
    {
      type: 'mockupCard',
      gap: 60,
      src: `${MENTE}/logo-design.png`,
      w: 1520,
      h: 651,
      spCaption: '＜ロゴデザイン(一部抜粋)＞',
    },
    {
      type: 'textSection',
      gap: 240,
      spGap: 60,
      level: 'main',
      heading: '■自分に合う美容師を探しやすく、比較しやすい画面へ。',
      // Figma 3031:44833 準拠の明示改行
      body: [
        'トップ画面では、Men’teが何のサービスなのかを直感的に理解できることを重視しました。',
        '美容師一覧・検索画面では、ユーザーが自分に合う美容師を探しやすく、比較しやすい情報の並びを設計。',
        '美容師詳細画面では、プロフィールや実績を通じて、美容師個人の魅力や技術が伝わる構成にしています。',
        '管理画面では、公開後の運用や改善も見据え、美容師側・運営側が情報を管理しやすい設計を目指しました。',
      ],
    },
    // アプリ画面。Figma Group 1288 / arigatosun_web_works-08 (1520×824)
    { type: 'mockupCard', gap: 60, src: `${MENTE}/app-screens.png`, w: 1520, h: 824 },
    {
      type: 'textSection',
      gap: 80,
      level: 'main',
      heading: '■リリースして終わりではなく、育て続けるアプリへ。',
      // Figma 3031:44837 準拠の明示改行
      body: [
        'アプリは、リリースして終わりではありません。',
        '実際にユーザーが使い始めることで、細かな改善点や不具合、追加したい機能が見えてきます。',
        'Men’teでも、リリース後の運用を通じて改善要望や相談が生まれています。弊社では、公開後も不具合対応や改善相談に継続して対応し、',
        'サービスを運営しながら育てていく体制を支援しています。',
        '構想段階だったサービスが実際に公開され、ユーザー登録や利用が始まったことで、Men’teはようやくスタート地点に立ちました。',
        '今後も機能追加や改善を重ねながら、サービスの成長を支えるパートナーとして伴走していきます。',
      ],
    },
    { type: 'divider', gap: 200 },
    {
      type: 'interview',
      gap: 200,
      spGap: 60,
      // 見出しは写真とまとめて sticky 固定するため interview 内に持たせる
      title: '■クライアントの声',
      // Figma cv_1 (680×419)
      photo: { w: 680, h: 419, src: `${MENTE}/interview.png` },
      heading: ['開発だけをする会社ではなく、', '一緒に整理しながら共に進んでくれる会社。'],
      // a は Figma 3031:44841 の明示改行（<p>区切り）に合わせたセグメント配列
      qa: [
        {
          q: 'Q)Men’teを立ち上げようと思った背景を教えてください。',
          a: [
            'A)僕自身が美容師として働く中で、「日本の男性の美意識を底上げし、日本国民をカッコ良くする」という想いがずっとありました。',
            'ただ、一人をカッコ良くするだけでは限界があります。',
            '既存の予約媒体では難しい部分もあり、美容師個人がもっと活躍できる形を作らない限り、本当の意味で国民の底上げにはつながらないと感じていました。',
            'そこで、新しい形で男性の美容意識を高められるサービスとして、Men’teの構想を考え始めました。',
          ],
        },
        {
          q: 'Q)開発を進めるうえで、どのような不安がありましたか？',
          a: [
            'A)アプリ開発自体が完全に未経験だったので、「何をどう進めればいいのか分からない」「本当に形になるのか」という不安は常にありました。特に、自分の頭の中にはイメージがあるのに、それを開発側に正確に伝える難しさが大きかったです。',
          ],
        },
        {
          q: 'Q)以前の開発では、どのような課題がありましたか？',
          a: [
            'A)以前お願いしていた会社では、かなり大きな金額をかけて開発を進めていました。ただ、途中から「今どこまで進んでいるのか」「何が完成していて、何が未完成なのか」が見えづらくなっていきました。コミュニケーション面でも認識のズレが増え、自分の中では不安がどんどん大きくなっていった印象です。結果として、思い描いていた形にはならず、精神的にもかなりしんどい時期でした。',
          ],
        },
        {
          q: 'Q)一度うまくいかなかった中で、改めて開発を依頼しようと思えた理由は何でしたか？',
          a: [
            'A)正直、一度失敗を経験していたので、「また同じことになるんじゃないか」という怖さはかなりありました。それでも再挑戦しようと思えたのは、Men’teを諦めきれなかったからです。美容業界で実際に働いているからこそ、このサービスには需要があると思っていました。',
            '御社を選んだ理由は、単純に信頼ができたからです。',
            'ただ作るだけではなく、「なぜ必要なのか」「どういう使われ方をするのか」を一緒に整理しながら進めてくれた感覚がありました。過去の失敗も親身に相談に乗ってくれて、ここなら信頼できるという確信を持てました。',
          ],
        },
        {
          q: 'Q)開発が始まってからの進め方はどう感じましたか？',
          a: [
            'A)以前の開発資料がそのまま使えない部分も多かったので、かなりゼロベースに近い状態から要件を整理していく必要がありました。その中でも、細かく確認しながら進めてもらえたので、「今どこを作っているのか」「次に何を決めるべきか」が以前よりかなり見えやすかったです。アプリ開発は専門用語も多く、経営者側が理解しきれない部分もありますが、その都度すり合わせをしながら進めてもらえた点は安心感がありました。',
          ],
        },
        {
          q: 'Q)リリース後のサポートについては、どのように感じていますか？',
          a: [
            'A)リリースして終わりではなく、運用が始まってからの対応がすごく大事だと思っています。実際、使い始めると細かい改善点や不具合は必ず出てきます。その時に相談できる状態があるのは、とても感謝しています。アプリは運営しながら育てていくものだと思っているので、継続的に相談できる環境があるのは本当に助かっています。',
          ],
        },
        {
          q: 'Q)弊社に依頼した後、状況はどう変わりましたか？',
          a: [
            'A)以前は、「本当に完成するのか分からない」という不安の方が強かったです。',
            '今は、もちろん課題はまだまだありますが、前に進んでいる感覚があります。実際にユーザー登録や利用も始まり、頭の中の構想だったものが、少しずつサービスとして形になってきています。',
            '期待というより、「やっとスタート地点に立てた」という感覚が近いかもしれません。',
          ],
        },
        {
          q: 'Q)同じような悩みを持つ経営者の方に勧めるとしたら、弊社をどのように伝えますか？',
          a: [
            'A)「開発だけをする会社」ではなく、「一緒に整理しながら共に進んでくれる会社」と伝えると思います。特に、アプリ開発が初めての経営者は、不安や分からないことがかなり多いです。その時に、一方的ではなくコミュニケーションを取りながら進めてくれるかはかなり重要だと思います。',
          ],
        },
        {
          q: 'Q)今後、弊社に期待していることはありますか？',
          a: [
            'A)Men’teはまだこれからのサービスなので、今後も改善や機能追加はかなり増えていくと思っています。なので、単発の開発だけではなく、「一緒にサービスを育てていくパートナー」として、引き続き相談しながら進めていけたら嬉しいです。',
          ],
        },
      ],
    },
    { type: 'divider', gap: 200 },
    {
      type: 'creditList',
      gap: 180,
      groups: [
        {
          label: 'CREDIT',
          lines: [
            'CLIENT : Men’te',
            'PROJECT MANAGEMENT : RYO YOSHIKAWA',
            'BRANDING / DESIGN : YUGO NISHIMOTO',
            'DEVELOPMENT : KOSHI TSUCHIGA',
          ],
        },
        {
          label: 'SCOPE',
          lines: ['REQUIREMENTS / UI/UX / APP / LOGO / VI / RELEASE / IMPROVEMENT'],
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

/**
 * slug から詳細ページデータを取得する。
 * logo-archive はパターンB（アーカイブ）、nest は NEST 詳細、mente は Men’te 詳細、
 * それ以外は CHORITZ 詳細を返す。
 * 「順番は後で変わる」前提のため、この分岐の差し替えだけで割当を変更できる。
 */
export async function getWorkDetailBySlug(
  slug: string,
): Promise<WorkDetailContent | undefined> {
  if (slug === 'logo-archive') return { ...IGC_ARCHIVE, slug };
  if (slug === 'nest') return { ...NEST_DETAIL, slug };
  if (slug === 'mente') return { ...MENTE_DETAIL, slug };
  return { ...CHORITZ_DETAIL, slug };
}
