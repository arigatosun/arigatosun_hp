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

export type Member = {
  slug: string;
  name: string;
  role: string;
  photo?: string;
  catchphrase: string;
  description: string;
  career: string;
  social?: MemberSocial;
  projects?: MemberProject[];
};
