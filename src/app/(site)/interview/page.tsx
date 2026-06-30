import type { Metadata } from 'next';
import InterviewList from './InterviewList';

export const metadata: Metadata = {
  title: 'Interview',
  description:
    '株式会社アリガトサンのクライアントインタビュー一覧。AI開発・デザイン・ブランディングをともに進めたクライアントの声をご紹介します。',
};

export default function InterviewPage() {
  return <InterviewList />;
}
