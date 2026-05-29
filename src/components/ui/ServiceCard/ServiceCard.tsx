'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { ServiceCardData } from '@/types/service';
import styles from './ServiceCard.module.scss';

type ServiceCardProps = {
  card: ServiceCardData;
};

export default function ServiceCard({ card }: ServiceCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // マウス座標 → CSS 変数 (--x, --y) でボタン位置を更新。
  // transform に transition を入れず、CSS 変数の更新だけで瞬時に追従する。
  // 入退場のフェード (opacity / scale) のみ別途 transition で「ふわっと」させる。
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = cardRef.current;
    const btn = buttonRef.current;
    if (!card || !btn) return;
    const rect = card.getBoundingClientRect();
    btn.style.setProperty('--x', `${e.clientX - rect.left}px`);
    btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  return (
    <Link
      ref={cardRef}
      href={`/service/${card.id}`}
      className={styles.card}
      aria-label={`${card.title} の詳細を見る`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* 背景: 動画 > 画像 > プレースホルダー の優先順 */}
      {card.bgVideo ? (
        <>
          <video
            className={styles.bgVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={card.bgVideo.poster}
            aria-hidden="true"
          >
            <source src={card.bgVideo.webm} type="video/webm" />
            <source src={card.bgVideo.mp4} type="video/mp4" />
          </video>
          {/* 下半分の黒色グラデーション（滑らかな暗化） */}
          <div className={styles.gradient} />
          {/* 細かいドット（ハーフトーン風）— 下に行くほど密度が増す */}
          <div className={styles.dots} aria-hidden="true" />
        </>
      ) : card.bgImage ? (
        <>
          <Image
            src={card.bgImage}
            alt={card.title}
            width={612}
            height={748}
            className={styles.bgImage}
          />
          <Image
            src="/images/sections/service/card-overlay.png"
            alt=""
            width={612}
            height={748}
            className={styles.overlay}
            aria-hidden="true"
          />
          <div className={styles.gradient} />
        </>
      ) : (
        <div className={styles.placeholder} aria-hidden="true" />
      )}

      {/* カード内コンテンツ */}
      <div className={styles.content}>
        {/* カード下部情報 */}
        <div className={styles.info}>
          <p className={styles.categoryLabel}>{card.categoryLabel}</p>
          <h3 className={styles.cardTitle}>{card.title}</h3>
          <p className={styles.cardDescription}>{card.description}</p>
        </div>
      </div>

      {/* VIEW マーカー（マウス追従カーソル）。PC のみ。
          mouseEnter で .viewButtonVisible を付与 → opacity / scale フェードで「ふわっと」表示。
          CSS 変数 --x / --y を mouseMove で更新 → transform で位置を即時反映。 */}
      <div
        ref={buttonRef}
        className={`${styles.viewButton} ${
          isHovered ? styles.viewButtonVisible : ''
        }`}
        aria-hidden="true"
      >
        <span
          className={`${styles.viewButtonLine} ${styles.viewButtonLineTop}`}
        >
          <span className={styles.viewButtonText}>VIEW</span>
        </span>
        <span
          className={`${styles.viewButtonLine} ${styles.viewButtonLineBottom}`}
        >
          <span className={styles.viewButtonText}>{card.title} &gt;</span>
        </span>
      </div>
    </Link>
  );
}
