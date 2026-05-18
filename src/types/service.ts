// ServiceCard 系の型定義
// 複数コンポーネント（ServiceCard / ServiceSection / 将来の Service ページ）で共有

export type ServiceCardData = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  viewLabel: string;
  bgImage: string;
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

/** コンセプトブロックのビジュアル（イラスト画像 or ピルリスト） */
export type ServiceConceptVisual =
  | {
      kind: 'image';
      /** Figma 書き出し画像。未用意なら null（プレースホルダー表示） */
      src: string | null;
      alt: string;
      width: number;
      height: number;
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

/** SERVICE 詳細ページ1件分のデータ */
export type ServiceDetailData = {
  slug: string;
  titleEn: string;
  titleJa: string;
  quote: string;
  description: string[];
  heroImage: string | null;
  concepts: ServiceConcept[];
  caseStudies: ServiceCaseStudy[];
};
