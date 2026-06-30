import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import type { InterviewItem } from '@/data/interviews';
import styles from './InterviewCard.module.scss';

type InterviewCardProps = {
  item: InterviewItem;
};

// インタビューカード（TOP セクション / 一覧ページ共通）。カード全体が詳細ページへのリンク。
export default function InterviewCard({ item }: InterviewCardProps) {
  return (
    <Link href={`/interview/${item.slug}`} className={styles.card}>
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
    </Link>
  );
}
