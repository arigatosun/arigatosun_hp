'use client';

import dynamic from 'next/dynamic';

const GlobalCanvas = dynamic(() => import('./GlobalCanvas'), {
  ssr: false,
});

export default function GlobalCanvasLoader() {
  return <GlobalCanvas />;
}
