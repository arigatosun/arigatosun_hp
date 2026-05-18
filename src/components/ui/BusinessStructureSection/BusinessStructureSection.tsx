'use client';

import { useRef, useCallback } from 'react';
import Image from 'next/image';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SectionHeader from '@/components/ui/SectionHeader';
import styles from './BusinessStructureSection.module.scss';

export default function BusinessStructureSection() {
  const glowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // SP/PC判定（768px以上でマウスインタラクション有効）
  const isPC = useMediaQuery('(min-width: 768px)');

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (glowRef.current) {
      glowRef.current.style.left = `${x}px`;
      glowRef.current.style.top = `${y}px`;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    // DOM直接操作でクラスを切り替え（React再レンダリングを回避）
    if (glowRef.current) {
      glowRef.current.classList.remove(styles.floating);
      glowRef.current.classList.add(styles.hovering);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) {
      // クラスを浮遊モードに戻す
      glowRef.current.classList.remove(styles.hovering);
      glowRef.current.classList.add(styles.floating);
      // インラインスタイルを削除してCSSデフォルト位置に戻す
      glowRef.current.style.removeProperty('left');
      glowRef.current.style.removeProperty('top');
    }
  }, []);

  return (
    <section className={styles.section}>
      {/* 左側: タイトル + 説明テキスト */}
      <div className={styles.left}>
        <SectionHeader
          logo={{
            src: '/images/sections/about/title-sun.png',
            alt: '',
            width: 56,
            height: 56,
          }}
          title="事業領域と連携体制"
          subtitle="BUSINESS STRUCTURE"
        />

        <p className={styles.body}>
          アリガトサンの事業を牽引する4つのコア領域と、連携体制を示す図です。
          「開発」「デザイン」「IP創出」「セールス」の各領域は、それぞれが独立して極めてクオリティの高い価値を提供する専門集団です。その圧倒的な個の力をベースとしながら、プロジェクトに応じて領域間や外部パートナー・アドバイザーとシームレスに連携することで、あらゆるビジネス課題に対し、より高度で包括的なソリューションを実現します。
        </p>
      </div>

      {/* 右側: 連携体制図 + ヒートマップ */}
      <div
        ref={containerRef}
        className={styles.right}
        onMouseMove={isPC ? handleMouseMove : undefined}
        onMouseEnter={isPC ? handleMouseEnter : undefined}
        onMouseLeave={isPC ? handleMouseLeave : undefined}
      >
        <Image
          src="/images/sections/about/structure-layer.png"
          alt="事業領域と連携体制図"
          width={640}
          height={640}
          className={styles.structureImage}
        />
        {/* ヒートマップグロー */}
        <div
          ref={glowRef}
          className={`${styles.heatmapGlow} ${styles.floating}`}
        />
      </div>
    </section>
  );
}
