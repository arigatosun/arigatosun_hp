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

/** コンセプトブロックのビジュアル（イラスト画像 or ピルリスト） */
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
    }
  | {
      kind: 'pills';
      rows: ServicePillRow[];
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
