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
      // 会社概要カードの中心が画面中央に来たら、カード自体を本当にピン固定
      // （position:fixed）して HOLD_PX ぶん静止＝「カチッ」と止まる。transform 補正
      // ではなく実ピンなのでブルブル震えない。pinSpacing:true なのでスペーサーで
      // 高さが確保され、解除時もジャンプせず、フッターが先に上がる問題も起きない。
      //
      // 写真は縦長のまま自然スクロールし、その上をカードがせり上がる（写真側のピンは
      // pinSpacing:false で高さが詰まりフッターが先行する不具合の原因になるため使わない）。
      const cardPin = ScrollTrigger.create({
        trigger: card,
        start: 'center center',
        end: () => `+=${HOLD_PX}`,
        pin: card,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      return () => cardPin.kill();
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
