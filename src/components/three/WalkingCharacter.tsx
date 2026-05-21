'use client';

import { useRef, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

/**
 * 奥→手前へサイズアップしてくる "depth-walk" モードの設定。
 * 未指定なら従来通り X 軸を横切る横走行になる。
 *
 * OrthographicCamera のままだと Z 軸移動では見かけのサイズが変わらないため、
 * スケール（と必要なら Y 位置）を進捗 0→1 に合わせて補間して立体感を表現する。
 *
 *   - durationMs: startScale → endScale に到達するまでの時間（ms）
 *   - startScale: 奥にいる時のスケール（小さい）
 *   - endScale:   手前まで来た時のスケール（大きい）
 *   - startY / endY: 任意。指定すると Y 位置も同時に補間（上から下に降りてくる演出など）
 */
export type DepthWalkConfig = {
  startScale: number;
  endScale: number;
  durationMs: number;
  startY?: number;
  endY?: number;
};

type WalkingCharacterProps = {
  glbPath: string;
  direction: 'left-to-right' | 'right-to-left';
  speed?: number;
  waitMs?: number;
  baseY?: number;
  scale?: number;
  sectionSelector: string;
  triggerOnVisible?: boolean;
  /**
   * キャラ本体の Y 軸回転（ラジアン）を明示指定する。
   * 未指定なら direction に応じて進行方向を向く（横向き）。
   *   - 0: 正面（カメラ向き）
   *   - Math.PI: 後ろ向き
   *   - Math.PI * 0.5: 右向き（=`left-to-right` 時のデフォルト）
   *   - -Math.PI * 0.5: 左向き（=`right-to-left` 時のデフォルト）
   */
  facingRotationY?: number;
  /**
   * 指定すると X 走行をやめて「奥→手前」のサイズアップ演出に切り替える。
   */
  depthWalk?: DepthWalkConfig;
  /**
   * セクションが画面下からどれだけ離れているうちに「visible 扱い」にして
   * 描画＆歩行を開始するかの余白（px）。
   *   - default: 100（セクション最上端が画面の下端 +100px に入った瞬間にトリガー）
   *   - 大きくすると「セクションに到達する前から歩き始めている」演出になる
   *   - キャラの Y はセクション中心を追従するので、視界外（画面下）の間は実際には見えない
   */
  approachMarginPx?: number;
  /**
   * カーソル位置に応じてキャラの Y 軸回転を補間し、見つめる挙動を有効化。
   * グローバル mousemove を購読するだけなので pointer-events は不要。
   *   - maxAngle: 最大回転角（ラジアン）。例: 0.5 ≈ ±28°
   *   - lerp:     1 フレームあたりの追従係数（0..1）。小さいほどゆっくり追従
   *   - proximity: 指定すると、カーソル近接時のみ look-at が有効化され、
   *                離れると base 回転（direction/facingRotationY 既定）に戻る。
   *                near / far は px 単位の距離しきい値。
   */
  lookAtCursor?:
    | boolean
    | {
        maxAngle?: number;
        lerp?: number;
        proximity?: { near: number; far: number };
      };
  /**
   * キャラをクリックするとジャンプ＋スピンするリアクションを有効化。
   * Canvas は pointer-events: none のまま、window click を捕まえて
   * キャラの投影スクリーン位置との距離で当たり判定。
   *   - hitRadius: 当たり判定半径（px）。指定しなければ scale から自動算出
   *   - durationMs: アニメ全体の長さ
   *   - jumpHeight: ジャンプの最大高さ（3D 単位）
   *   - spins:      回転数（1 で 360°）
   */
  reactOnClick?:
    | boolean
    | {
        hitRadius?: number;
        durationMs?: number;
        jumpHeight?: number;
        spins?: number;
        /** 当たり判定円を画面上に可視化（デバッグ用） */
        debug?: boolean;
      };
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
  facingRotationY,
  depthWalk,
  approachMarginPx = 100,
  lookAtCursor = false,
  reactOnClick = false,
}: WalkingCharacterProps) {
  const group = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const isRunning = useRef(!triggerOnVisible);
  const hasStarted = useRef(!triggerOnVisible);
  const waitTimerRef = useRef<number | null>(null);
  const sectionElRef = useRef<HTMLElement | null>(null);
  // depth-walk モード時の経過時間（ms）。0→durationMs で進む。
  const depthElapsedRef = useRef(0);
  // カーソル位置（NDC: -1..1）と直近のクリック座標（px）
  const cursorNdcXRef = useRef(0);
  const cursorPxRef = useRef({ x: 0, y: 0 });
  // クリックリアクションの開始時刻（performance.now()）。null = 非再生
  const reactionStartRef = useRef<number | null>(null);

  // look-at / click 設定の正規化
  const lookCfg = lookAtCursor
    ? typeof lookAtCursor === 'object'
      ? lookAtCursor
      : {}
    : null;
  const lookMaxAngle = lookCfg?.maxAngle ?? 0.4;
  const lookLerp = lookCfg?.lerp ?? 0.08;
  const lookProximity = lookCfg?.proximity ?? null;

  const clickCfg = reactOnClick
    ? typeof reactOnClick === 'object'
      ? reactOnClick
      : {}
    : null;
  const clickHitRadius = clickCfg?.hitRadius;
  const clickDurationMs = clickCfg?.durationMs ?? 800;
  const clickJumpHeight = clickCfg?.jumpHeight ?? 1.0;
  const clickSpins = clickCfg?.spins ?? 1;
  const clickDebug = clickCfg?.debug ?? false;
  // デバッグ円の位置・半径をフレームごとに更新するため、useRef + DOM 直書き
  const debugCircleRef = useRef<HTMLDivElement | null>(null);
  // キャラ本体の visual 中心 Y オフセット（model 単位）— 足元基準で計算
  const visualOffsetYRef = useRef(0);

  // ルートボーンの直接参照とrest pose保存用
  const rootBoneRef = useRef<THREE.Object3D | null>(null);
  const rootBone00Ref = useRef<THREE.Object3D | null>(null);
  const rootRestPos = useRef(new THREE.Vector3());
  const rootRestQuat = useRef(new THREE.Quaternion());
  const root00RestPos = useRef(new THREE.Vector3());
  const root00RestQuat = useRef(new THREE.Quaternion());

  const { viewport, camera } = useThree();
  const { scene, animations } = useGLTF(glbPath);
  const clonedScene = useMemo(() => skeletonClone(scene) as THREE.Group, [scene]);

  const isLeftToRight = direction === 'left-to-right';
  const startX = isLeftToRight ? -viewport.width / 2 - 3 : viewport.width / 2 + 3;
  const endX = isLeftToRight ? viewport.width / 2 + 3 : -viewport.width / 2 - 3;
  // facingRotationY が渡されていればそれを採用、なければ進行方向を向く（従来挙動）
  const rotationY =
    facingRotationY ?? (isLeftToRight ? Math.PI * 0.5 : -Math.PI * 0.5);

  // SkinnedMeshのfrustumCulling問題を回避 + ルートボーン参照を取得
  // ＋ キャラの bounding box から visual 中心の Y オフセット（モデル空間）を算出
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

    // visual 中心 Y を計算: clonedScene のローカル座標系での bounding box 中央
    // group の transform 影響を除去するため matrixWorld の逆行列で local 化
    clonedScene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clonedScene);
    const worldCenter = new THREE.Vector3();
    box.getCenter(worldCenter);
    // clonedScene.matrixWorld が group の transform を含む場合、それを取り除く
    if (!clonedScene.matrixWorld.equals(new THREE.Matrix4())) {
      const inv = clonedScene.matrixWorld.clone().invert();
      worldCenter.applyMatrix4(inv);
    }
    visualOffsetYRef.current = worldCenter.y;
  }, [clonedScene]);

  // ─── キャラ本体の visual 中心をスクリーン座標(px)で返すヘルパー ───
  // group の足元 origin ではなく、bounding box 中央を使うことで click hit / debug 円が
  // キャラ本体に重なるようにする。
  const getVisualScreenPos = useCallback((): { x: number; y: number } | null => {
    if (!group.current) return null;
    const worldPos = new THREE.Vector3();
    worldPos.copy(group.current.position);
    worldPos.y += visualOffsetYRef.current * group.current.scale.y;
    const projected = worldPos.clone().project(camera);
    return {
      x: ((projected.x + 1) * 0.5) * window.innerWidth,
      y: ((1 - (projected.y + 1) * 0.5)) * window.innerHeight,
    };
  }, [camera]);

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

  // ─── グローバル mousemove / click 購読 ───
  // Canvas は pointer-events: none のままなので、window レベルで取って投影座標で判定する。
  // 他の HTML 要素のクリックを邪魔しないように capture: false（バブリング後）で listen。
  useEffect(() => {
    if (!lookAtCursor && !reactOnClick) return;

    const onMove = (e: MouseEvent) => {
      cursorPxRef.current.x = e.clientX;
      cursorPxRef.current.y = e.clientY;
      cursorNdcXRef.current = (e.clientX / window.innerWidth) * 2 - 1;
    };

    const tryHit = (clientX: number, clientY: number, e: Event) => {
      if (!reactOnClick || !group.current) return;
      if (reactionStartRef.current !== null) return;
      const screenPos = getVisualScreenPos();
      if (!screenPos) return;
      const dx = clientX - screenPos.x;
      const dy = clientY - screenPos.y;
      const dist = Math.hypot(dx, dy);
      const groupScale = group.current.scale.x || 1;
      const fallbackRadius = Math.max(120, 240 * groupScale);
      const radius = clickHitRadius ?? fallbackRadius;
      if (dist <= radius) {
        reactionStartRef.current = performance.now();
        // Link 等への navigate を止める
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // click は Link の navigate と競合しやすいので pointerdown も併用（capture phase で取る）
    const onPointerDown = (e: PointerEvent) => tryHit(e.clientX, e.clientY, e);
    const onClick = (e: MouseEvent) => tryHit(e.clientX, e.clientY, e);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('click', onClick, true);
    };
  }, [lookAtCursor, reactOnClick, clickHitRadius, getVisualScreenPos]);

  // ─── デバッグ用: 当たり判定円を画面に表示（reactOnClick.debug=true 時） ───
  useEffect(() => {
    if (!clickDebug) return;
    const div = document.createElement('div');
    div.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'border: 2px dashed rgba(255,0,0,0.8)',
      'border-radius: 50%',
      'pointer-events: none',
      'z-index: 9999',
      'transform: translate(-50%, -50%)',
      'box-sizing: border-box',
    ].join(';');
    document.body.appendChild(div);
    debugCircleRef.current = div;
    return () => {
      div.remove();
      debugCircleRef.current = null;
    };
  }, [clickDebug]);

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
      // 下マージンを approachMarginPx に拡張 → セクション到達前から歩行開始可
      const isVisible =
        rect.bottom > -100 &&
        rect.top < window.innerHeight + approachMarginPx;
      group.current.visible = isVisible;

      if (!isVisible) return;

      // セクション中央とビューポート中央の差をpx→3D単位に変換してY軸追従
      const pixelToUnit = viewport.height / window.innerHeight;
      const sectionCenterY = rect.top + rect.height / 2;
      const viewportCenterY = window.innerHeight / 2;
      const yOffset = (viewportCenterY - sectionCenterY) * pixelToUnit;
      const sectionTrackedY = baseY + yOffset;
      // depth-walk モード時は補間後に Y も足し込むので一旦 baseY 寄りで仮置き
      group.current.position.y = sectionTrackedY;

      // セクションが見えたら初回歩行開始
      if (triggerOnVisible && !hasStarted.current) {
        hasStarted.current = true;
        if (depthWalk) {
          depthElapsedRef.current = 0;
          group.current.position.x = 0;
        } else {
          group.current.position.x = startX;
        }
        isRunning.current = true;
      }
    }

    // ─── 歩行/サイズアップの位置・スケール更新（running 時のみ） ───
    if (isRunning.current) {
      if (depthWalk) {
        // depth-walk モード（奥→手前にサイズアップ）
        depthElapsedRef.current += delta * 1000;
        const progress = Math.min(
          depthElapsedRef.current / depthWalk.durationMs,
          1,
        );
        const currentScale =
          depthWalk.startScale +
          (depthWalk.endScale - depthWalk.startScale) * progress;
        group.current.scale.setScalar(currentScale);

        if (depthWalk.startY !== undefined && depthWalk.endY !== undefined) {
          const interpY =
            depthWalk.startY + (depthWalk.endY - depthWalk.startY) * progress;
          group.current.position.y += interpY - baseY;
        }
        group.current.position.x = 0;

        if (progress >= 1) {
          isRunning.current = false;
          waitTimerRef.current = window.setTimeout(() => {
            depthElapsedRef.current = 0;
            isRunning.current = true;
          }, waitMs);
        }
      } else {
        // 横走行モード（従来挙動）
        group.current.position.x += (isLeftToRight ? 1 : -1) * speed * delta;
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
      }
    }

    // ─── look-at: カーソルを見つめる（rotation Y を補間） ───
    // 基本は rotationY（direction が決める横向き or facingRotationY 指定値）。
    // proximity 指定がある場合のみ、近接時に「カメラ正面+カーソル傾き」へ全力でブレンド。
    // proximity 未指定なら base に look-at の傾きを加算するだけ（横向きを保ちつつ顔だけ少し振れる）。
    if (lookCfg) {
      const lookAtDelta = cursorNdcXRef.current * lookMaxAngle;
      let targetRot: number;
      if (lookProximity) {
        let proximityT = 1;
        const sp = getVisualScreenPos();
        if (sp) {
          const dx = cursorPxRef.current.x - sp.x;
          const dy = cursorPxRef.current.y - sp.y;
          const dist = Math.hypot(dx, dy);
          const t = THREE.MathUtils.smoothstep(
            dist,
            lookProximity.near,
            lookProximity.far,
          );
          proximityT = 1 - t;
        } else {
          proximityT = 0;
        }
        // near → カメラ正面+傾き、far → base 回転
        targetRot = rotationY + (lookAtDelta - rotationY) * proximityT;
      } else {
        // 加算式: base 回転 + カーソルによる傾き
        targetRot = rotationY + lookAtDelta;
      }
      group.current.rotation.y +=
        (targetRot - group.current.rotation.y) * lookLerp;
    } else {
      group.current.rotation.y = rotationY;
    }

    // ─── click reaction: ジャンプ + スピン（look-at を一時的に上書き） ───
    if (reactionStartRef.current !== null) {
      const t =
        (performance.now() - reactionStartRef.current) / clickDurationMs;
      if (t >= 1) {
        reactionStartRef.current = null;
      } else {
        // ジャンプ: sin カーブで上に行って戻る
        const jumpY = Math.sin(t * Math.PI) * clickJumpHeight;
        group.current.position.y += jumpY;
        // スピン: rotationY を直接書き換え（look-at と競合しないよう設定）
        group.current.rotation.y = rotationY + t * Math.PI * 2 * clickSpins;
      }
    }

    // ─── デバッグ円の位置と半径を更新（visual 中心ベース） ───
    if (clickDebug && debugCircleRef.current && group.current.visible) {
      const sp = getVisualScreenPos();
      if (sp) {
        const groupScale = group.current.scale.x || 1;
        const fallbackRadius = Math.max(120, 240 * groupScale);
        const radius = clickHitRadius ?? fallbackRadius;
        const d = debugCircleRef.current;
        d.style.left = `${sp.x}px`;
        d.style.top = `${sp.y}px`;
        d.style.width = `${radius * 2}px`;
        d.style.height = `${radius * 2}px`;
        d.style.display = 'block';
      }
    } else if (debugCircleRef.current && !group.current.visible) {
      debugCircleRef.current.style.display = 'none';
    }
  });

  // 初期 X / scale は depthWalk 有無で分岐
  const initialX = depthWalk ? 0 : startX;
  const initialScale = depthWalk ? depthWalk.startScale : scale;
  const initialY = depthWalk && depthWalk.startY !== undefined ? depthWalk.startY : baseY;

  return (
    <group
      ref={group}
      position={[initialX, initialY, 0]}
      rotation={[0, rotationY, 0]}
      scale={initialScale}
      visible={!triggerOnVisible}
    >
      <primitive object={clonedScene} />
    </group>
  );
}
