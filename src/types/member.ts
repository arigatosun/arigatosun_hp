// Member 系の型定義
// MemberSection / member 詳細ページ / 将来の API 連携で共有

export type MemberSocial = {
  instagram?: string;
  x?: string;
};

export type MemberProject = {
  title: string;
  slug: string;
  thumbnail?: string;
};

// 本文の段落配列。PC と SP で改行（段落区切り）が異なる場合は
// { pc, sp } 形式で渡すと、ビューポートごとに別の段落構成で出し分ける。
export type MemberIntro = string[] | { pc: string[]; sp: string[] };

export type Member = {
  slug: string;
  name: string;
  role: string;
  photo?: string;
  // MemberSection 一覧の hover でカラーフェード切替に使う（ABOUT カラー版）
  photoColor?: string;
  // true にするとサイト全体（一覧 / スライダー / 詳細URL）から非表示。
  // 再表示は false に戻すかこの行を削除するだけ。
  hidden?: boolean;
  catchphrase: string;
  description: string;
  career: string;
  social?: MemberSocial;
  projects?: MemberProject[];
  // Phase 5: ABOUT/MEMBER 詳細ページ Figma 準拠 拡張フィールド
  roleJp?: string;
  // string[] を渡すとセグメント間に「SPのみ改行」を入れる（PC は 1 行表示）
  quote?: string | string[];
  // string[]（PC/SP 共通）または { pc, sp }（ビューポート別の改行）
  introParagraphs?: MemberIntro;
};
