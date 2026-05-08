// ServiceCard 系の型定義
// 複数コンポーネント（ServiceCard / ServiceSection / 将来の Service ページ）で共有

export type ServiceCardData = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  description: string;
  viewLabel: string;
  bgImage: string;
};

export type ServiceMenuItem = string;
