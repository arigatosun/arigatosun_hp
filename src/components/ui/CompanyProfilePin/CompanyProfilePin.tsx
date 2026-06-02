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

    // PC / SP 両方でピンさせる。
    // 写真だけを「中央」でピン固定する。固定している間、下の会社概要カードは
    // 通常スクロールで写真の上を中央まで自然にせり上がってくる（transform を使わ
    // ないので解除時のジャンプが出ない）。カードの中心が画面中央に来て少し溜めた
    // 位置で写真のピンを解除 → そのまま流れてフッターが見える。
    mm.add('all', () => {
      // 自然状態（ピン前）の写真下端とカード上端の重なり量（スクロール非依存）。
      const imgRect0 = image.getBoundingClientRect();
      const cardRect0 = card.getBoundingClientRect();
      const overlap = imgRect0.bottom - cardRect0.top;

      // 写真ピン開始（写真中心=画面中心）から、カード中心が画面中心へ来るまでの
      // スクロール量 R を寸法から算出し、そこに「溜め」HOLD_PX を足してピン長とする。
      const getEnd = () => {
        const imageH = image.offsetHeight;
        const cardH = card.offsetHeight;
        const rise = imageH / 2 + cardH / 2 - overlap; // カードが中央に来るまで
        return `+=${Math.max(rise, 0) + HOLD_PX}`;
      };

      const imagePin = ScrollTrigger.create({
        trigger: image,
        start: 'center center',
        end: getEnd,
        pin: image,
        // スペーサーを入れない＝写真を固定したまま、下の会社概要が上を流れて
        // 中央までせり上がる。解除時もスペーサー無しで継ぎ目が出にくい。
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      return () => imagePin.kill();
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
