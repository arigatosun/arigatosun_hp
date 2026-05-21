// SERVICE 詳細ページ（/service/[slug]）の静的データソース。
// 将来 CMS / API へ差し替え予定。
// 現状 design-branding のみ Figma 準拠で本実装。ai-dev / ip-creative は後日。

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
  quote: '「いいデザインは、その先の未来を想像させる。」',
  description: [
    'モノやコトが溢れる世界において、ブランド自らが声を上げ、らしさを振る舞い、情報を正しく伝えていく。',
    '私たちは、目的を達成するための「自ら動き、働きかけるデザイン＝能動的デザイン」が、',
    'ブランディングに欠かせない要素のひとつと考えています。',
    'そのために、本質を見極め、戦略と表現を往来しながら、細部にいたるまでこだわり抜く。',
    '時代の流れに揺るがず、定められた寿命を全うし、未来でも機能し続ける構造を生み出す。',
    'それが、デザイン・ブランディング部の仕事です。',
  ],
  // Figma ではプレースホルダー画像。実画像が用意でき次第 src を設定。
  heroImage: null,
  concepts: [
    {
      id: 'standard',
      title: 'アリガトサン・スタンダード',
      subtitle: 'ARIGATOSUN STANDARD',
      // Figma 実測: 5 セグメント（明示的改行）
      body: [
        'デザインとは、表現を司る「意匠」、らしさを機能させるための「設計」。',
        'そして現代において、物事の本質を見定め、正しい方向へと導く「課題解決」という思考は欠かせません。「美しさ」や「機能性」に加え、目的を達成するための「戦略」までもが、デザインという営みに集約されています。',
        'アリガトサンではこれらを一貫した指針とし、',
        'さらに「価値拡張」と「独自性」という新たな価値を組み込んだものを、',
        '独自の定義としています。',
      ],
      bodyTracking: 3.84,
      visual: {
        kind: 'image',
        src: '/images/sections/service/detail/concept-standard.png',
        alt: 'アリガトサン・スタンダードを表すクラウド型の概念図。意匠・設計・課題解決・価値拡張・独自性の5要素で構成される',
        // 線画PNGの実寸（wrap のアスペクトを画像と完全一致させる）
        width: 2043,
        height: 1398,
        // 雲シルエットのマスク（線画より小さめ枠で書き出されているため size/position で補正）
        mask: {
          src: '/images/sections/service/detail/concept-standard-mask.png',
          size: '93.98% 88.2%',
          position: '48.8% 50.3%',
        },
      },
    },
    {
      id: 'scope',
      title: '能動的デザインの領域',
      subtitle: 'DESIGN & BRANDING SCOPE',
      // Figma 実測: 2 セグメント（明示的改行）
      body: [
        'ロゴやVI設計、Webといった既存の領域を超え、本質的な「価値」を能動的に発信するデザインを構築。',
        '論理的な設計と感覚的な表現を横断し、一貫したデザイン・ブランディングによる可能性の最大化と拡張を目指します。',
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
      // NOTE: Figma 上のサブ見出しは「DESIGN & BRANDING SCOPE」のまま（コピペ漏れの可能性）。
      subtitle: 'DESIGN & BRANDING SCOPE',
      // Figma 実測: 2 セグメント（明示的改行）
      body: [
        'プロジェクトの数だけ、最適解へのルートは存在します。',
        'ただ制作フローに当てはめるのではなく、課題の核心に応じて柔軟にプロセスを再定義。独自の価値を見出し、まだ見ぬ可能性を具現化するための最適な「カタチ」を共創します。',
      ],
      bodyTracking: 4,
      visual: {
        kind: 'image',
        src: '/images/sections/service/detail/concept-flow.png',
        alt: '制作フローを表すネットワーク図。デザイン・ブランディングを中心に各スキルが連携する様子',
        // 線画PNGの実寸
        width: 1998,
        height: 1953,
        // 泡シルエットのマスク。マスク(1998×1951)を線画(1998×1953)枠いっぱいに伸ばし、
        // 高さ2px差は 0.1% 拡大で吸収（4辺を一致させる）。
        mask: {
          src: '/images/sections/service/detail/concept-flow-mask.png',
          size: '100% 100%',
          position: '0% 0%',
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
          catchphrase: '技術を、ただの便利さで終わらせない。',
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
  concepts: [],
  caseStudies: [],
};

const IP_CREATIVE: ServiceDetailData = {
  slug: 'ip-creative',
  titleEn: 'IP / CREATIVE',
  titleJa: 'IP・クリエイティブ',
  quote: '',
  description: [],
  heroImage: null,
  concepts: [],
  caseStudies: [],
};

export const SERVICE_DETAIL: Record<string, ServiceDetailData> = {
  'design-branding': DESIGN_BRANDING,
  'ai-dev': AI_DEV,
  'ip-creative': IP_CREATIVE,
};

/** 静的生成・存在チェック用の slug 一覧 */
export const SERVICE_DETAIL_SLUGS = Object.keys(SERVICE_DETAIL);
