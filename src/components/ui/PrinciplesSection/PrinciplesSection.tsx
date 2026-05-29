'use client';

import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import SlimeGlow, { SLIME_GLOW_STANDARD } from '@/components/ui/SlimeGlow';
import styles from './PrinciplesSection.module.scss';

type Principle = {
  labelJa: string;
  link: { text: string; href: string };
  description: string[];
};

const principles: Principle[] = [
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
      '言われたことをこなすのではなく、見えぬ細部に愛を宿した仕事だけが、顧客の想像を超え、偽りなき「ありがとう」を掘り起こす。我々の成長（RISE）は、お客さまの成功と共にある。',
    ],
  },
  {
    labelJa: '社会に',
    link: { text: 'NEWS', href: '/news' },
    description: [
      '仲間からお客さまへと波及した感謝と熱量は、やがて社会全体を照らす光',
      '（SUN）となる。',
      '我々が生み出す妥協なき価値を起点として「ありがとう」の循環を世の中に広げ、日本を向上させる未来を必ず創り上げる。',
    ],
  },
];

export default function PrinciplesSection() {
  return (
    <section className={styles.section}>
      {/* セクションタイトル (Figma: フル幅でメインコンテンツの上) */}
      <SectionHeader
        logo={{
          src: '/images/sections/about/title-sun.svg',
          alt: '',
          width: 61,
          height: 58,
        }}
        title="アリガト３原則"
        subtitle="ARIGATOSUN THREE PRINCIPLES"
      />

      {/* メインコンテンツ — 左: ダイアグラム / 右: 原則リスト (Figma レイアウト) */}
      <div className={styles.content}>
        {/* 楕円ダイアグラム + 赤スライムグロー (mask で外側楕円形にクリップ) */}
        <div className={styles.diagramArea}>
          {/* 線画: 3つの楕円 + 周回矢印 + 小装飾 (PC: 590×431 / SP: 351×256 で別アセット) */}
          <Image
            src="/images/sections/about/principles-diagram.svg"
            alt="アリガト３原則 ダイアグラム"
            width={590}
            height={431}
            className={`${styles.diagramBase} ${styles.diagramPc}`}
          />
          <Image
            src="/images/sections/about/principles-diagram-sp.svg"
            alt=""
            width={351}
            height={256}
            className={`${styles.diagramBase} ${styles.diagramSp}`}
            aria-hidden="true"
          />

          {/* 赤スライムグロー層: mask-image で外側楕円形にクリップ → はみ出さない */}
          {/* PC / SP 共に SlimeGlow を表示 (サービス詳細「アリガトサン・スタンダード」と同一) */}
          <div className={styles.glowMaskLayer} aria-hidden="true">
            <SlimeGlow {...SLIME_GLOW_STANDARD} />
          </div>

          {/* テキストラベル 仲間 / お客様 / 社会 */}
          <div className={styles.mapLabels}>
            <div className={styles.mapLabel}>
              <span className={styles.mapLabelJa}>仲間</span>
              <span className={styles.mapLabelEn}>TEAM</span>
            </div>
            <div className={styles.mapLabel}>
              <span className={styles.mapLabelJa}>お客様</span>
              <span className={styles.mapLabelEn}>CLIENT</span>
            </div>
            <div className={styles.mapLabel}>
              <span className={styles.mapLabelJa}>社会</span>
              <span className={styles.mapLabelEn}>SOCIETY</span>
            </div>
          </div>
        </div>

        {/* 右側: 原則リスト (常時表示) */}
        <div className={styles.principlesList}>
          {principles.map((principle) => (
            <div key={principle.labelJa} className={styles.principleItem}>
              <div className={styles.principleHead}>
                <div className={styles.principleHeadLeft}>
                  <span className={styles.principleLabel}>{principle.labelJa}</span>
                  <Image
                    src="/images/sections/about/arigatosun-logo.svg"
                    alt="アリガトサン"
                    width={200}
                    height={30}
                    className={styles.principleLogo}
                  />
                </div>
                <Link href={principle.link.href} className={styles.principleLink}>
                  <span className={styles.principleLinkText}>
                    {principle.link.text} &gt;
                  </span>
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
