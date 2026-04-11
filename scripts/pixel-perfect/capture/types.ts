/**
 * Capture Agent が出力する DOM スナップショットの型定義
 */

export type ElementSnapshot = {
  /** 一意なID（DOM順の連番） */
  id: number;
  /** タグ名（DIV, SECTION, H1 など） */
  tag: string;
  /** Next.js CSS Modules でハッシュ化されたクラス名一覧 */
  classNames: string[];
  /** 推定された元のSCSSファイルパス（例: page.module.scss） */
  cssModuleHints: string[];
  /** 推定された元のクラス名（例: heroLogo） */
  originalClassNames: string[];
  /** getBoundingClientRect の値 */
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** computed style の主要プロパティ */
  computed: {
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing: string;
    color: string;
    backgroundColor: string;
    marginTop: string;
    marginRight: string;
    marginBottom: string;
    marginLeft: string;
    paddingTop: string;
    paddingRight: string;
    paddingBottom: string;
    paddingLeft: string;
    width: string;
    height: string;
    display: string;
    position: string;
    transform: string;
    gap: string;
  };
  /** テキスト内容（先頭50文字） */
  textPreview?: string;
};

export type CaptureSnapshot = {
  /** キャプチャ対象のセクション名 */
  section: string;
  /** ビューポート幅 */
  viewportWidth: number;
  /** ビューポート高さ */
  viewportHeight: number;
  /** キャプチャ実行時刻 (ISO) */
  capturedAt: string;
  /** 対象URL */
  url: string;
  /** 対象セクションのセレクタ */
  sectionSelector: string;
  /** 全要素のスナップショット */
  elements: ElementSnapshot[];
};
