import { Fragment } from 'react';
import Image from 'next/image';
import styles from './WorkInterview.module.scss';

type WorkInterviewProps = {
  /** セクション見出し（■クライアントの声）。写真とまとめて左カラムで sticky 固定する。 */
  title: string;
  /** 左カラムの写真。src 未指定時はサイズ確保のプレースホルダー。flip 指定で水平反転。 */
  photo: { w: number; h: number; src?: string; flip?: boolean };
  /** 右カラム見出し。配列 = 明示改行（要素間に <br>）。 */
  heading: string[];
  /** Q&A の繰り返し。a は Figma の明示改行ごとのセグメント配列。 */
  qa: { q: string; a: string[] }[];
};

/**
 * 「クライアントの声」インタビューブロック。
 * PC: 左に「見出し + 写真」(sticky で固定) / 右に見出し + Q&A の 2 カラム。
 * SP: 縦積み（見出し → 写真 → 見出し → Q&A）。
 * 写真は画像が後追いのため src 未指定時はグレープレースホルダーで寸法だけ確保する。
 */
export default function WorkInterview({
  title,
  photo,
  heading,
  qa,
}: WorkInterviewProps) {
  return (
    <section className={styles.interview}>
      <div className={styles.row}>
        {/* 左カラム: 見出し + 写真。PC では sticky でまとめて固定 */}
        <div className={styles.left}>
          <h2 className={styles.title}>{title}</h2>
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
                style={photo.flip ? { transform: 'scaleX(-1)' } : undefined}
              />
            ) : (
              <div className={styles.photoPlaceholder} aria-hidden="true" />
            )}
          </div>
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
