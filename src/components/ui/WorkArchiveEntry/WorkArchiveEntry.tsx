import { Fragment } from 'react';
import Image from 'next/image';
import WorkImageSlider from '@/components/ui/WorkImageSlider';
import styles from './WorkArchiveEntry.module.scss';

type WorkArchiveEntryProps = {
  heading: string;
  body: string[];
  credit: string[];
  images: string[];
  /** SP で 720 幅の full-bleed カードにする */
  extended?: boolean;
  /** SP inner card のアスペクト比を上書き（例: IGC は '390 / 242'） */
  cardAspect?: string;
};

export default function WorkArchiveEntry({
  heading,
  body,
  credit,
  images,
  extended = false,
  cardAspect,
}: WorkArchiveEntryProps) {
  const firstImage = images[0];
  return (
    <article>
      {/* PC: 既存のスライダー */}
      <div className={styles.sliderPc}>
        <WorkImageSlider images={images} alt={heading} />
      </div>

      {/* SP: 白カード 390x346 + 内側にロゴ画像（390 or 720 幅） */}
      <div
        className={`${styles.cardSp} ${extended ? styles.cardSpExtended : ''}`}
      >
        <div
          className={styles.cardSpInner}
          style={cardAspect ? { aspectRatio: cardAspect } : undefined}
        >
          {firstImage ? (
            <Image
              src={firstImage}
              alt={heading}
              fill
              sizes="(max-width: 1023px) 100vw, 720px"
              className={styles.cardSpImage}
            />
          ) : (
            <div className={styles.cardSpPlaceholder} aria-hidden="true" />
          )}
        </div>
      </div>

      <div className={styles.text}>
        <h2 className={styles.heading}>
          {heading.split('\n').map((seg, i, arr) => (
            <Fragment key={i}>
              {seg}
              {i < arr.length - 1 && <br className={styles.spOnlyBr} />}
            </Fragment>
          ))}
        </h2>
        <p className={styles.body}>
          {body.map((line, index) => (
            <Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
        <p className={styles.credit}>
          {credit.map((line, lineIndex) => {
            // ` | ` を境に分割。PC/SP とも ` | ` は表示。SP のみ後ろで <br> 改行。
            const segments = line.split(' | ');
            return (
              <Fragment key={lineIndex}>
                {lineIndex > 0 && <br />}
                {segments.map((seg, segIndex) => (
                  <Fragment key={segIndex}>
                    {segIndex > 0 && (
                      <>
                        {/* Figma 準拠で全角スペース両側に挟む */}
                        {'　|　'}
                        <br className={styles.spOnlyBr} />
                      </>
                    )}
                    {seg}
                  </Fragment>
                ))}
              </Fragment>
            );
          })}
        </p>
      </div>
    </article>
  );
}
