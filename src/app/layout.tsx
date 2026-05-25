import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import '@/styles/fonts.css';
import '@/styles/globals.scss';

export const metadata: Metadata = {
  title: {
    default: '株式会社アリガトサン | ARIGATOSUN',
    template: '%s | 株式会社アリガトサン',
  },
  description:
    'AI(LLM)システムの開発からデザイン・ブランディング、IPコンテンツ制作を行うクリエイティブスタジオです。',
  keywords: ['アリガトサン', 'AI開発', 'LLM', 'デザイン', 'ブランディング', 'IPコンテンツ'],
  openGraph: {
    title: '株式会社アリガトサン | ARIGATOSUN',
    description:
      'AI(LLM)システムの開発からデザイン・ブランディング、IPコンテンツ制作を行うクリエイティブスタジオです。',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
