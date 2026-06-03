'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import type { FooterSitCharacterProps } from './FooterSitCharacter';

const FooterSitCharacter = dynamic(() => import('./FooterSitCharacter'), { ssr: false });

// ── SP のキャラサイズを viewport 幅でクランプ ──
// CSS で Canvas ごと transform:scale すると、サイズと位置が transform-origin で連動して
// 足元位置が破綻する。そのため設計が意図した「3D 側のサイズ・位置制御」(charScale/charPosition)で行う。
//
// サイズ: 390px で 0.6 → 1023px で 1.0 へ線形クランプ。1024px 以上(PC)は等倍 1.0。
//   → SP/PC 境界(1023↔1024)が both ≈1.0 で連続し、1012px 付近で急に小さくならない。
// 位置: どの scale でも足元(world Y -1.4 = canvas 336px)と水平中心(world X 0.81 = canvas 248px)を
//   保つよう charPosition を算出（CSS の Canvas 位置は不変）。3D 定数より:
//     - 足元 world Y = charPos.y + (足元 localY ≈ -0.3) × scale = -1.4  → charPos.y = -1.4 + 0.3 × scale
//     - 中心 world X = charPos.x + (mesh offset ≈ -0.79) × scale = 0.81 → charPos.x = 0.81 + 0.79 × scale
//   （scale=1 で [1.6,-1.1]=PC既定 / scale=0.6 で [1.284,-1.22] と一致）
const SP_MIN_VW = 390;
const SP_MAX_VW = 1023;
const MIN_SCALE = 0.6;

function computeScale(vw: number): number {
  if (vw >= 1024) return 1;
  const t = Math.min(1, Math.max(0, (vw - SP_MIN_VW) / (SP_MAX_VW - SP_MIN_VW)));
  const s = MIN_SCALE + (1 - MIN_SCALE) * t;
  // 0.05 刻みに量子化。scale 変化時に key で再マウントして IK の rest を取り直すため
  // （刻みは目視で分からないレベル。連続再マウントを抑える）。
  return Math.round(s * 20) / 20;
}

export default function FooterSitCharacterLoader(props: FooterSitCharacterProps = {}) {
  const [scale, setScale] = useState(() =>
    typeof window !== 'undefined' ? computeScale(window.innerWidth) : 1,
  );

  useEffect(() => {
    const update = () => setScale(computeScale(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const charPosition: [number, number, number] = [
    0.81 + 0.79 * scale,
    -1.4 + 0.3 * scale,
    0,
  ];

  // key=scale: サイズが変わったら再マウントして Sit ポーズの rest を取り直す（腕IKのズレ防止）。
  return (
    <FooterSitCharacter
      key={scale.toFixed(2)}
      {...props}
      charScale={scale}
      charPosition={charPosition}
    />
  );
}
