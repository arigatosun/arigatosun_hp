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
export type WorkContentBlock =
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
      images: string[];
      imageRatio: { w: number; h: number };
      caption: string;
    };

/** 1作品の詳細ページ全体のデータ。 */
export type WorkDetailContent = {
  slug: string;
  hero: WorkHero;
  blocks: WorkContentBlock[];
};
