import type { Metadata } from 'next';

// /admin 配下（login + (authenticated)）共通のメタデータ。
// title は子セグメントで明示的に上書きされ、`%s | 管理画面` で wrap される。
// noindex は admin 全ページに適用する。
export const metadata: Metadata = {
  title: {
    default: '管理画面',
    template: '%s | 管理画面',
  },
  robots: 'noindex, nofollow',
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
