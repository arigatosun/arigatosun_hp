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
