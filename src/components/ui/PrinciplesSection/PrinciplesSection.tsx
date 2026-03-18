'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PrinciplesSection.module.scss';

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    labelJa: '仲間に',
    link: { text: 'SERVICE', href: '/service' },
    description: [
      'すべての基本は、隣で共に戦う仲間への敬意と感謝から始まる。',
      '背中を預け合えること、そして互いの妥協なき仕事（プロフェッショナリズム）に対して、',
      '心からの感謝と強固な絆がなければ、決して外の世界へ圧倒的な熱を届けることはできない。',
    ],
  },
  {
    labelJa: 'お客様に',
    link: { text: 'WORKS', href: '/works' },
    description: [
      '期待を託してくれたことに感謝し、圧倒的な価値（Give）で報いよう。',
      '言われたことをこなすのではなく、見えぬ細部に愛を宿した仕事だけが、顧客の想像を超え、',
      '偽りなき「ありがとう」を掘り起こす。我々の成長（RISE）は、お客さまの成功と共にある。',
    ],
  },
  {
    labelJa: '社会に',
    link: { text: 'NEWS', href: '/news' },
    description: [
      '仲間からお客さまへと波及した感謝と熱量は、やがて社会全体を照らす光（SUN）となる。',
      '我々が生み出す妥協なき価値を起点として「ありがとう」の循環を世の中に広げ、',
      '日本を向上させる未来を必ず創り上げる。',
    ],
  },
];

export default function PrinciplesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);
  const glow3Ref = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const glow1 = glow1Ref.current;
      const glow2 = glow2Ref.current;
      const glow3 = glow3Ref.current;
      const items = itemRefs.current;
      if (!glow1 || !glow2 || !glow3) return;

      // 初期状態: テキストは下から、グローは縮小+高ブラーで非表示
      items.forEach((item) => {
        if (item) gsap.set(item, { opacity: 0, y: 30 });
      });
      gsap.set(glow1, { opacity: 0, scale: 0.3, yPercent: -50, filter: 'blur(24px)' });
      gsap.set(glow2, { opacity: 0, scale: 0.4, yPercent: -50, filter: 'blur(28px)' });
      gsap.set(glow3, { opacity: 0, scale: 0.4, yPercent: -50, filter: 'blur(28px)' });

      // SP判定（768px未満）
      const isSP = window.matchMedia('(max-width: 767px)').matches;
      const pauseDuration = isSP ? 0.6 : 1.2;
      const finalPause = isSP ? 1 : 2;

      // スクロール連動タイムライン（ピン固定でじっくり演出）
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: isSP ? 'top 25%' : 'top 15%',
          end: isSP ? '+=1500' : '+=3000',
          scrub: isSP ? 1 : 2,
          pin: true,
        },
      });

      // Phase 1: 仲間にアリガトサン + ヒートマップが有機的に出現
      tl.to(items[0]!, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' })
        .to(glow1, {
          opacity: 1, scale: 1, yPercent: -50, filter: 'blur(6px)',
          duration: 2.5, ease: 'expo.out',
        }, '<0.15')
        .to({}, { duration: pauseDuration })

      // Phase 2: お客様にアリガトサン + ヒートマップが滑らかに拡大
        .to(items[1]!, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' })
        .to(glow2, {
          opacity: 1, scale: 1, yPercent: -50, filter: 'blur(8px)',
          duration: 3, ease: 'expo.out',
        }, '<0.2')
        .to({}, { duration: pauseDuration })

      // Phase 3: 社会にアリガトサン + ヒートマップが完全に展開
        .to(items[2]!, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' })
        .to(glow3, {
          opacity: 1, scale: 1, yPercent: -50, filter: 'blur(8px)',
          duration: 3, ease: 'expo.out',
        }, '<0.2')
        .to({}, { duration: finalPause }); // 余韻（完成状態をしっかり見せてから解除）
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* セクションタイトル */}
      <div className={styles.header}>
        <Image
          src="/images/about/titlesunlogo.png"
          alt=""
          width={56}
          height={56}
          className={styles.headerLogo}
        />
        <div className={styles.headerText}>
          <h2 className={styles.headerTitle}>アリガト３原則</h2>
          <p className={styles.headerSub}>ARIGATOSUN THREE PRINCIPLES</p>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* 左側: ヒートマップダイアグラム */}
        <div className={styles.mapArea}>
          <Image
            src="/images/about/principleslayer.png"
            alt="アリガト３原則 ダイアグラム"
            width={600}
            height={460}
            className={styles.mapImage}
          />

          {/* テキストラベル - 横並び */}
          <div className={styles.mapLabels}>
            <div className={styles.mapLabel}>
              <span className={styles.mapLabelJa}>仲間</span>
              <span className={styles.mapLabelEn}>TEAM</span>
            </div>
            <div className={`${styles.mapLabel} ${styles.mapLabelClient}`}>
              <span className={styles.mapLabelJa}>お客様</span>
              <span className={styles.mapLabelEn}>CLIENT</span>
            </div>
            <div className={`${styles.mapLabel} ${styles.mapLabelSociety}`}>
              <span className={styles.mapLabelJa}>社会</span>
              <span className={styles.mapLabelEn}>SOCIETY</span>
            </div>
          </div>

          {/* ヒートマップグロー効果 - 内側から累積的に広がる3層 */}
          <div ref={glow1Ref} className={`${styles.heatmapGlow} ${styles.glow1}`} />
          <div ref={glow2Ref} className={`${styles.heatmapGlow} ${styles.glow2}`} />
          <div ref={glow3Ref} className={`${styles.heatmapGlow} ${styles.glow3}`} />
        </div>

        {/* 右側: 原則リスト */}
        <div className={styles.principlesList}>
          {principles.map((principle, index) => (
            <div
              key={principle.labelJa}
              ref={(el) => { itemRefs.current[index] = el; }}
              className={styles.principleItem}
            >
              <div className={styles.principleHead}>
                <div className={styles.principleHeadLeft}>
                  <span className={styles.principleLabel}>{principle.labelJa}</span>
                  <Image
                    src="/images/about/blackarigatosun.png"
                    alt="アリガトサン"
                    width={200}
                    height={30}
                    className={styles.principleLogo}
                  />
                </div>
                <Link href={principle.link.href} className={styles.principleLink}>
                  {principle.link.text} &gt;
                </Link>
              </div>
              <p className={styles.principleDesc}>
                {principle.description.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < principle.description.length - 1 && <br />}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
