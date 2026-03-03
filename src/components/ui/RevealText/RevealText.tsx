'use client';

import { useEffect, useRef, useCallback } from 'react';
import styles from './RevealText.module.scss';

type RevealTextProps = {
  children: React.ReactNode;
  className?: string;
};

export default function RevealText({ children, className }: RevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef<HTMLElement[]>([]);
  const isPlayingRef = useRef(false);

  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const line = queueRef.current.shift()!;
    line.classList.add(styles.revealed);

    // 次の行を一定間隔後にアニメーション
    setTimeout(() => playNext(), 600);
  }, []);

  const enqueue = useCallback((el: HTMLElement) => {
    queueRef.current.push(el);
    if (!isPlayingRef.current) {
      playNext();
    }
  }, [playNext]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const lines = container.querySelectorAll(`.${styles.line}`);

    const observer = new IntersectionObserver(
      (entries) => {
        // 上から順にアニメーションするためDOM順でソート
        const sorted = [...entries]
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const aTop = a.boundingClientRect.top;
            const bTop = b.boundingClientRect.top;
            return aTop - bTop;
          });

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
  }, [enqueue]);

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
