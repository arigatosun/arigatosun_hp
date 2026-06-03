'use client';

import { useEffect, useState } from 'react';
import FooterCharacterLoader from './FooterCharacterLoader';
import type { FooterCharacterProps } from './FooterCharacter';

// ── Hero の 3D キャラを viewport 幅で可変サイズに ──
// CSS で Canvas ごと縮小すると、見た目位置(3D投影で決まる)が transform-origin で連動して破綻する。
// そのため設計が意図した 3D 側の charScale で縮小し、charPosition をカメラ中心基準で
// 再計算して「見た目位置（カメラ中心＝Canvas中心）」を保つ。
//
// サイズ: 390px で 70% → 1023px で 100% へ線形クランプ。1024px 以上(PC)は等倍(=props のまま)。
// 位置: char_visual = charPos + meshOffset×scale。Canvas 中心(=カメラ中心 cam.x/cam.y)に
//   固定したいので charPos(r) = (1-r)·cam + r·basePos（r=1 で basePos＝現状、r<1 で中心へ縮む）。
const SP_MIN_VW = 390;
const SP_MAX_VW = 1023;
const MIN_RATIO = 0.7;
// FooterCharacter の DEFAULT_CHAR_SCALE（Hero は charScale 未指定でこの値を使用）。
const FALLBACK_BASE_SCALE = 4.73;

function computeRatio(vw: number): number {
  if (vw >= 1024) return 1;
  const t = Math.min(1, Math.max(0, (vw - SP_MIN_VW) / (SP_MAX_VW - SP_MIN_VW)));
  return MIN_RATIO + (1 - MIN_RATIO) * t; // 0.7 → 1.0
}

export default function HeroResponsiveCharacter(props: FooterCharacterProps) {
  const baseScale = props.charScale ?? FALLBACK_BASE_SCALE;
  const basePos = props.charPosition ?? [-19.37, -0.75, 0];
  const cam = props.cameraPosition ?? [2, 0, 14];

  const [ratio, setRatio] = useState(() =>
    typeof window !== 'undefined' ? computeRatio(window.innerWidth) : 1,
  );

  useEffect(() => {
    const update = () => setRatio(computeRatio(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const charScale = baseScale * ratio;
  const charPosition: [number, number, number] = [
    (1 - ratio) * cam[0] + ratio * basePos[0],
    (1 - ratio) * cam[1] + ratio * basePos[1],
    basePos[2],
  ];

  return (
    <FooterCharacterLoader {...props} charScale={charScale} charPosition={charPosition} />
  );
}
