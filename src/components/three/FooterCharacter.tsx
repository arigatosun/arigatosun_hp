'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';

const GLB_PATH = '/models/arigatokun_bye.glb';

function ByeModel() {
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
  }, [clonedScene]);

  useEffect(() => {
    const actionName = Object.keys(actions)[0];
    if (actionName && actions[actionName]) {
      actions[actionName].reset().play();
      actions[actionName].setLoop(THREE.LoopRepeat, Infinity);
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions]);

  return (
    <group ref={group} position={[-3.0, -1.3, 0]} scale={1.3}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(GLB_PATH);

// WorksSectionフッター用の3Dキャラクター（独立Canvas）
export default function FooterCharacter() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <Suspense fallback={null}>
        <ByeModel />
      </Suspense>
    </Canvas>
  );
}
