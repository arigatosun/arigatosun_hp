'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ServiceSection.module.scss';
import ServiceCard from './ServiceCard';
import type { ServiceCardData } from './ServiceCard';
import Button from '@/components/ui/Button';

gsap.registerPlugin(ScrollTrigger);

const SERVICE_CARDS: ServiceCardData[] = [
  {
    id: 'ai-dev',
    category: 'AI / DEVELOPMENT',
    categoryLabel: 'AI・開発',
    title: 'AI / DEVELOPMENT',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW AI / DEVELOPMENT >',
    bgImage: '/images/top/backgroundcard.png',
  },
  {
    id: 'design-branding',
    category: 'DESIGN / BRANDING',
    categoryLabel: 'デザイン・ブランディング',
    title: 'DESIGN / BRANDING',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW DESIGN / BRANDING >',
    bgImage: '/images/top/backgroundcard.png',
  },
  {
    id: 'ip-creative',
    category: 'IP / CREATIVE',
    categoryLabel: 'IP・クリエイティブ',
    title: 'IP / CREATIVE',
    description:
      'ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。ここに簡易的な説明文が入ります。',
    viewLabel: 'VIEW IP / CREATIVE >',
    bgImage: '/images/top/backgroundcard.png',
  },
];

const MENU_ITEMS = [
  '・AI / DEVELOPMENT >',
  '・DESIGN / BRANDING >',
  '・IP / CREATIVE >',
];

export default function ServiceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const activeIndexRef = useRef(0);

  // DOM直接操作でアクティブメニューを切り替え（React再レンダリングを回避）
  const updateActiveMenu = useCallback((newIndex: number) => {
    if (activeIndexRef.current === newIndex) return;
    const menu = menuRef.current;
    if (!menu) return;

    const items = menu.children;
    const prevItem = items[activeIndexRef.current];
    const nextItem = items[newIndex];

    if (prevItem) prevItem.className = styles.menuItem;
    if (nextItem) nextItem.className = styles.menuItemActive;

    activeIndexRef.current = newIndex;
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // カードトラックの横スクロール量を計算（右側エリアの幅を基準）
    const getScrollAmount = () => {
      const rightArea = section.querySelector(`.${styles.right}`) as HTMLElement;
      const rightWidth = rightArea ? rightArea.offsetWidth : window.innerWidth * 0.62;
      return -(track.scrollWidth - rightWidth);
    };

    // GPU合成レイヤーに昇格
    gsap.set(track, { force3D: true });

    const tween = gsap.to(track, {
      x: getScrollAmount,
      ease: 'none',
      force3D: true,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${Math.max(track.scrollWidth, window.innerWidth)}`,
        pin: true,
        scrub: 1.2, // 滑らかな追従スクロール
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // スクロール進行率からアクティブなメニューを計算（DOM直接操作）
          const progress = self.progress;
          const menuCount = MENU_ITEMS.length;
          const newIndex = Math.min(
            Math.floor(progress * menuCount),
            menuCount - 1
          );
          updateActiveMenu(newIndex);
        },
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [updateActiveMenu]);

  return (
    <section className={styles.service} ref={sectionRef}>
      {/* 上部装飾マスク */}
      <div className={styles.decoTop}>
        <Image
          src="/images/top/uemask.png"
          alt=""
          width={1920}
          height={420}
          className={styles.decoImage}
          aria-hidden="true"
        />
      </div>

      <div className={styles.inner}>
        {/* 左側: sticky コンテンツ */}
        <div className={styles.left}>
          <div className={styles.leftContent}>
            <h2 className={styles.titleLogo}>
              <Image
                src="/images/top/servicetitlelogo.png"
                alt="サービス"
                width={203}
                height={47}
                className={styles.titleLogoImage}
              />
            </h2>
            <p className={styles.label}>SERVICE</p>

            <div className={styles.description}>
              <p>最先端のAI開発技術で、アイデアや理想を形に。</p>
              <p>デザイン・ブランディングで、世の中に届けるところまで。</p>
              <p>構想からリリースまで一気通貫で進めます。</p>
            </div>

            <ul className={styles.menuList} ref={menuRef}>
              {MENU_ITEMS.map((item, index) => (
                <li
                  key={item}
                  className={
                    index === 0 ? styles.menuItemActive : styles.menuItem
                  }
                >
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button href="/service">VIEW SERVICE &gt;</Button>
          </div>
        </div>

        {/* 右側: 横スクロールカード */}
        <div className={styles.right}>
          <div className={styles.cardsTrack} ref={trackRef}>
            {SERVICE_CARDS.map((card) => (
              <ServiceCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>

      {/* 下部装飾マスク */}
      <div className={styles.decoBottom}>
        <Image
          src="/images/top/sitamask.png"
          alt=""
          width={1920}
          height={420}
          className={styles.decoImage}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
