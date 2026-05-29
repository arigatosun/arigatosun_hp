import styles from './WorkCaption.module.scss';

type WorkCaptionProps = {
  text: string;
  spHidden?: boolean;
};

export default function WorkCaption({ text, spHidden }: WorkCaptionProps) {
  return (
    <div className={`${styles.caption} ${spHidden ? styles.spHidden : ''}`}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
