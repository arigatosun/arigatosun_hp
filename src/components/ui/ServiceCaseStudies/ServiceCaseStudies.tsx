import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import { splitClientName } from '@/lib/client-name-segments';
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
              <p className={styles.client}>
                <span className={styles.clientLabel}>CLIENT : </span>
                {/* クライアント名は文字種の変わり目で区切り、英字は .clientValueEn
                    (font-en = CLIENT ラベルと同体裁)、日本語は .client(Noto Sans JP) を
                    継承させる。文字列全体で判定すると日英混在名の英字部分まで日本語の
                    指定になり、英字だけ太く見えてしまう。 */}
                {splitClientName(c.client).map((seg, i) =>
                  seg.isJa ? (
                    <Fragment key={i}>{seg.text}</Fragment>
                  ) : (
                    <span key={i} className={styles.clientValueEn}>{seg.text}</span>
                  )
                )}
              </p>
              <p className={styles.text}>{c.text}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
