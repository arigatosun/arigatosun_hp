import Image from 'next/image';
import styles from './MemberHeroBlock.module.scss';

interface MemberHeroBlockProps {
  photo: string;
  photoAlt: string;
  roleJp: string;
  roleEn: string;
  nameEn: string;
}

export default function MemberHeroBlock({
  photo,
  photoAlt,
  roleJp,
  roleEn,
  nameEn,
}: MemberHeroBlockProps) {
  return (
    <section className={styles.root}>
      <div className={styles.photoFrame}>
        <Image
          src={photo}
          alt={photoAlt}
          width={293}
          height={293}
          className={styles.photo}
          priority
        />
      </div>
      <div className={styles.infoBlock}>
        <p className={styles.role}>
          <span className={styles.roleJp}>{roleJp} </span>
          <span className={styles.roleEn}>{roleEn}</span>
        </p>
        <h1 className={styles.name}>{nameEn}</h1>
        <div className={styles.divider} aria-hidden="true" />
      </div>
    </section>
  );
}
