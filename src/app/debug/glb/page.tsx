'use client';

import { Suspense, useRef, useState, useMemo, useCallback, useLayoutEffect, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import styles from './page.module.scss';

// ─── 型定義 ───
type DebugParams = {
  camX: number;
  camY: number;
  camZ: number;
  fov: number;
  orthoZoom: number;
  charRotX: number;
  charRotY: number;
  charRotZ: number;
  charScale: number;
  charOffsetX: number;
  charOffsetY: number;
  charOffsetZ: number;
  playing: boolean;
  speed: number;
  lockRoot: boolean;
  lockRoot00: boolean;
  filterRootTracks: boolean;
  // Auto Y補正
  autoYCorrect: boolean;
  yCorrectStrength: number;
  yCorrectOffset: number;
  walkEnabled: boolean;
  walkSpeed: number;
  walkDirection: 'left-to-right' | 'right-to-left';
  showGrid: boolean;
  showAxes: boolean;
  showBones: boolean;
  showWireframe: boolean;
};

const DEFAULT_PARAMS: DebugParams = {
  camX: 0,
  camY: 0,
  camZ: 8,
  fov: 50,
  orthoZoom: 80,
  charRotX: 0,
  charRotY: 90,
  charRotZ: 0,
  charScale: 1,
  charOffsetX: 0,
  charOffsetY: 0,
  charOffsetZ: 0,
  playing: true,
  speed: 1,
  lockRoot: true,
  lockRoot00: true,
  filterRootTracks: false,
  autoYCorrect: true,
  yCorrectStrength: 1.0,
  yCorrectOffset: 0,
  walkEnabled: true,
  walkSpeed: 2.5,
  walkDirection: 'left-to-right',
  showGrid: true,
  showAxes: true,
  showBones: false,
  showWireframe: false,
};

const GLB_PATH = '/models/walk.v3.glb';

// ─── Euler Y抽出ユーティリティ ───
const _euler = new THREE.Euler();
function getYRotationDeg(q: THREE.Quaternion): number {
  _euler.setFromQuaternion(q, 'YXZ');
  return _euler.y * (180 / Math.PI);
}

// ─── 共通UIコンポーネント ───
function Slider({ label, value, onChange, min, max, step = 0.1 }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number;
}) {
  return (
    <div className={styles.control}>
      <label>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value.toFixed(step < 0.1 ? 2 : step < 1 ? 1 : 0)}</span>
      </label>
      <input type="range" min={min} max={max} step={step}
        value={value} onChange={(e) => onChange(parseFloat(e.target.value))} />
    </div>
  );
}

function Toggle({ label, value, onChange, desc }: {
  label: string; value: boolean; onChange: (v: boolean) => void; desc?: string;
}) {
  return (
    <div className={styles.control}>
      <label className={styles.toggle}>
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span>{label}</span>
      </label>
      {desc && <div className={styles.toggleDesc}>{desc}</div>}
    </div>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value} style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

// ─── ボーン情報パネル ───
function BoneInfo({ bones }: { bones: { name: string; pos: string; rot: string }[] }) {
  return (
    <div className={styles.bonePanel}>
      <h4>Bone Transforms (live)</h4>
      <div className={styles.boneList}>
        {bones.map((b) => (
          <div key={b.name} className={styles.boneItem}>
            <span className={styles.boneName}>{b.name}</span>
            <span className={styles.boneData}>pos: {b.pos}</span>
            <span className={styles.boneData}>rot: {b.rot}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── トラック一覧 ───
function TrackList({ tracks, filtered }: { tracks: string[]; filtered: string[] }) {
  return (
    <div className={styles.trackPanel}>
      <h4>Animation Tracks ({tracks.length})</h4>
      <div className={styles.trackList}>
        {tracks.map((t) => {
          const isFiltered = !filtered.includes(t);
          return (
            <div key={t} className={`${styles.trackItem} ${isFiltered ? styles.trackFiltered : ''}`}>
              {isFiltered && <span className={styles.filteredBadge}>除去</span>}
              {t}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── カメラ同期（OrthographicCamera対応） ───
function CameraRig({ params, controlsRef }: {
  params: DebugParams; controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();
  const prevCam = useRef({ x: params.camX, y: params.camY, z: params.camZ, zoom: params.orthoZoom });
  useFrame(() => {
    // OrthographicCameraのzoom同期
    if (camera instanceof THREE.OrthographicCamera) {
      if (camera.zoom !== params.orthoZoom) {
        camera.zoom = params.orthoZoom;
        camera.updateProjectionMatrix();
      }
    }
    const c = prevCam.current;
    if (c.x !== params.camX || c.y !== params.camY || c.z !== params.camZ) {
      camera.position.set(params.camX, params.camY, params.camZ);
      if (controlsRef.current) { controlsRef.current.target.set(0, 0, 0); controlsRef.current.update(); }
      prevCam.current = { x: params.camX, y: params.camY, z: params.camZ, zoom: params.orthoZoom };
    }
  });
  return null;
}

// ─── デバッグキャラクター ───
function DebugCharacter({ params, onBoneUpdate, onTracksReady, onCorrectionUpdate }: {
  params: DebugParams;
  onBoneUpdate: (bones: { name: string; pos: string; rot: string }[]) => void;
  onTracksReady: (all: string[], filtered: string[]) => void;
  onCorrectionUpdate: (info: { rawY: number; correctedY: number; appliedY: number }) => void;
}) {
  const walkGroupRef = useRef<THREE.Group>(null);
  const charGroupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const rootBoneRef = useRef<THREE.Object3D | null>(null);
  const rootBone00Ref = useRef<THREE.Object3D | null>(null);
  const rootRestPos = useRef(new THREE.Vector3());
  const rootRestQuat = useRef(new THREE.Quaternion());
  const root00RestPos = useRef(new THREE.Vector3());
  const root00RestQuat = useRef(new THREE.Quaternion());
  const frameCount = useRef(0);

  const { viewport } = useThree();
  const { scene, animations } = useGLTF(GLB_PATH);
  const clonedScene = useMemo(() => skeletonClone(scene) as THREE.Group, [scene]);

  // frustumCulling無効化 + ルートボーン参照取得
  useLayoutEffect(() => {
    clonedScene.traverse((obj) => {
      obj.frustumCulled = false;
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

  // SkeletonHelper
  const skeletonHelper = useMemo(() => {
    let skeleton: THREE.SkeletonHelper | null = null;
    clonedScene.traverse((obj) => {
      if ((obj as THREE.SkinnedMesh).isSkinnedMesh && !skeleton) {
        skeleton = new THREE.SkeletonHelper(clonedScene);
      }
    });
    return skeleton;
  }, [clonedScene]);

  // AnimationMixer（filterRootTracksの変更で再構築）
  useEffect(() => {
    if (animations.length === 0) return;
    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const originalClip = animations[0];
    const allTrackNames = originalClip.tracks.map((t) => t.name);
    let tracks = originalClip.tracks;
    if (params.filterRootTracks) {
      tracks = tracks.filter((track) => {
        const name = track.name.toLowerCase();
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
    }
    onTracksReady(allTrackNames, tracks.map((t) => t.name));

    const clip = new THREE.AnimationClip(
      originalClip.name + '_debug_' + Date.now(), originalClip.duration, tracks,
    );
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.play();

    return () => { mixer.stopAllAction(); mixer.uncacheRoot(clonedScene); mixerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clonedScene, animations, params.filterRootTracks]);

  // ワイヤーフレーム切替
  useEffect(() => {
    clonedScene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (mat && 'wireframe' in mat) (mat as THREE.MeshStandardMaterial).wireframe = params.showWireframe;
        });
      }
    });
  }, [clonedScene, params.showWireframe]);

  // 歩行初期位置
  useEffect(() => {
    if (walkGroupRef.current && params.walkEnabled) {
      walkGroupRef.current.position.x = params.walkDirection === 'left-to-right'
        ? -(viewport.width / 2 + 3) : viewport.width / 2 + 3;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.walkDirection]);

  useFrame((_, delta) => {
    // 1. アニメーション更新
    if (params.playing && mixerRef.current) {
      mixerRef.current.update(delta * params.speed);
    }

    // 2. Auto Y補正: mixer更新後、rootボーンのアニメーション回転を読み取る
    let correctionDeg = 0;
    let rawRootY = 0;

    if (rootBoneRef.current) {
      // アニメーションが適用された後のrootボーンのY回転（度）を読み取る
      rawRootY = getYRotationDeg(rootBoneRef.current.quaternion);

      if (params.autoYCorrect) {
        // rest poseからのY回転差分を算出
        const restY = getYRotationDeg(rootRestQuat.current);
        correctionDeg = (rawRootY - restY) * params.yCorrectStrength;
      }
    }

    // 3. ルートボーン位置固定（XZ移動を防止、Yは歩行の上下動を維持）
    if (params.lockRoot && rootBoneRef.current) {
      rootBoneRef.current.position.set(
        rootRestPos.current.x,
        rootBoneRef.current.position.y, // Yは歩行アニメーションの上下動を維持
        rootRestPos.current.z,
      );
      // autoYCorrectがONのときはrootのquaternionはそのまま残す（読み取りに必要）
      // OFFのときのみ従来通りロックする
      if (!params.autoYCorrect) {
        rootBoneRef.current.quaternion.copy(rootRestQuat.current);
      }
    }
    if (params.lockRoot00 && rootBone00Ref.current) {
      rootBone00Ref.current.position.copy(root00RestPos.current);
      rootBone00Ref.current.quaternion.copy(root00RestQuat.current);
    }
    clonedScene.position.set(0, 0, 0);
    clonedScene.quaternion.identity();

    // 4. キャラクターの向きを適用（autoYCorrectで逆回転打ち消し）
    if (charGroupRef.current) {
      const finalY = params.charRotY - correctionDeg + params.yCorrectOffset;
      charGroupRef.current.rotation.set(
        (params.charRotX * Math.PI) / 180,
        (finalY * Math.PI) / 180,
        (params.charRotZ * Math.PI) / 180,
      );
      charGroupRef.current.scale.setScalar(params.charScale);
      charGroupRef.current.position.set(params.charOffsetX, params.charOffsetY, params.charOffsetZ);
    }

    // 5. 歩行移動
    if (params.walkEnabled && walkGroupRef.current) {
      const isLTR = params.walkDirection === 'left-to-right';
      const dir = isLTR ? 1 : -1;
      walkGroupRef.current.position.x += dir * params.walkSpeed * delta;
      const endX = isLTR ? viewport.width / 2 + 3 : -(viewport.width / 2 + 3);
      const startX = isLTR ? -(viewport.width / 2 + 3) : viewport.width / 2 + 3;
      if (isLTR ? walkGroupRef.current.position.x > endX : walkGroupRef.current.position.x < endX) {
        walkGroupRef.current.position.x = startX;
      }
    }

    // 6. デバッグ情報を定期更新
    frameCount.current++;
    if (frameCount.current % 6 === 0) {
      // 補正情報
      const appliedY = params.charRotY - correctionDeg + params.yCorrectOffset;
      onCorrectionUpdate({ rawY: rawRootY, correctedY: correctionDeg, appliedY });

      // ボーン情報
      const boneData: { name: string; pos: string; rot: string }[] = [];
      const targetBones = ['root', 'root.00', 'spine', 'upper_foot.L', 'upper_foot.R'];
      clonedScene.traverse((obj) => {
        if (targetBones.includes(obj.name)) {
          const p = obj.position;
          const q = obj.quaternion;
          const euler = new THREE.Euler().setFromQuaternion(q, 'YXZ');
          boneData.push({
            name: obj.name,
            pos: `${p.x.toFixed(3)}, ${p.y.toFixed(3)}, ${p.z.toFixed(3)}`,
            rot: `${(euler.x * 180 / Math.PI).toFixed(1)}°, ${(euler.y * 180 / Math.PI).toFixed(1)}°, ${(euler.z * 180 / Math.PI).toFixed(1)}°`,
          });
        }
      });
      onBoneUpdate(boneData);
    }
  });

  return (
    <group ref={walkGroupRef}>
      <group ref={charGroupRef}>
        <primitive object={clonedScene} />
        {skeletonHelper && params.showBones && <primitive object={skeletonHelper} />}
      </group>
    </group>
  );
}

// ─── メインページ ───
export default function GlbDebugPage() {
  const [params, setParams] = useState<DebugParams>(DEFAULT_PARAMS);
  const [bones, setBones] = useState<{ name: string; pos: string; rot: string }[]>([]);
  const [allTracks, setAllTracks] = useState<string[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<string[]>([]);
  const [correction, setCorrection] = useState({ rawY: 0, correctedY: 0, appliedY: 0 });
  const [activePanel, setActivePanel] = useState<'character' | 'camera' | 'anim' | 'tracks' | 'bones'>('character');
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const update = useCallback(
    <K extends keyof DebugParams>(key: K, value: DebugParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
    }, [],
  );

  const handleTracksReady = useCallback((all: string[], filtered: string[]) => {
    setAllTracks(all); setFilteredTracks(filtered);
  }, []);
  const handleBoneUpdate = useCallback((data: { name: string; pos: string; rot: string }[]) => {
    setBones(data);
  }, []);
  const handleCorrectionUpdate = useCallback((info: { rawY: number; correctedY: number; appliedY: number }) => {
    setCorrection(info);
  }, []);

  return (
    <div className={styles.page}>
      {/* 3Dビューポート */}
      <div className={styles.viewport}>
        <Canvas
          orthographic
          camera={{
            position: [DEFAULT_PARAMS.camX, DEFAULT_PARAMS.camY, DEFAULT_PARAMS.camZ],
            zoom: DEFAULT_PARAMS.orthoZoom,
            near: 0.1,
            far: 1000,
          }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#1a1a2e']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <directionalLight position={[-3, 3, -3]} intensity={0.5} />
          <CameraRig params={params} controlsRef={controlsRef} />
          <OrbitControls ref={controlsRef} />
          {params.showGrid && (
            <Grid args={[20, 20]} cellSize={1} cellThickness={0.5} cellColor="#4a4a6a"
              sectionSize={5} sectionThickness={1} sectionColor="#6a6a9a" fadeDistance={30} position={[0, -3.5, 0]} />
          )}
          {params.showAxes && <axesHelper args={[5]} />}
          <Suspense fallback={null}>
            <DebugCharacter
              params={params}
              onBoneUpdate={handleBoneUpdate}
              onTracksReady={handleTracksReady}
              onCorrectionUpdate={handleCorrectionUpdate}
            />
          </Suspense>
        </Canvas>

        {/* ステータスオーバーレイ */}
        <div className={styles.status}>
          <span>CAM: [{params.camX.toFixed(1)}, {params.camY.toFixed(1)}, {params.camZ.toFixed(1)}]</span>
          <span>FOV: {params.fov}</span>
          <span>CHAR Y: {params.charRotY}°</span>
          {params.autoYCorrect && (
            <span className={styles.statusHighlight}>
              AutoY: {correction.correctedY.toFixed(2)}° → Final: {correction.appliedY.toFixed(1)}°
            </span>
          )}
        </div>
      </div>

      {/* コントロールパネル */}
      <div className={styles.panel}>
        <h2 className={styles.title}>GLB Debug Inspector</h2>
        <p className={styles.subtitle}>{GLB_PATH}</p>

        <div className={styles.tabs}>
          {(['character', 'camera', 'anim', 'tracks', 'bones'] as const).map((tab) => (
            <button key={tab}
              className={`${styles.tab} ${activePanel === tab ? styles.tabActive : ''}`}
              onClick={() => setActivePanel(tab)}
            >
              {{ character: 'Char', camera: 'Cam', anim: 'Anim', tracks: 'Tracks', bones: 'Bones' }[tab]}
            </button>
          ))}
        </div>

        <div className={styles.panelContent}>
          {/* ─── キャラクタータブ ─── */}
          {activePanel === 'character' && (
            <>
              <h3>Auto Y Correction</h3>
              <Toggle
                label="Auto Y補正 ON"
                value={params.autoYCorrect}
                onChange={(v) => update('autoYCorrect', v)}
                desc="アニメーション中のrootボーンY回転を自動で打ち消し、常に真横歩行に見せる"
              />
              {params.autoYCorrect && (
                <>
                  <Slider label="補正強度" value={params.yCorrectStrength} onChange={(v) => update('yCorrectStrength', v)} min={0} max={2} step={0.05} />
                  <Slider label="Y追加オフセット" value={params.yCorrectOffset} onChange={(v) => update('yCorrectOffset', v)} min={-30} max={30} step={0.5} />
                  <div className={styles.correctionInfo}>
                    <InfoRow label="Root Raw Y" value={`${correction.rawY.toFixed(2)}°`} />
                    <InfoRow label="Correction" value={`-${correction.correctedY.toFixed(2)}°`} color="#ff6b6b" />
                    <InfoRow label="Final Y" value={`${correction.appliedY.toFixed(1)}°`} color="#6bff6b" />
                  </div>
                </>
              )}

              <h3>Rotation (deg)</h3>
              <Slider label="Rot X" value={params.charRotX} onChange={(v) => update('charRotX', v)} min={-180} max={180} step={1} />
              <Slider label="Rot Y (base)" value={params.charRotY} onChange={(v) => update('charRotY', v)} min={-180} max={180} step={1} />
              <Slider label="Rot Z" value={params.charRotZ} onChange={(v) => update('charRotZ', v)} min={-180} max={180} step={1} />

              <h3>Position Offset</h3>
              <Slider label="Offset X" value={params.charOffsetX} onChange={(v) => update('charOffsetX', v)} min={-10} max={10} step={0.1} />
              <Slider label="Offset Y" value={params.charOffsetY} onChange={(v) => update('charOffsetY', v)} min={-10} max={10} step={0.1} />
              <Slider label="Offset Z" value={params.charOffsetZ} onChange={(v) => update('charOffsetZ', v)} min={-10} max={10} step={0.1} />

              <h3>Scale</h3>
              <Slider label="Scale" value={params.charScale} onChange={(v) => update('charScale', v)} min={0.1} max={3} step={0.05} />

              <h3>Display</h3>
              <Toggle label="Show Bones" value={params.showBones} onChange={(v) => update('showBones', v)} />
              <Toggle label="Wireframe" value={params.showWireframe} onChange={(v) => update('showWireframe', v)} />
              <Toggle label="Show Grid" value={params.showGrid} onChange={(v) => update('showGrid', v)} />
              <Toggle label="Show Axes" value={params.showAxes} onChange={(v) => update('showAxes', v)} />

              <div className={styles.presets}>
                <h3>Quick Presets</h3>
                <button onClick={() => setParams((p) => ({ ...p, charRotX: 0, charRotY: 0, charRotZ: 0 }))}>Front (0°)</button>
                <button onClick={() => setParams((p) => ({ ...p, charRotX: 0, charRotY: 90, charRotZ: 0 }))}>Side R (90°)</button>
                <button onClick={() => setParams((p) => ({ ...p, charRotX: 0, charRotY: -90, charRotZ: 0 }))}>Side L (-90°)</button>
                <button onClick={() => setParams((p) => ({ ...p, charRotX: 0, charRotY: 180, charRotZ: 0 }))}>Back (180°)</button>
                <button onClick={() => setParams((p) => ({ ...p, charOffsetX: 0, charOffsetY: 0, charOffsetZ: 0 }))}>Offset Reset</button>
              </div>
            </>
          )}

          {/* ─── カメラタブ ─── */}
          {activePanel === 'camera' && (
            <>
              <h3>Camera Position</h3>
              <Slider label="X" value={params.camX} onChange={(v) => update('camX', v)} min={-20} max={20} />
              <Slider label="Y" value={params.camY} onChange={(v) => update('camY', v)} min={-20} max={20} />
              <Slider label="Z" value={params.camZ} onChange={(v) => update('camZ', v)} min={0.5} max={30} />
              <h3>Orthographic Zoom</h3>
              <Slider label="Zoom" value={params.orthoZoom} onChange={(v) => update('orthoZoom', v)} min={10} max={300} step={1} />
              <div className={styles.presets}>
                <h3>Camera Presets</h3>
                <button onClick={() => setParams((p) => ({ ...p, camX: 0, camY: 0, camZ: 8 }))}>Front</button>
                <button onClick={() => setParams((p) => ({ ...p, camX: 8, camY: 0, camZ: 0 }))}>Side</button>
                <button onClick={() => setParams((p) => ({ ...p, camX: 0, camY: 8, camZ: 0 }))}>Top</button>
                <button onClick={() => setParams((p) => ({ ...p, camX: 5, camY: 3, camZ: 5 }))}>Perspective</button>
              </div>
            </>
          )}

          {/* ─── アニメーションタブ ─── */}
          {activePanel === 'anim' && (
            <>
              <h3>Playback</h3>
              <Toggle label="Play / Pause" value={params.playing} onChange={(v) => update('playing', v)} />
              <Slider label="Speed" value={params.speed} onChange={(v) => update('speed', v)} min={0} max={3} step={0.1} />

              <h3>Root Bone Lock</h3>
              <Toggle label='Lock "root" position' value={params.lockRoot} onChange={(v) => update('lockRoot', v)} />
              <Toggle label='Lock "root.00"' value={params.lockRoot00} onChange={(v) => update('lockRoot00', v)} />
              <Toggle label="Filter root tracks" value={params.filterRootTracks} onChange={(v) => update('filterRootTracks', v)} />

              <h3>Walk</h3>
              <Toggle label="Enable walking" value={params.walkEnabled} onChange={(v) => update('walkEnabled', v)} />
              <Slider label="Walk Speed" value={params.walkSpeed} onChange={(v) => update('walkSpeed', v)} min={0.5} max={10} step={0.1} />
              <div className={styles.presets}>
                <button onClick={() => update('walkDirection', 'left-to-right')}>
                  L → R {params.walkDirection === 'left-to-right' ? '●' : ''}
                </button>
                <button onClick={() => update('walkDirection', 'right-to-left')}>
                  R → L {params.walkDirection === 'right-to-left' ? '●' : ''}
                </button>
              </div>
            </>
          )}

          {activePanel === 'tracks' && <TrackList tracks={allTracks} filtered={filteredTracks} />}
          {activePanel === 'bones' && <BoneInfo bones={bones} />}
        </div>

        <button className={styles.resetBtn} onClick={() => setParams(DEFAULT_PARAMS)}>Reset All</button>
      </div>
    </div>
  );
}
