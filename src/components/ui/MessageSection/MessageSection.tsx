import styles from './MessageSection.module.scss';

export default function MessageSection() {
  return (
    <section className={styles.message}>
      {/* RISE WITH THANKS. */}
      <h2 className={styles.heading}>
        <span className={styles.red}>RISE WIT</span>
        <span className={styles.white}>H THANKS.</span>
      </h2>

      {/* メッセージ本文 */}
      <div className={styles.body}>
        {/* 前半: 赤文字 */}
        <p className={styles.textRed}>
          ここにメッセージが入ります。ここにメッセージが入ります。<br />
          ここにメッセージが入ります。<br />
          ここにメッセージが入ります。ここにメッセージが入ります。ここにメッセージが入り<br />
          ます。ここにメッセージが入ります。ここにメッセージが入ります。
        </p>

        {/* 後半: 赤→白の切り替え */}
        <p className={styles.textMixed}>
          <span className={styles.red}>ここにメッセージが入ります。ここに</span>
          <span className={styles.white}>
            メッセージが入ります。ここにメッセージが入り
            ます。ここにメッセージが入ります。ここにメッセージが入ります。ここにメッセージ
            が入ります。ここにメッセージが入ります。ここにメッセージが入ります。ここにメッ
            セージが入ります。ここにメッセージ。
          </span>
        </p>
      </div>
    </section>
  );
}
