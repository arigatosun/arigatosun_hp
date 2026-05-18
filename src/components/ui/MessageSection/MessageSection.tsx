'use client';

import { Fragment, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { messageHeading, messageBody } from '@/data/message';
import styles from './MessageSection.module.scss';

gsap.registerPlugin(ScrollTrigger);

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

    const chars = section.querySelectorAll<HTMLElement>(`.${styles.char}`);
    if (chars.length === 0) return;

    // CSS変数から実カラー値を取得（カラーコードはハードコードしない）
    const rootStyles = getComputedStyle(document.documentElement);
    const colorWhite = rootStyles.getPropertyValue('--color-white').trim();
    const colorRed = rootStyles.getPropertyValue('--color-primary').trim();

    const ctx = gsap.context(() => {
      // 初期状態: 全文字 白
      gsap.set(chars, { color: colorWhite });

      // スクロール進行に合わせて 白→赤 を DOM順（左上→右下）に描画
      gsap.to(chars, {
        color: colorRed,
        ease: 'none',
        duration: 0.6,
        stagger: { each: 0.1, ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
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
