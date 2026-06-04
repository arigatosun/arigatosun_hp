import { Fragment } from 'react';
import Image from 'next/image';
import styles from './WorkInterview.module.scss';

type WorkInterviewProps = {
  /** 左カラムの写真。src 未指定時はサイズ確保のプレースホルダー。 */
  photo: { w: number; h: number; src?: string };
  /** 右カラム見出し。配列 = 明示改行（要素間に <br>）。 */
  heading: string[];
  /** Q&A の繰り返し。a は Figma の明示改行ごとのセグメント配列。 */
  qa: { q: string; a: string[] }[];
};

/**
 * 「クライアントの声」インタビューブロック。
 * PC: 左に写真 / 右に見出し + Q&A の 2 カラム。SP: 縦積み（写真 → 見出し → Q&A）。
 * 写真は画像が後追いのため src 未指定時はグレープレースホルダーで寸法だけ確保する。
 */
export default function WorkInterview({
  photo,
  heading,
  qa,
}: WorkInterviewProps) {
  return (
    <section className={styles.interview}>
      <div className={styles.row}>
        <div
          className={styles.photo}
          style={{ aspectRatio: `${photo.w} / ${photo.h}` }}
        >
          {photo.src ? (
            <Image
              src={photo.src}
              alt=""
              fill
              sizes="(max-width: 1023px) 92vw, 680px"
              className={styles.photoImg}
            />
          ) : (
            <div className={styles.photoPlaceholder} aria-hidden="true" />
          )}
        </div>

        <div className={styles.column}>
          <h3 className={styles.heading}>
            {heading.map((line, index) => (
              <Fragment key={index}>
                {index > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </h3>

          <dl className={styles.qaList}>
            {qa.map((item, index) => (
              <Fragment key={index}>
                <dt className={styles.question}>{item.q}</dt>
                <dd className={styles.answer}>
                  {item.a.map((line, lineIndex) => (
                    <Fragment key={lineIndex}>
                      {lineIndex > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </dd>
              </Fragment>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
