import type { Metadata } from 'next';

// contact/page.tsx は 'use client'（フォーム）のため、メタデータはこの layout で付与する。
// 配下の contact/thanks は自身の metadata（noindex）で上書きする。
const description =
  '株式会社アリガトサンへのお問い合わせ。AI開発・デザイン・ブランディング・IPコンテンツ制作のご相談を承ります。構想段階のご相談からお気軽にどうぞ。';

export const metadata: Metadata = {
  title: 'Contact',
  description,
  openGraph: {
    title: 'Contact | 株式会社アリガトサン',
    description,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
