// ServiceCard 系の型定義
// 複数コンポーネント（ServiceCard / ServiceSection / 将来の Service ページ）で共有

export type ServiceCardData = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  viewLabel: string;
  /** カード背景画像。未用意なら null（グレープレースホルダー表示） */
  bgImage: string | null;
  /** カード背景動画。指定があれば bgImage より優先（mp4 / webm のペアを想定） */
  bgVideo?: {
    /** WebM ソース (vp9) — 軽量・モダンブラウザ向け */
    webm: string;
    /** MP4 ソース (h264) — フォールバック */
    mp4: string;
    /** ローディング前 / 再生失敗時に表示する静止画 (必要なら) */
    poster?: string;
  };
};

export type ServiceMenuItem = string;

// ── SERVICE 詳細ページ（/service/[slug]）系の型 ──

/** 側面ナビ・他サービス誘導で使うサービス参照 */
export type ServiceNavItem = {
  slug: string;
  label: string;
};

/** ピルリスト1行（能動的デザインの領域） */
export type ServicePillRow = {
  label: string;
  items: string;
  /** 赤アクセント（Figma の BRANDING ピル） */
  accent: boolean;
};

/** 赤グローを形（雲・泡など）の内側だけにクリップするマスク */
export type ServiceConceptMask = {
  /** 形のシルエット画像（不透明部分にだけグローが出る） */
  src: string;
  /** mask-size（線画イラストとの寸法差を補正・例 '94% 88%'） */
  size: string;
  /** mask-position（例 '50% 50%'） */
  position: string;
};

/** 画像オーバーレイ（雲ダイアグラム上の標準コピー等） */
export type ServiceImageOverlay = {
  /** 表示テキスト */
  text: string;
  /** 画像枠基準の絶対配置 (%) */
  topPct: number;
  leftPct: number;
  /** テキスト幅（画像幅基準 %） */
  widthPct: number;
};

/** PROCESS（進め方）の 1 ステップ */
export type ServiceFlowStep = {
  /** STEP.1 等のステップ番号ラベル */
  step: string;
  /** ステップ見出し（例: 現状整理・課題把握） */
  title: string;
  /** ステップ説明文（1行） */
  description: string;
};

/** コンセプトブロックのビジュアル（イラスト画像 / ピルリスト / フローステップ） */
export type ServiceConceptVisual =
  | {
      kind: 'image';
      /** Figma 書き出し画像。未用意なら null（プレースホルダー表示） */
      src: string | null;
      alt: string;
      width: number;
      height: number;
      /** グローを形の内側にクリップするマスク。null ならクリップなし */
      mask: ServiceConceptMask | null;
      /** 画像の上に重ねるテキストオーバーレイ（AI/DEV アリガトサン・スタンダードの3標準等） */
      overlays?: ServiceImageOverlay[];
    }
  | {
      kind: 'pills';
      rows: ServicePillRow[];
    }
  | {
      kind: 'steps';
      items: ServiceFlowStep[];
    };

/** 詳細ページ中段のコンセプトブロック */
export type ServiceConcept = {
  id: string;
  title: string;
  subtitle: string;
  /** Figma の明示的改行ごとに分割した本文セグメント */
  body: string[];
  /** 本文の字間（Figma 実測 px・16px 基準） */
  bodyTracking: number;
  visual: ServiceConceptVisual;
};

/** 実績・事例カード */
export type ServiceCaseStudy = {
  id: string;
  client: string;
  /** 「メイン文｜サブ文」を "|" 区切りで保持（Figma 準拠） */
  text: string;
  /** サムネ画像。未用意なら null（プレースホルダー表示） */
  thumbnail: string | null;
};

/** 3カラム promise グリッドの 1 アイテム */
export type ServicePromiseItem = {
  /** 大見出し（キャッチコピー） */
  catchphrase: string;
  /** 本文（1段落） */
  body: string;
};

/** 3カラム promise セクション（私たちが実現すること 等） */
export type ServicePromiseSection = {
  id: string;
  title: string;
  subtitle: string;
  items: ServicePromiseItem[];
};

/** SERVICE 詳細ページ1件分のデータ */
export type ServiceDetailData = {
  slug: string;
  titleEn: string;
  titleJa: string;
  quote: string;
  description: string[];
  heroImage: string | null;
  /** 「私たちが実現すること」「私たちが実現してきたこと」など Hero 直後の3カラムグリッド（複数可） */
  promises?: ServicePromiseSection[];
  concepts: ServiceConcept[];
  caseStudies: ServiceCaseStudy[];
};
