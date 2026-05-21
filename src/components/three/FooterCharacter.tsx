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

function WaveModel() {
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
    // カメラ z=8→z=10 にさらに引いた分、scale も 1.25 倍（2.7→3.375）+
    // position も 1.25 倍にして、見かけサイズ・視覚位置を一定に保つ。
    <group ref={group} position={[-14.43, -0.53, 0]} scale={3.375}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(GLB_PATH);

// WorksSectionフッター・TOP Hero 用の3Dキャラクター（独立Canvas）
export default function FooterCharacter() {
  return (
    <Canvas
      // Phase 18 追補: カメラを z=5 → z=10 まで引き、足元・腕先・トゲの先まで
      // Canvas に収める。スケールと position も同比率で拡大して見かけ・位置を維持。
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      {/* Phase 18: 粘土マテリアル（Metallic=0 / Roughness 高め）が沈まないよう、
          ambient 1.0→1.5、directional 1.5→1.8 に強化＋斜め前方からの fill 追加 */}
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.8} />
      <directionalLight position={[-3, 2, 4]} intensity={0.5} />
      <Suspense fallback={null}>
        <WaveModel />
      </Suspense>
    </Canvas>
  );
}
