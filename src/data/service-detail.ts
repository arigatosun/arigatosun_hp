// SERVICE 詳細ページ（/service/[slug]）の静的データソース。
// 将来 CMS / API へ差し替え予定。

import type {
  ServiceDetailData,
  ServiceNavItem,
} from '@/types/service';

/** 側面ナビ・他サービス誘導で共有するサービス一覧（並び順は Figma 準拠） */
export const SERVICE_NAV: readonly ServiceNavItem[] = [
  { slug: 'ai-dev', label: 'AI / DEVELOPMENT' },
  { slug: 'design-branding', label: 'DESIGN / BRANDING' },
  { slug: 'ip-creative', label: 'IP / CREATIVE' },
] as const;

const DESIGN_BRANDING: ServiceDetailData = {
  slug: 'design-branding',
  titleEn: 'DESIGN / BRANDING',
  titleJa: 'デザイン・ブランディング',
  // SP のみ「未」と「来」の間で改行 (`||` = SP 専用改行マーカー)
  quote: '「いいデザインは、その先の未||来を想像させる。」',
  description: [
    'モノやコトが溢れる世界において、ブランド自らが声を上げ、らしさを振る舞い、情報を正しく伝えていく。',
    '私たちは、目的を達成するための「自ら動き、働きかけるデザイン＝能動的デザイン」が、ブランディングに欠かせない要素のひとつと考えています。',
    'そのために、本質を見極め、戦略と表現を往来しながら、細部にいたるまでこだわり抜く。',
    '時代の流れに揺るがず、定められた寿命を全うし、未来でも機能し続ける構造を生み出す。',
    'それが、デザイン・ブランディング部の仕事です。',
  ],
  // Figma ではプレースホルダー画像。実画像が用意でき次第 src を設定。
  heroImage: null,
  // Hero メイン画像はスライドショー (Figma Rectangle 4702/4716/4717)
  heroSlides: [
    {
      src: '/images/sections/service/detail/design-branding-hero/slide-1.png',
      alt: 'デザイナーがノート PC で資料を確認しながら作業している風景',
    },
    {
      src: '/images/sections/service/detail/design-branding-hero/slide-2.png',
      alt: '手書きで設計やアイデアを書き出したノートのクローズアップ',
    },
    {
      src: '/images/sections/service/detail/design-branding-hero/slide-3.png',
      alt: '机に広げられたアリガトくんモチーフのロゴ・VI 検証用プリント群',
    },
  ],
  concepts: [
    {
      id: 'standard',
      title: 'アリガトサン・スタンダード',
      subtitle: 'ARIGATOSUN STANDARD',
      // Figma SP (2837:53673) は 5 段落構成
      body: [
        'デザインとは、表現を司る「意匠」、',
        'らしさを機能させるための「設計」。',
        'そして現代において、物事の本質を見定め、正しい方向へと導く「課題解決」という思考は欠かせません。「美しさ」や「機能性」に加え、目的を達成するための「戦略」までもが、デザインという営みに集約されています。',
        'アリガトサンではこれらを一貫した指針とし、さらに「価値拡張」と「独自性」という新たな価値を組み込んだものを、',
        '独自の定義としています。',
      ],
      bodyTracking: 3.84,
      visual: {
        kind: 'image',
        // Figma Group 1030 (351×240) — 線画 SVG。Group 1226 (350×240) はマスク
        src: '/images/sections/service/detail/concept-standard.svg',
        alt: 'アリガトサン・スタンダードを表すクラウド型の概念図。意匠・設計・課題解決・価値拡張・独自性の5要素で構成される',
        width: 351,
        height: 240,
        // マスクは線画とほぼ同寸 (350×240 vs 351×240) — 1px 差は size 100% 100% で吸収
        mask: {
          src: '/images/sections/service/detail/concept-standard-mask.svg',
          size: '100% 100%',
          position: '50% 50%',
        },
      },
    },
    {
      id: 'scope',
      title: '能動的デザインの領域',
      subtitle: 'DESIGN & BRANDING SCOPE',
      // Figma SP: 「による」までを 1 行に収めたいので 3 セグメント構成にする
      body: [
        'ロゴやVI設計、Webといった既存の領域を超え、本質的な「価値」を能動的に発信するデザインを構築。',
        '論理的な設計と感覚的な表現を横断し、一貫したデザイン・ブランディングによる',
        '可能性の最大化と拡張を目指します。',
      ],
      bodyTracking: 4.48,
      visual: {
        kind: 'pills',
        rows: [
          { label: 'BRANDING', items: 'MVV / NAMING / COPYWRITING', accent: true },
          { label: 'IDENTITY', items: 'LOGO / VI / TAGLINE / GUIDELINES', accent: false },
          { label: 'DIGITAL', items: 'WEB / APP / UI・UX', accent: false },
          { label: 'GRAPHIC', items: 'PACKAGE / EDITORIAL / PAPER', accent: false },
          { label: 'CREATIVE', items: 'PHOTO / MOVIE / 3D / ILLUSTRATION', accent: false },
        ],
      },
    },
    {
      id: 'flow',
      title: '制作フロー',
      // Figma SP (2837:53731) はサブ見出し PROCESS / body は単一段落で自然 wrap
      subtitle: 'PROCESS',
      body: [
        'プロジェクトの数だけ、最適解へのルートは存在します。ただ制作フローに当てはめるのではなく、課題の核心に応じて柔軟にプロセスを再定義。独自の価値を見出し、まだ見ぬ可能性を具現化するための最適な「カタチ」を共創します。',
      ],
      bodyTracking: 4,
      visual: {
        kind: 'image',
        // Figma Group 1224 (355×351, 線画) + Group 1225 (350×350, マスク) の SVG ペア
        src: '/images/sections/service/detail/concept-flow.svg',
        alt: '制作フローを表すネットワーク図。デザイン・ブランディングを中心に各スキルが連携する様子',
        width: 355,
        height: 351,
        // マスク (350×350) は線画 (355×351) とほぼ同寸。5px 差は size 100% 100% で吸収
        mask: {
          src: '/images/sections/service/detail/concept-flow-mask.svg',
          size: '100% 100%',
          position: '50% 50%',
        },
      },
    },
  ],
  caseStudies: [
    {
      id: 'tsukemono',
      client: '全日本漬物協同組合連合会',
      text: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
      thumbnail: null,
    },
    {
      id: 'choritz',
      client: '頂立輸入代行会社',
      text: '数値では測れない想いや姿勢を、ブランドの核心へ宿す。| 社名からVIまで、一気通貫のブランド構築',
      thumbnail: null,
    },
    {
      id: 'nest',
      client: 'NEST',
      text: 'デジタルでは生まれない温もりと偶然性を、シンボルとして可視化する。| 拡張を見据えたロゴ・VI設計',
      thumbnail: null,
    },
  ],
};

// ── AI / DEVELOPMENT (Figma node 2481:61546 / SERVICE(PC:1920px) より) ──
// 構築中：① Hero 完了 / ②③④⑤ は順次追加
const AI_DEV: ServiceDetailData = {
  slug: 'ai-dev',
  titleEn: 'AI / DEVELOPMENT',
  titleJa: 'AI・開発',
  // Hero quote (Figma x=200 y=487 w=920 h=112 / 2 セグメント)
  quote: '人が本当に向き合うべき仕事へ、\n事業が価値を生む方向へ。',
  // Hero description (Figma x=200 y=639 w=1163 h=152 / 4 段落)
  description: [
    'AIが当たり前になった世界で、ただ作るだけの開発は、もう価値にならない。',
    '私たちは、止まっている業務を前に進め、止まりかけている構想を現実に変えるための基盤をつくる。',
    '人が判断や企画、対話に立ち返るための仕組みを。挑戦が、価値を生み出す事業へ変わっていくための土台を。',
    'そしてその先に、現代で最も魔法に近い技術で、目の前の現実を変えていく驚きを届けたい。',
  ],
  heroImage: null,
  // Hero メイン画像はスライドショー (Figma Rectangle 4660/4718/4719/4720)
  heroSlides: [
    {
      src: '/images/sections/service/detail/ai-dev-hero/slide-1.png',
      alt: '開発者がデュアルディスプレイの前でコードを書いている風景',
    },
    {
      src: '/images/sections/service/detail/ai-dev-hero/slide-2.png',
      alt: 'IoT 基板に接続された配線群のクローズアップ',
    },
    {
      src: '/images/sections/service/detail/ai-dev-hero/slide-3.png',
      alt: 'デスクでキーボードを打つ手元と作業画面',
    },
    {
      src: '/images/sections/service/detail/ai-dev-hero/slide-4.png',
      alt: 'チームメンバーがディスプレイを見て議論している様子',
    },
  ],
  // ② 私たちが実現すること (Figma y=2086〜)
  // ③ 私たちが実現してきたこと (Figma y=2932〜)
  // 共に 3 cols at x=200/760/1320, w=400 each
  promises: [
    {
      id: 'realize',
      title: '私たちが実現すること',
      subtitle: 'WHAT WE REALIZE',
      items: [
        {
          catchphrase: '人が本当に向き合うべき仕事へ、時間と思考を返す。',
          body: '業務改善の目的は、単なる効率化ではありません。繰り返しの整理や準備を仕組みに変えることで、人が判断、対話、企画に集中できる環境をつくります。',
        },
        {
          catchphrase: '構想を、価値を生む現実へ変える基盤を、早く形にする。',
          body: '新しい事業に必要なのは、最初から完璧なシステムではなく、早く触れ、学び、改善できる土台です。私たちは、速度と継続可能性を両立させながら、挑戦を事業基盤へ変えていきます。',
        },
        {
          // Figma SP は「技術を、」で明示改行
          catchphrase: '技術を、\nただの便利さで終わらせない。',
          body: 'AIもシステムも、機能の説明だけでは人の心を動かせません。想像を超える体験こそが、導入の確信になり、人と事業を前へ進める力になると、私たちは信じています。',
        },
      ],
    },
    {
      id: 'realized',
      title: '私たちが実現してきたこと',
      subtitle: "WHAT WE'VE MADE REAL",
      items: [
        {
          catchphrase: '諦めかけていた夢のアプリを、現実に。',
          body: '実現しなかった構想を、本当に必要な要素へ整理し直し、現実のプロダクトとして形にしてきました。',
        },
        {
          catchphrase: 'システムに縁のなかった会社が、新しい事業を立ち上げる。',
          body: 'オンラインガチャという新しい挑戦に対し、展開性のある事業基盤の構築を可能にしました。',
        },
        {
          catchphrase: '高額な見積もりに閉ざされていたSaaS構想を、前に進めた。',
          body: '重くなっていた構想を、動くものを見ながら改善できる柔軟なプロジェクトへ変換しました。',
        },
      ],
    },
  ],
  concepts: [
    // ④ アリガトサン・スタンダード (Figma y=3785〜)
    {
      id: 'standard',
      title: 'アリガトサン・スタンダード',
      subtitle: 'ARIGATOSUN STANDARD',
      // Figma SP (2837:55068 / x=40 y=3436 w=310 h=240): 2 段落構成
      //   段落 1: 私たちは、言われたものを…ではありません。
      //   段落 2: 要望の奥にある本質を…理想は現実に近づきます。
      //   (段落 2 の内部はコンテナ幅に応じて auto-wrap)
      body: [
        '私たちは、言われたものをそのまま作るだけの開発会社ではありません。',
        '要望の奥にある本質を見極め、何を作るべきか、どこまで作るべきかを再定義する。そして、机上の仕様書ではなく、まず動くものをつくり、見えたものを起点に正解を更新していく。そうして初めて、理想は現実に近づきます。',
      ],
      bodyTracking: 4.48,
      visual: {
        kind: 'image',
        // AI/DEV 用クラウドダイアグラム (Figma Group 1227 線画 + Group 1230 マスク)
        // 3 つの「ただ◯◯ではなく…」キャッチコピーは SVG 内に焼き込み済みのため overlays 不要
        src: '/images/sections/service/detail/concept-standard-ai.svg',
        alt: 'アリガトサン・スタンダード（AI/DEV）を表すクラウド型の概念図。3つの主バブル + 2つのサテライト円、各バブル内に「ただ◯◯ではなく…」のキャッチコピー',
        width: 354,
        height: 346,
        // 線画 (354×346) とマスク (354×346) は同寸
        mask: {
          src: '/images/sections/service/detail/concept-standard-ai-mask.svg',
          size: '100% 100%',
          position: '50% 50%',
        },
      },
    },
    // ⑤ PROCESS（進め方）(Figma y=4729〜)
    {
      id: 'process',
      title: '進め方',
      subtitle: 'PROCESS',
      // 本文 (Figma x=200 y=4935 w=700 h=114 / 3 セグメント)
      body: [
        'プロジェクトの数だけ、最適解へのルートは存在します。',
        'だから私たちは、最初から固定されたフローへ当てはめません。',
        '課題の核心に応じて、順番も、検証も、必要な実装も柔軟に再定義します。',
      ],
      bodyTracking: 4,
      visual: {
        kind: 'steps',
        items: [
          {
            step: 'STEP.1',
            title: '現状整理・課題把握',
            description: '何が前進を止めているのかを整理します。',
          },
          {
            step: 'STEP.2',
            title: '最小構成での試作・PoC',
            description: 'まず動く最小単位をつくります。',
          },
          {
            step: 'STEP.3',
            title: '見えたものを起点に再定義',
            description: 'フィードバックを価値の更新として受け止めます。',
          },
          {
            step: 'STEP.4',
            title: '段階的な実装・改善',
            description: '必要な機能を、必要な順番で積み上げます。',
          },
          {
            step: 'STEP.5',
            title: '運用・拡張',
            description: '作って終わりではなく、使われ続ける状態まで育てます。',
          },
        ],
      },
    },
  ],
  // ⑥ 実績・事例 (Figma y=5715〜) — design-branding と同内容（Figma 上で共通使用）
  caseStudies: [
    {
      id: 'tsukemono',
      client: '全日本漬物協同組合連合会',
      text: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
      thumbnail: null,
    },
    {
      id: 'choritz',
      client: '頂立輸入代行会社',
      text: '数値では測れない想いや姿勢を、ブランドの核心へ宿す。| 社名からVIまで、一気通貫のブランド構築',
      thumbnail: null,
    },
    {
      id: 'nest',
      client: 'NEST',
      text: 'デジタルでは生まれない温もりと偶然性を、シンボルとして可視化する。| 拡張を見据えたロゴ・VI設計',
      thumbnail: null,
    },
  ],
};

// ── IP / CREATIVE (Figma node 2692:37929 / SERVICE(PC:1920px) より) ──
const IP_CREATIVE: ServiceDetailData = {
  slug: 'ip-creative',
  titleEn: 'IP / CREATIVE',
  titleJa: 'IP・クリエイティブ',
  // Hero 太字キャッチ (Figma 2692:38184 / x=200 y=487 w=920 h=112 / 28px / 8.12px tracking / 2 セグメント)
  quote: 'ひとつのアイデンティティを、\n世界が愛するカルチャーへ。',
  // Hero 小キャッチ (Figma 2697:43669 / x=200 y=659 w=1163 h=38 / 22px / 5.28px tracking)
  // SP のみ「、」で改行 → 「、時」が同じ行になるのを防ぐ
  subQuote: '「個性の熱量」を真ん中に置き、\n時代を超える物語を創り出す。',
  // Hero 説明 (Figma 2692:38185 / x=200 y=725 w=1163 h=152 / 16px / 3.84px tracking)
  // Figma 構造: 3 <p> で中央 <p> に <br> 1 本 → 実体は 4 セグメント
  description: [
    'クリエイターの脳内にある純粋な衝動や、固有のパーソナル・スタイル ―――',
    'それこそが、すべての偉大なIPの原点です。',
    '私たちはそのアイデンティティを誰よりも深く理解し、磨き上げ、ファンと深く結びつけることで、',
    '一過性のブームではない『愛され続けるカルチャー』へと伴走します。',
  ],
  // Figma Rectangle 4704 (x=200 y=957 w=1520 h=800) — メインヒーロー画像枠
  heroImage: null,
  // Hero メイン画像はスライドショー (Figma Rectangle 4704/4705/4706/4707/4709)
  heroSlides: [
    {
      src: '/images/sections/service/detail/ip-hero/slide-1.png',
      alt: 'KUSOMEGANE の作品コマ：ジェット・ソファ・スイカ割り等のシーン集',
    },
    {
      src: '/images/sections/service/detail/ip-hero/slide-2.png',
      alt: 'クリエイターがタブレットで作品を制作している風景',
    },
    {
      src: '/images/sections/service/detail/ip-hero/slide-3.png',
      alt: 'タブレットの画面に描かれた KUSOMEGANE のキャラクター',
    },
    {
      src: '/images/sections/service/detail/ip-hero/slide-4.png',
      alt: '刺繍機で KUSOMEGANE キャラクターを刺繍しているところ',
    },
    {
      src: '/images/sections/service/detail/ip-hero/slide-5.png',
      alt: 'KUSOMEGANE のキーホルダーやブラインドボックス等のグッズ展示',
    },
  ],
  // Hero 右上のキャラクター (Figma 2692:38187 Group 867 / x=1397 y=260 w=286 h=296)
  heroCharacter: null,
  // ②' クリエイター紹介セクション (Figma 2817:35484 Group 1119 / x=190 y=1733 w=1787 h=833)
  // KUSOMEGANE という具体的 IP 事例を Hero 下に紹介
  creatorProfile: {
    // Figma 2734:26518 アイコン1 (x=190 y=1795 w=294 h=294 / 2x export 588x588)
    avatar: {
      src: '/images/sections/service/detail/kusomegane-avatar.png',
      alt: 'KUSOMEGANE のメインキャラクター（青いクマと羊のキャラ）',
    },
    // Figma 2702:43682 KUSOMEGANE© ロゴ (x=518 y=1856 w=409 h=40) — 現状はテキストで代用、後で SVG 化可能
    title: 'KUSOMEGANE©',
    // Figma 2702:43700 (x=518 y=1924 w=1042 h=102 / 16px / 3.84px tracking / 34px line-height / 3 段落)
    description: [
      'SNS発、圧倒的なパーソナル・スタイルとシュールな世界観でファンの心を掴むオリジナルIP。',
      '日常の違和感を切り取る独自の視点と、思わず誰かに見せたくなるユーモアで、静かに支持を広げています。',
      'ヴィレッジヴァンガード等でのポップアップ展開も実施。',
    ],
    // Figma 2704:43762 SNS アイコン (Instagram / TikTok / YouTube)
    snsLinks: {
      instagram: 'https://www.instagram.com/megamegakun',
      tiktok: 'https://www.tiktok.com/@megamegakun',
      youtube: 'https://www.youtube.com/@kusomegane_studio',
    },
  },
  // ② 私たちが実現すること WHAT WE REALIZE (Figma 2704:43923 / x=200 y=2362 w=1520 h=526)
  promises: [
    {
      id: 'realize',
      title: '私たちが実現すること',
      subtitle: 'WHAT WE REALIZE',
      items: [
        {
          // Figma 2704:43765 (x=200 y=2616 w=400 h=72) — 明示的 2 行
          catchphrase: '固有のアイデンティティを\n解放する',
          // Figma 2704:43796 (x=200 y=2712 w=400 h=136)
          body: '誰かに合わされた表現ではなく、その人・その場所にしか無い『固有のパーソナル・スタイル』を徹底的に肯定し、純度の高いコンテンツとして結晶化させます。',
        },
        {
          // Figma 2704:43797 (x=760 y=2616 w=400 h=72) — 明示的 2 行
          catchphrase: '『消費』ではなく\n『愛着』を生む',
          // Figma 2704:43799 (x=760 y=2712 w=400 h=136)
          // SP コンテナ幅 310 では「ではなく、」が 1 行に収まらず "ではな|く、" の
          // 中途半端な auto-wrap が起きるため、強制改行は削除して全体を 1 段落にする。
          body: '数字を追うだけのトレンド消費ではなく、ファンの人生に長く寄り添い、記憶に残り続ける深い愛着（ロイヤリティ）を市場に生み出します。',
        },
        {
          // Figma 2704:43766 (x=1320 y=2616 w=400 h=72) — 明示的 2 行
          catchphrase: 'クリエイティブで\n境界線を越える',
          // Figma 2704:43800 (x=1320 y=2712 w=400 h=102)
          // Figma SP の wrap: …『感情 / の循環』… で改行されるよう、
          //「の」の直前に明示改行を入れる。
          body: '国境、世代、そしてメディアの枠組みを越え、一つの熱狂が次の熱狂を呼ぶ『感情\nの循環』を世界中に広げていきます。',
          // SP: ls 2.52 だと「枠組みを越」が 1 行に収まらず Figma と wrap 位置がズレるため、
          //     2.16 まで詰めて Figma 通りの 1 行 19 文字に揃える。
          bodyTrackingSp: 2.16,
        },
      ],
    },
  ],
  concepts: [
    // ③ アリガトサン・スタンダード ARIGATOSUN STANDARD (Figma 2692:38222 / y=3168〜)
    {
      id: 'standard',
      title: 'アリガトサン・スタンダード',
      subtitle: 'ARIGATOSUN STANDARD',
      // Figma 2692:38221 (x=200 y=3374 w=700 h=190 / 16px)
      body: [
        '私たちがIPを生み出す上で、決して譲らない3つの判断軸。',
        '平均点なキャラクターは作らない。広く浅い認知ではなく、まず最初の100人を熱狂させる世界観をつくる。そして、10年先もその個性が輝き続けるための生態系を設計する ―――',
        'この3つの判断が、IP事業部のすべての制作と展開を支えています。',
      ],
      bodyTracking: 3.84,
      visual: {
        kind: 'callouts',
        // 3 つの callout テキストは SVG に焼き込み済みのため overlay は出さない
        items: [],
        // Figma Group 1239 (350×341, 線画) + Group 1240 (350×341, マスク)
        image: {
          src: '/images/sections/service/detail/concept-standard-ip.svg',
          alt: 'アリガトサン・スタンダード（IP/CREATIVE）を表す 3 つの大バブル + 衛星円の概念図',
          width: 350,
          height: 341,
          mask: {
            src: '/images/sections/service/detail/concept-standard-ip-mask.svg',
            size: '100% 100%',
            position: '50% 50%',
          },
        },
      },
    },
    // ④ クリエイターの才能を活かす、ギルド型組織 CREATOR FIRST (Figma 2704:43909 / x=284 y=4147)
    // Figma 改行: 「活かす、」の後で 1 回改行
    {
      id: 'creator-first',
      title: 'クリエイターの才能を活かす、\nギルド型組織。',
      subtitle: 'CREATOR FIRST',
      // Figma 2704:43805 (x=200 y=4353 w=700 h=228 / 16px)
      // Figma 改行 (ユーザー指定): 「グッズ / 管」「『トライブ / （族）」「純度の高 / さがコンテ」
      body: [
        '才能が、雑務に埋もれてしまわないように。企画・制作はもちろん、グッズ',
        '管理やコラボの調整、3D素材・アプリ・ゲーム開発まで、創作のまわりで必要なすべてを社内で担います。',
        'プロデューサー・ディレクター陣をハブに、IPごとに最適な『トライブ',
        '（族）』を形成。作者は、本当に必要な工程だけに集中でき、その純度の高',
        'さがコンテンツの強さになります。',
      ],
      bodyTracking: 3.84,
      visual: {
        kind: 'image',
        // 線画 + 9 ラベル一体型 SVG (Figma Group 1233) — テキストは path として焼き込み済み
        src: '/images/sections/service/detail/concept-creator-first-ip.svg',
        alt: 'CREATOR FIRST のギルド型組織図。中央「作者」を内周「プロデュース／ディレクション」が囲み、外周にコラボレーション・コンテンツ企画制作・アプリゲーム開発・グッズ管理・EC・3D デザイン等が並ぶ',
        width: 351,
        height: 351,
        // 赤グローはマスク (Figma Group 1234 = クローバー + 4 隅バブル) の内側だけに表示
        mask: {
          src: '/images/sections/service/detail/concept-creator-first-ip-mask.svg',
          size: '100% 100%',
          position: '50% 50%',
        },
      },
    },
    // ⑤ IPの育て方・進め方 ECOSYSTEM PROCESS (Figma 2692:38348 / x=284 y=5100〜)
    {
      id: 'ecosystem-process',
      title: 'IPの育て方・進め方',
      subtitle: 'ECOSYSTEM PROCESS',
      // Figma 2692:38347 (x=200 y=5306 w=700 h=228 / 16px / Figma 内の改行 = 5 セグメント)
      body: [
        'IPは一度生み出して終わりではなく、',
        '育てながら次の世代に手渡していくものです。',
        '発掘・言語化から、世界観構築、メディアミックスによる多角展開、',
        // SP は「運用」と「フェーズ」の間で改行
        'そして10年20年と愛され続ける運用\nフェーズまで ―――',
        '各段階に最適な座組みでプロジェクトを進行します。',
      ],
      bodyTracking: 3.84,
      visual: {
        kind: 'phases',
        // Figma 4 PHASES (x=1167 / 親右側)
        // description は Figma 内に明示的改行 \n あり（ServicePhaseSteps 側で white-space: pre-line で受ける）
        items: [
          {
            // 2692:41778 PHASE.1 (y=5100) / 2692:41780 (y=5138) / 2692:41779 (y=5182)
            step: 'PHASE.1',
            title: '発掘・言語化',
            description: 'クリエイターのパーソナルな衝動を抽出し、\nIPの核（アイデンティティ）を定義する。',
          },
          {
            // 2704:43871 PHASE.2 (y=5286) / 2704:43873 (y=5324) / 2704:43872 (y=5368)
            step: 'PHASE.2',
            title: '世界観構築',
            description: 'ビジュアルとストーリーを練り上げ、最初の熱狂的なファン層（コアコミュニティ）を形成する。',
          },
          {
            // 2704:43874 PHASE.3 (y=5472) / 2704:43876 (y=5510) / 2704:43875 (y=5554)
            step: 'PHASE.3',
            title: '多角化展開',
            description: 'グッズ、リアル店舗、タイアップなど、\n世界観を壊さない最適なメディアミックスを実行する。',
          },
          {
            // 2704:43877 PHASE.4 (y=5658) / 2704:43879 (y=5696) / 2704:43878 (y=5740)
            step: 'PHASE.4',
            title: '運用・継続',
            description: '時代に合わせてチューニングしながら、\n10年20年と愛され続ける定番ブランドへと育成する。',
          },
        ],
      },
    },
  ],
  // ⑥ 実績・事例 (Figma 2692:41742 / y=6124〜) — Figma 上の subtitle は "DESIGN & BRANDING SCOPE" コピー残り
  // 内容は他サービスと共通（Figma 上で同じカードを使い回し）
  caseStudies: [
    {
      id: 'tsukemono',
      client: '全日本漬物協同組合連合会',
      text: '何百年も続く日本の漬物文化を、この先も愛してもらえるカタチへ。| 最優秀賞から生まれたキャラクターデザインと、ポータルサイトのリブランディング',
      thumbnail: null,
    },
    {
      id: 'choritz',
      client: '頂立輸入代行会社',
      text: '数値では測れない想いや姿勢を、ブランドの核心へ宿す。| 社名からVIまで、一気通貫のブランド構築',
      thumbnail: null,
    },
    {
      id: 'nest',
      client: 'NEST',
      text: 'デジタルでは生まれない温もりと偶然性を、シンボルとして可視化する。| 拡張を見据えたロゴ・VI設計',
      thumbnail: null,
    },
  ],
};

export const SERVICE_DETAIL: Record<string, ServiceDetailData> = {
  'design-branding': DESIGN_BRANDING,
  'ai-dev': AI_DEV,
  'ip-creative': IP_CREATIVE,
};

/** 静的生成・存在チェック用の slug 一覧 */
export const SERVICE_DETAIL_SLUGS = Object.keys(SERVICE_DETAIL);
