'use client';

import { useEffect, useRef } from 'react';
import styles from './SlimeGlow.module.scss';

type SlimeGlowProps = {
  /** ベースカラー (16進) */
  color?: string;
  /** ブロブの基本半径 (canvas 短辺に対する比率)。既定 0.3 */
  radiusRatio?: number;
  /** カーソル追従の最大ブレンド係数 (0-1)。1=カーソル直接, 0=自律ドリフトのみ。既定 0.85 */
  cursorBlend?: number;
  /** カーソル離脱後にカーソル影響が消えるまでの時間 (ms)。既定 800 */
  releaseMs?: number;
  /** バネ追従速度 (0-1, 大きいほど機敏)。既定 0.045 */
  followSpeed?: number;
  /** 自律ドリフト速度。既定 0.00018 */
  driftSpeed?: number;
  /** 最大透明度 (0-1)。各サブブロブ単体の値。重ね合わせで濃く見えるため低めに。既定 0.16 */
  maxOpacity?: number;
  /** サブブロブ数。既定 9 */
  subBlobCount?: number;
  /**
   * コア部分のブースト係数 (1 で均一、1.5 で中心が 1.5 倍明るい)。濃淡を強める。
   * 既定 1.6
   */
  coreBoost?: number;
  /**
   * グラデーションの落ち方の鋭さ (1 = リニア, 2-3 = 中心が明るくエッジが薄い)。
   * 既定 2.2
   */
  gradientFalloff?: number;
  /**
   * サブブロブ毎の強度バラつき (0 で全て同じ、1 で大きくばらつく)。
   * 既定 0.55
   */
  intensityVariance?: number;
  /**
   * 呼吸 (breath) アニメの速さ。小さいほどゆっくり大小を繰り返す。
   * 既定 0.00025 (約 25 秒で 1 サイクル)
   */
  breathSpeed?: number;
  /**
   * 呼吸の振幅 (基準サイズの ±N 倍率)。0=変化なし / 0.3=±30% 変動。
   * 既定 0.25
   */
  breathAmount?: number;
};

/**
 * 生命感のある不定形グロー。
 * - 各サブブロブは独立した位相 / 半径 / オフセットを持ち、非対称な「アメーバ」状の形を作る
 * - 何もしなくても自律的に canvas 内をふわふわ漂う
 * - カーソルが canvas に入ると、追従ターゲットがカーソル位置へブレンド
 * - カーソルが出ると、現在位置から自然なドリフトへ戻る（跳ね返り無し）
 */
export default function SlimeGlow({
  color = '#DA2719',
  radiusRatio = 0.3,
  cursorBlend = 0.85,
  releaseMs = 800,
  followSpeed = 0.045,
  driftSpeed = 0.00018,
  maxOpacity = 0.16,
  subBlobCount = 9,
  coreBoost = 1.6,
  gradientFalloff = 2.2,
  intensityVariance = 0.55,
  breathSpeed = 0.00025,
  breathAmount = 0.25,
}: SlimeGlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // hex → rgb
    const hex = color.replace('#', '');
    const full = hex.length === 3 ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] : hex;
    const cr = parseInt(full.slice(0, 2), 16);
    const cg = parseInt(full.slice(2, 4), 16);
    const cb = parseInt(full.slice(4, 6), 16);

    let w = 0;
    let h = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // ── サブブロブ群: 各々が独立した個性を持つ ──
    type SubBlob = {
      // 中心からの基本オフセット角度（等分配ではなく不規則）
      baseAngle: number;
      // 中心からの基本距離係数 (0.2 - 1.0)
      baseDistance: number;
      // サイズ係数 (0.4 - 1.0)
      sizeFactor: number;
      // 揺らぎの位相と速度（各々ランダム）
      phase: number;
      phaseSpeed: number;
      // オフセット距離の揺れ振幅 (0.4 - 1.0)
      jitterAmp: number;
      // サイズの揺れ振幅 (0.1 - 0.3)
      sizeJitter: number;
      // 強度係数 (intensityVariance に応じて 1 ± variance/2 でバラつく)
      // 1 より大きい sub-blob は明るく、小さいと淡い → 濃淡が生まれる
      intensity: number;
    };

    function buildSubBlobs(): SubBlob[] {
      return Array.from({ length: subBlobCount }).map((_, i) => {
        // 角度はランダム + わずかな等間隔バイアスでバランス
        const angle = (i / subBlobCount) * Math.PI * 2 + (Math.random() - 0.5) * 1.2;
        // 強度バラつき: 1 ± intensityVariance/2 の範囲
        const intensity = 1 + (Math.random() - 0.5) * intensityVariance;
        return {
          baseAngle: angle,
          // 0.0-0.55: 中央寄りだが多少散らして不規則さを残す
          baseDistance: Math.random() * 0.55,
          // サイズは大きめに揃えて重なりで一塊感を出す
          sizeFactor: 0.65 + Math.random() * 0.35, // 0.65-1.0
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.0006 + Math.random() * 0.0012,
          // ジッターをやや戻して有機的な揺らぎを復活
          jitterAmp: 0.2 + Math.random() * 0.35, // 0.2-0.55
          sizeJitter: 0.12 + Math.random() * 0.15,
          intensity,
        };
      });
    }

    const subBlobs = buildSubBlobs();

    // ── 自律ドリフトターゲット（Lissajous 風） ──
    // 異なる周期の sin/cos を組み合わせて閉じない曲線軌道を生成
    const driftSeed = {
      ax: 0.3 + Math.random() * 0.2,
      ay: 0.3 + Math.random() * 0.2,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2,
      // 異なる周波数を組み合わせて閉じない複雑な軌道
      freqXa: 1.0,
      freqXb: 0.41,
      freqYa: 0.83,
      freqYb: 1.27,
    };

    function driftTarget(time: number) {
      const t = time * driftSpeed;
      // 異なる周波数の sin の重ね合わせで複雑な軌道
      const nx =
        0.5 +
        driftSeed.ax * Math.sin(t * driftSeed.freqXa + driftSeed.px) * 0.6 +
        driftSeed.ax * 0.4 * Math.sin(t * driftSeed.freqXb + driftSeed.py * 1.3);
      const ny =
        0.5 +
        driftSeed.ay * Math.cos(t * driftSeed.freqYa + driftSeed.py) * 0.6 +
        driftSeed.ay * 0.4 * Math.cos(t * driftSeed.freqYb + driftSeed.px * 0.7);
      return { x: nx * w, y: ny * h };
    }

    // ── 状態 ──
    let bx = w * 0.5;
    let by = h * 0.5;
    let cursorX: number | null = null;
    let cursorY: number | null = null;
    // カーソル影響度 (0=ドリフトのみ / 1=カーソル直結) を時間で滑らかに減衰
    let cursorWeight = 0;
    let lastCursorAt = -Infinity;

    function onMouseMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      if (inside) {
        cursorX = e.clientX - rect.left;
        cursorY = e.clientY - rect.top;
        lastCursorAt = performance.now();
      }
      // 範囲外でも cursorX/Y は前回値のまま保持 (cursorWeight が時間で減衰)
    }

    function onMouseLeave() {
      // window mouseleave (タブ切り替え等) で即座に重みを失わせる必要は無い。
      // 何もしないで cursorWeight の自然減衰に任せる
    }

    function onTouchMove(e: TouchEvent) {
      const t = e.targetTouches[0];
      if (!t) return;
      const rect = canvas!.getBoundingClientRect();
      const inside =
        t.clientX >= rect.left &&
        t.clientX <= rect.right &&
        t.clientY >= rect.top &&
        t.clientY <= rect.bottom;
      if (inside) {
        cursorX = t.clientX - rect.left;
        cursorY = t.clientY - rect.top;
        lastCursorAt = performance.now();
      }
    }

    const ro = new ResizeObserver(() => {
      const oldW = w;
      const oldH = h;
      resize();
      if (oldW > 0) bx = (bx / oldW) * w;
      if (oldH > 0) by = (by / oldH) * h;
    });
    ro.observe(canvas);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    function draw(time: number) {
      const short = Math.min(w, h);
      // 呼吸: 全体サイズが sin でゆっくり ±breathAmount 変動
      const breathScale = 1 + Math.sin(time * breathSpeed) * breathAmount;
      const baseRadius = short * radiusRatio * breathScale;

      // ── ターゲット位置決定 ──
      const drift = driftTarget(time);
      // カーソル影響度を時間で更新（離れてから releaseMs かけて 0 へ）
      const sinceCursor = performance.now() - lastCursorAt;
      const targetWeight =
        cursorX !== null && cursorY !== null
          ? Math.max(0, 1 - sinceCursor / releaseMs)
          : 0;
      // 滑らかに補間（急激な切替を避ける）
      cursorWeight += (targetWeight - cursorWeight) * 0.06;

      // 実ターゲット = ドリフト + カーソル方向ブレンド
      let tx = drift.x;
      let ty = drift.y;
      if (cursorX !== null && cursorY !== null && cursorWeight > 0.01) {
        const blend = cursorWeight * cursorBlend;
        tx = drift.x * (1 - blend) + cursorX * blend;
        ty = drift.y * (1 - blend) + cursorY * blend;
      }

      // バネで滑らかに追従
      bx += (tx - bx) * followSpeed;
      by += (ty - by) * followSpeed;

      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = 'lighter';

      // ── 各サブブロブを独立して描画 ──
      for (const s of subBlobs) {
        // 各サブブロブは独立した位相で自分の軌道を持つ
        const localT = time * s.phaseSpeed + s.phase;
        // 角度方向と垂直方向に異なる sin を入れて、楕円ではなく不規則な軌道に
        const angle = s.baseAngle + Math.sin(localT * 0.7) * 0.6;
        // 距離も揺らぐ
        const distR = baseRadius * s.baseDistance * (1 + Math.sin(localT) * s.jitterAmp * 0.5);
        // 各サブブロブの位置
        const sx = bx + Math.cos(angle) * distR;
        const sy = by + Math.sin(angle) * distR;
        // 半径も揺らぐ
        const r = baseRadius * s.sizeFactor * (1 + Math.sin(localT * 1.3 + 1.0) * s.sizeJitter);

        // 個別の濃淡: コア部分を coreBoost で持ち上げ、エッジに向けて
        // gradientFalloff の冪乗で急速に減衰させる
        const peak = maxOpacity * s.intensity * coreBoost;
        const mid = maxOpacity * s.intensity * Math.pow(0.5, gradientFalloff);
        const grad = ctx!.createRadialGradient(sx, sy, 0, sx, sy, r);
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${peak})`);
        // 中心付近 (10%) に明るいコアを残してから急速に薄くする
        grad.addColorStop(0.15, `rgba(${cr}, ${cg}, ${cb}, ${maxOpacity * s.intensity})`);
        grad.addColorStop(0.5, `rgba(${cr}, ${cg}, ${cb}, ${mid})`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(sx, sy, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [
    color,
    radiusRatio,
    cursorBlend,
    releaseMs,
    followSpeed,
    driftSpeed,
    maxOpacity,
    subBlobCount,
    coreBoost,
    gradientFalloff,
    intensityVariance,
    breathSpeed,
    breathAmount,
  ]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
