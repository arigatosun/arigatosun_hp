import Link from 'next/link';
import Image from 'next/image';
import styles from './WorksCard.module.scss';

type WorksCardProps = {
  client: string;
  title: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  href?: string;
  /**
   * SP で title 内の "|" を改行に置換する。Figma SP の 2 段落構成カード (work-2) で使う。
   * 既定: false (PC/SP とも " | " を可視表示)
   */
  spBreakAtPipe?: boolean;
};

export default function WorksCard({
  client,
  title,
  image,
  imageWidth,
  imageHeight,
  href = '/works',
  spBreakAtPipe = false,
}: WorksCardProps) {
  // works.ts の title は LP 用の \n と | 区切りを含む。/works カードは自然折り返しで表示するため
  // \n を除去。spBreakAtPipe=true のカード (work-2) は SP で | を改行に変換、それ以外は " | " を可視表示。
  const cleaned = title.replace(/\n/g, '');
  const clauses = cleaned.split('|');

  return (
    <Link href={href} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={image}
          alt={client}
          width={imageWidth}
          height={imageHeight}
          className={styles.image}
        />
      </div>

      <p className={styles.client}>
        <span className={styles.clientLabel}>CLIENT：</span>
        <span className={styles.clientName}>{client}</span>
      </p>

      <p className={styles.body}>
        {clauses.map((clause, i) => (
          <span key={i}>
            {i > 0 &&
              (spBreakAtPipe ? (
                <>
                  <span className={styles.bodyPipe}> | </span>
                  <br className={styles.bodyBreak} />
                </>
              ) : (
                ' | '
              ))}
            {clause.trim()}
          </span>
        ))}
      </p>

      <span className={styles.viewMore}>
        <span className={styles.viewMoreText}>VIEW MORE &gt;</span>
      </span>
    </Link>
  );
}
