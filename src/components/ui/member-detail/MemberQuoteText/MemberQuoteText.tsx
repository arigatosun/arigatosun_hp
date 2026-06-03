import { Fragment } from 'react';
import styles from './MemberQuoteText.module.scss';

interface MemberQuoteTextProps {
  // string[] を渡すとセグメント間に「SPのみ改行」を入れる（PC は 1 行表示）
  text: string | string[];
}

export default function MemberQuoteText({ text }: MemberQuoteTextProps) {
  const segments = Array.isArray(text) ? text : [text];

  return (
    <p className={styles.root}>
      {segments.map((segment, index) => (
        <Fragment key={index}>
          {index > 0 && <br className={styles.spBr} />}
          {segment}
        </Fragment>
      ))}
    </p>
  );
}
