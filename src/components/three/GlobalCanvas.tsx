'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import WalkingCharacter from './WalkingCharacter';
import { useGLTF } from '@react-three/drei';

const GLB_PATH = '/models/walk.v3.glb';

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
      <ambientLight intensity={1.2} />
      <directionalLight position={[0, 0, 10]} intensity={0.8} />

      <Suspense fallback={null}>
        {/* Hero: 左→右に歩行 */}
        <WalkingCharacter
          glbPath={GLB_PATH}
          direction="left-to-right"
          speed={1.8}
          sectionSelector='[data-section="hero"]'
          baseY={-0.8}
          scale={0.6}
        />
        {/* Service: 右→左に歩行（セクション表示時にトリガー） */}
        <WalkingCharacter
          glbPath={GLB_PATH}
          direction="right-to-left"
          speed={1.8}
          sectionSelector='[data-section="service"]'
          triggerOnVisible
          baseY={-2.5}
          scale={0.6}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(GLB_PATH);
