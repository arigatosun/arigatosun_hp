'use client';

import dynamic from 'next/dynamic';

const FooterSitCharacter = dynamic(() => import('./FooterSitCharacter'), { ssr: false });

export default function FooterSitCharacterLoader() {
  return <FooterSitCharacter />;
}
