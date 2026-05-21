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
  concepts: [
    // ④ アリガトサン・スタンダード (Figma y=3785〜)
    {
      id: 'standard',
      title: 'アリガトサン・スタンダード',
      subtitle: 'ARIGATOSUN STANDARD',
      // Figma 実測 (x=200 y=3991 w=700 h=149 / 4 セグメント)
      body: [
        '私たちは、言われたものをそのまま作るだけの開発会社ではありません。',
        '要望の奥にある本質を見極め、何を作るべきか、どこまで作るべきかを再定義する。',
        'そして、机上の仕様書ではなく、まず動くものをつくり、見えたものを起点に正解を更新していく。',
        'そうして初めて、理想は現実に近づきます。',
      ],
      bodyTracking: 4.48,
      visual: {
        kind: 'image',
        // 雲ダイアグラム画像 (Figma _レイヤー_1 x=1070 y=3794 w=634 h=640)
        // 実画像は未用意のためプレースホルダー表示
        src: null,
        alt: 'アリガトサン・スタンダードを表すクラウド型の概念図（AI/DEV）',
        width: 634,
        height: 640,
        mask: null,
        // 雲上に重ねる 3 標準テキスト
        // Figma 実測（cloud 1070-1704 x 3794-4434 を 100% として配置）:
        //   ・「ただ速いことではなく…」: x=1305 y=3909 w=220 → left 37.1% top 18.0% w 34.7%
        //   ・「ただ安いことではなく…」: x=1124 y=4143 w=220 → left  8.5% top 54.5% w 34.7%
        //   ・「ただAIを使うことでなく…」: x=1412 y=4187 w=241 → left 53.9% top 61.4% w 38.0%
        overlays: [
          {
            text: 'ただ速いことではなく、\n意味のある状態に\n最短で到達すること。',
            topPct: 18,
            leftPct: 37,
            widthPct: 35,
          },
          {
            text: 'ただ安いことではなく、\n諦めかけていた構想を\n現実に落とし込むこと。',
            topPct: 54.5,
            leftPct: 8.5,
            widthPct: 35,
          },
          {
            text: 'ただAIを使うことでなく、\n人がAIの手足になる\n状態を終わらせること。',
            topPct: 61.5,
            leftPct: 54,
            widthPct: 38,
          },
        ],
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
