'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SectionTitle from '@/components/ui/SectionTitle';
import ContactConfirmationDialog from '@/components/contact/ContactConfirmationDialog';
import AgentDraftReviewDialog from '@/components/contact/AgentDraftReviewDialog';
import {
  INITIAL_CONTACT_FORM,
  PRIVACY_POLICY_VERSION,
} from '@/lib/contact/constants';
import type { ContactErrors, ContactFormData, ContactFormState } from '@/lib/contact/types';
import { useContactWebMcp } from '@/lib/contact/useContactWebMcp';
import { validateContactField, validateUntypedContact } from '@/lib/contact/validation';
import styles from './page.module.scss';

type FormField = keyof ContactFormState;
type FormState = ContactFormState;
type Errors = ContactErrors;
type Touched = Partial<Record<FormField, boolean>>;

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(INITIAL_CONTACT_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [confirmationSnapshot, setConfirmationSnapshot] = useState<ContactFormData | null>(null);
  const [agentPrepared, setAgentPrepared] = useState(false);
  const formFieldsRef = useRef<HTMLDivElement>(null);

  const openConfirmation = useCallback((contact: ContactFormData) => {
    setConfirmationSnapshot({ ...contact });
  }, []);

  const handleAgentPrepared = useCallback((next: ContactFormState) => {
    setAgentPrepared(true);
    setErrors(validateUntypedContact(next));
    requestAnimationFrame(() => {
      formFieldsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.getElementById('company')?.focus({ preventScroll: true });
    });
  }, []);

  const { pendingDraft, resolvePendingDraft } = useContactWebMcp({
    formData,
    setFormData,
    confirmationInProgress: confirmationSnapshot !== null,
    onAgentPrepared: handleAgentPrepared,
    openConfirmation,
  });

  // ── スパム対策（formData とは分離。バリデーション対象に含めない） ──
  // ハニーポット: 人間は触れない隠しフィールド。値が入っていればボット。
  const [honeypot, setHoneypot] = useState('');
  // フォーム表示時刻。極端に速い送信（ボット）をサーバー側で弾く材料にする。
  const formStartRef = useRef(0);
  useEffect(() => {
    formStartRef.current = Date.now();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const field = name as FormField;
    setAgentPrepared(false);
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 一度 blur 済 or 既にエラー表示中 のフィールドはリアルタイムで再検証して
    // 修正中に正しい状態になれば即エラーを消す。未触のフィールドは静かにする。
    if (touched[field] || errors[field]) {
      const msg = validateContactField(field, value);
      setErrors((prev) => ({ ...prev, [field]: msg }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const field = e.target.name as FormField;
    setTouched((prev) => ({ ...prev, [field]: true }));
    const msg = validateContactField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: msg }));
  };

  // フォーム送信ボタン押下時の処理。
  // バリデーション通過後、確認を挟まず直接送信する（確認モーダルは廃止）。
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed || isSubmitting) return;

    // 種別UIは表示しない方針のため、通常送信では inquiryType を検証・送信対象に含めない
    const newErrors = validateUntypedContact(formData);
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

    // バリデーション通過 → そのまま送信
    setIsSubmitting(true);
    setSubmitErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          company: formData.company,
          name: formData.name,
          nameKana: formData.nameKana,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          website: honeypot, // ハニーポット（人間は空）
          _t: formStartRef.current, // フォーム表示時刻
          privacyConsent: agreed,
          privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        }),
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
        {/* ハニーポット: 視覚・支援技術・タブ移動から隠す。ボットだけが埋める。 */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
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
          <div className={styles.formFields} ref={formFieldsRef} data-contact-fields>
            {agentPrepared && (
              <div className={styles.agentPrepared} role="status" tabIndex={-1}>
                AIが指定した項目をフォームへ反映しました。内容を確認し、必要に応じて修正してください。
              </div>
            )}
            {/* 問い合わせ種別はサイト上に表示しない（オーナー方針）。
                WebMCP経由のAI入力時だけ form state 内部で保持し、承認ダイアログで本人確認する。 */}
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

        {/* 送信ボタン（ページ全体の中央）。バリデーション通過後はそのまま送信 */}
        <div className={styles.submitWrap}>
          {submitErrorMessage && (
            <p className={styles.submitError} role="alert">
              {submitErrorMessage}
            </p>
          )}
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!agreed || isSubmitting}
          >
            {isSubmitting ? 'SENDING...' : 'SEND MESSAGE >'}
          </button>
        </div>
      </form>
      {confirmationSnapshot && (
        <ContactConfirmationDialog
          open
          contact={confirmationSnapshot}
          privacyConsent={agreed}
          onPrivacyConsentChange={setAgreed}
          onClose={() => setConfirmationSnapshot(null)}
        />
      )}
      <AgentDraftReviewDialog
        conflicts={pendingDraft?.conflicts ?? []}
        onResolve={resolvePendingDraft}
      />
    </div>
  );
}
