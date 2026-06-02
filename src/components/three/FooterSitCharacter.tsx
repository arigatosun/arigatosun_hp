'use client';

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import * as THREE from 'three';
import { Leva, useControls, folder } from 'leva';
import { CURSOR_FOLLOW_CONFIG } from './cursorFollowConfig';

const IS_DEV = process.env.NODE_ENV === 'development';

// ?v= はキャッシュバスター。glb の中身を差し替えたらこの番号を上げる
// （本番は next.config.ts で immutable キャッシュしているため、上げないと旧版が残る）。
const GLB_PATH = '/models/arigatokunn_sit.glb?v=opt1';

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
// OrthographicCamera 用ズーム。Canvas のピクセル空間で 1 world unit = zoom px。
// 旧 perspective (fov 70, z=5) で見えていた縦範囲 ~7 world unit を Canvas 高さ 600 に収めるには
// zoom ≒ 600/7 ≈ 86。実体感的に少し詰めて 90 をデフォルトに。
const DEFAULT_CAMERA_ZOOM = 90;

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
  // 腕チェーン: spine の回転で動いた upper_arm 起点から、毎フレーム 2-bone IK を
  // 解いて hand を rest 位置に固定する（Blender の IK ＋ COPY_ROTATION 相当を Three.js 側で再現）。
  // glTF/GLB は Blender の IK / COPY_ROTATION を持ち越せないため、ここで手当てする。
  const upperArmLBoneRef = useRef<THREE.Bone | null>(null);
  const upperArmRBoneRef = useRef<THREE.Bone | null>(null);
  const lowarmLBoneRef = useRef<THREE.Bone | null>(null);
  const lowarmRBoneRef = useRef<THREE.Bone | null>(null);
  const handLBoneRef = useRef<THREE.Bone | null>(null);
  const handRBoneRef = useRef<THREE.Bone | null>(null);

  // Sit ポーズ（mixer 適用後）のローカル回転。初回フレームで1度だけ捕捉する。
  // 毎フレーム再取得すると、Sit クリップが 1F(duration=1/24s) しか持たない関係で
  // mixer がボーンを書き戻さないフレームが発生し、前フレームの出力（既に delta を
  // 乗算済み）を rest として拾ってしまい無限回転する。
  const restSpineQ = useRef(new THREE.Quaternion());
  const restHeadQ = useRef(new THREE.Quaternion());
  // 2-bone IK 用の rest（Sit pose）情報。world 座標で保持し、毎フレーム
  // upper_arm の現在 world 位置を起点に IK を解く。
  const restArmL = useRef({
    L1: 0, L2: 0,
    upperArmPos: new THREE.Vector3(),
    lowarmPos: new THREE.Vector3(),
    handPos: new THREE.Vector3(),
    upperArmWorldQ: new THREE.Quaternion(),
    lowarmWorldQ: new THREE.Quaternion(),
    handWorldQ: new THREE.Quaternion(),
  });
  const restArmR = useRef({
    L1: 0, L2: 0,
    upperArmPos: new THREE.Vector3(),
    lowarmPos: new THREE.Vector3(),
    handPos: new THREE.Vector3(),
    upperArmWorldQ: new THREE.Quaternion(),
    lowarmWorldQ: new THREE.Quaternion(),
    handWorldQ: new THREE.Quaternion(),
  });
  const restCaptured = useRef(false);
  // Sit ポーズ(mixer)が確実に適用されてから rest を捕捉するためのウォームアップ frame カウンタ。
  // 初回フレームでバインドポーズ(腕が上がった状態)を掴むと、IK が手をそこに固定し続けて
  // 腕が上がったまま固定される（"たまに"発生）ため、数フレーム待ってから捕捉する。
  const restWarmupFrames = useRef(0);

  // 平滑化された delta 回転（rest からの差分）
  const smoothedSpineDeltaQ = useRef(new THREE.Quaternion());
  const smoothedHeadDeltaQ = useRef(new THREE.Quaternion());

  // ウィンドウベースのマウス座標 (-1..+1 正規化)。
  // Canvas に pointer-events: none を設定しているため R3F の state.mouse が
  // 更新されない（CONTACT US ボタンクリックを通すために必要な指定）。
  // 代わりに window の pointermove を直接拾って正規化する。
  const mouseRef = useRef({ x: 0, y: 0 });

  // useFrame 用の使い回しバッファ（GC 抑制）
  const tmpEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const tmpQ = useRef(new THREE.Quaternion());
  const tmpParentInvQ = useRef(new THREE.Quaternion());
  // IK 用の使い回しバッファ
  const ikTmpS = useRef(new THREE.Vector3());
  const ikTmpToTarget = useRef(new THREE.Vector3());
  const ikTmpToTargetN = useRef(new THREE.Vector3());
  const ikTmpPolePerp = useRef(new THREE.Vector3());
  const ikTmpElbow = useRef(new THREE.Vector3());
  const ikTmpRestDir = useRef(new THREE.Vector3());
  const ikTmpNewDir = useRef(new THREE.Vector3());
  const ikTmpCorrQ = useRef(new THREE.Quaternion());
  const ikTmpWorldQ = useRef(new THREE.Quaternion());

  useLayoutEffect(() => {
    const boneNames: string[] = [];
    clonedScene.traverse((obj) => {
      obj.frustumCulled = false;
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        mats.forEach((mat) => {
          if (!mat) return;
          // テカリ（specular highlight）を抑えてマットな見え方にする。
          // 既存の roughness が低めにベイクされていても上書きで matte 化。
          const m = mat as THREE.MeshStandardMaterial;
          if (m.isMeshStandardMaterial) {
            m.roughness = 1.0;
            m.metalness = 0;
            m.envMapIntensity = 0;
          }
          mat.needsUpdate = true;
        });
      }
      if ((obj as THREE.Bone).isBone) {
        boneNames.push(obj.name);
        const name = obj.name;
        // この GLB は区切り文字なしの命名 (例: upper_armL / lowarmL / handL)。
        // upper_armL001 系 (root 直下の旧 IK chain) は除外する必要があるので完全一致で拾う。
        if (name === 'spine' && !spineBoneRef.current) {
          spineBoneRef.current = obj as THREE.Bone;
        } else if (name === 'head' && !headBoneRef.current) {
          headBoneRef.current = obj as THREE.Bone;
        } else if (name === 'upper_armL' && !upperArmLBoneRef.current) {
          upperArmLBoneRef.current = obj as THREE.Bone;
        } else if (name === 'upper_armR' && !upperArmRBoneRef.current) {
          upperArmRBoneRef.current = obj as THREE.Bone;
        } else if (name === 'lowarmL' && !lowarmLBoneRef.current) {
          lowarmLBoneRef.current = obj as THREE.Bone;
        } else if (name === 'lowarmR' && !lowarmRBoneRef.current) {
          lowarmRBoneRef.current = obj as THREE.Bone;
        } else if (name === 'handL' && !handLBoneRef.current) {
          handLBoneRef.current = obj as THREE.Bone;
        } else if (name === 'handR' && !handRBoneRef.current) {
          handRBoneRef.current = obj as THREE.Bone;
        }
      }
    });

    if (IS_DEV) {
      // 開発時のみ: 実際のボーン名一覧と、各 ref が拾えたかを 1 回だけ console に吐く。
      // 「肩補正が効かない」時に、ボーン命名規則がコードと一致しているかを確認する。
      console.log('[FooterSitCharacter] bones:', boneNames);
      console.log('[FooterSitCharacter] resolved refs:', {
        spine: spineBoneRef.current?.name ?? null,
        head: headBoneRef.current?.name ?? null,
        upperArmL: upperArmLBoneRef.current?.name ?? null,
        upperArmR: upperArmRBoneRef.current?.name ?? null,
        lowarmL: lowarmLBoneRef.current?.name ?? null,
        lowarmR: lowarmRBoneRef.current?.name ?? null,
        handL: handLBoneRef.current?.name ?? null,
        handR: handRBoneRef.current?.name ?? null,
      });
    }
  }, [clonedScene]);

  useLayoutEffect(() => {
    // glb 内に含まれるアニメは 'Sit' のみ（静止ポーズ保持）
    // useLayoutEffect で初回フレーム(useFrame)より前に確実に再生開始し、
    // mixer.update が初回から Sit ポーズを適用できるようにする（腕上がり対策）。
    const actionName = Object.keys(actions)[0];
    if (actionName && actions[actionName]) {
      actions[actionName].reset().play();
      actions[actionName].setLoop(THREE.LoopRepeat, Infinity);
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions]);

  // ウィンドウ全体の pointermove を拾ってマウス座標を -1..+1 に正規化。
  // Canvas が pointer-events: none のため R3F の state.mouse は使えない。
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      // y は画面上が +1、下が -1 になるよう反転（R3F state.mouse の慣例に合わせる）
      mouseRef.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // ─── 2-bone IK ソルバ ───
  // 解析解 (law of cosines)。pole hint は rest pose の elbow 方向を使い、
  // 自然な肘の曲がり方向を維持する。
  // （useFrame 内から呼ぶため、宣言を使用箇所より前に置く）
  function solve2BoneIK(
    upperArm: THREE.Bone,
    lowarm: THREE.Bone,
    hand: THREE.Bone,
    rest: typeof restArmL.current,
  ) {
    if (rest.L1 <= 0 || rest.L2 <= 0) return;
    if (!upperArm.parent) return;

    // 親 (shoulder) の world は spine.updateMatrixWorld で更新済みのはず
    const S = upperArm.getWorldPosition(ikTmpS.current);
    const T = rest.handPos; // target = rest hand world pos

    const toTarget = ikTmpToTarget.current.subVectors(T, S);
    let d = toTarget.length();
    const minD = Math.abs(rest.L1 - rest.L2) + 0.001;
    const maxD = rest.L1 + rest.L2 - 0.001;
    d = Math.max(minD, Math.min(maxD, d));
    const toTargetN = ikTmpToTargetN.current.copy(toTarget).normalize();

    // pole 方向 = rest の elbow オフセットを toTarget 平面に投影
    const polePerp = ikTmpPolePerp.current.subVectors(rest.lowarmPos, rest.upperArmPos);
    const proj = polePerp.dot(toTargetN);
    polePerp.addScaledVector(toTargetN, -proj);
    if (polePerp.lengthSq() < 0.0001) {
      // fallback: 下方向に肘を曲げる
      polePerp.set(0, -1, 0);
    } else {
      polePerp.normalize();
    }

    // 肩の angle (law of cosines)
    const cosA = (rest.L1 * rest.L1 + d * d - rest.L2 * rest.L2) / (2 * rest.L1 * d);
    const A = Math.acos(Math.max(-1, Math.min(1, cosA)));

    // elbow 位置 (world)
    const elbow = ikTmpElbow.current
      .copy(S)
      .addScaledVector(toTargetN, rest.L1 * Math.cos(A))
      .addScaledVector(polePerp, rest.L1 * Math.sin(A));

    // upper_arm の新 world rotation
    const restUpperArmDirW = ikTmpRestDir.current
      .subVectors(rest.lowarmPos, rest.upperArmPos).normalize();
    const newUpperArmDirW = ikTmpNewDir.current
      .subVectors(elbow, S).normalize();
    const upperArmCorrQ = ikTmpCorrQ.current.setFromUnitVectors(restUpperArmDirW, newUpperArmDirW);
    const newUpperArmWorldQ = ikTmpWorldQ.current.copy(upperArmCorrQ).multiply(rest.upperArmWorldQ);

    // local 変換 (parent = shoulder の現在 world で割る)
    upperArm.parent.getWorldQuaternion(tmpParentInvQ.current).invert();
    upperArm.quaternion.copy(tmpParentInvQ.current).multiply(newUpperArmWorldQ);
    upperArm.updateMatrixWorld(true);

    // lowarm の新 world rotation
    const restLowarmDirW = ikTmpRestDir.current
      .subVectors(rest.handPos, rest.lowarmPos).normalize();
    const newLowarmDirW = ikTmpNewDir.current
      .subVectors(T, elbow).normalize();
    const lowarmCorrQ = ikTmpCorrQ.current.setFromUnitVectors(restLowarmDirW, newLowarmDirW);
    const newLowarmWorldQ = ikTmpWorldQ.current.copy(lowarmCorrQ).multiply(rest.lowarmWorldQ);

    // local 変換 (parent = 新しい upper_arm の world)
    upperArm.getWorldQuaternion(tmpParentInvQ.current).invert();
    lowarm.quaternion.copy(tmpParentInvQ.current).multiply(newLowarmWorldQ);
    lowarm.updateMatrixWorld(true);

    // hand: world 回転を rest に固定（指は hand の子なので一緒に rest 向きを維持）
    lowarm.getWorldQuaternion(tmpParentInvQ.current).invert();
    hand.quaternion.copy(tmpParentInvQ.current).multiply(rest.handWorldQ);
    hand.updateMatrixWorld(true);
  }

  useFrame((state, delta) => {
    // 1) Sit アニメ適用（毎フレーム静止ポーズに戻す）
    mixer?.update(delta);

    const spine = spineBoneRef.current;
    const head = headBoneRef.current;
    if (!spine || !head) return;

    const upperArmL = upperArmLBoneRef.current;
    const upperArmR = upperArmRBoneRef.current;
    const lowarmL = lowarmLBoneRef.current;
    const lowarmR = lowarmRBoneRef.current;
    const handL = handLBoneRef.current;
    const handR = handRBoneRef.current;

    // 2) 初回のみ Sit ポーズの回転＋ボーン位置を rest として退避（以降は再取得しない）
    //    spine/head は local rotation を、腕チェーンは IK 用に world 位置＋world 回転を保持。
    if (!restCaptured.current) {
      // Sit クリップ(1フレーム)の適用が初回フレームに間に合わず、バインドポーズ(腕が
      // 上がった状態)を rest として掴むと、IK が手をそこに固定し続けて腕が上がったまま
      // になる。mixer.update を数フレーム回して Sit ポーズが確実に反映されてから捕捉する。
      restWarmupFrames.current += 1;
      if (restWarmupFrames.current < 5) return;
      restSpineQ.current.copy(spine.quaternion);
      restHeadQ.current.copy(head.quaternion);
      // 腕チェーン (L): Sit pose の world 位置・回転をキャプチャ
      if (upperArmL && lowarmL && handL) {
        upperArmL.getWorldPosition(restArmL.current.upperArmPos);
        lowarmL.getWorldPosition(restArmL.current.lowarmPos);
        handL.getWorldPosition(restArmL.current.handPos);
        upperArmL.getWorldQuaternion(restArmL.current.upperArmWorldQ);
        lowarmL.getWorldQuaternion(restArmL.current.lowarmWorldQ);
        handL.getWorldQuaternion(restArmL.current.handWorldQ);
        restArmL.current.L1 = restArmL.current.upperArmPos.distanceTo(restArmL.current.lowarmPos);
        restArmL.current.L2 = restArmL.current.lowarmPos.distanceTo(restArmL.current.handPos);
      }
      if (upperArmR && lowarmR && handR) {
        upperArmR.getWorldPosition(restArmR.current.upperArmPos);
        lowarmR.getWorldPosition(restArmR.current.lowarmPos);
        handR.getWorldPosition(restArmR.current.handPos);
        upperArmR.getWorldQuaternion(restArmR.current.upperArmWorldQ);
        lowarmR.getWorldQuaternion(restArmR.current.lowarmWorldQ);
        handR.getWorldQuaternion(restArmR.current.handWorldQ);
        restArmR.current.L1 = restArmR.current.upperArmPos.distanceTo(restArmR.current.lowarmPos);
        restArmR.current.L2 = restArmR.current.lowarmPos.distanceTo(restArmR.current.handPos);
      }
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
    //    Canvas が pointer-events: none のため state.mouse は更新されない。
    //    window pointermove で更新される mouseRef を使う。
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
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

    // 8) 2-bone IK で hand を rest 位置に固定
    //    glTF は Blender の IK / COPY_ROTATION を持ち越せず、Three.js 側では純粋な FK 階層
    //    (spine → shoulder → upper_arm → lowarm → hand → 指) になる。
    //    spine 回転で shoulder と upper_arm の world 位置が動くので、
    //    その新しい upper_arm 位置から「rest hand 位置」を IK ターゲットにして
    //    upper_arm / lowarm の角度を逆算する。hand の world 回転は rest に固定。
    //    結果: 肩・腕は spine と連動して動くが、hand と指は世界空間に静止（足と同じ挙動）。
    spine.updateMatrixWorld(true);

    if (upperArmL && lowarmL && handL) {
      solve2BoneIK(upperArmL, lowarmL, handL, restArmL.current);
    }
    if (upperArmR && lowarmR && handR) {
      solve2BoneIK(upperArmR, lowarmR, handR, restArmR.current);
    }
  });

  return (
    <group ref={group} position={position} rotation={[rotationX, rotationY, 0]} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

// 開発時は leva GUI でライト数値をライブ調整できるようにする。
// 本番（NODE_ENV !== development）では useControls の `render: () => false` で
// 値は内部状態として保持しつつ GUI を出さない運用も可能だが、ここは単純に
// 開発フラグで初期値と同じ値を返す関数を分けることで本番の依存と挙動を完全に分離する。
const FOOTER_SIT_LIGHTS_DEFAULTS = {
  ambient: 1.4,
  hemi: 0.45,
  hemiSky: '#ffffff',
  hemiGround: '#ffe8e0',
  mainDirIntensity: 0.7,
  mainDirX: 5, mainDirY: 5, mainDirZ: 5,
  leftFillIntensity: 0.5,
  leftFillX: -5, leftFillY: 3, leftFillZ: 5,
  bottomFillIntensity: 0.25,
  bottomFillX: 0, bottomFillY: -3, bottomFillZ: 4,
  matteRoughness: 1.0,
  matteEnvMapIntensity: 0.0,
};

function DevFooterSitLights() {
  // 開発時のみ呼ばれる前提（フックを条件分岐内に置かないため、ラッパー側で出し分け）
  const cfg = useControls('Footer Sit Character / Lights', {
    ambient: { value: FOOTER_SIT_LIGHTS_DEFAULTS.ambient, min: 0, max: 5, step: 0.05 },
    Hemisphere: folder({
      hemi: { value: FOOTER_SIT_LIGHTS_DEFAULTS.hemi, min: 0, max: 3, step: 0.05 },
      hemiSky: FOOTER_SIT_LIGHTS_DEFAULTS.hemiSky,
      hemiGround: FOOTER_SIT_LIGHTS_DEFAULTS.hemiGround,
    }),
    'Directional Main (R-front)': folder({
      mainDirIntensity: { value: FOOTER_SIT_LIGHTS_DEFAULTS.mainDirIntensity, min: 0, max: 3, step: 0.05 },
      mainDirX: { value: FOOTER_SIT_LIGHTS_DEFAULTS.mainDirX, min: -10, max: 10, step: 0.5 },
      mainDirY: { value: FOOTER_SIT_LIGHTS_DEFAULTS.mainDirY, min: -10, max: 10, step: 0.5 },
      mainDirZ: { value: FOOTER_SIT_LIGHTS_DEFAULTS.mainDirZ, min: -10, max: 10, step: 0.5 },
    }),
    'Directional Fill (L)': folder({
      leftFillIntensity: { value: FOOTER_SIT_LIGHTS_DEFAULTS.leftFillIntensity, min: 0, max: 3, step: 0.05 },
      leftFillX: { value: FOOTER_SIT_LIGHTS_DEFAULTS.leftFillX, min: -10, max: 10, step: 0.5 },
      leftFillY: { value: FOOTER_SIT_LIGHTS_DEFAULTS.leftFillY, min: -10, max: 10, step: 0.5 },
      leftFillZ: { value: FOOTER_SIT_LIGHTS_DEFAULTS.leftFillZ, min: -10, max: 10, step: 0.5 },
    }),
    'Directional Bottom Fill': folder({
      bottomFillIntensity: { value: FOOTER_SIT_LIGHTS_DEFAULTS.bottomFillIntensity, min: 0, max: 3, step: 0.05 },
      bottomFillX: { value: FOOTER_SIT_LIGHTS_DEFAULTS.bottomFillX, min: -10, max: 10, step: 0.5 },
      bottomFillY: { value: FOOTER_SIT_LIGHTS_DEFAULTS.bottomFillY, min: -10, max: 10, step: 0.5 },
      bottomFillZ: { value: FOOTER_SIT_LIGHTS_DEFAULTS.bottomFillZ, min: -10, max: 10, step: 0.5 },
    }),
  });
  return (
    <>
      <ambientLight intensity={cfg.ambient} />
      <hemisphereLight args={[cfg.hemiSky, cfg.hemiGround, cfg.hemi]} />
      <directionalLight position={[cfg.mainDirX, cfg.mainDirY, cfg.mainDirZ]} intensity={cfg.mainDirIntensity} />
      <directionalLight position={[cfg.leftFillX, cfg.leftFillY, cfg.leftFillZ]} intensity={cfg.leftFillIntensity} />
      <directionalLight position={[cfg.bottomFillX, cfg.bottomFillY, cfg.bottomFillZ]} intensity={cfg.bottomFillIntensity} />
    </>
  );
}

function StaticFooterSitLights() {
  const d = FOOTER_SIT_LIGHTS_DEFAULTS;
  return (
    <>
      <ambientLight intensity={d.ambient} />
      <hemisphereLight args={[d.hemiSky, d.hemiGround, d.hemi]} />
      <directionalLight position={[d.mainDirX, d.mainDirY, d.mainDirZ]} intensity={d.mainDirIntensity} />
      <directionalLight position={[d.leftFillX, d.leftFillY, d.leftFillZ]} intensity={d.leftFillIntensity} />
      <directionalLight position={[d.bottomFillX, d.bottomFillY, d.bottomFillZ]} intensity={d.bottomFillIntensity} />
    </>
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
  /** カメラ FOV（perspective 時のみ参照されるレガシー値、orthographic では無視） */
  cameraFov?: number;
  /** OrthographicCamera のズーム。1 world unit = zoom px。 */
  cameraZoom?: number;
  /** デバッグ: Canvas DOM の枠線 + 背景色 + AxesHelper + 中心マーカー */
  debug?: boolean;
  /** カーソル追従を OFF にして rest pose のみで固定（正面向き調整用） */
  freezeCursor?: boolean;
};

// フッター上部に座るキャラクター（独立Canvas）。spine/head がマウスカーソルを追従する。
// camera は orthographic（平行投影）に固定。cameraFov は後方互換のため Props 型に残す
// が消費しない（旧 perspective 設定を呼んでいた箇所が壊れないようにするためだけ）。
export default function FooterSitCharacter({
  charPosition = DEFAULT_CHAR_POSITION,
  charScale = DEFAULT_CHAR_SCALE,
  charRotationY = DEFAULT_CHAR_ROTATION_Y,
  charRotationX = DEFAULT_CHAR_ROTATION_X,
  cameraPosition = DEFAULT_CAMERA_POSITION,
  cameraZoom = DEFAULT_CAMERA_ZOOM,
  debug = false,
  freezeCursor = false,
}: FooterSitCharacterProps = {}) {
  return (
    <>
      {/* 開発時の Leva パネルはデフォルト非表示にしておく。
          値は useControls の初期値 (FOOTER_SIT_LIGHTS_DEFAULTS) が使われる。
          ライティングを再調整したくなったら hidden={false} に切替で右上に表示。 */}
      {IS_DEV && <Leva hidden />}
      <Canvas
      orthographic
      camera={{ position: cameraPosition, zoom: cameraZoom, near: 0.1, far: 1000 }}
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
      {/* 暗くて赤が濃く見える問題への対処:
          - ambient を全体的に明るく上げる
          - hemisphereLight で上下方向の自然なグラデを与える
          - directional は強度を下げて、左右＋下からの fill を追加し陰影を平らに
          - マテリアル側でも roughness=1 / envMapIntensity=0 にして specular を抑制（SitModel 内 traverse）
          開発時は leva GUI（画面右上）でライト数値をライブ調整可能。 */}
      {IS_DEV ? <DevFooterSitLights /> : <StaticFooterSitLights />}
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
    </>
  );
}
