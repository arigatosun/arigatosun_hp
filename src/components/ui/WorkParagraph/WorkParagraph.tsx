import { Fragment } from 'react';
import styles from './WorkParagraph.module.scss';

type WorkParagraphProps = {
  body: string[];
};

export default function WorkParagraph({ body }: WorkParagraphProps) {
  return (
    <section className={styles.paragraph}>
      <p className={styles.body}>
        {body.map((line, index) => (
          <Fragment key={index}>
            {index > 0 && <br />}
            {/* 文中の <br> トークンは PC のみ改行（SP は連続表示で自然 wrap） */}
            {line.split('<br>').map((segment, segmentIndex) => (
              <Fragment key={segmentIndex}>
                {segmentIndex > 0 && <br className={styles.pcBreak} />}
                {segment}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
