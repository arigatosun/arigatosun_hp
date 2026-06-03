'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CompanyProfileSection from '@/components/ui/CompanyProfileSection';
import styles from './CompanyProfilePin.module.scss';

gsap.registerPlugin(ScrollTrigger);

// ── チューニング用定数（実機で微調整する） ──
// 会社概要カードが「下から中央までせり上がる」スクロール量。
const RISE_PX = 620;
// 中央に来た後、解除までに静止する「溜め」のスクロール量（はっきり止める）。
const HOLD_PX = 420;

/**
 * /about 最下部のスクロール演出。
 *
 * 写真（ZEROビル）＋会社概要カードを 1 つのラッパーごと pin で固定（pinSpacing:true）。
 * 固定中に会社概要カードだけを transform で下から中央へせり上げ、中央で HOLD_PX ぶん
 * 静止（カチッ）させてから解除し、フッターへ流す。
 *
 * - pinSpacing:true なのでスペーサーで高さが確保され、フッターが先に上がる不具合が出ない。
 * - 固定ラッパー内のカードを transform で動かすため、ネイティブスクロールとのズレ（ブレ）
 *   が出ず、溜めはカチッと静止する。
 * - カードの自然位置の中心を写真の中心に合わせておくので、解除時に transform=0＝中央の
 *   ままで通常フローへ連続し、ジャンプ・隙間が出ない。
 * - prefers-reduced-motion 時は演出なし（通常スクロール）。
 */
export default function CompanyProfilePin() {
  const pinRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pin = pinRef.current;
    const image = imageRef.current;
    const card = cardRef.current;
    if (!pin || !image || !card) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mm = gsap.matchMedia();
    // ピン演出は広い PC 限定（≥1280px）。1279px 以下では会社概要を縦積みに切り替える
    // ため（カードが縦長になりピン中央寄せが成立しない）、演出せず通常スクロールにする。
    mm.add('(min-width: 1280px)', () => {
      // カードの自然位置の「中心」を写真の「中心」に合わせる margin を当てる。
      // → ピン終了時に y=0 でカードが中央に居て、通常フローと連続する（解除でズレない）。
      // 見えるカード（#company-profile セクション）を基準に整列する。cardMover 直下の
      // セクションは負 margin で上にずれているため、cardMover ではなくセクションを測る。
      const visibleCard =
        (card.querySelector('#company-profile') as HTMLElement | null) ?? card;
      const alignCard = () => {
        card.style.marginTop = '0px';
        gsap.set(card, { y: 0 });
        const ir = image.getBoundingClientRect();
        const cr = visibleCard.getBoundingClientRect();
        const delta = ir.top + ir.height / 2 - (cr.top + cr.height / 2);
        card.style.marginTop = `${delta}px`;
        // 整列のため一瞬 y=0（中央＝高い位置）にしたので、開始位置（下）へ戻す。
        // これでピン前から常に「下にいる」状態になり、高い位置→下がる動きが出ない。
        gsap.set(card, { y: RISE_PX });
      };
      alignCard();

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: image,
          // 写真の中心が画面中央に来たら固定開始。
          start: 'center center',
          end: `+=${RISE_PX + HOLD_PX}`,
          pin, // ラッパー（写真＋カード）ごと固定
          pinSpacing: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: alignCard,
        },
      });
      // せり上がり: 下(+RISE_PX) → 中央(0)
      tl.fromTo(
        card,
        { y: RISE_PX },
        { y: 0, ease: 'none', duration: RISE_PX }
      );
      // 溜め: 中央(0)で静止。y:0→0 は no-op で消えるため、ダミーで時間だけ進める
      // （この間 card の y は 0 のまま＝中央で静止）。
      tl.to({}, { duration: HOLD_PX });

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(card, { y: 0 });
        card.style.marginTop = '';
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
