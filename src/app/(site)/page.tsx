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
import FooterCharacterLoader from '@/components/three/FooterCharacterLoader';
import { getAllWorks } from '@/data/works';

export default async function Home() {
  const works = await getAllWorks();

  return (
    <div className={styles.page}>
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
              />
            </picture>
          </h1>

          <div className={styles.heroLabelsArea}>
            <div className={styles.heroCharacter}>
              {/* TOP Hero 用キャラ。位置調整：
                  デフォルト -19.37 → -22.52（左に 3.15 world ≒ 40px シフト）。
                  heroCharacter の transform: translate(20px, 0) で枠も右にシフト。
                  charRotationY で body 向きを微調整して完全正面に。
                  位置確認したい時は `debug` prop を付ければ視覚化される。
                  cameraPosition Z=28 はデフォルト 14 の 2x。SCSS 側で Canvas を
                  2x に拡張しているので、カメラを引いて見た目のキャラサイズを維持しつつ
                  手振り等の動きが見切れないよう描画余白を確保している。
                  cameraPosition Y=-5 は、キャラ本体 (armature root が world Y≒-1.79) より
                  さらに下に降ろし、見下ろし気味だった視点を正面〜やや下からの見え方に補正。
                  キャラ自体の回転は変えていない。 */}
              <div className={styles.heroCharacterCanvas}>
                <FooterCharacterLoader
                  charPosition={[-20.93, -0.75, 0]}
                  charRotationY={0}
                  cameraPosition={[2, -5, 28]}
                  orthographic
                  cameraZoom={15}
                />
              </div>
            </div>
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
          <p className={styles.heroInfoCopyright}>&copy; 2026 ARIGATOSUN. ALL RIGHTS RESEAVED.</p>
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

            <div className={styles.aboutLastRow}>
              <RevealBlock className={styles.aboutBlock}>
                <RevealLine>しかし、</RevealLine>
                <RevealLine>人が人らしく生きる上で忘れてはいけないものは「心の動き」です。</RevealLine>
                <RevealLine>心が躍り、思わず理性が吹き飛ぶような「想像を超えた」瞬間。</RevealLine>
                <RevealLine>そこにこそ本当の「ありがとう」が宿ると信じ、この社名を名付けました。</RevealLine>
                <RevealLine>妥協なき愛で、世を照らす太陽であれ。</RevealLine>
                <RevealLine>正解を超える体験を創造するために、私たちは挑戦を続けます。</RevealLine>
              </RevealBlock>

              <Button href="/about">VIEW ABOUT &gt;</Button>
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
