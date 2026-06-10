'use client';

import dynamic from 'next/dynamic';
import DeferMount from '@/components/ui/DeferMount';

const ParallaxMotifs = dynamic(() => import('./ParallaxMotifs'), {
  ssr: false,
});

export default function ParallaxMotifsLoader() {
  // ABOUT 手前で読み込みを始め、見える時には従来どおり表示できるようにする。
  return (
    <DeferMount targetSelector='[data-motifs-trigger]' rootMargin="1200px">
      <ParallaxMotifs />
    </DeferMount>
  );
}
