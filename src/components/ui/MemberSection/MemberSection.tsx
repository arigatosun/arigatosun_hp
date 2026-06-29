'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { members, isMemberDetailReady } from '@/data/members';
import { useMediaQuery } from '@/lib/useMediaQuery';
import SectionHeader from '@/components/ui/SectionHeader';
import styles from './MemberSection.module.scss';

type MemberSectionProps = {
  variant?: 'grid' | 'slider';
};

export default function MemberSection({ variant = 'grid' }: MemberSectionProps) {
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  // SP/PC判定（768px以上でマウスインタラクション有効）
  const isPC = useMediaQuery('(min-width: 768px)');

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
  }, []);

  const handleMouseEnter = useCallback((_e: React.MouseEvent<HTMLElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.classList.add(styles.cardHovered);
  }, []);

  const handleMouseLeave = useCallback((_e: React.MouseEvent<HTMLElement>, index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;
    card.classList.remove(styles.cardHovered);
    card.style.removeProperty('--rotate-x');
    card.style.removeProperty('--rotate-y');
  }, []);

  // カード1枚をレンダリングする共通関数
  const renderCard = (member: typeof members[number], index: number) => {
    // 記入完了（本文あり）のメンバーだけクリックで遷移可能。未記入はクリック無効。
    const ready = isMemberDetailReady(member);

    const className = `${styles.card} ${
      variant === 'slider' ? styles.cardSlider : ''
    } ${ready ? '' : styles.cardDisabled}`;

    const inner = (
      <>
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
          {/* カラー版を上に重ねて hover でフェード表示（モノクロ → カラー） */}
          {member.photoColor && (
            <Image
              src={member.photoColor}
              alt=""
              aria-hidden="true"
              width={231}
              height={231}
              className={styles.cardPhotoColor}
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, 16vw"
            />
          )}
        </div>
        <p className={styles.cardRole}>{member.role}</p>
        <p className={styles.cardName}>{member.name}</p>
      </>
    );

    // 記入完了 → Link で遷移可能（ホバー演出あり）
    if (ready) {
      return (
        <Link
          key={`${member.slug}-${index}`}
          href={`/about/member/${member.slug}`}
          ref={(el) => {
            cardRefs.current[index] = el;
          }}
          className={className}
          onMouseMove={isPC ? (e) => handleMouseMove(e, index) : undefined}
          onMouseEnter={isPC ? (e) => handleMouseEnter(e, index) : undefined}
          onMouseLeave={isPC ? (e) => handleMouseLeave(e, index) : undefined}
        >
          {inner}
        </Link>
      );
    }

    // 未記入 → 非リンクの div（クリック無効・ホバー演出なし）
    return (
      <div
        key={`${member.slug}-${index}`}
        ref={(el) => {
          cardRefs.current[index] = el;
        }}
        className={className}
        aria-disabled="true"
      >
        {inner}
      </div>
    );
  };

  return (
    <section
      id="member"
      className={`${styles.section} ${variant === 'slider' ? styles.sectionSlider : ''}`}
    >
      {/* セクションタイトル（Figma node 1649:298718: 左にミニアリガトサンアイコン）*/}
      {/* slider variant では .section padding を 0 にしてトラックを viewport 端まで延ばすので、
          タイトルだけ専用 wrap で padding を再付与する */}
      <div className={variant === 'slider' ? styles.sliderTitleWrap : undefined}>
        <SectionHeader
          title="メンバー"
          subtitle="MEMBER"
          logo={{
            src: '/images/sections/about/member-icon.svg',
            alt: '',
            width: 61,
            height: 58,
          }}
        />
      </div>

      {variant === 'grid' ? (
        // グリッドモード（ABOUTページ用）
        <div className={styles.grid}>
          {members.map((member, index) => renderCard(member, index))}
        </div>
      ) : (
        // スライダーモード（詳細ページ用）
        <div className={styles.sliderWrapper}>
          <div className={styles.sliderTrack}>
            {/* 2 セット連結 → translateX(-50%) で 1 セット分シフトしてシームレスループ */}
            {members.map((member, index) => renderCard(member, index))}
            {members.map((member, index) =>
              renderCard(member, index + members.length),
            )}
          </div>
        </div>
      )}
    </section>
  );
}
