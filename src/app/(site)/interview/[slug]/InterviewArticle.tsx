import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';
import type { InterviewDetail, IvBlock, IvPara } from '@/data/interview-detail';
import styles from './InterviewArticle.module.scss';

function Rich({ para }: { para: IvPara }) {
  return (
    <>
      {para.map((s, i) =>
        s.b ? (
          <b key={i} className={styles.bold}>
            {s.t}
          </b>
        ) : (
          <Fragment key={i}>{s.t}</Fragment>
        ),
      )}
    </>
  );
}

function Block({ block }: { block: IvBlock }) {
  switch (block.type) {
    case 'divider':
      return <hr className={styles.divider} />;

    case 'heading':
      return (
        <h2 className={`${styles.heading}${block.fill ? ` ${styles.headingFill}` : ''}`}>
          {block.lines.map((l, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {l}
            </Fragment>
          ))}
        </h2>
      );

    case 'overview':
      return (
        <div className={styles.overview}>
          {block.points.map((p, i) => (
            <div key={i} className={styles.overviewPoint}>
              <h3 className={styles.pointTitle}>{p.title}</h3>
              <p className={styles.pointDesc}>
                {p.desc.map((d, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {d}
                  </Fragment>
                ))}
              </p>
            </div>
          ))}
        </div>
      );

    case 'profile':
      return (
        <div className={styles.profile}>
          <h3 className={styles.profileLabel}>{block.label}</h3>
          {block.lines.map((line, i) => (
            <p key={i} className={styles.profileLine}>
              <Rich para={line} />
            </p>
          ))}
        </div>
      );

    case 'question':
      return <p className={styles.question}>{block.text}</p>;

    case 'answer':
      return (
        <div className={styles.answer}>
          {block.paragraphs.map((para, i) => (
            <p key={i} className={styles.answerPara}>
              {i === 0 && <b className={styles.speaker}>{block.speaker}）</b>}
              <Rich para={para} />
            </p>
          ))}
        </div>
      );

    case 'note':
      return <p className={styles.note}>{block.text}</p>;

    case 'image':
      return (
        <div className={styles.image} style={{ aspectRatio: `${block.w} / ${block.h}` }}>
          <Image
            src={block.src}
            alt={block.alt}
            fill
            quality={90}
            sizes="(max-width: 1023px) 92vw, 1200px"
            className={block.pos === 'bottom' ? styles.imgBottom : styles.img}
          />
        </div>
      );

    case 'workLink':
      return (
        <p className={styles.workLink}>
          <Link href="/works/care-go" className={styles.workLinkInner}>
            <span>ケアGO</span>
            <span className={styles.underline}>「介護業界特化AI SaaSの開発」</span>
            <span>はこちらからご覧いただけます。</span>
          </Link>
        </p>
      );

    default:
      return null;
  }
}

export default function InterviewArticle({ detail }: { detail: InterviewDetail }) {
  return (
    <article className={styles.page}>
      <div className={styles.hero}>
        <Image
          src={detail.hero.src}
          alt={detail.hero.alt}
          fill
          priority
          quality={90}
          sizes="(max-width: 1023px) 100vw, 1200px"
          className={styles.heroImg}
        />
      </div>

      <p className={styles.metaClient}>{detail.meta.client}</p>
      <h1 className={styles.metaHeading}>{detail.meta.heading}</h1>
      <p className={styles.metaBody}>{detail.meta.body}</p>

      {detail.blocks.map((b, i) => (
        <Block key={i} block={b} />
      ))}

      <div className={styles.backWrap}>
        <Link href="/interview" className={styles.back}>
          &lt; BACK TO LIST
        </Link>
      </div>
    </article>
  );
}
