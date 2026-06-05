import styles from './page.module.scss';
import Button from '@/components/ui/Button';
import SectionTitle from '@/components/ui/SectionTitle';
import RevealText, { RevealBlock, RevealLine } from '@/components/ui/RevealText';
import ParallaxMotifs from '@/components/ui/ParallaxMotifs';
import ServiceSection from '@/components/ui/ServiceSection';
import WorksSection from '@/components/ui/WorksSection';
import NewsSection from '@/components/ui/NewsSection';
import LogoSlider from '@/components/ui/LogoSlider';
import MessageSection from '@/components/ui/MessageSection';
import GlobalCanvasLoader from '@/components/three/GlobalCanvasLoader';
import { getAllWorks } from '@/data/works';

export default async function Home() {
  const works = await getAllWorks();

  return (
    <div className={styles.page}>
      {/* LCP対策: ヒーローのロゴ画像を head で先読み（SP/PC を media で出し分け）。
          <img> 側の fetchPriority="high" と合わせ、最初の描画要素を最速で取得させる。
          React が <link> を head へ巻き上げる。 */}
      <link
        rel="preload"
        as="image"
        href="/images/sections/hero/title-logo-sp.png"
        media="(max-width: 1023px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/images/sections/hero/title-logo.png"
        media="(min-width: 1024px)"
        fetchPriority="high"
      />
      {/* サービスセクション歩行キャラ用3Dキャンバス */}
      <GlobalCanvasLoader />
      {/* 赤モチーフ（ページレベルで配置、セクション間をまたいで表示） */}
      <ParallaxMotifs />

      {/* ── ヒーローセクション ── */}
      <section className={styles.hero} data-section="hero">
        <div className={styles.heroContent}>
          <h1 className={styles.heroLogo}>
            {/* PC/SP で別書き出し画像を出し分け。<picture> で SP は title-logo-sp.png（612x142）、
                PC は title-logo.png（1144x264）。next/image を picture で囲むと <source> が
                解釈されないため、ここは素の <img> を使う（PNG なので priority 相当の preload は
                ヘッダーで別途指定可能）。 */}
            <picture>
              <source media="(max-width: 1023px)" srcSet="/images/sections/hero/title-logo-sp.png" />
              <img
                src="/images/sections/hero/title-logo.png"
                alt="株式会社アリガトサン"
                width={1144}
                height={264}
                className={styles.heroLogoImage}
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </h1>

          <div className={styles.heroLabelsArea}>
            {/* Hero 手振り 3D キャラは非表示（SP/PC 両方）。レイアウト箱（.heroCharacter）は
                スペーサーとして残し、heroLabels の右端整列（ロゴ「ン」基準）と area 高さを維持する。 */}
            <div className={styles.heroCharacter} aria-hidden="true" />
            <ul className={styles.heroLabels}>
              <li>AI / DEVELOPMENT</li>
              <li>DESIGN / BRANDING</li>
              <li>IP / CREATIVE</li>
            </ul>
          </div>
        </div>

        <div className={styles.heroInfo}>
          <p className={styles.heroInfoTitle}>RISE WITH THANKS.</p>
          <p className={styles.heroInfoBody}>Arigatosun Inc.</p>
          <p className={styles.heroInfoBody}>Address : Room 802, ZERO Bldg. 4-6-26</p>
          <p className={styles.heroInfoBody}>Nishinaniwa-cho, Amagasaki-shi Hyogo Japan</p>
          <p className={styles.heroInfoCopyright}>&copy; 2026 ARIGATOSUN. ALL RIGHTS RESERVED.</p>
        </div>

      </section>

      {/* ── アバウトセクション ── */}
      <section className={styles.about}>
        <SectionTitle
          src="/images/sections/about/title-text.png"
          alt="アバウト"
          width={216}
          height={48}
          label="ABOUT"
        />

        <div className={styles.aboutContent}>
          <h3 className={styles.aboutHeading}>感謝とともに昇る。</h3>

          <RevealText className={styles.aboutMessage}>
            <RevealBlock className={styles.aboutBlock}>
              {/* Figma SP の段落構造に合わせて、長い1文は 1 つの RevealLine 内で自然改行させる */}
              <RevealLine>株式会社アリガトサンは、</RevealLine>
              <RevealLine>
                AI(LLM)システムの開発からデザイン・ブランディング、IPコンテンツ制作を行うクリエイティブスタジオです。
              </RevealLine>
            </RevealBlock>

            <RevealBlock className={styles.aboutBlock}>
              <RevealLine>AIが当たり前になった世の中で、</RevealLine>
              <RevealLine>「正解を導くこと」は簡単になったかもしれません。</RevealLine>
            </RevealBlock>

            <div className={styles.aboutLastRow} data-motifs-trigger>
              <RevealBlock className={styles.aboutBlock}>
                <RevealLine>しかし、</RevealLine>
                <RevealLine>人が人らしく生きる上で忘れてはいけないものは「心の動き」です。</RevealLine>
                <RevealLine>心が躍り、思わず理性が吹き飛ぶような「想像を超えた」瞬間。</RevealLine>
                <RevealLine>そこにこそ本当の「ありがとう」が宿ると信じ、この社名を名付けました。</RevealLine>
                <RevealLine>妥協なき愛で、世を照らす太陽であれ。</RevealLine>
                <RevealLine>正解を超える体験を創造するために、私たちは挑戦を続けます。</RevealLine>
              </RevealBlock>

              <Button href="/about" size="sm">VIEW ABOUT &gt;</Button>
            </div>
          </RevealText>
        </div>
      </section>

      {/* ── サービスセクション ── */}
      <ServiceSection />

      {/* ── ワークスセクション ── */}
      <WorksSection works={works} />

      {/* ── ニュースセクション ── */}
      <NewsSection />

      {/* ── 企業ロゴスライダー ── */}
      <LogoSlider />

      {/* ── メッセージセクション ── */}
      <MessageSection />
    </div>
  );
}
