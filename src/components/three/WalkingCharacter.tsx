'use client';

import { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

type WalkingCharacterProps = {
  glbPath: string;
  direction: 'left-to-right' | 'right-to-left';
  speed?: number;
  waitMs?: number;
  baseY?: number;
  scale?: number;
  sectionSelector: string;
  triggerOnVisible?: boolean;
};

// rootボーンのtranslation/rotationトラックを除去したクリップを生成
function createCleanWalkClip(clip: THREE.AnimationClip): THREE.AnimationClip {
  const filteredTracks = clip.tracks.filter((track) => {
    const name = track.name.toLowerCase();
    // root / root.00 / root_00 の position/quaternion/scale を除去
    if (name.startsWith('root.') || name.startsWith('root_')) {
      const afterRoot = name.slice(
        name.startsWith('root.00') || name.startsWith('root_00') ? 7 : 5,
      );
      if (afterRoot === '' || /^(position|quaternion|scale)$/.test(afterRoot)) return false;
      if (afterRoot.startsWith('.') || afterRoot.startsWith('_')) {
        if (/^(position|quaternion|scale)$/.test(afterRoot.slice(1))) return false;
      }
    }
    return true;
  });
  return new THREE.AnimationClip(
    clip.name + '_clean_' + Math.random().toString(36).slice(2),
    clip.duration,
    filteredTracks,
  );
}

// 再利用可能な歩行キャラクターコンポーネント
// グローバルCanvas内で使用し、対象セクションのスクロール位置に追従する
export default function WalkingCharacter({
  glbPath,
  direction,
  speed = 2.5,
  waitMs = 6000,
  baseY = -3.5,
  scale = 0.8,
  sectionSelector,
  triggerOnVisible = false,
}: WalkingCharacterProps) {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const isRunning = useRef(!triggerOnVisible);
  const hasStarted = useRef(!triggerOnVisible);
  const waitTimerRef = useRef<number | null>(null);
  const sectionElRef = useRef<HTMLElement | null>(null);

  // ルートボーンの直接参照とrest pose保存用
  const rootBoneRef = useRef<THREE.Object3D | null>(null);
  const rootBone00Ref = useRef<THREE.Object3D | null>(null);
  const rootRestPos = useRef(new THREE.Vector3());
  const rootRestQuat = useRef(new THREE.Quaternion());
  const root00RestPos = useRef(new THREE.Vector3());
  const root00RestQuat = useRef(new THREE.Quaternion());

  const { viewport } = useThree();
  const { scene, animations } = useGLTF(glbPath);
  const clonedScene = useMemo(() => skeletonClone(scene) as THREE.Group, [scene]);

  const isLeftToRight = direction === 'left-to-right';
  const startX = isLeftToRight ? -viewport.width / 2 - 3 : viewport.width / 2 + 3;
  const endX = isLeftToRight ? viewport.width / 2 + 3 : -viewport.width / 2 - 3;
  const rotationY = isLeftToRight ? Math.PI * 0.5 : -Math.PI * 0.5;

  // SkinnedMeshのfrustumCulling問題を回避 + ルートボーン参照を取得
  useLayoutEffect(() => {
    clonedScene.traverse((obj) => {
      obj.frustumCulled = false;
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => { if (mat) mat.needsUpdate = true; });
      }
      if (obj.name === 'root') {
        rootBoneRef.current = obj;
        rootRestPos.current.copy(obj.position);
        rootRestQuat.current.copy(obj.quaternion);
      }
      if (obj.name === 'root.00') {
        rootBone00Ref.current = obj;
        root00RestPos.current.copy(obj.position);
        root00RestQuat.current.copy(obj.quaternion);
      }
    });
  }, [clonedScene]);

  // AnimationMixerを作成し、rootトラックを除去して再生
  useEffect(() => {
    if (animations.length === 0) return;

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const cleanClip = createCleanWalkClip(animations[0]);
    const action = mixer.clipAction(cleanClip);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(clonedScene);
      mixerRef.current = null;
    };
  }, [clonedScene, animations]);

  // セクション参照とスタート位置の初期化
  useEffect(() => {
    sectionElRef.current = document.querySelector(sectionSelector);

    if (!triggerOnVisible && group.current) {
      group.current.position.x = startX;
      isRunning.current = true;
    }

    return () => {
      if (waitTimerRef.current !== null) window.clearTimeout(waitTimerRef.current);
    };
  }, [sectionSelector, triggerOnVisible, startX]);

  useFrame((_, delta) => {
    // アニメーション更新
    mixerRef.current?.update(delta);

    // rootボーンをrest poseに固定（微小なドリフト防止）
    if (rootBoneRef.current) {
      rootBoneRef.current.position.copy(rootRestPos.current);
      rootBoneRef.current.quaternion.copy(rootRestQuat.current);
    }
    if (rootBone00Ref.current) {
      rootBone00Ref.current.position.copy(root00RestPos.current);
      rootBone00Ref.current.quaternion.copy(root00RestQuat.current);
    }
    clonedScene.position.set(0, 0, 0);
    clonedScene.quaternion.identity();

    if (!group.current) return;

    const section = sectionElRef.current;
    if (section) {
      const rect = section.getBoundingClientRect();
      const isVisible = rect.bottom > -100 && rect.top < window.innerHeight + 100;
      group.current.visible = isVisible;

      if (!isVisible) return;

      // セクション中央とビューポート中央の差をpx→3D単位に変換してY軸追従
      const pixelToUnit = viewport.height / window.innerHeight;
      const sectionCenterY = rect.top + rect.height / 2;
      const viewportCenterY = window.innerHeight / 2;
      const yOffset = (viewportCenterY - sectionCenterY) * pixelToUnit;
      group.current.position.y = baseY + yOffset;

      // セクションが見えたら初回歩行開始
      if (triggerOnVisible && !hasStarted.current) {
        hasStarted.current = true;
        group.current.position.x = startX;
        isRunning.current = true;
      }
    }

    if (!isRunning.current) return;

    // X軸移動
    group.current.position.x += (isLeftToRight ? 1 : -1) * speed * delta;

    // 画面外到達 → 待機後リセット
    const hasReachedEnd = isLeftToRight
      ? group.current.position.x > endX
      : group.current.position.x < endX;

    if (hasReachedEnd) {
      isRunning.current = false;
      waitTimerRef.current = window.setTimeout(() => {
        if (group.current) {
          group.current.position.x = startX;
          isRunning.current = true;
        }
      }, waitMs);
    }
  });

  return (
    <group
      ref={group}
      position={[startX, baseY, 0]}
      rotation={[0, rotationY, 0]}
      scale={scale}
      visible={!triggerOnVisible}
    >
      <primitive object={clonedScene} />
    </group>
  );
}
