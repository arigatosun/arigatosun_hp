// ServiceCard 系の型定義
// 複数コンポーネント（ServiceCard / ServiceSection / 将来の Service ページ）で共有

export type ServiceCardData = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  viewLabel: string;
  /** カード背景画像。未用意なら null（グレープレースホルダー表示） */
  bgImage: string | null;
  /** カード背景動画。指定があれば bgImage より優先（mp4 / webm のペアを想定） */
  bgVideo?: {
    /** WebM ソース (vp9) — 軽量・モダンブラウザ向け */
    webm: string;
    /** MP4 ソース (h264) — フォールバック */
    mp4: string;
    /** ローディング前 / 再生失敗時に表示する静止画 (必要なら) */
    poster?: string;
  };
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

/** 赤グローを形（雲・泡など）の内側だけにクリップするマスク */
export type ServiceConceptMask = {
  /** 形のシルエット画像（不透明部分にだけグローが出る） */
  src: string;
  /** mask-size（線画イラストとの寸法差を補正・例 '94% 88%'） */
  size: string;
  /** mask-position（例 '50% 50%'） */
  position: string;
};

/** 画像オーバーレイ（雲ダイアグラム上の標準コピー等） */
export type ServiceImageOverlay = {
  /** 表示テキスト */
  text: string;
  /** 画像枠基準の絶対配置 (%) */
  topPct: number;
  leftPct: number;
  /** テキスト幅（画像幅基準 %） */
  widthPct: number;
};

/** PROCESS（進め方）の 1 ステップ */
export type ServiceFlowStep = {
  /** STEP.1 等のステップ番号ラベル */
  step: string;
  /** ステップ見出し（例: 現状整理・課題把握） */
  title: string;
  /** ステップ説明文（1行） */
  description: string;
};

/** STANDARD の右側に並ぶ 3 つの判断軸カード（個性の純度 / 持続の設計 / 熱狂の深度 等） */
export type ServiceCalloutItem = {
  /** 短いラベル（例: 個性の純度） */
  label: string;
  /** 本文（例: 誰かに合わせない、固有の表現を尊ぶ。） */
  body: string;
};

/** ギルド型組織図のバブル（中央 / 内周 / 外周 のいずれか） */
export type ServiceOrgBubble = {
  /** 表示テキスト */
  text: string;
  /** 画像枠内の中心位置 (%) */
  topPct: number;
  leftPct: number;
  /** バブルのサイズ（フレーム短辺基準 %） */
  sizePct: number;
  /** ring: 'core'（中央）/ 'inner'（プロデュース・ディレクション）/ 'outer'（外周のスキル群） */
  ring: 'core' | 'inner' | 'outer';
};

/** コンセプトブロックのビジュアル（イラスト画像 / ピルリスト / フローステップ / 判断軸カード / 組織バブル） */
export type ServiceConceptVisual =
  | {
      kind: 'image';
      /** Figma 書き出し画像。未用意なら null（プレースホルダー表示） */
      src: string | null;
      alt: string;
      width: number;
      height: number;
      /** グローを形の内側にクリップするマスク。null ならクリップなし */
      mask: ServiceConceptMask | null;
      /** 画像の上に重ねるテキストオーバーレイ（AI/DEV アリガトサン・スタンダードの3標準等） */
      overlays?: ServiceImageOverlay[];
      /**
       * SP で図を全幅(+44px)に拡大せず、ネイティブ幅で頭打ち＋中央寄せにする。
       * 単体完結の図（CREATOR FIRST 等）を上の図とサイズ感を揃えたい時に true。
       */
      compactSp?: boolean;
    }
  | {
      kind: 'pills';
      rows: ServicePillRow[];
    }
  | {
      kind: 'steps';
      items: ServiceFlowStep[];
    }
  | {
      kind: 'phases';
      items: ServiceFlowStep[];
    }
  | {
      kind: 'callouts';
      items: ServiceCalloutItem[];
      /** 背景に敷くラインアート + 赤グロー（任意） */
      image?: {
        src: string;
        alt: string;
        /** Figma 実寸の線画サイズ */
        width: number;
        height: number;
        /** グローを形の内側にクリップするマスク */
        mask: ServiceConceptMask | null;
      };
    }
  | {
      kind: 'orgBubbles';
      bubbles: ServiceOrgBubble[];
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

/** 3カラム promise グリッドの 1 アイテム */
export type ServicePromiseItem = {
  /** 大見出し（キャッチコピー） */
  catchphrase: string;
  /** 本文（1段落） */
  body: string;
  /**
   * SP のみ本文 letter-spacing を上書きする (px)。
   * デフォルト (2.52) では Figma SP の wrap 位置に収まらない本文で指定する。
   */
  bodyTrackingSp?: number;
};

/** 3カラム promise セクション（私たちが実現すること 等） */
export type ServicePromiseSection = {
  id: string;
  title: string;
  subtitle: string;
  items: ServicePromiseItem[];
};

/** Hero 直後のクリエイター紹介（IP/CREATIVE 専用 / KUSOMEGANE 等の事例 IP） */
export type ServiceCreatorProfileData = {
  /** 左側の正方形アバター画像 (Figma 294x294)。null ならグレープレースホルダー */
  avatar: { src: string | null; alt: string };
  /** 大きな見出しテキスト（KUSOMEGANE© 等。後で SVG ロゴに差し替え可能） */
  title: string;
  /** 説明本文。Figma 改行ごとに分割（3 段落） */
  description: string[];
  /** SNS リンク（指定があるものだけアイコン表示） */
  snsLinks?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
};

/** Hero 下部のポラロイドモザイク 1 枚 */
export type ServiceHeroMosaicItem = {
  /** ポラロイドの画像 src。null ならグレープレースホルダー */
  src: string | null;
  alt: string;
  /** Figma 実測のフレーム内基準位置（左上原点 %, 親 1158x833） */
  topPct: number;
  leftPct: number;
  /** Figma 実測サイズ（親比 %） */
  widthPct: number;
  heightPct: number;
  /** Figma 配置の回転角（deg、左肩から時計回り） */
  rotateDeg: number;
  /** 重なり順（後勝ち） */
  zIndex: number;
};

/** SERVICE 詳細ページ1件分のデータ */
export type ServiceDetailData = {
  slug: string;
  titleEn: string;
  titleJa: string;
  /** Hero の太字キャッチ（28px / Noto Sans JP） */
  quote: string;
  /** Hero の小キャッチ（22px / Noto Sans JP）— 「個性の熱量」を真ん中に置き… 等 */
  subQuote?: string;
  description: string[];
  heroImage: string | null;
  /** Hero の右側に置く 5 枚ポラロイド（IP/CREATIVE のみ） */
  heroMosaic?: ServiceHeroMosaicItem[];
  /** Hero メイン画像をスライドショーにしたい場合の差分（IP/CREATIVE 等）。
   *  指定があれば heroImage は無視され、スライドショーが表示される。 */
  heroSlides?: { src: string; alt: string }[];
  /** Hero 右上のキャラ画像（Figma Group 867）。null なら非表示 */
  heroCharacter?: { src: string | null; alt: string } | null;
  /** Hero 直後のクリエイター事例紹介（IP/CREATIVE のみ）。null/undefined なら非表示 */
  creatorProfile?: ServiceCreatorProfileData;
  /** 「私たちが実現すること」「私たちが実現してきたこと」など Hero 直後の3カラムグリッド（複数可） */
  promises?: ServicePromiseSection[];
  concepts: ServiceConcept[];
  caseStudies: ServiceCaseStudy[];
};
