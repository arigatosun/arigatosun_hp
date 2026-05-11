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
};

export default function WorksCard({
  client,
  title,
  image,
  imageWidth,
  imageHeight,
  href = '/works',
}: WorksCardProps) {
  // works.ts の title は LP 用の \n を含む。/works カードは自然折り返しで表示するため改行は除去
  const bodyText = title.replace(/\n/g, '');

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

      <p className={styles.body}>{bodyText}</p>

      <span className={styles.viewMore}>
        <span className={styles.viewMoreText}>VIEW MORE &gt;</span>
      </span>
    </Link>
  );
}
