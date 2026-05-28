'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import WalkingCharacter from './WalkingCharacter';
import { useGLTF } from '@react-three/drei';

// Phase 18: 粘土風シェーディング + リグ刷新（root.00 廃止）の Web 用最適化版に差し替え。
// 旧 walk.v3.glb（23MB）は履歴/万一のロールバック用に残置。
const GLB_PATH = '/models/arigatokunn_web.glb';

// ページ全体で1つだけのグローバルCanvas
// OrthographicCameraで描画（遠近法による見かけの回転を防止）
export default function GlobalCanvas() {
  // SP (≤1023px) では歩く 3D キャラを小さく描画する
  const [isSp, setIsSp] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px)');
    const update = () => setIsSp(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  // PC 0.6 → SP 0.35（約 58% に縮小）
  const walkScale = isSp ? 0.35 : 0.6;
  // SP は LogoSlider キャラを 70px (camera zoom 150 → +0.467 world unit) 上にオフセット
  const SP_OFFSET_Y = 0.467;
  const logoBaseY = isSp ? -1.5 + SP_OFFSET_Y : -1.5;

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 8], zoom: 150, near: 0.1, far: 1000 }}
      gl={{ antialias: true, alpha: true }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 50,
        background: 'transparent',
      }}
    >
      {/* Phase 18: 新キャラ（Procedural Clay：Metallic=0 / Roughness 高め）が
          沈んで見えないよう強度を上げ、斜め前方からの fill light も追加。
          旧設定: ambient 1.2 / dir(0,0,10) 0.8 */}
      <ambientLight intensity={1.8} />
      <directionalLight position={[3, 4, 8]} intensity={1.4} />
      <directionalLight position={[-4, 2, 5]} intensity={0.6} />

      <Suspense fallback={null}>
        {/* LogoSlider: 左→右に逆方向で歩く 2 体目。
            approachMarginPx を 1500 にしてロゴ表示時には既に画面内に入っている状態に。 */}
        <WalkingCharacter
          glbPath={GLB_PATH}
          direction="left-to-right"
          speed={1.0}
          sectionSelector='[data-section="logo-slider"]'
          triggerOnVisible
          approachMarginPx={1500}
          baseY={logoBaseY}
          scale={walkScale}
          reactOnClick={{
            durationMs: 600,
            jumpHeight: 1.0,
            spins: 0,
            hitRadius: 180,
          }}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(GLB_PATH);
