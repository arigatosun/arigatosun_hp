import Link from 'next/link';
import type { Metadata } from 'next';
import SectionTitle from '@/components/ui/SectionTitle';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'お問い合わせを受け付けました',
  robots: { index: false, follow: false },
};

export default function ContactThanksPage() {
  return (
    <div className={styles.page} data-contact-page>
      <div className={styles.inner}>
        <SectionTitle
          src="/images/sections/contact/title-logo.png"
          alt="お問い合わせ"
          width={250}
          height={43}
          label="CONTACT US"
          as="h1"
          className={styles.titleSection}
        />

        <div className={styles.thanksText}>
          <p>お問い合わせいただき、誠にありがとうございます。</p>
          <p>2～3営業日以内に担当者よりメールでご返信させていただきます。</p>
          <p>※お問い合わせが立て込んだ場合、7～10営業日程度になる可能性あります。</p>
        </div>

        <div className={styles.buttonWrap}>
          <Link href="/" className={styles.topPageButton}>
            &lt; TOP PAGE
          </Link>
        </div>
      </div>
    </div>
  );
}
