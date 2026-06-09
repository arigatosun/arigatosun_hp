// WorkItem 型定義
// WorksSection / 将来の Works 一覧・詳細ページで共有

export type WorkDetail = {
  label: string;
  value: string;
};

/**
 * /works ページ左サイドバーの絞り込みカテゴリ。
 * 'ALL'（全件表示の擬似カテゴリ）は含めない。作品が実際に属するカテゴリのみ。
 */
export type WorksCategory =
  | 'AI / DEVELOPMENT'
  | 'DESIGN / BRANDING'
  | 'IP / CREATIVE'
  | 'CREATIVE PROJECT';

export type WorkItem = {
  id: string;
  client: string;
  title: string;
  details: WorkDetail[];
  /**
   * この作品が属するカテゴリ（複数可）。/works の左サイドバー絞り込みに使用。
   * details のラベル（D / B：→ DESIGN / BRANDING、AI / D：→ AI / DEVELOPMENT 等）に対応。
   */
  categories: WorksCategory[];
  term: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  /**
   * SP (<=1023px) で title 内の "|" を改行に置き換えるか。
   * true: Figma SP の 2 段落表示 (pipe 非表示) / false (既定): pipe を " | " として可視表示。
   */
  spBreakAtPipe?: boolean;
  /**
   * PC で title の "|" 直後を「>=1920px のときだけ」強制改行するか。
   * true: 1920px で Figma 厳密一致（"|" が行末）／1920px 未満は自然折り返し（幅で変動）。
   * 既定 (false): 全幅で自然折り返し。WorksSection 側でレスポンシブ <br> として描画。
   */
  breakAfterPipeAtMax?: boolean;
  /**
   * カード画像の object-position（cover 時のトリミング基準）。
   * 横長画像を流用するカードで 'left' 等を指定。既定は中央。
   */
  imagePosition?: string;
};

// ── 詳細ページ（/works/[slug]）用 ──

/**
 * ヒーロー写真コラージュの 1 枚。
 * - x/y/width/height は PC ヒーロー基準（既定 1920×760）の Figma 実測 px
 * - sp が指定された場合は SP ヒーロー基準（既定 390×540）で別配置
 * - src 未指定時はプレースホルダー（グレー枠）でレンダリング
 */
export type WorkHeroPhoto = {
  src?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  sp?: { x: number; y: number; width: number; height: number };
};

/** 詳細ページヒーロー（写真コラージュ＋クライアントロゴ）。 */
export type WorkHero = {
  /** PC ヒーロー全体サイズ（Figma 基準）。省略時は 1920×760。 */
  width?: number;
  height?: number;
  /** SP ヒーロー全体サイズ（Figma 基準）。省略時は 390×540。 */
  spWidth?: number;
  spHeight?: number;
  /** 背景帯のスタイル。省略時は pink。 */
  band?: 'pink' | 'none';
  photos: WorkHeroPhoto[];
  /**
   * SP 専用フォトコラージュ。指定時は SP がこちらを描画（photos.sp は無視）。
   * PC と SP で枚数や構成が大きく異なるケース用（例: NEST）。
   */
  spPhotos?: WorkHeroPhoto[];
  /** クライアントロゴ（ワードマーク／マークの2 SVG）。任意。 */
  logo?: { wordmark: string; mark: string };
  /**
   * SP のクライアントロゴ表示制御。
   * 既定は true (logo が設定されていれば SP でも表示)。
   * false にすると SP でロゴを描画しない（例: SP 画像にロゴが焼き込まれている時）。
   */
  spLogo?: boolean;
  /**
   * SP のフォトコーナー border-radius を無効化する。
   * full-bleed の 1 枚画像 (例: CHORITZ SP コラージュ) で角丸を出したくない時に true。
   */
  spFlatPhoto?: boolean;
  /**
   * PC / SP 両方のフォトコーナー border-radius を無効化する（角丸なし）。
   * 端まで角丸なしで見せたいヒーロー (例: Men’te) で true。
   */
  flatPhoto?: boolean;
  /**
   * SP ヒーロー画像の object-position（cover トリミング基準）。
   * 横長の PC 画像を SP 縦枠に流用する時、ロゴ等が中央に来るよう調整する（例: '12% center'）。
   */
  spPhotoPosition?: string;
  /**
   * SP のヘッダーとヒーロー上端の追加ギャップ (px)。
   * Figma SP の白余白に合わせて調整。既定 0。
   */
  spOffsetTop?: number;
};

/** 表示名カードの1行（ラベル＋注記＋右側ロゴ画像）。 */
export type WorkNamingRow = {
  label: string;
  note: string;
  /** 右側ロゴ画像。w / h は SVG viewBox 寸法（アスペクト比に使用）。 */
  visual: { src: string; w: number; h: number };
};

/**
 * 詳細ページの本文ブロック。順序入替可能な配列で持つ（block ベース構成）。
 * 今後 process / credit 等のブロック型を追加してユニオンを拡張する。
 */
// gap = 直前の要素からの上余白（Figma 実測 px・1920 基準）。ページ側で margin-top に適用。
// spGap が指定されると SP 時の最小値 (clamp の min) として使われる。
// 既定は gap * 0.42（PC 値の 42%）。Figma SP で別値を実測したブロックで上書きする。
export type WorkContentBlock = { gap: number; spGap?: number } & (
  | {
      type: 'lead';
      heading: string;
      subheading: string;
      body: string[]; // 明示改行を保持
    }
  | {
      type: 'textSection';
      level: 'main' | 'sub'; // main=■見出し(24px) / sub=＜＞見出し(20px)
      heading: string;
      body?: string[]; // 任意（見出しのみブロックを許可）
    }
  | {
      type: 'namingCard';
      rows: WorkNamingRow[];
      /** SP 用 1 枚画像（指定時 SP では rows ではなくこの画像を full-bleed 表示） */
      spImage?: { src: string; w: number; h: number };
    }
  | {
      type: 'paragraph'; // 見出しなしの本文ブロック
      body: string[];
    }
  | {
      type: 'showcaseCard'; // 色付きカード＋中央グラフィック
      background: 'white' | 'pink';
      card: { w: number; h: number }; // カードの Figma 寸法（アスペクト比に使用）
      /** SP 専用のカード寸法（Figma SP 実測）。指定時は SP のみ aspect-ratio を上書き */
      spCard?: { w: number; h: number };
      graphic: { src: string; w: number; h: number };
    }
  | {
      type: 'imageGrid'; // グレーカード＋画像グリッド＋キャプション
      cardHeight: number; // カードの Figma 高さ（min-height に使用）
      images: string[];
      imageRatio: { w: number; h: number };
      caption: string;
      /**
       * true の時、グレーカード装飾（背景・内側余白・min-height）を外し、
       * 画像を全幅でそのまま表示する。背景や余白を内包した「自己完結型の合成画像」用。
       */
      bare?: boolean;
      /** true の時、各サムネにブラーを適用（機密の提案資料用）。省略時は no-blur */
      blur?: boolean;
      /** SP 専用の画像差し替え（Figma SP が PC と別構成のケース用）。指定時 SP のみ描画される */
      spImages?: string[];
      /** SP 専用の aspect-ratio。省略時は imageRatio を流用 */
      spImageRatio?: { w: number; h: number };
      /** SP 専用のカード高さ (Figma SP 実測 px)。指定時 SP のみ min-height を上書き */
      spCardHeight?: number;
      /** SP 専用のグリッド列数。省略時は 2 */
      spGridCols?: number;
      /** SP のみブラーを適用する（spImages 側のみ）。PC は blur プロパティで制御 */
      spBlur?: boolean;
    }
  | {
      type: 'mockupCard'; // Web デザインモックアップ画像カード
      src: string;
      w: number; // カードの Figma 寸法（アスペクト比に使用）
      h: number;
      /**
       * SP 専用のレイアウト切替。指定時、SP のみ src を使わずプレースホルダー描画。
       * - pairStacked:  上下 2 段 (白カード / 黒カード) のプレースホルダー。NEST メインロゴ用
       * - pairSplit2:   左右 2 列 (白カード / 黒カード) のプレースホルダー。NEST 施設用
       * - variations11: 3 列 + 4 列 + 4 列 の 11 タイルプレースホルダー。VI 展開用
       * - placeholder:  カード形のプレースホルダー 1 枚
       *
       * spAspectRatio は SP のカード全体アスペクト比（例: '390 / 400'）。省略時は w/h を流用。
       */
      sp?: {
        variant: 'pairStacked' | 'pairSplit2' | 'variations11' | 'placeholder';
        spAspectRatio?: string;
      };
      /** SP 専用の画像差し替え（PC とは別の SP 用モックアップ画像を出すケース用） */
      spSrc?: string;
      /** SP 専用 w / h (aspect-ratio に使用)。省略時は w / h を流用 */
      spW?: number;
      spH?: number;
      /**
       * SP 専用の画像スライダー。指定時、SP は単一画像ではなく ‹ › で切り替わるスライダーを表示する。
       * spSliderAspect はスライダー枠のアスペクト比（例: '620 / 1140'）。
       */
      spSlider?: string[];
      spSliderAspect?: string;
      /** SP で 28px の左右 padding を解除して画面端まで広げる (pair プレースホルダーと同じ full-bleed 挙動) */
      spFullBleed?: boolean;
      /** SP のみ画像内右下にオーバーレイ表示するキャプション (PC では別途 caption ブロックを使う想定) */
      spCaption?: string;
    }
  | {
      type: 'caption'; // 画像下の小さな注釈テキスト（＜資料名の説明＞ 等）
      text: string;
      /** SP では非表示にする（直前の mockupCard が spCaption で内側にオーバーレイ表示する場合用） */
      spHidden?: boolean;
    }
  | {
      type: 'divider'; // セクション区切りの短い横線
    }
  | {
      type: 'creditList'; // CREDIT / SCOPE / TERM のラベル＋内容
      groups: { label: string; lines: string[] }[];
    }
  | {
      type: 'interview'; // クライアントの声: 左に「見出し + 写真」(sticky) / 右に見出し + Q&A
      /** セクション見出し（■クライアントの声）。写真とまとめて左カラムで固定する。 */
      title: string;
      /** 左カラムの写真。src 未指定時はサイズ確保のプレースホルダー（グレー枠）。 */
      photo: { w: number; h: number; src?: string };
      /** 右カラム見出し。配列 = 明示改行（要素間に <br>）。 */
      heading: string[];
      /** Q&A の繰り返し。q = 質問（18px）/ a = 回答（16px）。a は Figma の明示改行ごとのセグメント配列。 */
      qa: { q: string; a: string[] }[];
    }
  | {
      type: 'relatedWorks'; // 他実績へのリンクカード群
    }
);

/** アーカイブ型ページ（パターンB）の1エントリ（カード＋見出し＋本文＋CREDIT）。 */
export type WorkArchiveEntry = {
  heading: string;
  body: string[]; // 本文段落
  /**
   * &lt;CREDIT&gt; / CLIENT 行 / &lt;SCOPE&gt; / &lt;TERM&gt; の 4 行構成（SP Figma 準拠）。
   * 1 要素 = 1 行として &lt;br&gt; で連結表示。
   */
  credit: string[];
  /** PC スライダー画像 / SP は先頭 1 枚のみカードに使用 */
  images: string[];
  /** SP で 720 幅の full-bleed カードにする（既定 false = 390 幅 viewport 内） */
  extended?: boolean;
  /**
   * SP の inner card のアスペクト比を上書きする。
   * 既定: 非 extended = '390 / 226', extended = '720 / 227'。
   * IGC のみ Figma 実測で 390 / 242 のため指定。
   */
  cardAspect?: string;
};

/** 1作品の詳細ページ全体のデータ。pattern で2種のレイアウトを判別。 */
export type WorkDetailContent =
  | {
      slug: string;
      pattern: 'detail'; // パターンA: ブロック積み上げ式の詳細ページ
      hero: WorkHero;
      blocks: WorkContentBlock[];
    }
  | {
      slug: string;
      pattern: 'archive'; // パターンB: スライダーカードのアーカイブページ
      lead: { heading: string; body: string[] };
      entries: WorkArchiveEntry[];
    };
