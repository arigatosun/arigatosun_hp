'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { members } from '@/data/members';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SectionHeader from '@/components/ui/SectionHeader';
import styles from './MemberSection.module.scss';

type MemberSectionProps = {
  variant?: 'grid' | 'slider';
};

export default function MemberSection({ variant = 'grid' }: MemberSectionProps) {
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // SP/PC判定（768px以上でマウスインタラクション有効）
  const isPC = useMediaQuery('(min-width: 768px)');

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;

    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--glow-x', `${glowX}%`);
    card.style.setProperty('--glow-y', `${glowY}%`);
  }, []);

  const handleMouseEnter = useCallback((_e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.classList.add(styles.cardHovered);
  }, []);

  const handleMouseLeave = useCallback((_e: React.MouseEvent<HTMLAnchorElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.classList.remove(styles.cardHovered);
    card.style.removeProperty('--rotate-x');
    card.style.removeProperty('--rotate-y');
    card.style.removeProperty('--glow-x');
    card.style.removeProperty('--glow-y');
  }, []);

  // カード1枚をレンダリングする共通関数
  const renderCard = (member: typeof members[number], index: number) => (
    <Link
      key={`${member.slug}-${index}`}
      href={`/about/member/${member.slug}`}
      ref={(el) => { cardRefs.current[index] = el; }}
      className={`${styles.card} ${variant === 'slider' ? styles.cardSlider : ''}`}
      onMouseMove={isPC ? (e) => handleMouseMove(e, index) : undefined}
      onMouseEnter={isPC ? (e) => handleMouseEnter(e, index) : undefined}
      onMouseLeave={isPC ? (e) => handleMouseLeave(e, index) : undefined}
    >
      <div className={styles.cardPhotoWrap}>
        {member.photo ? (
          <Image
            src={member.photo}
            alt={`${member.name} の写真`}
            width={231}
            height={231}
            className={styles.cardPhoto}
            sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 16vw"
          />
        ) : (
          <div className={styles.cardPhotoFallback} />
        )}
      </div>
      <p className={styles.cardRole}>{member.role}</p>
      <p className={styles.cardName}>{member.name}</p>
    </Link>
  );

  return (
    <section
      id="member"
      className={`${styles.section} ${variant === 'slider' ? styles.sectionSlider : ''}`}
    >
      {/* セクションタイトル */}
      <SectionHeader title="メンバー" subtitle="MEMBER" />

      {variant === 'grid' ? (
        // グリッドモード（ABOUTページ用）
        <div className={styles.grid}>
          {members.map((member, index) => renderCard(member, index))}
        </div>
      ) : (
        // スライダーモード（詳細ページ用）
        <div className={styles.sliderWrapper}>
          <div className={styles.sliderTrack}>
            {/* 元データ + 複製でシームレスループ */}
            {members.map((member, index) => renderCard(member, index))}
            {members.map((member, index) => renderCard(member, index + members.length))}
          </div>
        </div>
      )}
    </section>
  );
}
