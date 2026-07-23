import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import { splitClientName } from '@/lib/client-name-segments';
import type { InterviewItem } from '@/data/interviews';
import styles from './InterviewCard.module.scss';

type InterviewCardProps = {
  item: InterviewItem;
};

const NO_BREAK_TEXT_PATTERN = /(\d+(?:時間|年|ヶ月|月|日|人|社|件)|AI SaaS|Men’te|ケアGO)/g;
const NO_BREAK_TEXT_EXACT = /^(?:\d+(?:時間|年|ヶ月|月|日|人|社|件)|AI SaaS|Men’te|ケアGO)$/;

function renderNoBreakText(text: string) {
  return text.split(NO_BREAK_TEXT_PATTERN).map((part, index) =>
    NO_BREAK_TEXT_EXACT.test(part) ? (
      <span key={`${part}-${index}`} className={styles.noBreak}>
        {part}
      </span>
    ) : (
      part
    )
  );
}

function renderLines(lines: string[]) {
  return lines.map((line, j) => (
    <Fragment key={j}>
      {j > 0 && <br />}
      {renderNoBreakText(line)}
    </Fragment>
  ));
}

// インタビューカード（TOP セクション / 一覧ページ共通）。カード全体が詳細ページへのリンク。
export default function InterviewCard({ item }: InterviewCardProps) {
  const hasBodySp = Boolean(item.bodySp);

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
      {/* クライアント名は文字種の変わり目で区切り、英字だけ欧文書体(Mozaic GEO / Light)に
          する。行全体を Noto Sans JP にすると「株式会社YKT Innovation 様」の英字部分が
          和文書体の Regular で描かれ、そこだけ太く見えてしまう。
          サイズ・行間・字間は日本語と共通のまま（.client を継承）。 */}
      <p className={styles.client}>
        {splitClientName(item.client).map((seg, i) =>
          seg.isJa ? (
            <Fragment key={i}>{seg.text}</Fragment>
          ) : (
            <span key={i} className={styles.clientEn}>{seg.text}</span>
          )
        )}
      </p>
      <h3 className={styles.heading}>
        {renderLines(item.heading)}
      </h3>
      <p className={`${styles.body} ${hasBodySp ? styles.bodyPc : ''}`}>
        {renderLines(item.body)}
      </p>
      {item.bodySp && (
        <p className={`${styles.body} ${styles.bodySp}`}>
          {renderLines(item.bodySp)}
        </p>
      )}
    </Link>
  );
}
