'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';

// Phase 18 追補: 粘土風シェーディングの新手振りモデルに差し替え。
// 旧 arigatokun_bye.glb は履歴/ロールバック用に残置。
const GLB_PATH = '/models/arigatokunn_wave.glb';
// glb 内に 2 アニメ（ArmatureAction.001 / .002）が含まれているので、
// Blender 担当指定の「手振り = ArmatureAction.001」を明示指定する。
const WAVE_ACTION_NAME = 'ArmatureAction.001';

// ─── デフォルト値（呼び出し側で個別に上書き可） ───
const DEFAULT_CHAR_POSITION: [number, number, number] = [-19.37, -0.75, 0];
const DEFAULT_CHAR_SCALE = 4.73;
const DEFAULT_CAMERA_POSITION: [number, number, number] = [2, 0, 14];
const DEFAULT_CAMERA_FOV = 50;

type WaveModelProps = {
  position: [number, number, number];
  scale: number;
  rotationY?: number;
};

function WaveModel({ position, scale, rotationY = 0 }: WaveModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(GLB_PATH);
  const clonedScene = useMemo(() => skeletonClone(scene) as THREE.Group, [scene]);
  const { actions } = useAnimations(animations, group);

  useLayoutEffect(() => {
    clonedScene.traverse((obj) => {
      obj.frustumCulled = false;
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => { if (mat) mat.needsUpdate = true; });
      }
    });
    // 直下 root（Armature）の transform は animation 参照が依存している可能性があるため
    // リセットしない。clonedScene 自体のローカル transform だけ identity に。
    clonedScene.position.set(0, 0, 0);
    clonedScene.quaternion.identity();
    clonedScene.scale.set(1, 1, 1);
  }, [clonedScene]);

  useEffect(() => {
    // 「手振り」アクションを明示指定で再生。命名が変わった場合のフォールバックも担保。
    const action =
      actions[WAVE_ACTION_NAME] ?? actions[Object.keys(actions)[0]];
    if (action) {
      action.reset().play();
      action.setLoop(THREE.LoopRepeat, Infinity);
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions]);

  return (
    // 新 wave.glb は Armature が x=4.49 / y=-0.22 にずれている。
    // animation 参照はそれを前提にしているのでリセットせず、group の position で
    // スケール換算した内部オフセットをキャンセル + 視覚位置を直接ずらす。
    // rotationY: glb 自体の body が少し斜めに見える時の補正
    <group ref={group} position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(GLB_PATH);

// ─── 公開コンポーネント Props ───
export type FooterCharacterProps = {
  /** キャラの group position。デフォルト [-19.37, -0.75, 0] */
  charPosition?: [number, number, number];
  /** キャラの group scale。デフォルト 4.73 */
  charScale?: number;
  /** キャラの group rotation Y（ラジアン）。default 0。
   *  glb の body が少し斜めに見える時の補正に使用。 */
  charRotationY?: number;
  /** Canvas のカメラ position。デフォルト [2, 0, 14] */
  cameraPosition?: [number, number, number];
  /** カメラ FOV。デフォルト 50 */
  cameraFov?: number;
  /** デバッグ: Canvas DOM の枠線 + 背景色 + AxesHelper + カメラ中心マーカーを表示 */
  debug?: boolean;
};

// WorksSectionフッター・TOP Hero 用の3Dキャラクター（独立Canvas）
// props で位置・スケール・カメラを上書きできるので、配置箇所ごとに別値を渡す。
export default function FooterCharacter({
  charPosition = DEFAULT_CHAR_POSITION,
  charScale = DEFAULT_CHAR_SCALE,
  charRotationY = 0,
  cameraPosition = DEFAULT_CAMERA_POSITION,
  cameraFov = DEFAULT_CAMERA_FOV,
  debug = false,
}: FooterCharacterProps = {}) {
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: cameraFov }}
      gl={{ antialias: true, alpha: true }}
      style={
        debug
          ? {
              background: 'rgba(255, 200, 200, 0.25)', // 薄ピンク
              border: '2px dashed red',
              boxSizing: 'border-box',
            }
          : { background: 'transparent' }
      }
    >
      {/* Phase 18: 粘土マテリアル（Metallic=0 / Roughness 高め）が沈まないよう、
          ambient 1.0→1.5、directional 1.5→1.8 に強化＋斜め前方からの fill 追加 */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.8} />
      <directionalLight position={[-3, 2, 4]} intensity={0.5} />
      {debug && (
        <>
          {/* 原点 (0,0,0) に座標軸ヘルパー（赤=X / 緑=Y / 青=Z） */}
          <axesHelper args={[3]} />
          {/* カメラ視野中心マーカー（カメラ X,Y から Z=0 平面へ垂直に落とした点）に
              黄色い小さい球 */}
          <mesh position={[cameraPosition[0], cameraPosition[1], 0]}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
          {/* キャラの group position に水色マーカー（補正前の origin） */}
          <mesh position={charPosition}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
        </>
      )}
      <Suspense fallback={null}>
        <WaveModel position={charPosition} scale={charScale} rotationY={charRotationY} />
      </Suspense>
    </Canvas>
  );
}
