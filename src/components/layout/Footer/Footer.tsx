import Link from 'next/link';
import Image from 'next/image';
import FooterSitCharacterLoader from '@/components/three/FooterSitCharacterLoader';
import styles from './Footer.module.scss';

const serviceSubmenu = [
  { href: '/service/ai-dev', label: '・AI / DEVELOPMENT' },
  { href: '/service/design-branding', label: '・DESIGN / BRANDING' },
  { href: '/service/ip-creative', label: '・IP / CREATIVE' },
];

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

      {/* アーチ上のキャラクター */}
      <div className={styles.sitCharacter}>
        <FooterSitCharacterLoader />
      </div>

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

          <nav className={styles.nav}>
            <ul className={styles.mainMenu}>
              <li>
                <Link href="/about" className={styles.mainMenuItem}>
                  ABOUT
                </Link>
              </li>
              <li>
                <Link href="/service" className={styles.mainMenuItem}>
                  SERVICE
                </Link>
                <ul className={styles.subMenu}>
                  {serviceSubmenu.map((sub) => (
                    <li key={sub.href}>
                      <Link href={sub.href} className={styles.subMenuItem}>
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <Link href="/works" className={styles.mainMenuItem}>
                  WORKS
                </Link>
              </li>
              <li>
                <Link href="/news" className={styles.mainMenuItem}>
                  NEWS
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.mainMenuItem}>
                  CONTACT US
                </Link>
              </li>
              <li>
                <a
                  href="https://instagram.com/"
                  className={styles.mainMenuItem}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  INSTAGRAM
                  <svg
                    className={styles.externalIcon}
                    width="14"
                    height="14"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 5.5V8.5C8 8.76522 7.89464 9.01957 7.70711 9.20711C7.51957 9.39464 7.26522 9.5 7 9.5H1.5C1.23478 9.5 0.98043 9.39464 0.792893 9.20711C0.605357 9.01957 0.5 8.76522 0.5 8.5V3C0.5 2.73478 0.605357 2.48043 0.792893 2.29289C0.98043 2.10536 1.23478 2 1.5 2H4.5M6.5 0.5H9.5M9.5 0.5V3.5M9.5 0.5L4 6"
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* 右側: CREATIVE PROJECTS */}
        <div className={styles.right}>
          <h3 className={styles.projectsTitle}>CREATIVE PROJECTS</h3>
          <div className={styles.projectImages}>
            <div className={styles.projectImageWrap}>
              <Image
                src="/images/partners/kusomegane-logo.png"
                alt="KUSOMEGANE"
                width={400}
                height={130}
                className={styles.projectImage}
              />
            </div>
            <div className={styles.projectImageWrap}>
              <Image
                src="/images/partners/aseave-logo.png"
                alt="ASEAVE"
                width={400}
                height={130}
                className={styles.projectImage}
              />
            </div>
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
