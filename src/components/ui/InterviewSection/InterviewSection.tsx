import Image from 'next/image';
import { Fragment } from 'react';
import SectionTitle from '@/components/ui/SectionTitle';
import { INTERVIEWS } from '@/data/interviews';
import styles from './InterviewSection.module.scss';

// TOP ページの「インタビュー（CLIENT INTERVIEW）」セクション。横に最大3つ表示。
export default function InterviewSection() {
  const items = INTERVIEWS.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section className={styles.section}>
      <SectionTitle
        src="/images/sections/interview/title-logo.png"
        alt="インタビュー"
        width={259}
        height={42}
        label="CLIENT INTERVIEW"
        className={styles.title}
      />
      <ul className={styles.grid}>
        {items.map((item, i) => (
          <li key={i} className={styles.card}>
            <div className={styles.imageWrap}>
              <Image
                src={item.image}
                alt={item.imageAlt ?? ''}
                fill
                quality={90}
                sizes="(max-width: 1023px) 92vw, 480px"
                className={styles.image}
              />
            </div>
            <p className={styles.client}>{item.client}</p>
            <h3 className={styles.heading}>
              {item.heading.map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h3>
            <p className={styles.body}>
              {item.body.map((line, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
