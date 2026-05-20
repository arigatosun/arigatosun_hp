'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ServiceSection.module.scss';
import ServiceCard from '@/components/ui/ServiceCard';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import { SERVICE_CARDS, SERVICE_MENU_ITEMS } from '@/data/services';

gsap.registerPlugin(ScrollTrigger);

// スクロール連動の横スクロールアニメーションを有効にするフラグ
// true: アニメーション有効 / false: アニメーション停止（静的表示）
const ENABLE_SCROLL_ANIMATION = true;

export default function ServiceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  // -1 を初期値にして、スクロール開始時 (progress 0 → newIndex 0) で
  // 1項目目が明示的に active になるようにする（Phase 12 で初期 active 表示を廃止した整合）
  const activeIndexRef = useRef(-1);

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
    if (!ENABLE_SCROLL_ANIMATION) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    // gsap.matchMedia でPC時のみ横スクロールを有効化
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px)', () => {
      // 終了位置: 3カード（カードコンテンツ）の中心がビューポート中央と一致するよう
      // トラックを translateX する。画面幅に追従（invalidateOnRefresh で resize 対応）。
      const getScrollAmount = () => {
        const rightArea = section.querySelector(`.${styles.right}`) as HTMLElement | null;
        if (!rightArea) return 0;
        const rightRect = rightArea.getBoundingClientRect();
        // .cardsTrack の padding-right は最後のカード後の余白なので、
        // 中央寄せの対象（カード本体の幅）からは除外する
        const trackPaddingRight =
          parseFloat(getComputedStyle(track).paddingRight) || 0;
        const cardsContentWidth = track.scrollWidth - trackPaddingRight;
        const viewportWidth = window.innerWidth;
        const targetLeftX = (viewportWidth - cardsContentWidth) / 2;
        return targetLeftX - rightRect.left;
      };

      // GPU合成レイヤーに昇格
      gsap.set(track, { force3D: true });

      gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        force3D: true,
        scrollTrigger: {
          trigger: section,
          start: 'top 32px',
          end: () => `+=${Math.max(track.scrollWidth, window.innerWidth)}`,
          pin: true,
          scrub: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            // 左サイドバーをスクロール進行に合わせてフェード（戻りも自動で再生）
            section.style.setProperty('--service-progress', String(progress));
            // 左メニューの active 更新
            const menuCount = SERVICE_MENU_ITEMS.length;
            const newIndex = Math.min(
              Math.floor(progress * menuCount),
              menuCount - 1
            );
            updateActiveMenu(newIndex);
          },
        },
      });
    });

    return () => mm.revert();
  }, [updateActiveMenu]);

  return (
    <section className={styles.service} ref={sectionRef} data-section="service">
      {/* 上部装飾マスク */}
      <div className={styles.decoTop}>
        <Image
          src="/images/sections/service/mask-top.png"
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
            <SectionTitle
              src="/images/sections/service/title-logo.png"
              alt="サービス"
              width={203}
              height={47}
              label="SERVICE"
              className={styles.sectionTitle}
            />

            <div className={styles.description}>
              <p>最先端のAI開発技術で、アイデアや理想を形に。</p>
              <p>ブランディングで、世の中に届けるところまで。</p>
              <p>構想からリリースまで一気通貫で進めます。</p>
            </div>

            <ul className={styles.menuList} ref={menuRef}>
              {SERVICE_MENU_ITEMS.map((item) => (
                <li key={item} className={styles.menuItem}>
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
          src="/images/sections/service/mask-bottom.png"
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
