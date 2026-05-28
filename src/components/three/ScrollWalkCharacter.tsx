'use client';

import { useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';

/**
 * unified glb（Idle / TurnToSide / Walk / StopWalk / WaitingPose / ResumeWalk）を
 * スクロール方向に連動させて双方向に歩かせるキャラクター。
 *
 * 仕様:
 *   - 開始位置 x=0（画面中央）、Idle ではなく WaitingPose（横向き立ち）でスタート
 *   - スクロール開始で ResumeWalk → Walk へ
 *   - スクロール 下方向 → キャラ左へ移動 / 上方向 → キャラ右へ移動
 *   - スクロール方向が変わったら Y 回転を smooth lerp で反転
 *   - 画面端まで来たら viewport.width / 2 でクランプ（画面外に出ない）
 *   - 停止 200ms で StopWalk → WaitingPose
 *   - 再開で ResumeWalk → Walk
 *
 * 注意:
 *   Walk クリップが「キャラから見て前」へ歩くと仮定。group の rotation.y で
 *   左右どちらに歩くかを制御する。default は rotation.y=0（モデルの正面歩行）。
 */

type AnimState =
  | 'walking'
  | 'stopping'
  // 右歩きからの停止専用の中間遷移。TurnRight → TurnRightBridge を経て waiting (RightIdle) へ。
  | 'finishing'
  | 'waiting'
  | 'resuming';

// 方向によって再生クリップを切替える。
// 右 (facingSign=+1) の停止フロー: TurnRight → TurnRightBridge → RightIdle
// 左 (facingSign=-1) の停止フロー: StopWalk → Idle
function clipForState(state: AnimState, facingSign: -1 | 1): string {
  if (state === 'walking') return 'Walk';
  if (state === 'resuming') return 'ResumeWalk';
  if (state === 'stopping') return facingSign === +1 ? 'TurnRight' : 'StopWalk';
  if (state === 'finishing') return 'TurnRightBridge';
  // waiting: 右は RightIdle (右向きで揺れる)、左は Idle (正面で揺れる)
  return facingSign === +1 ? 'RightIdle' : 'Idle';
}
// 後方互換用のデフォルト (visibility-reset などで「左向きでの初期 waiting clip」を取るのに使う)
const STATE_TO_CLIP = {
  walking: 'Walk',
  stopping: 'StopWalk',
  waiting: 'Idle',
  resuming: 'ResumeWalk',
} as const;

type ScrollWalkCharacterProps = {
  glbPath: string;
  baseY?: number;
  scale?: number;
  sectionSelector: string;
  /** セクションが画面下にこの px 以内に近づいたら描画ON。default 100 */
  approachMarginPx?: number;
  /**
   * スクロール 1px ごとに進行方向へ動く world units。default 0.003。
   * 大きいほど「少しのスクロールで大きく進む」。
   */
  walkRate?: number;
  /**
   * Walk クリップ 1 サイクル分で進む world units（足滑り防止のキャリブレーション値）。
   * default 4.0。値を上げると同じ歩幅で大きく進む = 足の回転が遅く見える。
   * 値を下げると同じ歩幅で少ししか進まない = 足の回転が速く見える。
   * ブラウザで実機調整してフィットさせる。
   */
  stridePerCycle?: number;
  /** スクロール停止判定のデバウンス（ms）。default 200 */
  scrollStopMs?: number;
  /** クロスフェード秒数。default 0.2 */
  crossFadeDuration?: number;
  /**
   * 右を向く時の Y 回転（ラジアン）。default +Math.PI / 2（横向き、左側面がカメラ側）。
   */
  rotationFacingRight?: number;
  /** 左を向く時の Y 回転。default -Math.PI / 2（横向き、右側面がカメラ側） */
  rotationFacingLeft?: number;
  /** Y 回転の lerp 係数（毎フレーム適用、0..1）。default 0.1 */
  rotationLerp?: number;
  /**
   * セクションが書き込む scroll progress の CSS 変数名（例: '--service-progress'）。
   * 指定すると window scrollY 単独ではなく、この progress 変化を「歩いている時間帯」
   * の判定に使用する（state 遷移トリガー）。X 移動と walk timeScale は引き続き
   * window scroll delta ベース。
   */
  progressVar?: string;
  /**
   * キャラの初期 X 位置（world units）。default 0（画面中央）。
   * 負値で左寄せ、正値で右寄せ。
   */
  initialX?: number;
  /**
   * 一方向クリップ（StopWalk / ResumeWalk / TurnToSide）の再生速度倍率。
   * default 2.0（スクロール停止/再開のレスポンスを早くする）。
   * 1.0 で glb の元速度。3.0 だと急ぎ気味。
   */
  transitionSpeed?: number;
};

export default function ScrollWalkCharacter({
  glbPath,
  baseY = -2.0,
  scale = 0.6,
  sectionSelector,
  approachMarginPx = 100,
  walkRate = 0.003,
  stridePerCycle = 4.0,
  scrollStopMs = 200,
  crossFadeDuration = 0.2,
  rotationFacingRight = Math.PI / 2,
  rotationFacingLeft = -Math.PI / 2,
  rotationLerp = 0.1,
  progressVar,
  initialX = 0,
  transitionSpeed = 2.0,
}: ScrollWalkCharacterProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations: unifiedAnimations } = useGLTF(glbPath);
  // 「右歩きからの停止」専用の振り向きクリップ（Blender 側で 394-430F を抽出した glb）。
  // 同じスケルトン構造なので unified glb の clonedScene 上で問題なく再生できる。
  const { animations: turnRightAnimations } = useGLTF(
    '/models/arigatokunn_turn_right.glb',
  );
  const animations = useMemo(
    () => [...unifiedAnimations, ...turnRightAnimations],
    [unifiedAnimations, turnRightAnimations],
  );
  const clonedScene = useMemo(
    () => skeletonClone(scene) as THREE.Group,
    [scene],
  );
  const { actions } = useAnimations(animations, group);

  // 状態
  const stateRef = useRef<AnimState>('waiting');
  const sectionElRef = useRef<HTMLElement | null>(null);
  const lastScrollY = useRef(0);
  const scrollDeltaSinceFrame = useRef(0); // px since last frame
  const scrollStopTimerRef = useRef<number | null>(null);
  // Walk クリップの位相（cycles, fractional）。X 累積移動距離から算出して
  // walk.time に直接打ち込むことで「移動量と脚の回転」を phase-lock する。
  const walkPhaseRef = useRef(0);

  // 走行向き: -1 = 左歩き（scroll 下）、+1 = 右歩き（scroll 上）
  const facingSignRef = useRef<-1 | 1>(-1);
  // 走行向きに応じた target rotation Y。全 state で facingSign ベースに統一:
  //   facingSign === +1 → rotationFacingRight (+π/2)
  //   facingSign === -1 → rotationFacingLeft  (-π/2)
  // → 停止/待機中もその時の向きを維持し、右歩き Idle は左歩き Idle の鏡像になる。
  const targetRotYRef = useRef(rotationFacingLeft);
  // progress 連動モード用: 前フレームの progress 値
  const prevProgressRef = useRef(0);
  // セクション可視性の前フレーム状態（invisible→visible の境界でリセットするため）
  const wasVisibleRef = useRef(false);

  const { viewport } = useThree();

  // SkinnedMesh の frustumCulling 抑止
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

  // ループ設定 + 一方向クリップの LoopOnce 設定 + 初期 WaitingPose 再生
  useEffect(() => {
    (
      ['StopWalk', 'ResumeWalk', 'TurnToSide', 'TurnRight', 'TurnRightBridge'] as const
    ).forEach((name) => {
      const a = actions[name];
      if (a) {
        a.setLoop(THREE.LoopOnce, 1);
        a.clampWhenFinished = true;
      }
    });
    (['Idle', 'Walk', 'WaitingPose', 'RightIdle'] as const).forEach((name) => {
      const a = actions[name];
      if (a) {
        a.setLoop(THREE.LoopRepeat, Infinity);
      }
    });
    // 初期は Idle（揺れスタンバイ）
    const waiting = actions[STATE_TO_CLIP.waiting];
    if (waiting) {
      waiting.reset().play();
    }
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions]);

  // セクション要素を取得
  useEffect(() => {
    sectionElRef.current = document.querySelector(sectionSelector);
  }, [sectionSelector]);

  // 状態遷移ヘルパー
  const transitionRef = useRef<(next: AnimState) => void>(() => {});
  // 現在再生中のクリップ名（state とは別に持つ。stopping 時に方向で
  // StopWalk / TurnRight を出し分けるため、STATE_TO_CLIP 一律マップでは不足）。
  const currentClipNameRef = useRef<string>(STATE_TO_CLIP.waiting);
  useEffect(() => {
    const transition = (next: AnimState) => {
      const old = stateRef.current;
      if (old === next) return;

      const nextClipName = clipForState(next, facingSignRef.current);

      const oldAction = actions[currentClipNameRef.current];
      const newAction = actions[nextClipName];
      if (!newAction) return;

      newAction.reset();
      // 一方向クリップ（遷移アニメ）は transitionSpeed 倍速で再生する。
      // 右側の振り向きセット (TurnRight / TurnRightBridge) も左 (StopWalk / ResumeWalk) と
      // 同じく transitionSpeed を掛けて速度を揃える。
      const isTransitionClip =
        next === 'stopping' || next === 'resuming' || next === 'finishing';
      let timeScale = isTransitionClip ? transitionSpeed : 1;
      // RightIdle はクリップ尺 (15F=0.625s) が Idle (40F=1.667s) より短いため
      // そのまま再生すると揺れが速く見える。Idle の尺に揃える比率で減速する。
      if (
        next === 'waiting' &&
        nextClipName === 'RightIdle' &&
        actions['Idle']
      ) {
        const idleDur = actions['Idle'].getClip().duration;
        const rightIdleDur = newAction.getClip().duration;
        if (idleDur > 0 && rightIdleDur > 0) {
          timeScale = rightIdleDur / idleDur;
        }
      }
      newAction.setEffectiveTimeScale(timeScale);
      newAction.play();
      if (oldAction && oldAction !== newAction) {
        oldAction.crossFadeTo(newAction, crossFadeDuration, false);
      }
      // Walk は walking 中だけ mixer 自動進行を止めて time を手動制御する。
      // walking から抜ける時は paused を解除して、停止クリップへのクロスフェードで
      // 自然に脚が止まるようにする。
      const walkAction = actions['Walk'];
      if (walkAction) {
        if (next === 'walking') {
          walkAction.paused = true;
        } else if (old === 'walking') {
          walkAction.paused = false;
        }
      }

      stateRef.current = next;
      currentClipNameRef.current = nextClipName;

      // 一方向クリップは finish 後に次状態へ自動遷移
      if (
        next === 'stopping' ||
        next === 'resuming' ||
        next === 'finishing'
      ) {
        const mixer = newAction.getMixer();
        const handler = (e: { action: THREE.AnimationAction }) => {
          if (e.action !== newAction) return;
          mixer.removeEventListener(
            'finished',
            handler as unknown as THREE.EventListener<unknown, 'finished', THREE.AnimationMixer>,
          );
          if (stateRef.current === 'stopping') {
            // 右停止 (TurnRight 完了) → finishing (TurnRightBridge) → waiting
            // 左停止 (StopWalk 完了) → 直接 waiting
            if (facingSignRef.current === +1 && actions['TurnRightBridge']) {
              transition('finishing');
            } else {
              transition('waiting');
            }
          } else if (stateRef.current === 'finishing') {
            transition('waiting');
          } else if (stateRef.current === 'resuming') {
            transition('walking');
          }
        };
        mixer.addEventListener(
          'finished',
          handler as unknown as THREE.EventListener<unknown, 'finished', THREE.AnimationMixer>,
        );
      }
    };
    transitionRef.current = transition;
  }, [actions, crossFadeDuration, transitionSpeed]);

  // スクロールリスナー
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const onScroll = () => {
      const dy = window.scrollY - lastScrollY.current;
      scrollDeltaSinceFrame.current += dy;
      lastScrollY.current = window.scrollY;

      // 向き判定: 下スクロール（dy > 0）→ 左向き / 上スクロール（dy < 0）→ 右向き
      if (dy > 0) {
        facingSignRef.current = -1;
      } else if (dy < 0) {
        facingSignRef.current = +1;
      }

      // スクロール検知 → state 遷移
      // progressVar 指定時は useFrame の progress delta が walking 発火を担当するので
      // ここでは waiting→resuming は出さない（pin の card が動き出すまで character を待たせる）。
      if (!progressVar) {
        const s = stateRef.current;
        if (s === 'waiting') {
          transitionRef.current('resuming');
        }
      }

      // 停止判定タイマーをリセット
      if (scrollStopTimerRef.current !== null) {
        window.clearTimeout(scrollStopTimerRef.current);
      }
      scrollStopTimerRef.current = window.setTimeout(() => {
        if (stateRef.current === 'walking') {
          transitionRef.current('stopping');
        }
      }, scrollStopMs);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollStopTimerRef.current !== null) {
        window.clearTimeout(scrollStopTimerRef.current);
      }
    };
  }, [scrollStopMs, progressVar]);
  // Note: rotation の lerp 制御は useFrame 内で stateRef + facingSignRef を参照して
  // 決定するため、ここの deps に rotation 系プロップを入れる必要はない。

  // フレーム更新
  useFrame(() => {
    if (!group.current) return;

    // セクション可視性チェック
    const section = sectionElRef.current;
    if (section) {
      const rect = section.getBoundingClientRect();
      const isVisible =
        rect.bottom > -100 && rect.top < window.innerHeight + approachMarginPx;
      group.current.visible = isVisible;

      // invisible → visible の境界で character 全状態をリセット
      // （画面外に抜けたまま戻れない問題を防ぐ + 残留 scroll delta で位置がずれる問題を防ぐ）
      if (isVisible && !wasVisibleRef.current) {
        // 位置・回転・残留 scroll delta をリセット
        group.current.position.x = initialX;
        group.current.rotation.y = rotationFacingLeft;
        facingSignRef.current = -1;
        targetRotYRef.current = rotationFacingLeft;
        scrollDeltaSinceFrame.current = 0;
        prevProgressRef.current = 0;
        walkPhaseRef.current = 0;
        // state を waiting にスナップ（Idle 再生）
        Object.values(actions).forEach((a) => a?.stop());
        const w = actions[STATE_TO_CLIP.waiting];
        if (w) {
          w.reset();
          w.setEffectiveTimeScale(1);
          w.play();
        }
        stateRef.current = 'waiting';
        currentClipNameRef.current = STATE_TO_CLIP.waiting;
        // stop timer もクリア
        if (scrollStopTimerRef.current !== null) {
          window.clearTimeout(scrollStopTimerRef.current);
          scrollStopTimerRef.current = null;
        }
      }
      wasVisibleRef.current = isVisible;

      if (!isVisible) {
        // フレームごとに scroll delta をクリア
        scrollDeltaSinceFrame.current = 0;
        return;
      }

      // セクション中心追従で Y を調整
      const pixelToUnit = viewport.height / window.innerHeight;
      const sectionCenterY = rect.top + rect.height / 2;
      const viewportCenterY = window.innerHeight / 2;
      const yOffset = (viewportCenterY - sectionCenterY) * pixelToUnit;
      group.current.position.y = baseY + yOffset;
    }

    // ─── 回転制御 ───
    // 全 state で rotation は facingSign に従う。
    //   右 (facingSign=+1): +π/2 で固定（walking 中も停止 → Bridge → RightIdle 中もずっと右）
    //   左 (facingSign=-1): -π/2 で固定
    // 右側 Idle (RightIdle) はクリップ内の hips Y+90° / root Z-90° で「正面で揺れる」見え方が
    // 焼き込まれているので、group rotation を変えなくても正しく表示される。
    // 向きが変わるのは scroll 方向が反転した時の walking/resuming 中の lerp だけ。
    targetRotYRef.current =
      facingSignRef.current === +1 ? rotationFacingRight : rotationFacingLeft;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetRotYRef.current,
      rotationLerp,
    );

    // ─── タイミング判定: progress 連動モードでは pin 進行中だけ向き＆state 遷移を制御 ───
    if (progressVar && section) {
      const raw = getComputedStyle(section).getPropertyValue(progressVar).trim();
      const progress = parseFloat(raw) || 0;
      const prev = prevProgressRef.current;
      const delta = progress - prev;
      prevProgressRef.current = progress;
      if (Math.abs(delta) > 0.0001) {
        // progress の方向で向きを決める（target rotation は上の switch で反映）
        if (delta > 0) {
          facingSignRef.current = -1;
        } else {
          facingSignRef.current = +1;
        }
        // state: walking へ
        if (stateRef.current === 'waiting') {
          transitionRef.current('resuming');
        }
      }
    }

    // ─── X 位置 & Walk クリップ phase-lock: walking 状態の間は scroll delta ベース ───
    // pin 終了後も window scroll が続いていれば character は移動を続けて画面外へ抜ける。
    // Walk クリップは paused=true で mixer 自動進行を止めてあり、X 累積移動距離から
    // 算出した位相 (walkPhaseRef) を walk.time に毎フレーム打ち込むことで、足滑りを防ぐ。
    if (stateRef.current === 'walking') {
      const dy = scrollDeltaSinceFrame.current;
      const dx = -dy * walkRate;
      group.current.position.x += dx;

      const walk = actions['Walk'];
      if (walk) {
        // 移動方向に関わらず脚は常に前進サイクル（abs）。
        // 進む向きはキャラの facing rotation が担当する。
        walkPhaseRef.current += Math.abs(dx) / stridePerCycle;
        const dur = walk.getClip().duration;
        if (dur > 0) {
          walk.time = (walkPhaseRef.current % 1) * dur;
        }
      }
    }

    scrollDeltaSinceFrame.current = 0;
  });

  return (
    <group
      ref={group}
      position={[initialX, baseY, 0]}
      rotation={[0, rotationFacingLeft, 0]}
      scale={scale}
    >
      <primitive object={clonedScene} />
    </group>
  );
}
