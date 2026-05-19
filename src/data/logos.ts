// このファイルは将来 CMS / API から取得するデータの一時的な静的ソース

export type Logo = {
  id: string;
  /** ベース表示（線画版） */
  src: string;
  /** カーソルリベール用のカラー（塗り）版 */
  colorSrc: string;
  alt: string;
};

// 仮データ（後日クライアントロゴに差し替え）
export const LOGOS: readonly Logo[] = Array.from({ length: 8 }, (_, i) => ({
  id: `logo-${i}`,
  src: '/images/partners/corporate-logo.png',
  colorSrc: '/images/partners/corporate-logo-color.png',
  alt: 'ARIGATOSUN',
})) as readonly Logo[];
