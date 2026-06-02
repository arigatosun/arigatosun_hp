'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CompanyProfileSection from '@/components/ui/CompanyProfileSection';
import styles from './CompanyProfilePin.module.scss';

gsap.registerPlugin(ScrollTrigger);

// ── チューニング用定数（実機で微調整する） ──
// カードが中央に来た後、解除までに写真を固定し続ける追加スクロール量（「少し溜め」）。
const HOLD_PX = 140;

export default function CompanyProfilePin() {
  const pinRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    const image = imageRef.current;
    const card = cardRef.current;
    if (!pin || !image || !card) return;

    // モーション抑制設定では演出なし（通常スクロールのまま）。
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mm = gsap.matchMedia();

    // 全ビューポート対象。'(min-width: 1px)' は常に true（'all' は gsap.matchMedia で
    // コールバックが走らないことがあるため、確実にマッチするクエリを使う）。
    mm.add('(min-width: 1px)', () => {
      // 自然状態（ピン前）の写真下端とカード上端の重なり量（スクロール非依存）。
      const imgRect0 = image.getBoundingClientRect();
      const cardRect0 = card.getBoundingClientRect();
      const overlap = imgRect0.bottom - cardRect0.top;

      // カードが中央に来るまでのスクロール量（写真中心ピン開始からの相対）。
      const getRise = () =>
        Math.max(image.offsetHeight / 2 + card.offsetHeight / 2 - overlap, 0);

      const imagePin = ScrollTrigger.create({
        trigger: image,
        start: 'center center',
        // ピン長 = rise（中央まで）+ 溜め HOLD_PX + 抜け HOLD_PX。
        end: () => `+=${getRise() + HOLD_PX * 2}`,
        pin: image,
        // スペーサー無し＝写真を固定したまま会社概要が上を流れる。
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // カードの「中央での溜め」を transform で作る:
        //   rise 中 (scroll≤Sc)        : y=0（自然にせり上がる）
        //   溜め (Sc〜Sc+HOLD)          : y=scroll-Sc（中央に visually 固定＝止まる）
        //   抜け (Sc+HOLD〜Sc+2HOLD)    : y を 0 へ戻す（上へ抜けてフッターへ）
        onUpdate: (self) => {
          const Sc = self.start + getRise();
          const scroll = self.scroll();
          let y = 0;
          if (scroll <= Sc) y = 0;
          else if (scroll <= Sc + HOLD_PX) y = scroll - Sc;
          else if (scroll <= Sc + HOLD_PX * 2) y = Sc + HOLD_PX * 2 - scroll;
          else y = 0;
          gsap.set(card, { y });
        },
      });

      return () => {
        gsap.set(card, { y: 0 });
        imagePin.kill();
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div ref={pinRef} className={styles.pinWrap}>
      <div ref={imageRef} className={styles.imageArea} aria-hidden="true" />
      <div ref={cardRef} className={styles.cardMover}>
        <CompanyProfileSection />
      </div>
    </div>
  );
}
