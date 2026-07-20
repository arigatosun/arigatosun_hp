import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import type { ServiceCaseStudy } from '@/types/service';
import styles from './ServiceCaseStudies.module.scss';

type ServiceCaseStudiesProps = {
  caseStudies: ServiceCaseStudy[];
};

/** 実績・事例セクション（3カード / 各カードは /works/&lt;id&gt; への詳細リンク） */
export default function ServiceCaseStudies({
  caseStudies,
}: ServiceCaseStudiesProps) {
  return (
    <section className={styles.section}>
      <SectionHeader
        logo={{
          src: '/images/sections/service/detail/section-sun.svg',
          alt: '',
          width: 61,
          height: 58,
        }}
        title="実績・事例"
        subtitle="DESIGN & BRANDING SCOPE"
        size="service-detail"
      />
      <ul className={styles.list}>
        {caseStudies.map((c) => (
          <li key={c.id} className={styles.card}>
            <Link href={`/works/${c.id}`} className={styles.link}>
              <div className={styles.thumb}>
                {c.thumbnail ? (
                  <Image
                    src={c.thumbnail}
                    alt={c.client}
                    width={450}
                    height={253}
                    className={styles.thumbImage}
                    sizes="(max-width: 1023px) 90vw, 30vw"
                  />
                ) : (
                  <div
                    className={styles.thumbPlaceholder}
                    aria-hidden="true"
                  />
                )}
              </div>
              {/* CLIENT 行はラベル・クライアント名を通して同じ体裁に統一する。日本語有無で
                  書体やウェイトを出し分けると日英混在名で英字部分だけ太く見えてしまうため。 */}
              <p className={styles.client}>
                <span className={styles.clientLabel}>CLIENT : </span>
                {c.client}
              </p>
              <p className={styles.text}>{c.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
