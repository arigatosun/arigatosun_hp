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
            {/*
              文中の改行トークンを幅別に出し分ける:
              - <br>      : PC (1024〜) のみ改行
              - <br-mid>  : PC 中間域 (1024〜1512) のみ改行
              - <br-wide> : 中間域以外 (SP 〜1023 / 全幅 1513〜) で改行
              SP では <br>/<br-mid> は非表示、<br-wide> のみ有効。
            */}
            {line.split(/(<br-mid>|<br-wide>|<br>)/).map((part, i) => {
              if (part === '<br-mid>')
                return <br key={i} className={styles.brMid} />;
              if (part === '<br-wide>')
                return <br key={i} className={styles.brWide} />;
              if (part === '<br>')
                return <br key={i} className={styles.pcBreak} />;
              return <Fragment key={i}>{part}</Fragment>;
            })}
          </Fragment>
        ))}
      </p>
    </section>
  );
}
