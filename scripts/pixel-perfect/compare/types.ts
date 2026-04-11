/**
 * Comparator が扱う Figma 正解値の型定義
 *
 * 比較対象は要素の「key（識別子）」で紐付ける。
 * keyは元のSCSSクラス名（例: "heroLogo"）またはユーザーが指定する一意識別子。
 *
 * Phase 1 では Figma 正解値は手動でフィクスチャ JSON として用意する。
 * Phase 2 で Figma Dev Mode MCP から自動取得する。
 */

export type FigmaElementSpec = {
  /** 要素の識別キー（元クラス名と一致させる） */
  key: string;
  /** ヒューマンリーダブルな説明 */
  description?: string;
  /** Figmaが期待する数値プロパティ */
  expected: {
    width?: number;
    height?: number;
    fontSize?: number;
    lineHeight?: number;
    letterSpacing?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
  };
};

export type FigmaSpec = {
  section: string;
  viewportWidth: number;
  source: 'manual' | 'figma-mcp';
  elements: FigmaElementSpec[];
};

/** 差分の単位 */
export type DiffEntry = {
  key: string;
  cssModuleHints: string[];
  property: string;
  expected: number;
  actual: number;
  delta: number;
  unit: 'px';
};
