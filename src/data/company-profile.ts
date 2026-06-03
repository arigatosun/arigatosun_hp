// 会社概要セクション（/about 末尾）で表示する情報
// Figma node 1578:65974 (PC) / 2914:40322 (SP) から起こした値

export type CompanyInfoCell = {
  label: string;
  /** 連結時の全文（valueSegments 未指定時はこれを表示） */
  value: string;
  /** 値の表示フォント — EN (Mozaic GEO) を使うセル用フラグ */
  valueFont?: 'en';
  /** 値を複数行に分割（指定時はセグメント単位で描画し、間に <br> を挿入） */
  valueSegments?: string[];
  /**
   * valueSegments の <br> をどのブレークポイントで表示するか。
   * 'pc' = PC のみ改行 / SP は連結、'sp' = SP のみ改行 / PC は連結。
   */
  breakOn?: 'pc' | 'sp';
};

export type CompanyInfoRow = {
  /** 1行内の各セル */
  cells: CompanyInfoCell[];
};

/** 会社情報テーブル — 3 行（会社名/所在地 → 設立/代表者/従業員数 → 事業内容） */
export const COMPANY_INFO_ROWS: CompanyInfoRow[] = [
  {
    cells: [
      { label: '会社名', value: '株式会社アリガトサン' },
      // 数字は半角（Figma 準拠）。SP は cellValue 幅で空白位置に自然改行され 2 行になる。
      { label: '所在地', value: '兵庫県尼崎市東難波町4丁目6−26 ZEROビル 802号' },
    ],
  },
  {
    cells: [
      { label: '設立', value: '2024/05', valueFont: 'en' },
      { label: '代表者', value: '吉川 遼／廣森 氷河／中村 修人' },
      // PC: 2 行「９名（正社員）」「＋外部パートナー」/ SP: 1 行で連結（空白なし）
      {
        label: '従業員数',
        value: '９名（正社員）＋外部パートナー',
        valueSegments: ['９名（正社員）', '＋外部パートナー'],
        breakOn: 'pc',
      },
    ],
  },
];

/**
 * 事業内容（行 3 — 別レイアウト）
 * 各項目は [1行目, 2行目] のセグメント。SP では Figma の改行位置で 2 行表示、
 * PC ではセグメントを連結して 1 行表示（折返しは自然改行）。
 */
export const COMPANY_SERVICE_ITEMS: string[][] = [
  ['AI（LLM）を活用したWeb／業務システムの', '企画・設計・開発'],
  ['PoC／プロトタイピング、要件整理・実装伴', '走、運用改善'],
  ['デザイン・ブランディング（UI/UX、Web、', 'グラフィック、ディレクション）'],
  ['ブランド設計（VI／ロゴ／ガイドライン設', '計〜運用支援）'],
  ['オリジナルIP「KUSOMEGANE」を含む、', 'コンテンツの企画・制作・運用'],
  ['IPを軸とした発信・コミュニケーション設計'],
];
