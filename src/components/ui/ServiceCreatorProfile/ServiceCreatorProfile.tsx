import Image from 'next/image';
import type { ServiceCreatorProfileData } from '@/types/service';
import styles from './ServiceCreatorProfile.module.scss';

// Figma 2702:43682 「_編集モード」= KUSOMEGANE© のロゴ SVG (409x40)
const KUSOMEGANE_LOGO_SRC =
  '/images/sections/service/detail/kusomegane-logo.svg';

type ServiceCreatorProfileProps = ServiceCreatorProfileData;

/**
 * IP/CREATIVE: Hero 直下のクリエイター事例紹介セクション。
 * Figma Group 1119 (x=190 y=1733 w=1787 h=833)
 * - 左: アバター 294x294
 * - 右: タイトル（KUSOMEGANE©） + 説明 3 行 + SNS アイコン
 */
export default function ServiceCreatorProfile({
  avatar,
  title,
  description,
  snsLinks,
}: ServiceCreatorProfileProps) {
  return (
    <section className={styles.section} aria-labelledby="creator-profile-title">
      {/* Figma 2734:26519 Group 1024 (x=819 y=1733 w=1158 h=833) — 右側に重ねる装飾モザイク */}
      <Image
        src="/images/sections/service/detail/creator-mosaic.png"
        alt=""
        width={2202}
        height={1666}
        className={styles.mosaic}
        aria-hidden="true"
        sizes="(max-width: 1023px) 512px, 60vw"
      />
      <div className={styles.row}>
        <div className={styles.avatar}>
          {avatar.src ? (
            <Image
              src={avatar.src}
              alt={avatar.alt}
              width={294}
              height={294}
              className={styles.avatarImage}
              sizes="(max-width: 1023px) 190px, 294px"
            />
          ) : (
            <div className={styles.avatarPlaceholder} aria-hidden="true" />
          )}
        </div>

        <div className={styles.content}>
          <h2 id="creator-profile-title" className={styles.title}>
            <Image
              src={KUSOMEGANE_LOGO_SRC}
              alt={title}
              width={409}
              height={40}
              className={styles.titleLogo}
            />
          </h2>

          <div className={styles.description}>
            {description.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {snsLinks && (
            <ul className={styles.sns}>
              {snsLinks.instagram && (
                <li>
                  <a
                    href={snsLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={`${styles.snsLink} ${styles.snsInstagram}`}
                  />
                </li>
              )}
              {snsLinks.tiktok && (
                <li>
                  <a
                    href={snsLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className={`${styles.snsLink} ${styles.snsTiktok}`}
                  />
                </li>
              )}
              {snsLinks.youtube && (
                <li>
                  <a
                    href={snsLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    className={`${styles.snsLink} ${styles.snsYoutube}`}
                  />
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
