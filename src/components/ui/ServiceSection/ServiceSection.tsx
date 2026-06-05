'use client';

import { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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

    // gsap.matchMedia でPC時のみ横スクロールを有効化（SP=〜1023px は縦積みのため除外）
    const mm = gsap.matchMedia();

    mm.add('(min-width: 1024px)', () => {
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

      // pin 後のタイムラインを3区間に分ける:
      //  ① 開始待機 : 横スクロールしない待機（モチーフ入場アニメの完了待ち）
      //  ② 横移動   : カードが中央に揃うまでの横スクロール本体
      //  ③ 末尾静止 : 3枚が揃った状態のまま静止する末尾の「間（ま）」
      //               ここで pin を保持し、揃ったカードを確認できるようにしてから下へ抜ける。
      //
      // 各区間の「長さ」は横移動量(animPx)に対する相対比で定義する。こうすると末尾静止を
      // 足しても開始待機の実スクロール量が変わらない（総量基準だと連動して伸びてしまう）。
      // 開始待機は既存の挙動（横移動量の 0.25 倍）を維持。末尾静止のみ新規追加。
      const START_HOLD = 0.25; // 開始待機 ÷ 横移動量（既存と同じ。変更すると開始が伸縮）
      const END_HOLD = 0.6; // 末尾静止 ÷ 横移動量（新規。揃った後の「間」の長さ）
      const SPAN = START_HOLD + 1 + END_HOLD; // 横移動を 1 とした全体の相対量
      const DELAY_RATIO = START_HOLD / SPAN;
      const MOVE_RATIO = 1 / SPAN;
      const MOVE_END = DELAY_RATIO + MOVE_RATIO;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 32px',
          // 横移動分(animPx)を MOVE_RATIO に割り当てた end。
          // 開始待機・末尾静止のぶんも合算した総スクロール量になる。
          end: () => {
            const animPx =
              Math.max(track.scrollWidth, window.innerWidth) / 2;
            return `+=${animPx / MOVE_RATIO}`;
          },
          pin: true,
          // 追従の遅延も半分に短縮（より機敏な反応）
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const totalProgress = self.progress;
            // 開始待機中は animProgress=0、移動区間で 0→1、末尾静止は 1 に張り付き
            const progress =
              totalProgress < DELAY_RATIO
                ? 0
                : totalProgress > MOVE_END
                  ? 1
                  : (totalProgress - DELAY_RATIO) / MOVE_RATIO;
            section.style.setProperty('--service-progress', String(progress));

            // 全カードの合算カバー率が COVERAGE_THRESHOLD を超えた瞬間に左カラムを
            // 即座に非表示。カード1枚 (612px) では leftContent (721px) を完全に
            // 覆えないため、2枚目が右側に乗り上げてきて合算で約 95% 以上を覆った
            // タイミング = ユーザーの「完全に重なってから消える」基準に合わせる。
            // カード間の 16px ギャップは原理的に常に残るので、上限は ~97.8%。
            const leftContentEl = section.querySelector<HTMLElement>(
              `.${styles.leftContent}`
            );
            const cards = leftContentEl
              ? (Array.from(track.children) as HTMLElement[])
              : [];
            if (leftContentEl && cards.length) {
              const contentRect = leftContentEl.getBoundingClientRect();
              // 各カードと leftContent の交差区間を求める
              const intervals: Array<[number, number]> = [];
              for (const card of cards) {
                const r = card.getBoundingClientRect();
                const l = Math.max(r.left, contentRect.left);
                const rt = Math.min(r.right, contentRect.right);
                if (rt > l) intervals.push([l, rt]);
              }
              // ソートしてマージ → 合算カバー幅
              intervals.sort((a, b) => a[0] - b[0]);
              let covered = 0;
              let curStart = -Infinity;
              let curEnd = -Infinity;
              for (const [s, e] of intervals) {
                if (s > curEnd) {
                  if (curEnd > curStart) covered += curEnd - curStart;
                  curStart = s;
                  curEnd = e;
                } else if (e > curEnd) {
                  curEnd = e;
                }
              }
              if (curEnd > curStart) covered += curEnd - curStart;

              const COVERAGE_THRESHOLD = 0.95;
              const coverageRatio = covered / contentRect.width;
              section.style.setProperty(
                '--left-hidden',
                coverageRatio > COVERAGE_THRESHOLD ? '1' : '0'
              );
            }

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

      // ① 開始待機セグメント（横スクロールしない）— 全体の DELAY_RATIO 分
      tl.to({}, { duration: DELAY_RATIO });
      // ② 実際の横スクロール — MOVE_RATIO 分
      tl.to(track, {
        x: getScrollAmount,
        ease: 'none',
        force3D: true,
        duration: MOVE_RATIO,
      });
      // ③ 末尾の静止セグメント（揃った状態のまま）— 残りの END_HOLD/SPAN 分
      tl.to({}, { duration: END_HOLD / SPAN });
    });

    // SP(≤1023px): 縦版「文字にかぶさる」演出。
    // 文字ブロック(.left)を position:sticky で画面上部に貼り付け、その上を不透明なカード
    // (.right z-index 上)が縦スクロールで覆っていく（＝PC の横スクロールの縦版）。
    // 文字の消し方は PC と同じく「カードに覆われた瞬間に一気に非表示」（段階フェード＝グラデは行わない）。
    // 一度覆われたら latch して、カードが上へ抜けても再表示しない（セクション先頭へ戻すと復帰）。
    mm.add('(max-width: 1023px)', () => {
      const leftContentEl = section.querySelector<HTMLElement>(`.${styles.leftContent}`);
      if (!leftContentEl) return;

      let covered = false;
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // セクション先頭付近まで戻したら latch 解除（カードが退いた状態で文字を復帰）
          if (self.progress <= 0.05) covered = false;

          // カード群が leftContent を縦方向にどれだけ覆っているか（重なり区間をマージして合算）
          const contentRect = leftContentEl.getBoundingClientRect();
          const cards = Array.from(track.children) as HTMLElement[];
          const intervals: Array<[number, number]> = [];
          for (const card of cards) {
            const r = card.getBoundingClientRect();
            const t = Math.max(r.top, contentRect.top);
            const b = Math.min(r.bottom, contentRect.bottom);
            if (b > t) intervals.push([t, b]);
          }
          intervals.sort((a, b) => a[0] - b[0]);
          let cov = 0;
          let curStart = -Infinity;
          let curEnd = -Infinity;
          for (const [s, e] of intervals) {
            if (s > curEnd) {
              if (curEnd > curStart) cov += curEnd - curStart;
              curStart = s;
              curEnd = e;
            } else if (e > curEnd) {
              curEnd = e;
            }
          }
          if (curEnd > curStart) cov += curEnd - curStart;
          const ratio = contentRect.height > 0 ? cov / contentRect.height : 0;

          // 60% 以上覆われたら「覆われた」と確定（latch）。以降はカードが抜けても非表示を維持。
          if (ratio >= 0.6) covered = true;
          // 段階フェードせず 0/1 の二値で即時切替（グラデにしない）
          section.style.setProperty('--left-hidden', covered ? '1' : '0');
        },
      });

      return () => st.kill();
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
              <p>
                最先端のAI開発技術で、アイデアや理想を形に。
                <br />
                ブランディングで、世の中に届けるところまで。
                <br />
                構想からリリースまで一気通貫で進めます。
              </p>
            </div>

            <ul className={styles.menuList} ref={menuRef}>
              {SERVICE_MENU_ITEMS.map((item) => (
                <li key={item.label} className={styles.menuItem}>
                  <Link href={item.href} className={styles.menuLink}>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <Button href="/service" size="sm">VIEW SERVICE &gt;</Button>
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

        {/* SP 専用 VIEW SERVICE ボタン（カードの後ろに配置） */}
        <div className={styles.spButtonRow}>
          <Button href="/service" size="sm">VIEW SERVICE &gt;</Button>
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
