import type { Metadata } from 'next';
import OptOutNotice from '@/components/analytics/OptOutNotice';

// 関係者専用の機能ページ。検索結果には出さない。
export const metadata: Metadata = {
  title: 'アクセス計測オプトイン',
  robots: { index: false, follow: false },
};

export default function OptInPage() {
  return <OptOutNotice mode="in" />;
}
