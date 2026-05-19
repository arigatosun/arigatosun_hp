import { Fragment } from 'react';
import WorkImageSlider from '@/components/ui/WorkImageSlider';
import styles from './WorkArchiveEntry.module.scss';

type WorkArchiveEntryProps = {
  heading: string;
  body: string[];
  credit: string[];
  images: string[];
};

export default function WorkArchiveEntry({
  heading,
  body,
  credit,
  images,
}: WorkArchiveEntryProps) {
  return (
    <article>
      <WorkImageSlider images={images} alt={heading} />
      <div className={styles.text}>
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.body}>
          {body.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
        <p className={styles.credit}>
          {credit.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      </div>
    </article>
  );
}
