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

type AnimState = 'walking' | 'stopping' | 'waiting' | 'resuming';

const STATE_TO_CLIP: Record<AnimState, string> = {
  walking: 'Walk',
  stopping: 'StopWalk',
  waiting: 'WaitingPose',
  resuming: 'ResumeWalk',
};

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
   * スクロール velocity (px/ms) → Walk action.timeScale 換算係数。default 0.5。
   */
  velocityToTimeScale?: number;
  /** Walk timeScale の最小値（背景的に少し動かす）。default 0.4 */
  minWalkTimeScale?: number;
  /** Walk timeScale の最大値。default 2.0 */
  maxWalkTimeScale?: number;
  /** スクロール停止判定のデバウンス（ms）。default 200 */
  scrollStopMs?: number;
  /** クロスフェード秒数。default 0.2 */
  crossFadeDuration?: number;
  /**
   * 右を向く時の Y 回転（ラジアン）。default +Math.PI / 2（横向き、左側面がカメラ側）。
   * モデルの rotation.y=0 がカメラ正面向きという前提。
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
  velocityToTimeScale = 0.5,
  minWalkTimeScale = 0.4,
  maxWalkTimeScale = 2.0,
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
  const { scene, animations } = useGLTF(glbPath);
  const clonedScene = useMemo(
    () => skeletonClone(scene) as THREE.Group,
    [scene],
  );
  const { actions } = useAnimations(animations, group);

  // 状態
  const stateRef = useRef<AnimState>('waiting');
  const sectionElRef = useRef<HTMLElement | null>(null);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const scrollVelocityRef = useRef(0); // px / ms
  const scrollDeltaSinceFrame = useRef(0); // px since last frame
  const scrollStopTimerRef = useRef<number | null>(null);

  // 向き: -1 = 左向き（scroll 下時）、+1 = 右向き（scroll 上時）
  const facingSignRef = useRef<-1 | 1>(-1);
  // target rotation Y（向きに応じて切替）
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
    (['StopWalk', 'ResumeWalk', 'TurnToSide'] as const).forEach((name) => {
      const a = actions[name];
      if (a) {
        a.setLoop(THREE.LoopOnce, 1);
        a.clampWhenFinished = true;
      }
    });
    (['Idle', 'Walk', 'WaitingPose'] as const).forEach((name) => {
      const a = actions[name];
      if (a) {
        a.setLoop(THREE.LoopRepeat, Infinity);
      }
    });
    // 初期は WaitingPose（横向き立ち）
    const waiting = actions['WaitingPose'];
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
  useEffect(() => {
    const transition = (next: AnimState) => {
      const old = stateRef.current;
      if (old === next) return;
      const oldAction = actions[STATE_TO_CLIP[old]];
      const newAction = actions[STATE_TO_CLIP[next]];
      if (!newAction) return;

      newAction.reset();
      // 一方向クリップ（遷移アニメ）は transitionSpeed 倍速で再生
      const isTransitionClip =
        next === 'stopping' || next === 'resuming';
      newAction.setEffectiveTimeScale(isTransitionClip ? transitionSpeed : 1);
      newAction.play();
      if (oldAction && oldAction !== newAction) {
        oldAction.crossFadeTo(newAction, crossFadeDuration, false);
      }
      stateRef.current = next;

      // 一方向クリップは finish 後に次状態へ自動遷移
      if (next === 'stopping' || next === 'resuming') {
        const mixer = newAction.getMixer();
        const handler = (e: { action: THREE.AnimationAction }) => {
          if (e.action !== newAction) return;
          mixer.removeEventListener(
            'finished',
            handler as unknown as THREE.EventListener<unknown, 'finished', THREE.AnimationMixer>,
          );
          if (stateRef.current === 'stopping') transition('waiting');
          else if (stateRef.current === 'resuming') transition('walking');
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
    lastScrollTime.current = performance.now();

    const onScroll = () => {
      const now = performance.now();
      const dt = Math.max(now - lastScrollTime.current, 1);
      const dy = window.scrollY - lastScrollY.current;
      scrollVelocityRef.current = dy / dt;
      scrollDeltaSinceFrame.current += dy;
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;

      // 向き判定: 下スクロール（dy > 0）→ 左向き / 上スクロール（dy < 0）→ 右向き
      if (dy > 0) {
        facingSignRef.current = -1;
        targetRotYRef.current = rotationFacingLeft;
      } else if (dy < 0) {
        facingSignRef.current = +1;
        targetRotYRef.current = rotationFacingRight;
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
        scrollVelocityRef.current = 0;
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
  }, [scrollStopMs, rotationFacingLeft, rotationFacingRight, progressVar]);

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
        targetRotYRef.current = rotationFacingLeft;
        scrollDeltaSinceFrame.current = 0;
        prevProgressRef.current = 0;
        // state を waiting にスナップ（WaitingPose 再生）
        Object.values(actions).forEach((a) => a?.stop());
        const w = actions['WaitingPose'];
        if (w) {
          w.reset();
          w.setEffectiveTimeScale(1);
          w.play();
        }
        stateRef.current = 'waiting';
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

    // 回転を target に向けて smooth lerp（向きが変わると徐々に切り替わる）
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
        // progress の方向で向きを決める
        if (delta > 0) {
          targetRotYRef.current = rotationFacingLeft;
        } else {
          targetRotYRef.current = rotationFacingRight;
        }
        // state: walking へ
        if (stateRef.current === 'waiting') {
          transitionRef.current('resuming');
        }
      }
    }

    // ─── X 位置 & walk timeScale: walking 状態の間は常に scroll delta ベース ───
    // pin 終了後も window scroll が続いていれば character は移動を続けて画面外へ抜ける。
    if (stateRef.current === 'walking') {
      const walk = actions['Walk'];
      if (walk) {
        const velAbs = Math.abs(scrollVelocityRef.current);
        const ts = THREE.MathUtils.clamp(
          velAbs * velocityToTimeScale + minWalkTimeScale,
          minWalkTimeScale,
          maxWalkTimeScale,
        );
        walk.timeScale = ts;
      }
      const dy = scrollDeltaSinceFrame.current;
      const dx = -dy * walkRate;
      group.current.position.x += dx;
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
