'use client';

import dynamic from 'next/dynamic';
import type { FooterCharacterProps } from './FooterCharacter';

const FooterCharacter = dynamic(() => import('./FooterCharacter'), { ssr: false });

export default function FooterCharacterLoader(props: FooterCharacterProps = {}) {
  return <FooterCharacter {...props} />;
}
