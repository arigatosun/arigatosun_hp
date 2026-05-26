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
// 株式会社化に伴い corporate-logo を SVG 版に更新:
//   - src      : Group 1039 (1920×150 アウトライン / マーキー用ストリップ)
//   - colorSrc : Group 1103 (572×132 ベタ塗り / カーソル追従カラーリビール用)
export const LOGOS: readonly Logo[] = Array.from({ length: 8 }, (_, i) => ({
  id: `logo-${i}`,
  src: '/images/partners/corporate-logo.svg',
  colorSrc: '/images/partners/corporate-logo-color.svg',
  alt: 'ARIGATOSUN',
})) as readonly Logo[];
