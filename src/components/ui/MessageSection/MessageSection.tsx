'use client';

import { Fragment, useEffect, useRef } from 'react';
import { messageHeading, messageBody } from '@/data/message';
import styles from './MessageSection.module.scss';

/** 文字列を1文字ずつ span に分割（スクロール連動カラーリベール用） */
function splitChars(text: string) {
  return Array.from(text).map((ch, i) => (
    <span key={i} className={styles.char}>
      {ch}
    </span>
  ));
}

export default function MessageSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // reduced-motion: アニメーション無効（全文字 赤のまま表示）
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const chars = Array.from(
      section.querySelectorAll<HTMLElement>(`.${styles.char}`)
    );
    if (chars.length === 0) return;

    // CSS変数から実カラー値を取得（カラーコードはハードコードしない）
    const rootStyles = getComputedStyle(document.documentElement);
    const colorWhite = rootStyles.getPropertyValue('--color-white').trim();
    const colorRed = rootStyles.getPropertyValue('--color-primary').trim();

    // ── 各文字のリベール基準値 thresholds[i] ∈ (0,1) ──
    // 読み順に増加するが、視覚的な「行」ごとに次行を少し先行させる（改行フライング）。
    const FLY = 0.4; // 改行フライング率（次行は前行の 60% 進行地点で開始）
    let thresholds = new Array<number>(chars.length).fill(0);

    const measure = () => {
      // getBoundingClientRect の top で視覚的な「行」にグループ化
      const tops = chars.map((c) => c.getBoundingClientRect().top);
      const lineOf = new Array<number>(chars.length);
      const posOf = new Array<number>(chars.length);
      const lineLengths: number[] = [];
      let curTop = tops[0];
      let line = 0;
      let pos = 0;
      for (let i = 0; i < chars.length; i++) {
        if (i > 0 && Math.abs(tops[i] - curTop) > 4) {
          lineLengths[line] = pos;
          line += 1;
          pos = 0;
          curTop = tops[i];
        }
        lineOf[i] = line;
        posOf[i] = pos;
        pos += 1;
      }
      lineLengths[line] = pos;

      // 行ごとの開始 raw 値（前行長 ×(1-FLY) ずつ進める＝行が重なって先行する）
      const lineStart: number[] = [];
      let acc = 0;
      for (let L = 0; L < lineLengths.length; L++) {
        lineStart[L] = acc;
        acc += lineLengths[L] * (1 - FLY);
      }

      const raw = chars.map((_, i) => lineStart[lineOf[i]] + posOf[i]);
      const maxRaw = Math.max(...raw);
      // 0 と 1 に張り付かないよう正規化（progress 0 で全白・1 で全赤になる）
      thresholds = raw.map((v) => (v + 0.5) / (maxRaw + 1));
    };

    // 直近に適用した状態（0=白 / 1=赤）。変化した文字だけ書き換える。
    const state = new Array<number>(chars.length).fill(-1);
    let rafId = 0;

    const paint = () => {
      rafId = 0;
      const vh = window.innerHeight;
      const topRatio = section.getBoundingClientRect().top / vh;
      // section上端が画面下から85%で progress=0、上に0.55画面分 抜けた時点で1
      let prog = (0.85 - topRatio) / 1.4;
      prog = prog < 0 ? 0 : prog > 1 ? 1 : prog;

      // スクロールに双方向連動: 基準値を超えた文字は赤、未満は白。
      // グラデーションなし＝1文字ごとにくっきり切り替わる。
      for (let i = 0; i < chars.length; i++) {
        const next = prog >= thresholds[i] ? 1 : 0;
        if (next !== state[i]) {
          state[i] = next;
          chars[i].style.color = next ? colorRed : colorWhite;
        }
      }
    };

    const schedule = () => {
      if (!rafId) rafId = requestAnimationFrame(paint);
    };
    const onResize = () => {
      measure();
      paint();
    };

    measure();
    paint();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', onResize);

    // フォント遅延ロードで行の折り返しが変わった後に再計測する
    let cancelled = false;
    if (document.fonts) {
      document.fonts.ready.then(() => {
        if (!cancelled) onResize();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.message}>
      {/* RISE WITH THANKS. */}
      <h2 className={styles.heading}>{splitChars(messageHeading)}</h2>

      {/* メッセージ本文 */}
      <p className={styles.body}>
        {messageBody.map((para, i) => (
          <Fragment key={i}>
            {splitChars(para)}
            {i < messageBody.length - 1 && <br />}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
