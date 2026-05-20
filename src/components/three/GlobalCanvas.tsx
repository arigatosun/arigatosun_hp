'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import WalkingCharacter from './WalkingCharacter';
import { useGLTF } from '@react-three/drei';

// Phase 18: 粘土風シェーディング + リグ刷新（root.00 廃止）の Web 用最適化版に差し替え。
// 旧 walk.v3.glb（23MB）は履歴/万一のロールバック用に残置。
const GLB_PATH = '/models/arigatokunn_web.glb';

// ページ全体で1つだけのグローバルCanvas
// OrthographicCameraで描画（遠近法による見かけの回転を防止）
export default function GlobalCanvas() {
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
        {/* Service: 右→左に歩行（セクション表示時にトリガー） */}
        <WalkingCharacter
          glbPath={GLB_PATH}
          direction="right-to-left"
          speed={1.8}
          sectionSelector='[data-section="service"]'
          triggerOnVisible
          baseY={-2.8}
          scale={0.6}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(GLB_PATH);
