import Image from 'next/image';
import CopyLinkButton from '@/components/ui/CopyLinkButton';
import styles from './ShareButtons.module.scss';

type ShareButtonsProps = {
  /** シェア対象の絶対URL。 */
  url: string;
  /** シェア文（X のツイート本文等）。 */
  title: string;
};

// SNS シェア（X / Facebook / LINE はリンク、コピーは CopyLinkButton）。ニュース詳細と同仕様・同アイコン。
export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const enc = encodeURIComponent;
  const links = [
    {
      key: 'x',
      src: '/images/sections/news/share-1.svg',
      label: 'X でシェア',
      sizeClass: styles.iconX,
      round: false,
      href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`,
    },
    {
      key: 'fb',
      src: '/images/sections/news/share-2.png',
      label: 'Facebook でシェア',
      sizeClass: styles.iconFb,
      round: true,
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      key: 'line',
      src: '/images/sections/news/share-3.svg',
      label: 'LINE でシェア',
      sizeClass: styles.iconLine,
      round: false,
      href: `https://social-plugins.line.me/lineit/share?url=${enc(url)}`,
    },
  ];

  const iconClass = (sizeClass: string, round: boolean) =>
    `${styles.icon} ${sizeClass}${round ? ` ${styles.iconRound}` : ''}`;

  return (
    <div className={styles.share}>
      {links.map((t) => (
        <a
          key={t.key}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.label}
          className={iconClass(t.sizeClass, t.round)}
        >
          <Image src={t.src} alt="" width={24} height={24} />
        </a>
      ))}
      <CopyLinkButton
        url={url}
        iconSrc="/images/sections/news/share-4.svg"
        iconClassName={iconClass(styles.iconLink, false)}
        label="リンクをコピー"
      />
    </div>
  );
}
