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
          {/* 地図エリア（520×520） — Google Maps embed (API キー不要) */}
          <div className={styles.imageWrap}>
            <iframe
              src="https://maps.google.com/maps?q=%E5%85%B5%E5%BA%AB%E7%9C%8C%E5%B0%BC%E5%B4%8E%E5%B8%82%E6%9D%B1%E9%9B%A3%E6%B3%A2%E7%94%BA4%E4%B8%81%E7%9B%AE6-26%20ZERO%E3%83%93%E3%83%AB&t=&z=17&ie=UTF8&iwloc=&output=embed"
              className={styles.map}
              title="株式会社アリガトサン 所在地マップ"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
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
