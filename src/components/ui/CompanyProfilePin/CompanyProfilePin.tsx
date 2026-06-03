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
      const overlap =
        image.getBoundingClientRect().bottom - card.getBoundingClientRect().top;
      const getRise = () =>
        Math.max(image.offsetHeight / 2 + card.offsetHeight / 2 - overlap, 0);

      // ① 写真ピン: 写真中心が画面中央に来たら、カードの溜め終わりまで固定（＝写真が
      // 中央で止まる）。pinSpacing:false で写真を固定したまま会社概要が上を流れる。
      const imagePin = ScrollTrigger.create({
        trigger: image,
        start: 'center center',
        end: () => `+=${getRise() + HOLD_PX}`,
        pin: image,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      // ② カードの溜め: カード中心が画面中央でカード自体を実ピン固定（カチッと静止）。
      // 写真ピンと同じ pinSpacing:false に揃え、スペーサー干渉によるフッター先行を避ける。
      const cardPin = ScrollTrigger.create({
        trigger: card,
        start: 'center center',
        end: () => `+=${HOLD_PX}`,
        pin: card,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      return () => {
        imagePin.kill();
        cardPin.kill();
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
