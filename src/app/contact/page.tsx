'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.scss';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    company: '',
    name: '',
    nameKana: '',
    email: '',
    phone: '',
    message: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || '送信に失敗しました。');
        return;
      }

      setSubmitted(true);
    } catch {
      setErrorMessage('通信エラーが発生しました。時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={styles.thanksContainer}>
          <h2 className={styles.thanksTitle}>THANK YOU</h2>
          <p className={styles.thanksText}>
            お問い合わせいただきありがとうございます。
            <br />
            2～3営業日以内に担当者よりメールでご返信いたします。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* 左カラム: タイトル + 説明 */}
        <div className={styles.leftColumn}>
          <div className={styles.titleArea}>
            <Image
              src="/images/contact/contact_titlelogo.png"
              alt="CONTACT"
              width={250}
              height={37}
              className={styles.titleLogo}
              priority
            />
            <p className={styles.subtitle}>CONTACT US</p>
          </div>
          <p className={styles.description}>
            アリガトサンにご関心をお寄せいただきありがとうございます。
            <br />
            AIは日々進化し、いままで「難しい」とされていたことも、
            <br />
            形にできる可能性が広がっています。
            <br />
            思い浮かべている課題や、まだ言語化しきれていない「もしも」の
            <br />
            話でも構いません。
            <br />
            2～3営業日以内に担当者よりメールでご返信いたしますので、
            <br />
            お気軽にご相談ください。
          </p>
        </div>

        {/* 右カラム: フォーム */}
        <div className={styles.rightColumn}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>御社名・部署名</label>
              <input
                type="text"
                name="company"
                className={styles.input}
                placeholder="合同会社アリガトサン"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>お名前</label>
              <input
                type="text"
                name="name"
                className={styles.input}
                placeholder="感謝 太陽"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>ヨミガナ</label>
              <input
                type="text"
                name="nameKana"
                className={styles.input}
                placeholder="カンシャ タイヨウ"
                value={formData.nameKana}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${styles.labelEn}`}>MAIL</label>
              <input
                type="email"
                name="email"
                className={styles.input}
                placeholder="contact@arigatosun.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>電話番号</label>
              <input
                type="tel"
                name="phone"
                className={styles.input}
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>お問い合わせ内容</label>
              <textarea
                name="message"
                className={`${styles.input} ${styles.textarea}`}
                placeholder="お問い合わせ内容を入力ください。"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
          </form>
        </div>
      </div>

      {/* プライバシーポリシー同意 — ページ全体の中央 */}
      <div className={styles.agreementArea}>
        <label className={styles.agreementLabel}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className={styles.checkbox}
          />
          <span className={styles.agreementText}>
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.privacyLink}
            >
              プライバシーポリシー
            </a>
            に同意する
          </span>
        </label>
      </div>

      {/* エラーメッセージ */}
      {errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}

      {/* 送信ボタン — ページ全体の中央 */}
      <div className={styles.submitArea}>
        <button
          type="button"
          className={styles.submitButton}
          disabled={!agreed || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'SENDING...' : 'SEND MESSAGE >'}
        </button>
      </div>
    </div>
  );
}
