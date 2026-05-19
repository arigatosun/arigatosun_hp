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
          {body.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      )}
    </section>
  );
}
