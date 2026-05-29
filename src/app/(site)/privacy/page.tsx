import type { Metadata } from 'next';
import type { PrivacyBlock } from '@/data/privacy-policy';
import { privacyLead, privacySections } from '@/data/privacy-policy';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description:
    '株式会社アリガトサンのプライバシーポリシー（個人情報保護方針）です。取得する情報、利用目的、第三者提供、安全管理措置等について記載しています。',
};

/** 条項本文ブロックをレンダリング（純表示のためサーバーコンポーネント） */
function renderBlock(block: PrivacyBlock) {
  switch (block.type) {
    case 'text':
      return block.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>);

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      const listClass = block.ordered ? styles.numberList : styles.bulletList;
      return (
        <>
          <p>{block.lead}</p>
          <ListTag className={`${styles.list} ${listClass}`}>
            {block.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ListTag>
        </>
      );
    }

    case 'contact':
      return (
        <>
          <p>{block.lead}</p>
          <p>
            {block.name}
            <br />
            {block.address}
            <br />
            {block.emailPrefix}
            <a
              className={styles.mailLink}
              href={`mailto:${block.email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {block.email}
            </a>
          </p>
        </>
      );
  }
}

export default function PrivacyPage() {
  return (
    <div className={styles.page}>
      {/* タイトルブロック */}
      <section className={styles.intro}>
        <h1 className={styles.title}>PRIVACY POLICY</h1>
        <p className={styles.subtitle}>プライバシーポリシー</p>
      </section>

      {/* 本文 */}
      <section className={styles.content} aria-label="プライバシーポリシー本文">
        <p className={styles.lead}>{privacyLead}</p>

        <div className={styles.sections}>
          {privacySections.map((section) => (
            <article key={section.heading} className={styles.section}>
              <h2 className={styles.heading}>{section.heading}</h2>
              <div className={styles.body}>{renderBlock(section.block)}</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
