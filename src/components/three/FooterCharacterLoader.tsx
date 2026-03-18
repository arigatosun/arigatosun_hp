'use client';

import dynamic from 'next/dynamic';

const FooterCharacter = dynamic(() => import('./FooterCharacter'), { ssr: false });

export default function FooterCharacterLoader() {
  return <FooterCharacter />;
}
