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
            {line}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
