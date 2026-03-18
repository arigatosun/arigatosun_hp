'use client';

import dynamic from 'next/dynamic';

// GSAPはSSR不可のためdynamic import
const HeroAnimation = dynamic(() => import('./HeroAnimation'), {
  ssr: false,
});

export default function HeroAnimationLoader() {
  return <HeroAnimation />;
}
