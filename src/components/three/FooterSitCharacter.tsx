'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import { CURSOR_FOLLOW_CONFIG } from './cursorFollowConfig';

const GLB_PATH = '/models/arigatokunn_sit.glb';

const DEG2RAD = Math.PI / 180;

// ─── デフォルト値（呼び出し側で個別に上書き可） ───
// Canvas 内のアーチ頂点位置 ratio=0.7（footer .sitCharacter の CSS で揃え済）。
// 世界 Y=-1.1 → 足元（Sit pose で local Y≈-0.3、scale 1.0）が世界 Y≈-1.4 = NDC y≈-0.4
// に来てアーチ頂点に乗る。X=1.6 で水平中央寄せ（mesh+armature の -1.52 オフセットを補正）。
const DEFAULT_CHAR_POSITION: [number, number, number] = [1.6, -1.1, 0];
const DEFAULT_CHAR_SCALE = 1.0;
// Y軸（左右の顔の向き）: マイナス値で時計回り回転 → 顔を視聴者の左方向に
// X軸（上下のピッチ）: プラス値でキャラを前傾 → 煽り（下から見上げる感）を軽減
const DEFAULT_CHAR_ROTATION_Y = -0.1;
const DEFAULT_CHAR_ROTATION_X = 0.1;
const DEFAULT_CAMERA_POSITION: [number, number, number] = [0, 0, 5];
const DEFAULT_CAMERA_FOV = 70;

// ソフトクランプ: tanh で滑らかに ±limit に飽和させる。
// 中央付近は線形に近く、限界近くで漸近的に飽和し、限界超過でも 0 に戻らない。
function softClamp(value: number, limitRad: number): number {
  if (limitRad <= 0) return 0;
  return limitRad * Math.tanh(value / limitRad);
}

type SitModelProps = {
  position: [number, number, number];
  scale: number;
  rotationY: number;
  rotationX: number;
  freezeCursor: boolean;
};

function SitModel({ position, scale, rotationY, rotationX, freezeCursor }: SitModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(GLB_PATH);
  const clonedScene = useMemo(() => skeletonClone(scene) as THREE.Group, [scene]);
  const { actions, mixer } = useAnimations(animations, group);

  // 追従対象ボーン
  const spineBoneRef = useRef<THREE.Bone | null>(null);
  const headBoneRef = useRef<THREE.Bone | null>(null);

  // Sit ポーズ（mixer 適用後）のローカル回転。初回フレームで1度だけ捕捉する。
  // 毎フレーム再取得すると、Sit クリップが 1F(duration=1/24s) しか持たない関係で
  // mixer がボーンを書き戻さないフレームが発生し、前フレームの出力（既に delta を
  // 乗算済み）を rest として拾ってしまい無限回転する。
  const restSpineQ = useRef(new THREE.Quaternion());
  const restHeadQ = useRef(new THREE.Quaternion());
  const restCaptured = useRef(false);

  // 平滑化された delta 回転（rest からの差分）
  const smoothedSpineDeltaQ = useRef(new THREE.Quaternion());
  const smoothedHeadDeltaQ = useRef(new THREE.Quaternion());

  // useFrame 用の使い回しバッファ（GC 抑制）
  const tmpEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const tmpQ = useRef(new THREE.Quaternion());

  useLayoutEffect(() => {
    clonedScene.traverse((obj) => {
      obj.frustumCulled = false;
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => { if (mat) mat.needsUpdate = true; });
      }
      if ((obj as THREE.Bone).isBone) {
        if (obj.name === 'spine' && !spineBoneRef.current) {
          spineBoneRef.current = obj as THREE.Bone;
        } else if (obj.name === 'head' && !headBoneRef.current) {
          headBoneRef.current = obj as THREE.Bone;
        }
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    // glb 内に含まれるアニメは 'Sit' のみ（静止ポーズ保持）
    const actionName = Object.keys(actions)[0];
    if (actionName && actions[actionName]) {
      actions[actionName].reset().play();
      actions[actionName].setLoop(THREE.LoopRepeat, Infinity);
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions]);

  useFrame((state, delta) => {
    // 1) Sit アニメ適用（毎フレーム静止ポーズに戻す）
    mixer?.update(delta);

    const spine = spineBoneRef.current;
    const head = headBoneRef.current;
    if (!spine || !head) return;

    // 2) 初回のみ Sit ポーズのローカル回転を rest として退避（以降は再取得しない）
    //    Sit ポーズの spine/head は「まっすぐ前向きで座る」ための補正回転を含んでいるので、
    //    これを rest として使い、その上にカーソル追従の delta を乗せる。
    if (!restCaptured.current) {
      restSpineQ.current.copy(spine.quaternion);
      restHeadQ.current.copy(head.quaternion);
      restCaptured.current = true;
    }

    // freezeCursor: カーソル追従を OFF にして純粋な rest pose で固定する
    // （正面向き調整時の確認用フラグ）
    if (freezeCursor) {
      spine.quaternion.copy(restSpineQ.current);
      head.quaternion.copy(restHeadQ.current);
      return;
    }

    // 3) マウス → 基準 yaw/pitch（rad）
    const mx = state.mouse.x;
    const my = state.mouse.y;
    const mag = Math.hypot(mx, my);
    const within = mag < CURSOR_FOLLOW_CONFIG.deadzone;
    const baseRad = CURSOR_FOLLOW_CONFIG.baseAngleDeg * DEG2RAD;
    const baseYaw = within ? 0 : mx * baseRad;
    const basePitch = within ? 0 : -my * baseRad;

    // 4) ソフトクランプ（spine / head それぞれの可動域に丸める）
    const spineYaw = softClamp(baseYaw, CURSOR_FOLLOW_CONFIG.limits.spine.yawDeg * DEG2RAD);
    const spinePitch = softClamp(basePitch, CURSOR_FOLLOW_CONFIG.limits.spine.pitchDeg * DEG2RAD);
    const headYaw = softClamp(baseYaw, CURSOR_FOLLOW_CONFIG.limits.head.yawDeg * DEG2RAD);
    const headPitch = softClamp(basePitch, CURSOR_FOLLOW_CONFIG.limits.head.pitchDeg * DEG2RAD);

    // 5) ボーン配分
    const sYaw = spineYaw * CURSOR_FOLLOW_CONFIG.weights.spine;
    const sPitch = spinePitch * CURSOR_FOLLOW_CONFIG.weights.spine;
    const hYaw = headYaw * CURSOR_FOLLOW_CONFIG.weights.head;
    const hPitch = headPitch * CURSOR_FOLLOW_CONFIG.weights.head;

    // 6) 目標 delta クォータニオン（YXZ: yaw を先に適用、その後 pitch）
    tmpEuler.current.set(sPitch, sYaw, 0, 'YXZ');
    tmpQ.current.setFromEuler(tmpEuler.current);
    smoothedSpineDeltaQ.current.slerp(tmpQ.current, CURSOR_FOLLOW_CONFIG.slerpFactor);

    tmpEuler.current.set(hPitch, hYaw, 0, 'YXZ');
    tmpQ.current.setFromEuler(tmpEuler.current);
    smoothedHeadDeltaQ.current.slerp(tmpQ.current, CURSOR_FOLLOW_CONFIG.slerpFactor);

    // 7) Sit rest ポーズに delta を合成
    spine.quaternion.copy(restSpineQ.current).multiply(smoothedSpineDeltaQ.current);
    head.quaternion.copy(restHeadQ.current).multiply(smoothedHeadDeltaQ.current);
  });

  return (
    <group ref={group} position={position} rotation={[rotationX, rotationY, 0]} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// world 座標固定の矢印。group rotation の影響を受けない。
// 緑矢印 = +Z（カメラ方向）。キャラの顔がこの緑矢印と同じ方向を向いていれば正面。
function ForwardArrowDebug({
  position,
}: {
  position: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* +Z 方向（カメラ方向、ここが正面の基準）緑の太矢印 */}
      <mesh position={[0, 0, 2.2]}>
        <coneGeometry args={[0.2, 0.5, 16]} />
        <meshBasicMaterial color="lime" />
      </mesh>
      <mesh position={[0, 0, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2, 16]} />
        <meshBasicMaterial color="lime" />
      </mesh>
    </group>
  );
}

useGLTF.preload(GLB_PATH);

// ─── 公開コンポーネント Props ───
export type FooterSitCharacterProps = {
  /** キャラの group position。デフォルト [1.5, 0.6, 0] */
  charPosition?: [number, number, number];
  /** キャラの group scale。デフォルト 2.4 */
  charScale?: number;
  /** キャラの group rotation Y（ラジアン）。yaw = 左右の顔の向き補正 */
  charRotationY?: number;
  /** キャラの group rotation X（ラジアン）。pitch = 前後の傾き（煽り）補正 */
  charRotationX?: number;
  /** Canvas のカメラ position。デフォルト [0, 0, 5] */
  cameraPosition?: [number, number, number];
  /** カメラ FOV。デフォルト 50 */
  cameraFov?: number;
  /** デバッグ: Canvas DOM の枠線 + 背景色 + AxesHelper + 中心マーカー */
  debug?: boolean;
  /** カーソル追従を OFF にして rest pose のみで固定（正面向き調整用） */
  freezeCursor?: boolean;
};

// フッター上部に座るキャラクター（独立Canvas）。spine/head がマウスカーソルを追従する。
export default function FooterSitCharacter({
  charPosition = DEFAULT_CHAR_POSITION,
  charScale = DEFAULT_CHAR_SCALE,
  charRotationY = DEFAULT_CHAR_ROTATION_Y,
  charRotationX = DEFAULT_CHAR_ROTATION_X,
  cameraPosition = DEFAULT_CAMERA_POSITION,
  cameraFov = DEFAULT_CAMERA_FOV,
  debug = false,
  freezeCursor = false,
}: FooterSitCharacterProps = {}) {
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: cameraFov }}
      gl={{ antialias: true, alpha: true }}
      // React Three Fiber は Canvas を <div style="pointer-events: auto"> でラップする。
      // そのままだと .sitCharacter の CSS pointer-events: none を上書きしてしまい
      // CONTACT 送信ボタン等を覆ってクリックを奪うため、明示的に none を指定する。
      style={
        debug
          ? {
              background: 'rgba(255, 200, 200, 0.25)',
              border: '2px dashed red',
              boxSizing: 'border-box',
              pointerEvents: 'none',
            }
          : { background: 'transparent', pointerEvents: 'none' }
      }
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      {debug && (
        <>
          <axesHelper args={[3]} />
          <mesh position={[cameraPosition[0], cameraPosition[1], 0]}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="yellow" />
          </mesh>
          <mesh position={charPosition}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial color="cyan" />
          </mesh>
        </>
      )}
      <Suspense fallback={null}>
        <SitModel
          position={charPosition}
          scale={charScale}
          rotationY={charRotationY}
          rotationX={charRotationX}
          freezeCursor={freezeCursor}
        />
        {freezeCursor && false && <ForwardArrowDebug position={charPosition} />}
      </Suspense>
    </Canvas>
  );
}
