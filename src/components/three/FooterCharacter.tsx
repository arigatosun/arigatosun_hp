'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';

// Phase 18 追補: 粘土風シェーディングの新手振りモデルに差し替え。
// 旧 arigatokun_bye.glb は履歴/ロールバック用に残置。
const DEFAULT_GLB_PATH = '/models/arigatokunn_wave.glb';
// glb 内のアニメ名。新エクスポート (simple/felt) は "Wave"、旧 glb は "ArmatureAction.001"、
// 座りキャラ glb は "Sit"。useAnimations の actions マップで順に探して再生する。
const ACTION_CANDIDATES = ['Wave', 'ArmatureAction.001', 'Sit'];

// ─── デフォルト値（呼び出し側で個別に上書き可） ───
const DEFAULT_CHAR_POSITION: [number, number, number] = [-19.37, -0.75, 0];
const DEFAULT_CHAR_SCALE = 4.73;
const DEFAULT_CAMERA_POSITION: [number, number, number] = [2, 0, 14];
const DEFAULT_CAMERA_FOV = 50;
// 平行投影モード時のデフォルト zoom（px per world unit）。
// 現状の透視投影 fov=50 / Z=28 想定の見た目（≒ 15 px/world unit）に近い値を起点に。
const DEFAULT_CAMERA_ZOOM = 15;

type WaveModelProps = {
  glbPath: string;
  position: [number, number, number];
  scale: number;
  rotationY?: number;
  loopMode?: 'pingpong' | 'repeat';
};

function WaveModel({ glbPath, position, scale, rotationY = 0, loopMode = 'pingpong' }: WaveModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(glbPath);
  const clonedScene = useMemo(() => skeletonClone(scene) as THREE.Group, [scene]);
  // loopMode='repeat' のとき、各 track 末尾キー値を先頭値で上書きしてシームレスループにする。
  // Blender bake で frame 1 と frame end のポーズが微妙にズレているとループ境界でカクッと
  // 飛ぶため、末尾を先頭に合わせて連続性を確保する。
  const seamlessAnimations = useMemo(() => {
    if (loopMode !== 'repeat') return animations;
    return animations.map((src) => {
      const clip = src.clone();
      clip.tracks.forEach((track) => {
        const vs = track.getValueSize();
        const len = track.values.length;
        if (len < vs * 2) return;
        for (let i = 0; i < vs; i++) {
          track.values[len - vs + i] = track.values[i];
        }
      });
      return clip;
    });
  }, [animations, loopMode]);
  const { actions } = useAnimations(seamlessAnimations, group);

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
    // クリップ候補を順に探す。Wave / ArmatureAction.001 / Sit のいずれか。
    const candidate = ACTION_CANDIDATES.find((name) => actions[name]);
    const action = candidate
      ? actions[candidate]
      : actions[Object.keys(actions)[0]];
    if (action) {
      action.reset().play();
      // loopMode='pingpong' (default): Wave 用。片道モーションを往復再生して自然な手振りに。
      // loopMode='repeat': Sit 等のループ自然なアニメ用。通常の繰り返し。
      action.setLoop(
        loopMode === 'pingpong' ? THREE.LoopPingPong : THREE.LoopRepeat,
        Infinity,
      );
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions, loopMode]);

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

useGLTF.preload(DEFAULT_GLB_PATH);
// 比較用バリアント (wave_simple / wave_felt) は debug/wave-compare 専用のため TOP では preload しない
// （初回ロード約36MB削減。debug ページ訪問時に各自 useGLTF で遅延ロードされる）。
// Works セクション底部の座りキャラ (v=2: bake 済 IK pose 反映)
useGLTF.preload('/models/arigatokunn_sit_clay.glb?v=7');

// ─── 公開コンポーネント Props ───
export type FooterCharacterProps = {
  /** 使用する glb のパス。default '/models/arigatokunn_wave.glb'
   *  比較用に simple / felt 等の別ファイルを差し込める。 */
  glbPath?: string;
  /** キャラの group position。デフォルト [-19.37, -0.75, 0] */
  charPosition?: [number, number, number];
  /** キャラの group scale。デフォルト 4.73 */
  charScale?: number;
  /** キャラの group rotation Y（ラジアン）。default 0。
   *  glb の body が少し斜めに見える時の補正に使用。 */
  charRotationY?: number;
  /** Canvas のカメラ position。デフォルト [2, 0, 14] */
  cameraPosition?: [number, number, number];
  /** カメラ FOV（透視投影モード時のみ有効）。デフォルト 50 */
  cameraFov?: number;
  /**
   * 平行投影（Orthographic）カメラを使うかどうか。
   * true にすると遠近感が消え、フラットな 2D ライクな見え方になる。デフォルト false。
   */
  orthographic?: boolean;
  /** 平行投影モード時の zoom（px per world unit）。デフォルト 15 */
  cameraZoom?: number;
  /** デバッグ: Canvas DOM の枠線 + 背景色 + AxesHelper + カメラ中心マーカーを表示 */
  debug?: boolean;
  /** クリップのループ方式。
   *  - 'pingpong' (default): 順再生 → 逆再生 → ... 片道アニメ（Wave）向け
   *  - 'repeat': 普通の繰り返し（ループ自然なアニメ向け、Sit 等） */
  loopMode?: 'pingpong' | 'repeat';
};

// WorksSectionフッター・TOP Hero 用の3Dキャラクター（独立Canvas）
// props で位置・スケール・カメラを上書きできるので、配置箇所ごとに別値を渡す。
export default function FooterCharacter({
  glbPath = DEFAULT_GLB_PATH,
  charPosition = DEFAULT_CHAR_POSITION,
  charScale = DEFAULT_CHAR_SCALE,
  charRotationY = 0,
  cameraPosition = DEFAULT_CAMERA_POSITION,
  cameraFov = DEFAULT_CAMERA_FOV,
  orthographic = false,
  cameraZoom = DEFAULT_CAMERA_ZOOM,
  debug = false,
  loopMode = 'pingpong',
}: FooterCharacterProps = {}) {
  return (
    <Canvas
      orthographic={orthographic}
      camera={
        orthographic
          ? { position: cameraPosition, zoom: cameraZoom, near: 0.1, far: 1000 }
          : { position: cameraPosition, fov: cameraFov }
      }
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
        <WaveModel
          glbPath={glbPath}
          position={charPosition}
          scale={charScale}
          rotationY={charRotationY}
          loopMode={loopMode}
        />
      </Suspense>
    </Canvas>
  );
}
