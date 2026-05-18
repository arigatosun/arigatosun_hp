'use client';

import { useEffect, useRef } from 'react';
import styles from './RevealText.module.scss';

type RevealTextProps = {
  children: React.ReactNode;
  className?: string;
};

export default function RevealText({ children, className }: RevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // キューと再生状態は effect スコープ内に閉じる
    const queue: HTMLElement[] = [];
    let isPlaying = false;

    // function 宣言は巻き上げられるため、再帰（自己参照）を安全に書ける
    function playNext() {
      if (queue.length === 0) {
        isPlaying = false;
        return;
      }

      isPlaying = true;
      const line = queue.shift()!;

      // requestAnimationFrameでブラウザの描画タイミングに同期
      requestAnimationFrame(() => {
        line.classList.add(styles.revealed);
      });

      // 次の行を一定間隔後にアニメーション
      setTimeout(playNext, 600);
    }

    function enqueue(el: HTMLElement) {
      queue.push(el);
      if (!isPlaying) {
        playNext();
      }
    }

    const lines = container.querySelectorAll(`.${styles.line}`);

    const observer = new IntersectionObserver(
      (entries) => {
        // 上から順にアニメーションするためDOM順でソート
        const sorted = [...entries]
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        sorted.forEach((entry) => {
          enqueue(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    lines.forEach((line) => observer.observe(line));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

type RevealBlockProps = {
  children: React.ReactNode;
  className?: string;
};

export function RevealBlock({ children, className }: RevealBlockProps) {
  return (
    <div className={`${styles.block} ${className || ''}`}>
      {children}
    </div>
  );
}

type RevealLineProps = {
  children: React.ReactNode;
};

export function RevealLine({ children }: RevealLineProps) {
  return (
    <span className={styles.line}>
      <span className={styles.lineInner}>{children}</span>
      <span className={styles.mask} />
    </span>
  );
}
