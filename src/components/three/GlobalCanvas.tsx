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
        {/* Service: 奥→手前へサイズアップしながら歩いてくる depth-walk 演出。
            Phase 18 追補:
            - 正面向き（facingRotationY=0）
            - 横走行をやめて depth-walk モードへ（X 移動なし、scale を 0.25→0.85 に補間）
            - 5 秒かけて手前まで来る → waitMs(6 秒)後に奥へリセット
            - 仕上がり感を見て startScale/endScale/durationMs/startY/endY で微調整可
        */}
        {/* Service: 右→左に横歩行（ゆっくり目）。
            direction の既定どおり進行方向（カメラ-left）を向いて横向きに歩く。
            look-at は無効。クリックでジャンプのみのシンプルな反応。 */}
        <WalkingCharacter
          glbPath={GLB_PATH}
          direction="right-to-left"
          speed={1.0}
          sectionSelector='[data-section="service"]'
          triggerOnVisible
          // 画面下 700px 内に Service セクションが近づいた時点で歩行開始。
          // セクション到達時点ですでに数秒分歩いている状態にする。
          approachMarginPx={700}
          // Service セクション pin 中、キャラの足が viewport 下端付近に来るように上に上げる
          baseY={-2.0}
          scale={0.6}
          reactOnClick={{
            durationMs: 600,
            jumpHeight: 1.0,
            spins: 0,
            hitRadius: 180,
          }}
        />

        {/* LogoSlider: 左→右に逆方向で歩く 2 体目 */}
        <WalkingCharacter
          glbPath={GLB_PATH}
          direction="left-to-right"
          speed={1.0}
          sectionSelector='[data-section="logo-slider"]'
          triggerOnVisible
          approachMarginPx={700}
          baseY={-1.5}
          scale={0.6}
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
