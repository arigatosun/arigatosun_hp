'use client';

import Image from 'next/image';
import SectionHeader from '@/components/ui/SectionHeader';
import SlimeGlow, { SLIME_GLOW_STANDARD } from '@/components/ui/SlimeGlow';
import styles from './BusinessStructureSection.module.scss';

export default function BusinessStructureSection() {
  return (
    <section className={styles.section}>
      {/* 左側: タイトル + 説明テキスト */}
      <div className={styles.left}>
        <SectionHeader
          logo={{
            src: '/images/sections/about/title-sun.png',
            alt: '',
            width: 56,
            height: 56,
          }}
          title="事業領域と連携体制"
          subtitle="BUSINESS STRUCTURE"
        />

        <p className={styles.body}>
          アリガトサンの事業を牽引する4つのコア領域と、連携体制を示す図です。
          「開発」「デザイン」「IP創出」「コンサルティング」の各領域は、それぞれが独立して極めてクオリティの高い価値を提供する専門集団です。その圧倒的な個の力をベースとしながら、プロジェクトに応じて領域間や外部パートナー・アドバイザーとシームレスに連携することで、あらゆるビジネス課題に対し、より高度で包括的なソリューションを実現します。
        </p>
      </div>

      {/* 右側: 連携体制図 + 赤スライムグロー */}
      <div className={styles.right}>
        <Image
          src="/images/sections/about/structure-diagram.svg"
          alt="事業領域と連携体制図"
          width={638}
          height={648}
          className={styles.structureImage}
          sizes="(max-width: 1023px) 90vw, 35vw"
        />
        {/* 赤スライムグロー層: mask-image で 4-clover + 外側2小円のシルエットに切り抜く
            → 連携体制図の輪郭外には絶対にはみ出さない */}
        {/* PC / SP 共に SlimeGlow を表示 (サービス詳細「アリガトサン・スタンダード」と同一) */}
        <div className={styles.glowMaskLayer} aria-hidden="true">
          <SlimeGlow {...SLIME_GLOW_STANDARD} />
        </div>
      </div>
    </section>
  );
}
