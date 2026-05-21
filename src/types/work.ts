// WorkItem 型定義
// WorksSection / 将来の Works 一覧・詳細ページで共有

export type WorkDetail = {
  label: string;
  value: string;
};

export type WorkItem = {
  id: string;
  client: string;
  title: string;
  details: WorkDetail[];
  term: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
};

// ── 詳細ページ（/works/[slug]）用 ──

/** ヒーロー写真コラージュの1枚。位置・サイズは 1920×760 ヒーロー基準の px（Figma実測値）。 */
export type WorkHeroPhoto = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/** 詳細ページヒーロー（写真コラージュ＋クライアントロゴ）。 */
export type WorkHero = {
  /** ヒーロー全体サイズ（Figma 基準）。省略時は 1920×760。 */
  width?: number;
  height?: number;
  /** 背景帯のスタイル。省略時は pink。 */
  band?: 'pink' | 'none';
  photos: WorkHeroPhoto[];
  /** クライアントロゴ（ワードマーク／マークの2 SVG）。任意。 */
  logo?: { wordmark: string; mark: string };
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
export type WorkContentBlock = { gap: number } & (
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
    }
  | {
      type: 'paragraph'; // 見出しなしの本文ブロック
      body: string[];
    }
  | {
      type: 'showcaseCard'; // 色付きカード＋中央グラフィック
      background: 'white' | 'pink';
      card: { w: number; h: number }; // カードの Figma 寸法（アスペクト比に使用）
      graphic: { src: string; w: number; h: number };
    }
  | {
      type: 'imageGrid'; // グレーカード＋画像グリッド＋キャプション
      cardHeight: number; // カードの Figma 高さ（min-height に使用）
      images: string[];
      imageRatio: { w: number; h: number };
      caption: string;
      /** true の時、各サムネにブラーを適用（機密の提案資料用）。省略時は no-blur */
      blur?: boolean;
    }
  | {
      type: 'mockupCard'; // Web デザインモックアップ画像カード
      src: string;
      w: number; // カードの Figma 寸法（アスペクト比に使用）
      h: number;
    }
  | {
      type: 'caption'; // 画像下の小さな注釈テキスト（＜資料名の説明＞ 等）
      text: string;
    }
  | {
      type: 'divider'; // セクション区切りの短い横線
    }
  | {
      type: 'creditList'; // CREDIT / SCOPE / TERM のラベル＋内容
      groups: { label: string; lines: string[] }[];
    }
  | {
      type: 'relatedWorks'; // 他実績へのリンクカード群
    }
);

/** アーカイブ型ページ（パターンB）の1エントリ（スライダー＋見出し＋本文＋CREDIT）。 */
export type WorkArchiveEntry = {
  heading: string;
  body: string[]; // 本文段落
  credit: string[]; // ＜CREDIT＞行
  images: string[]; // スライダー画像
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
