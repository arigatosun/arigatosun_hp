import { Fragment } from 'react';
import styles from './WorkTextSection.module.scss';

type WorkTextSectionProps = {
  level: 'main' | 'sub';
  heading: string;
  body?: string[];
};

export default function WorkTextSection({
  level,
  heading,
  body,
}: WorkTextSectionProps) {
  return (
    <section
      className={`${styles.section} ${
        level === 'sub' ? styles.sub : styles.main
      }`}
    >
      {level === 'sub' ? (
        <h3 className={styles.heading}>{heading}</h3>
      ) : (
        <h2 className={styles.heading}>{heading}</h2>
      )}
      {body && body.length > 0 && (
        <div className={styles.bodyWrap}>
          {body.map((segment, i) => (
            <p key={i} className={styles.body}>
              {/* セグメント内の `\n` は SP 専用改行 (PC では非表示) */}
              {segment.split('\n').map((sub, j, arr) => (
                <Fragment key={j}>
                  {sub}
                  {j < arr.length - 1 && (
                    <br className={styles.spOnlyBr} />
                  )}
                </Fragment>
              ))}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
