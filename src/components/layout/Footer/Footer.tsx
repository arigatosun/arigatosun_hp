import Link from 'next/link';
import Image from 'next/image';
import FooterSitCharacterLoader from '@/components/three/FooterSitCharacterLoader';
import DeferMount from '@/components/ui/DeferMount';
import FooterNav from './FooterNav';
import styles from './Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* 背景マスクオーバーレイ（PC 用 / SP 用で別画像） */}
      <div className={styles.maskOverlay}>
        <Image
          src="/images/sections/footer/bg-mask.png"
          alt=""
          fill
          className={`${styles.maskImage} ${styles.maskImagePc}`}
        />
        <Image
          src="/images/sections/footer/bg-mask-sp.png"
          alt=""
          fill
          className={`${styles.maskImage} ${styles.maskImageSp}`}
        />
      </div>

      {/* アーチ上のキャラクター（FV 外なので近づくまで遅延ロード） */}
      <DeferMount className={styles.sitCharacter} rootMargin="1000px">
        <FooterSitCharacterLoader />
      </DeferMount>

      {/* CONTACT US ボタン */}
      <div className={styles.contactArea}>
        <Link href="/contact" className={styles.contactButton}>
          CONTACT US &gt;
        </Link>
      </div>

      {/* メインコンテンツ */}
      <div className={styles.content}>
        {/* 左側: ロゴ + ナビゲーション */}
        <div className={styles.left}>
          <div className={styles.logoWrap}>
            <Image
              src="/images/sections/footer/logo.png"
              alt="株式会社アリガトサン"
              width={740}
              height={170}
              className={styles.footerLogo}
            />
          </div>

          <FooterNav />
        </div>

        {/* 右側: CREATIVE PROJECTS */}
        <div className={styles.right}>
          <h3 className={styles.projectsTitle}>CREATIVE PROJECTS</h3>
          <div className={styles.projectImages}>
            <a
              className={styles.projectImageWrap}
              href="https://online.kusomegane.shop/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/partners/kusomegane-logo.png"
                alt="KUSOMEGANE"
                width={400}
                height={130}
                className={styles.projectImage}
                loading="eager"
              />
            </a>
            <a
              className={styles.projectImageWrap}
              href="https://aseave.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/images/partners/aseave-logo.png"
                alt="ASEAVE"
                width={400}
                height={130}
                className={styles.projectImage}
                loading="eager"
              />
            </a>
          </div>
        </div>
      </div>

      {/* 最下部 */}
      <div className={styles.bottom}>
        <span className={styles.companyName}>
          Arigatosun Inc.
        </span>
        <span className={styles.copyright}>
          &copy; 2026 ARIGATOSUN. ALL RIGHTS RESERVED.
        </span>
      </div>
    </footer>
  );
}
