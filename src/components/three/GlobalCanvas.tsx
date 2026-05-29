'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import WalkingCharacter from './WalkingCharacter';
import ScrollWalkCharacter from './ScrollWalkCharacter';
import { useGLTF } from '@react-three/drei';

// Phase 19: ニュース下のキャラを「クリック挙動」入りの新キャラに差し替え。
// 0-28F = 歩行, 29-56F = クリック反応, 57-118F = 残りの歩行（Walk クリップは 0-28F のみ使用）。
const GLB_PATH = '/models/arigatokunn_walk_click.glb?v=3';
// Phase 18 追補: スクロール連動用 unified glb（Idle / TurnToSide / Walk / StopWalk /
// WaitingPose / ResumeWalk の 6 クリップ内包）。Service セクションで使用。
const UNIFIED_GLB_PATH = '/models/arigatokunn_unified.glb';

// Service セクションの歩行キャラ表示フラグ。false で非表示。
// Phase 36 では Service の横スクロール演出（pin + 待機区間）を優先したいので OFF。
// 将来的に「歩行キャラと共存」させたくなったら true に戻す。
const SHOW_SERVICE_WALKER = false;

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
  // SP は両キャラを 70px (camera zoom 150 → +0.467 world unit) 上にオフセット
  const SP_OFFSET_Y = 0.467;
  const serviceBaseY = isSp ? -2.0 + SP_OFFSET_Y : -2.0;
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
      {/* Phase 19: 新キャラ（Clay rough 赤い粘土）は ambient 強すぎると
          赤が desaturate してベージュに見えるので 1.8 → 0.9 に抑え、
          directional 側で陰影を出して立体感を確保。 */}
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 8]} intensity={1.4} />
      <directionalLight position={[-4, 2, 5]} intensity={0.6} />

      <Suspense fallback={null}>
        {/* Service: スクロール連動の双方向横歩き。
            タイミング: --service-progress の変化（pin 中のみ）で歩き始め/止まる
            動き方: window scroll delta ベース（自由な進行・画面外にも抜ける）
            初期位置: 中央より -2 left（AI/DEVELOPMENT カードの隣あたり） */}
        {SHOW_SERVICE_WALKER && (
          <ScrollWalkCharacter
            glbPath={UNIFIED_GLB_PATH}
            sectionSelector='[data-section="service"]'
            approachMarginPx={700}
            baseY={serviceBaseY}
            scale={walkScale}
            progressVar="--service-progress"
            initialX={-2}
          />
        )}

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

useGLTF.preload(GLB_PATH);
// arigatokunn_unified.glb は SHOW_SERVICE_WALKER=false で現状未使用のため preload しない（初回ロード削減）。
// 右歩きからの停止時に再生する振り向き専用クリップ。ScrollWalkCharacter が内部でロードする
// パスと一致させて preload しておく。
useGLTF.preload('/models/arigatokunn_turn_right.glb');
