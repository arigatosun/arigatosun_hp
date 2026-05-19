import { Fragment } from 'react';
import styles from './WorkLeadBlock.module.scss';

type WorkLeadBlockProps = {
  heading: string;
  subheading: string;
  body: string[];
};

export default function WorkLeadBlock({
  heading,
  subheading,
  body,
}: WorkLeadBlockProps) {
  return (
    <section className={styles.lead}>
      <h2 className={styles.heading}>{heading}</h2>
      <p className={styles.subheading}>{subheading}</p>
      <span className={styles.divider} aria-hidden="true" />
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
