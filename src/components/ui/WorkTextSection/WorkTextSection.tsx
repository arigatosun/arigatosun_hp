import { Fragment } from 'react';
import styles from './WorkTextSection.module.scss';

type WorkTextSectionProps = {
  level: 'main' | 'sub';
  heading: string;
  body?: string[];
  /** テキスト列の Figma 実測幅（px・1920 基準）。指定時のみ列を max-width 固定。 */
  width?: number;
};

export default function WorkTextSection({
  level,
  heading,
  body,
  width,
}: WorkTextSectionProps) {
  const inner = (
    <>
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
    </>
  );

  return (
    <section
      className={`${styles.section} ${
        level === 'sub' ? styles.sub : styles.main
      }`}
    >
      {width ? (
        // Figma 実測幅を 1920 基準 clamp で max-width 固定（gapStyle と同手法）。
        // min = width*0.42（SP では container 幅で自然に充填され実質無効）。
        <div
          className={styles.column}
          style={{
            maxWidth: `clamp(${Math.round(width * 0.42)}px, ${(
              width / 19.2
            ).toFixed(3)}vw, ${width}px)`,
          }}
        >
          {inner}
        </div>
      ) : (
        inner
      )}
    </section>
  );
}
