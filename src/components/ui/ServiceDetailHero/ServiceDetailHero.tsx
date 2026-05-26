import Link from 'next/link';
import Image from 'next/image';
import { SERVICE_NAV } from '@/data/service-detail';
import ServiceHeroSlideshow, {
  type ServiceHeroSlide,
} from '@/components/ui/ServiceHeroSlideshow';
import styles from './ServiceDetailHero.module.scss';

type ServiceDetailHeroProps = {
  slug: string;
  titleEn: string;
  titleJa: string;
  quote: string;
  /** 大キャッチの下に置く小キャッチ（IP/CREATIVE: 「個性の熱量」を真ん中に置き… 22px） */
  subQuote?: string;
  description: string[];
  heroImage: string | null;
  /** 指定があれば heroImage は無視されスライドショーが表示される */
  heroSlides?: ServiceHeroSlide[];
};

export default function ServiceDetailHero({
  slug,
  titleEn,
  titleJa,
  quote,
  subQuote,
  description,
  heroImage,
  heroSlides,
}: ServiceDetailHeroProps) {
  return (
    <section className={styles.hero}>
      {/* 側面ナビ（サービス切り替え） */}
      <nav className={styles.sideNav} aria-label="サービス切り替え">
        {SERVICE_NAV.map((item) => {
          const active = item.slug === slug;
          return (
            <Link
              key={item.slug}
              href={`/service/${item.slug}`}
              className={`${styles.sideNavItem} ${
                active ? styles.sideNavItemActive : ''
              }`}
              aria-current={active ? 'page' : undefined}
            >
              ・{item.label} &gt;
            </Link>
          );
        })}
        <span className={styles.sideNavArrow} aria-hidden="true">
          <svg viewBox="0 0 8 57" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3.32809 56.3536C3.52335 56.5488 3.83993 56.5488 4.03519 56.3536L7.21717 53.1716C7.41244 52.9763 7.41244 52.6597 7.21717 52.4645C7.02191 52.2692 6.70533 52.2692 6.51007 52.4645L3.68164 55.2929L0.853213 52.4645C0.657951 52.2692 0.341369 52.2692 0.146106 52.4645C-0.0491558 52.6597 -0.0491557 52.9763 0.146106 53.1716L3.32809 56.3536ZM3.68164 56L4.18164 56L4.18164 -4.37114e-08L3.68164 0L3.18164 4.37114e-08L3.18164 56L3.68164 56Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <Link href="/works" className={styles.sideNavItem}>
          ・WORKS &gt;
        </Link>
      </nav>

      {/* ページ見出し */}
      <div className={styles.titleBlock}>
        <Image
          src="/images/sections/service/detail/section-sun.svg"
          alt=""
          width={61}
          height={58}
          className={styles.titleIcon}
          aria-hidden="true"
        />
        <div className={styles.titleText}>
          <h1 className={styles.titleEn}>{titleEn}</h1>
          <p className={styles.titleJa}>{titleJa}</p>
        </div>
      </div>

      {quote && <p className={styles.quote}>{quote}</p>}

      {subQuote && <p className={styles.subQuote}>{subQuote}</p>}

      {description.length > 0 && (
        <div className={styles.description}>
          {description.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      <div className={styles.heroImage}>
        {heroSlides && heroSlides.length > 0 ? (
          <ServiceHeroSlideshow slides={heroSlides} />
        ) : heroImage ? (
          <Image
            src={heroImage}
            alt={`${titleEn} のイメージ`}
            width={1520}
            height={855}
            className={styles.heroImageInner}
            priority
          />
        ) : (
          <div className={styles.heroImagePlaceholder} aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
