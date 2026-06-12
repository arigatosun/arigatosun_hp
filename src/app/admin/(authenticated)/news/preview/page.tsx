import type { Metadata } from 'next';
import LiveNewsPreview from './LiveNewsPreview';

export const metadata: Metadata = {
  title: 'ニュースプレビュー',
};

export default function NewsLivePreviewPage() {
  return <LiveNewsPreview />;
}
