import Image from 'next/image';
import styles from './CompanyProfileSection.module.scss';
import { COMPANY_INFO_ROWS, COMPANY_SERVICE_ITEMS } from '@/data/company-profile';

/**
 * 会社概要セクション（/about 末尾）
 * Figma node 1578:66185 (Group 586) + 1578:65973/65974 (image + table)
 *
 * グレー帯（1920×1080 フルブリード）の上に白カード（1520×720）を載せ、
 * 中身は左に画像プレースホルダー（520×520）、右に情報テーブル + 事業内容。
 */
export default function CompanyProfileSection() {
  return (
    <section id="company-profile" className={styles.section}>
      <div className={styles.card}>
        {/* セクションヘッダ — Figma 会社概要は 28px / ls 11.2 のため SectionHeader を使わずローカル実装 */}
        <header className={styles.header}>
          <Image
            src="/images/sections/about/title-sun.png"
            alt=""
            width={61}
            height={58}
            className={styles.headerLogo}
            aria-hidden="true"
          />
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>会社概要</h2>
            <p className={styles.headerSub}>COMPANY PROFILE</p>
          </div>
        </header>

        <div className={styles.inner}>
          {/* 画像エリア（520×520） — 暫定プレースホルダー */}
          <div className={styles.imageWrap}>
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          </div>

          {/* 情報テーブル */}
          <dl className={styles.table}>
            {COMPANY_INFO_ROWS.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`${styles.row} ${
                  row.cells.length === 3 ? styles.row3 : styles.row2
                }`}
              >
                {row.cells.map((cell, cellIndex) => (
                  <div key={cellIndex} className={styles.cell}>
                    <div className={styles.cellHeader}>
                      <span className={styles.cellAccent} aria-hidden="true" />
                      <dt className={styles.cellLabel}>{cell.label}</dt>
                    </div>
                    <dd
                      className={`${styles.cellValue} ${
                        cell.valueFont === 'en' ? styles.cellValueEn : ''
                      }`}
                    >
                      {cell.value}
                    </dd>
                  </div>
                ))}
              </div>
            ))}

            {/* 事業内容（縦リスト） */}
            <div className={`${styles.row} ${styles.rowFull}`}>
              <div className={styles.cell}>
                <div className={styles.cellHeader}>
                  <span className={styles.cellAccent} aria-hidden="true" />
                  <dt className={styles.cellLabel}>事業内容</dt>
                </div>
                <dd className={styles.cellValue}>
                  <ul className={styles.serviceList}>
                    {COMPANY_SERVICE_ITEMS.map((item) => (
                      <li key={item} className={styles.serviceItem}>
                        ・{item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
