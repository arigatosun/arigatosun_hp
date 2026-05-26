'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SectionTitle from '@/components/ui/SectionTitle';
import styles from './page.module.scss';

type FormField = 'company' | 'name' | 'nameKana' | 'email' | 'phone' | 'message';
type FormState = Record<FormField, string>;
type Errors = Partial<Record<FormField, string>>;
type Touched = Partial<Record<FormField, boolean>>;

const INITIAL_STATE: FormState = {
  company: '',
  name: '',
  nameKana: '',
  email: '',
  phone: '',
  message: '',
};

// ── バリデーションルール ──
// 必須項目: name / email / message。残りは任意だが、値があれば形式チェック。
const validators: Record<FormField, (value: string) => string | undefined> = {
  company: () => undefined,
  name: (v) => (v.trim() ? undefined : 'お名前を入力してください。'),
  nameKana: (v) => {
    if (!v.trim()) return undefined;
    // カタカナ / ひらがな / 長音 / 半角・全角スペース を許可
    return /^[ァ-ヴーぁ-ゖ\s　]+$/.test(v.trim())
      ? undefined
      : 'カタカナまたはひらがなで入力してください。';
  },
  email: (v) => {
    if (!v.trim()) return 'メールアドレスを入力してください。';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? undefined
      : '有効なメールアドレスを入力してください。';
  },
  phone: (v) => {
    if (!v.trim()) return undefined;
    return /^[\d\-+()\sー]+$/.test(v.trim())
      ? undefined
      : '電話番号は半角数字とハイフンで入力してください。';
  },
  message: (v) =>
    v.trim() ? undefined : 'お問い合わせ内容を入力してください。',
};

function validateAll(data: FormState): Errors {
  return (Object.keys(validators) as FormField[]).reduce<Errors>((errs, key) => {
    const msg = validators[key](data[key]);
    if (msg) errs[key] = msg;
    return errs;
  }, {});
}

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const field = name as FormField;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 一度 blur 済 or 既にエラー表示中 のフィールドはリアルタイムで再検証して
    // 修正中に正しい状態になれば即エラーを消す。未触のフィールドは静かにする。
    if (touched[field] || errors[field]) {
      const msg = validators[field](value);
      setErrors((prev) => ({ ...prev, [field]: msg }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const field = e.target.name as FormField;
    setTouched((prev) => ({ ...prev, [field]: true }));
    const msg = validators[field](formData[field]);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed || isSubmitting) return;

    const newErrors = validateAll(formData);
    if (Object.keys(newErrors).length > 0) {
      // 全フィールドを touched にしてエラーを表示
      const allTouched = (Object.keys(formData) as FormField[]).reduce<Touched>(
        (acc, key) => ((acc[key] = true), acc),
        {},
      );
      setTouched(allTouched);
      setErrors(newErrors);
      // 最初のエラーフィールドへフォーカス（アクセシビリティ）
      const firstErrorField = (Object.keys(newErrors) as FormField[])[0];
      const el = document.getElementById(firstErrorField);
      el?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitErrorMessage(data.error || '送信に失敗しました。');
        return;
      }

      router.push('/contact/thanks');
    } catch {
      setSubmitErrorMessage(
        '通信エラーが発生しました。時間をおいて再度お試しください。',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // フィールド毎のエラー表示制御 + a11y 属性
  const fieldA11y = (field: FormField) => {
    const err = errors[field];
    return {
      'aria-invalid': err ? true : undefined,
      'aria-describedby': err ? `${field}-error` : undefined,
      className: err
        ? `${styles.fieldInput} ${styles.fieldInputError}`
        : styles.fieldInput,
    };
  };

  return (
    <div className={styles.page} data-contact-page>
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
              <br className={styles.brPcOnly} />
              形にできる可能性が広がっています。
              <br />
              思い浮かべている課題や、まだ言語化しきれていない
              <br className={styles.brPcOnly} />
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
                placeholder="株式会社アリガトサン"
                value={formData.company}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="organization"
                {...fieldA11y('company')}
              />
              {errors.company && (
                <p id="company-error" className={styles.fieldErrorMessage}>
                  {errors.company}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="name" className={styles.fieldLabel}>
                お名前
              </label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="感謝 太陽"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="name"
                required
                {...fieldA11y('name')}
              />
              {errors.name && (
                <p id="name-error" className={styles.fieldErrorMessage}>
                  {errors.name}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="nameKana" className={styles.fieldLabel}>
                ヨミガナ
              </label>
              <input
                id="nameKana"
                name="nameKana"
                type="text"
                placeholder="カンシャ タイヨウ"
                value={formData.nameKana}
                onChange={handleChange}
                onBlur={handleBlur}
                // Android Gboard 向けの非標準値（HTML spec 外 / 未対応ブラウザは text 扱い）
                // @ts-expect-error -- "kana" は React 型に未収録だが意図的に維持
                inputMode="kana"
                {...fieldA11y('nameKana')}
              />
              {errors.nameKana && (
                <p id="nameKana-error" className={styles.fieldErrorMessage}>
                  {errors.nameKana}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.fieldLabel}>
                MAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="contact@arigatosun.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                required
                {...fieldA11y('email')}
              />
              {errors.email && (
                <p id="email-error" className={styles.fieldErrorMessage}>
                  {errors.email}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="phone" className={styles.fieldLabel}>
                電話番号
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0123456789"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="tel"
                {...fieldA11y('phone')}
              />
              {errors.phone && (
                <p id="phone-error" className={styles.fieldErrorMessage}>
                  {errors.phone}
                </p>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="message" className={styles.fieldLabel}>
                お問い合わせ内容
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="お問い合わせ内容を入力ください。"
                value={formData.message}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`${
                  errors.message
                    ? `${styles.fieldInput} ${styles.fieldInputError}`
                    : styles.fieldInput
                } ${styles.fieldTextarea}`}
                aria-invalid={errors.message ? true : undefined}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message && (
                <p id="message-error" className={styles.fieldErrorMessage}>
                  {errors.message}
                </p>
              )}
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

        {submitErrorMessage && (
          <p className={styles.errorMessage} role="alert">
            {submitErrorMessage}
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
