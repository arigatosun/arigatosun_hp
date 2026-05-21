import styles from './WorkCaption.module.scss';

type WorkCaptionProps = {
  text: string;
};

export default function WorkCaption({ text }: WorkCaptionProps) {
  return (
    <div className={styles.caption}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
