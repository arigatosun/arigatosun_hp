'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import styles from './HeroAnimation.module.scss';

// ── ロゴパネル定義 ──
const LOGO_PANELS = [
  { src: '/images/top/1.png', width: 500, height: 400, className: styles.panel1 },
  { src: '/images/top/2.png', width: 500, height: 400, className: styles.panel2 },
  { src: '/images/top/3.png', width: 480, height: 420, className: styles.panel3 },
  { src: '/images/top/4.png', width: 500, height: 400, className: styles.panel4 },
];

// ── 3フェーズモーション定義 ──
// 登場（enter）→ セトリング（settle）→ アイドル浮遊（idle）
const PANEL_MOTIONS = [
  {
    // パネル1: 最背面・左上 — 最初に登場、大きく回転しながら
    enter: { rotation: -12, duration: 8.0, ease: 'power1.out', delay: 0.5 },
    settle: { rotation: -15, duration: 2.5, ease: 'power1.inOut' },
    idle: { y: -15, rotation: -13.5, duration: 6.0, delay: 0 },
  },
  {
    // パネル2: 中央左 — 2番目に登場
    enter: { rotation: -5, duration: 7.5, ease: 'power1.out', delay: 1.0 },
    settle: { rotation: -8, duration: 2.2, ease: 'power1.inOut' },
    idle: { y: -18, rotation: -6.5, duration: 5.4, delay: 0.5 },
  },
  {
    // パネル3: 中央下 — 3番目に登場
    enter: { rotation: 3, duration: 8.0, ease: 'power1.out', delay: 1.3 },
    settle: { rotation: 5, duration: 2.5, ease: 'power1.inOut' },
    idle: { y: -12, rotation: 6, duration: 7.0, delay: 0.8 },
  },
  {
    // パネル4: 最前面・右下寄り — 最後に登場、最も柔らかく
    enter: { rotation: -1, duration: 7.2, ease: 'power1.out', delay: 1.7 },
    settle: { rotation: -3, duration: 2.5, ease: 'power1.inOut' },
    idle: { y: -20, rotation: -1.5, duration: 5.0, delay: 1.2 },
  },
];

export default function HeroAnimation() {
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const idleTweensRef = useRef<gsap.core.Tween[]>([]);

  // パネルを初期位置に配置し、即座にパネルアニメーションを開始
  useEffect(() => {
    panelRefs.current.forEach((panel) => {
      if (panel) {
        gsap.set(panel, {
          x: '-75vw',
          opacity: 0,
          scale: 0.85,
          y: 20,
          rotation: 0,
          force3D: true,
        });
      }
    });

    // パネルアニメーションを起動
    panelRefs.current.forEach((panel, index) => {
      if (!panel) return;
      const motion = PANEL_MOTIONS[index];
      const tl = gsap.timeline();

      const wobbleY = 12 + index * 3;
      const wobbleFreq = 3 + index * 0.5;

      tl.to(panel, {
        x: '10vw',
        opacity: 1,
        scale: 0.98,
        rotation: motion.enter.rotation,
        duration: motion.enter.duration,
        ease: motion.enter.ease,
        delay: motion.enter.delay,
        force3D: true,
        onUpdate: function () {
          const progress = this.progress();
          const dampen = 1 - progress * 0.7;
          const floatY = Math.sin(progress * Math.PI * wobbleFreq) * wobbleY * dampen;
          const scaleWobble = 1 - 0.03 * Math.sin(progress * Math.PI * (wobbleFreq + 1));
          gsap.set(panel, {
            y: floatY + (1 - progress) * 15,
            scaleX: 0.98 * scaleWobble,
            scaleY: 0.98 / scaleWobble,
          });
        },
      });

      tl.to(panel, { duration: 0.3 });

      tl.to(panel, {
        rotation: motion.settle.rotation,
        y: 0,
        scale: 1,
        scaleX: 1,
        scaleY: 1,
        duration: motion.settle.duration,
        ease: motion.settle.ease,
        force3D: true,
      });

      tl.call(() => {
        const idleTween = gsap.to(panel, {
          y: motion.idle.y,
          rotation: motion.idle.rotation,
          duration: motion.idle.duration,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: motion.idle.delay,
          force3D: true,
        });
        idleTweensRef.current.push(idleTween);
      });
    });

    return () => {
      idleTweensRef.current.forEach(tween => tween.kill());
      idleTweensRef.current = [];
      panelRefs.current.forEach(panel => {
        if (panel) gsap.killTweensOf(panel);
      });
    };
  }, []);

  return (
    <div className={styles.panels}>
      {LOGO_PANELS.map((panel, index) => (
        <div
          key={panel.src}
          ref={(el) => {
            panelRefs.current[index] = el;
          }}
          className={`${styles.panel} ${panel.className}`}
        >
          <Image
            src={panel.src}
            alt=""
            width={panel.width}
            height={panel.height}
            className={styles.panelImage}
            aria-hidden="true"
          />
        </div>
      ))}
    </div>
  );
}
