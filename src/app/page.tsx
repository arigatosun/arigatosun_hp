import Image from 'next/image';
import styles from './page.module.scss';
import Button from '@/components/ui/Button';
import RevealText, { RevealBlock, RevealLine } from '@/components/ui/RevealText';
import ParallaxMotifs from '@/components/ui/ParallaxMotifs';
import ServiceSection from '@/components/ui/ServiceSection';
import WorksSection from '@/components/ui/WorksSection';
import NewsSection from '@/components/ui/NewsSection';
import LogoSlider from '@/components/ui/LogoSlider';
import MessageSection from '@/components/ui/MessageSection';

export default function Home() {
  return (
    <div className={styles.page}>
      {/* 赤モチーフ（ページレベルで配置、セクション間をまたいで表示） */}
      <ParallaxMotifs />

      {/* ── ヒーローセクション ── */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroLogo}>
            <Image
              src="/images/top/topherologo.png"
              alt="合同会社アリガトサン"
              width={632}
              height={120}
              priority
              className={styles.heroLogoImage}
            />
          </h1>

          <ul className={styles.heroLabels}>
            <li>AI / DEVELOPMENT</li>
            <li>DESIGN / BRANDING</li>
            <li>IP / CREATIVE</li>
          </ul>
        </div>

        <div className={styles.heroInfo}>
          <p className={styles.heroInfoTitle}>RISE WITH THANKS.</p>
          <p className={styles.heroInfoBody}>Arigatosun Limited Liability Company</p>
          <p className={styles.heroInfoBody}>Address : Room 802, ZERO Bldg. 4-6-26</p>
          <p className={styles.heroInfoBody}>Nishinaniwa-cho, Amagasaki-shi Hyogo Japan</p>
          <p className={styles.heroInfoCopyright}>&copy; 2026 ARIGATOSUN. ALL RIGHTS RESEAVED.</p>
        </div>

        {/* 3Dシーンの領域（アニメーション付きGLB到着後に実装） */}
        <div className={styles.heroScene} />
      </section>

      {/* ── アバウトセクション ── */}
      <section className={styles.about}>
        <div className={styles.aboutHeader}>
          <h2 className={styles.aboutTitle}>
            <Image
              src="/images/top/about-title.png"
              alt="アバウト"
              width={216}
              height={48}
              className={styles.aboutTitleImage}
            />
          </h2>
          <p className={styles.aboutLabel}>ABOUT</p>
        </div>

        <div className={styles.aboutContent}>
          <h3 className={styles.aboutHeading}>感謝とともに昇る。</h3>

          <RevealText className={styles.aboutMessage}>
            <RevealBlock className={styles.aboutBlock}>
              <RevealLine>合同会社アリガトサンは、</RevealLine>
              <RevealLine>AI(LLM)システムの開発からデザイン・ブランディング、</RevealLine>
              <RevealLine>IPコンテンツ制作を行うクリエイティブスタジオです。</RevealLine>
            </RevealBlock>

            <RevealBlock className={styles.aboutBlock}>
              <RevealLine>AIが当たり前になった世の中で、</RevealLine>
              <RevealLine>「正解を導くこと」は簡単になったかもしれません。</RevealLine>
            </RevealBlock>

            <div className={styles.aboutLastRow}>
              <RevealBlock className={styles.aboutBlock}>
                <RevealLine>しかし、</RevealLine>
                <RevealLine>人が人らしく生きる上で忘れてはいけないものは「心の動き」です。</RevealLine>
                <RevealLine>心が躍り、思わず理性が吹き飛ぶような「想像を超えた」瞬間。</RevealLine>
                <RevealLine>そこにこそ本当の「ありがとう」が宿ると信じ、この社名を名付けました。</RevealLine>
                <RevealLine>妥協なき愛で、世を照らす太陽であれ。</RevealLine>
                <RevealLine>正解を超えるような体験を創造するために、私たちは挑戦を続けます。</RevealLine>
              </RevealBlock>

              <Button href="/about">VIEW ABOUT &gt;</Button>
            </div>
          </RevealText>
        </div>
      </section>

      {/* ── サービスセクション ── */}
      <ServiceSection />

      {/* ── ワークスセクション ── */}
      <WorksSection />

      {/* ── ニュースセクション ── */}
      <NewsSection />

      {/* ── 企業ロゴスライダー ── */}
      <LogoSlider />

      {/* ── メッセージセクション ── */}
      <MessageSection />
    </div>
  );
}
