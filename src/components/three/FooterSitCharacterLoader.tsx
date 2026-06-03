'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { FooterSitCharacterProps } from './FooterSitCharacter';

const FooterSitCharacter = dynamic(() => import('./FooterSitCharacter'), { ssr: false });

// SP(≤1023px) ではキャラを 60% に縮小する。
// CSS で Canvas ごと transform:scale すると、サイズと位置が transform-origin で連動し
// 足元の位置が破綻する（Canvas 内のキャラ足元ピクセルを正確に origin にできない）。
// そのため設計が意図した「3D 側のサイズ・位置制御」に従い、charScale / charPosition を差し替える。
//
// 算出（3D 定数より）:
//   - PC: charScale 1.0 / charPosition [1.6, -1.1, 0]
//   - 足元 world Y = charPos.y + (足元 localY ≈ -0.3) × scale。PC は -1.1 + (-0.3) = -1.4（アーチ頂点）。
//   - SP: scale 0.6。足元を world Y -1.4 に保つには charPos.y = -1.4 - (-0.3 × 0.6) = -1.22。
//   - 水平中心 world X 0.81（canvas 248px ＝ 画面中央）を保つには charPos.x = 0.81 - (-0.79 × 0.6) = 1.284。
const SP_CHAR_SCALE = 0.6;
const SP_CHAR_POSITION: [number, number, number] = [1.284, -1.22, 0];

export default function FooterSitCharacterLoader(props: FooterSitCharacterProps = {}) {
  const [isSp, setIsSp] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsSp(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const spProps = isSp
    ? { charScale: SP_CHAR_SCALE, charPosition: SP_CHAR_POSITION }
    : {};

  return <FooterSitCharacter {...props} {...spProps} />;
}
