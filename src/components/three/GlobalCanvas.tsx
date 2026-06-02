'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import WalkingCharacter from './WalkingCharacter';
import { useGLTF } from '@react-three/drei';

// Phase 19: ニュース下のキャラを「クリック挙動」入りの新キャラに差し替え。
// 0-28F = 歩行, 29-56F = クリック反応, 57-118F = 残りの歩行（Walk クリップは 0-28F のみ使用）。
const GLB_PATH = '/models/arigatokunn_walk_click_meshopt.glb?v=opt1';

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
  // PC は上側2つの3D（Hero/WORKS）に合わせて縮小（0.6 → 0.45）。SP は 0.35 を維持。
  const walkScale = isSp ? 0.35 : 0.45;
  // SP は両キャラを 70px (camera zoom 150 → +0.467 world unit) 上にオフセット
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
      {/* 新キャラ（Clay rough 赤い粘土）は ambient 強すぎると赤が desaturate するため
          ambient は控えめ（1.0）。
          目のキャッチライトは「顔の向きと反対側・上方」の光が眼球で反射して生まれる。
          キャラは右向き(left-to-right)なので、元の構成を左右反転して光源を上左に移す:
            - key を [3,4,8]（上右）→ [-3,4,8]（上左）= 右向き時の目のキャッチライト + 主シェーディング
            - fill を [-4,2,5]（左）→ [4,2,5]（右）でフィル */}
      <ambientLight intensity={1.0} />
      {/* キー（上左前・主シェーディング + 右向き時の目のキャッチライト） */}
      <directionalLight position={[-3, 4, 8]} intensity={1.5} />
      {/* フィル（右・目の高さ） */}
      <directionalLight position={[4, 2, 5]} intensity={0.9} />

      <Suspense fallback={null}>
        {/* LogoSlider: 左→右に歩くキャラ。
            approachMarginPx を大きめにして、ロゴ帯が画面に入る前から歩き出させ、
            ロゴ表示時には既に画面内で歩いている状態にする（入りが遅い対策）。 */}
        <WalkingCharacter
          glbPath={GLB_PATH}
          direction="left-to-right"
          speed={1.0}
          sectionSelector='[data-section="logo-slider"]'
          triggerOnVisible
          approachMarginPx={2800}
          // 右に抜けてから再度左から入るまでの待ち時間（default 6000ms）。
          // 右に抜けたら待ちなしで即左から再登場させる。
          waitMs={0}
          baseY={logoBaseY}
          scale={walkScale}
          reactOnClick={{
            hitRadius: 180,
            // 新 glb (arigatokunn_walk_click.glb) は 2 NLA track 入り：
            //   WalkTrack = 歩行ループ (元アクション 0-25F + 68-93F 結合)
            //   ClickTrack = クリック反応 (元アクション 29-56F)
            // クリック時：移動停止 + Click 再生 → 完了で Walk 再開 + 移動再開。
            clipNames: { walk: 'WalkTrack', click: 'ClickTrack' },
            fadeMs: 150,
          }}
        />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(GLB_PATH, false, true); // walk_click は meshopt 圧縮版（MeshoptDecoder で復号）
