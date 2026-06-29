'use client';

import { usePathname } from 'next/navigation';
import { CHATBOT_MEMBER_PATH } from '@/data/members';

// アリガトくんチャットページ（赤背景・全画面）では共通フッターを表示しない。
// Footer はサーバーコンポーネントのため、children として受け取り表示を出し分ける。
export default function FooterGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname === CHATBOT_MEMBER_PATH) return null;
  return <>{children}</>;
}
