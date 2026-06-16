import type { Metadata } from 'next';
import OptOutNotice from '@/components/analytics/OptOutNotice';

// 関係者専用の機能ページ。検索結果には出さない。
export const metadata: Metadata = {
  title: 'アクセス計測オプトアウト',
  robots: { index: false, follow: false },
};

export default function OptOutPage() {
  return <OptOutNotice mode="out" />;
}
