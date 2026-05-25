// 会社概要セクション（/about 末尾）で表示する情報
// Figma node 1578:65974 (Group 216) から起こした値

export type CompanyInfoRow = {
  /** 1行内の各セル */
  cells: {
    label: string;
    value: string;
    /** 値の表示フォント — EN (Mozaic GEO) を使うセル用フラグ */
    valueFont?: 'en';
  }[];
};

/** 会社情報テーブル — 3 行（会社名/所在地 → 設立/代表者/従業員数 → 事業内容） */
export const COMPANY_INFO_ROWS: CompanyInfoRow[] = [
  {
    cells: [
      { label: '会社名', value: '株式会社アリガトサン' },
      { label: '所在地', value: '兵庫県尼崎市東難波町４丁目６−２６ ZEROビル ８０２号' },
    ],
  },
  {
    cells: [
      { label: '設立', value: '2024/05', valueFont: 'en' },
      { label: '代表者', value: '吉川 遼' },
      { label: '従業員数', value: '９名（正社員）＋外部パートナー' },
    ],
  },
];

/** 事業内容（行 3 — 別レイアウト） */
export const COMPANY_SERVICE_ITEMS: string[] = [
  'AI（LLM）を活用したWeb／業務システムの企画・設計・開発',
  'PoC／プロトタイピング、要件整理・実装伴走、運用改善',
  'デザイン・ブランディング（UI/UX、Web、グラフィック、ディレクション）',
  'ブランド設計（VI／ロゴ／ガイドライン設計〜運用支援）',
  'オリジナルIP「KUSOMEGANE」を含む、コンテンツの企画・制作・運用',
  'IPを軸とした発信・コミュニケーション設計',
];
