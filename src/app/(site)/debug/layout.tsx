import '@/styles/fonts.css';
import '@/styles/globals.scss';

// デバッグページ専用レイアウト（Header/Footer なし）
export default function DebugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
