import type { Metadata } from 'next';

// about/page.tsx は 'use client' のため、メタデータはこの layout で付与する。
// 配下の about/member/[slug] は各ページの generateMetadata が上書きする。
const description =
  '株式会社アリガトサンについて。「感謝とともに昇る。」を理念に、AI(LLM)開発からデザイン・ブランディング、IPコンテンツ制作までを行うクリエイティブスタジオです。';

export const metadata: Metadata = {
  title: 'アバウト',
  description,
  openGraph: {
    title: 'アバウト | 株式会社アリガトサン',
    description,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
