'use client';

import dynamic from 'next/dynamic';
import type { FooterSitCharacterProps } from './FooterSitCharacter';

const FooterSitCharacter = dynamic(() => import('./FooterSitCharacter'), { ssr: false });

export default function FooterSitCharacterLoader(props: FooterSitCharacterProps = {}) {
  return <FooterSitCharacter {...props} />;
}
