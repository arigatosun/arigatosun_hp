import Image from 'next/image';
import styles from './LogoSlider.module.scss';

// 仮データ（後日クライアントロゴに差し替え）
const LOGOS = Array.from({ length: 8 }, (_, i) => ({
  id: `logo-${i}`,
  src: '/images/top/corporatelogo.png',
  alt: 'ARIGATOSUN',
}));

export default function LogoSlider() {
  return (
    <div className={styles.wrapper}>
      {/* アリガトクン（後日3Dアニメーションに差し替え） */}
      <div className={styles.character}>
        <Image
          src="/images/top/arigatokun2.png"
          alt="アリガトクン"
          width={200}
          height={200}
          className={styles.characterImage}
        />
      </div>

      {/* ロゴスライダー */}
      <div className={styles.slider}>
        <div className={styles.track}>
          {/* 2セット配置してシームレスな無限ループを実現 */}
          {[...LOGOS, ...LOGOS].map((logo, index) => (
            <div key={`${logo.id}-${index}`} className={styles.logoItem}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={865}
                height={188}
                className={styles.logoImage}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
