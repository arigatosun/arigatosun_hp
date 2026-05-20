'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SectionTitle from '@/components/ui/SectionTitle';
import styles from './page.module.scss';

type FormState = {
  company: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  message: string;
};

const INITIAL_STATE: FormState = {
  company: '',
  name: '',
  nameKana: '',
  email: '',
  phone: '',
  message: '',
};

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // WordPress 連携前は Resend 経由のメール送信 API を叩く。
      // 連携時は /api/contact 側の実装を WordPress エンドポイントに差し替えるだけで OK。
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error || '送信に失敗しました。');
        return;
      }

      router.push('/contact/thanks');
    } catch {
      setErrorMessage(
        '通信エラーが発生しました。時間をおいて再度お試しください。',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <form className={styles.formRoot} onSubmit={handleSubmit} noValidate>
        <div className={styles.inner}>
          {/* 左カラム: タイトル + リード文 */}
          <aside className={styles.intro}>
            <SectionTitle
              src="/images/sections/contact/title-logo.png"
              alt="お問い合わせ"
              width={250}
              height={43}
              label="CONTACT US"
              as="h1"
              className={styles.titleSection}
            />
            <p className={styles.introText}>
              アリガトサンにご関心をお寄せいただきありがとうございます。
              <br />
              AIは日々進化し、いままで「難しい」とされていたことも、
              <br />
              形にできる可能性が広がっています。
              <br />
              思い浮かべている課題や、まだ言語化しきれていない
              <br />
              「もしも」の話でも構いません。
              <br />
              2～3営業日以内に担当者よりメールでご返信いたしますので、
              <br />
              お気軽にご相談ください。
            </p>
          </aside>

          {/* 右カラム: フォームフィールド */}
          <div className={styles.formFields}>
            <div className={styles.field}>
              <label htmlFor="company" className={styles.fieldLabel}>
                御社名・部署名
              </label>
              <input
                id="company"
                name="company"
                type="text"
                className={styles.fieldInput}
                placeholder="合同会社アリガトサン"
                value={formData.company}
                onChange={handleChange}
                autoComplete="organization"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="name" className={styles.fieldLabel}>
                お名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={styles.fieldInput}
                placeholder="感謝 太陽"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="nameKana" className={styles.fieldLabel}>
                ヨミガナ
              </label>
              <input
                id="nameKana"
                name="nameKana"
                type="text"
                className={styles.fieldInput}
                placeholder="カンシャ タイヨウ"
                value={formData.nameKana}
                onChange={handleChange}
                inputMode="kana"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.fieldLabel}>
                MAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={styles.fieldInput}
                placeholder="contact@arigatosun.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="phone" className={styles.fieldLabel}>
                電話番号
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={styles.fieldInput}
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="message" className={styles.fieldLabel}>
                お問い合わせ内容
              </label>
              <textarea
                id="message"
                name="message"
                className={`${styles.fieldInput} ${styles.fieldTextarea}`}
                placeholder="お問い合わせ内容を入力ください。"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* プライバシー同意（ページ全体の中央） */}
        <div className={styles.privacyWrap}>
          <label className={styles.privacy}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className={styles.privacyCheck}
            />
            <span className={styles.privacyText}>
              <Link
                href="/privacy"
                className={styles.privacyLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                プライバシーポリシー
              </Link>
              に同意する
            </span>
          </label>
        </div>

        {errorMessage && (
          <p className={styles.errorMessage} role="alert">
            {errorMessage}
          </p>
        )}

        {/* 送信ボタン（ページ全体の中央） */}
        <div className={styles.submitWrap}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!agreed || isSubmitting}
          >
            {isSubmitting ? 'SENDING...' : 'SEND MESSAGE >'}
          </button>
        </div>
      </form>
    </div>
  );
}
