'use client';

import dynamic from 'next/dynamic';
import DeferMount from '@/components/ui/DeferMount';

const GlobalCanvas = dynamic(() => import('./GlobalCanvas'), {
  ssr: false,
});

export default function GlobalCanvasLoader() {
  // 歩行キャラ(walk_click)はロゴスライダーで登場する FV 外要素。
  // 当該セクションが 1500px 手前に近づくまで Canvas/モデルのロードを遅延する
  // （WalkingCharacter の approachMarginPx=1500 と揃え、歩き始めに間に合わせる）。
  return (
    <DeferMount targetSelector='[data-section="logo-slider"]' rootMargin="1500px">
      <GlobalCanvas />
    </DeferMount>
  );
}
