import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

// 公開マーケサイト共通のレイアウト。Header / Footer はここで適用。
// /admin 配下はこのレイアウトを経由しない。
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
