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
        <p className={styles.body}>
          {body.map((segment, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {/* `<br>` は PC 専用改行 (SP では非表示) */}
              {segment.split('<br>').map((pcSeg, p, pcArr) => (
                <Fragment key={p}>
                  {/* セグメント内の `\n` は SP 専用改行 (PC では非表示) */}
                  {pcSeg.split('\n').map((sub, j, arr) => (
                    <Fragment key={j}>
                      {sub}
                      {j < arr.length - 1 && (
                        <br className={styles.spOnlyBr} />
                      )}
                    </Fragment>
                  ))}
                  {p < pcArr.length - 1 && (
                    <br className={styles.pcOnlyBr} />
                  )}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </p>
      )}
    </section>
  );
}
