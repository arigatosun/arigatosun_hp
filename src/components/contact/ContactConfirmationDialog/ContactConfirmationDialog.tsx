'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getInquiryTypeLabel, PRIVACY_POLICY_VERSION } from '@/lib/contact/constants';
import type { ContactFormData } from '@/lib/contact/types';
import { createWebMcpSessionId, fetchJson } from '@/lib/webmcp/client';
import styles from './ContactConfirmationDialog.module.scss';

type Props = {
  open: boolean;
  contact: ContactFormData;
  privacyConsent: boolean;
  onPrivacyConsentChange: (consent: boolean) => void;
  onClose: () => void;
};

export default function ContactConfirmationDialog({ open, contact, privacyConsent, onPrivacyConsentChange, onClose }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      titleRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      restoreFocusRef.current?.focus();
    }

    return () => {
      if (dialog.open) dialog.close();
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  const close = () => {
    if (isSubmitting) return;
    setError('');
    onClose();
  };

  const submit = async () => {
    if (!privacyConsent || isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const sessionId = createWebMcpSessionId();
      // Generate once before approval: both requests must be bound to this exact key.
      const idempotencyKey = crypto.randomUUID();
      const approval = await fetchJson<{ approvalToken: string }>('/api/webmcp/contact/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          sessionId,
          idempotencyKey,
          userConfirmed: true,
          privacyConsent,
          privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        }),
      });
      await fetchJson('/api/webmcp/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          sessionId,
          approvalToken: approval.approvalToken,
          idempotencyKey,
          privacyConsent,
          privacyPolicyVersion: PRIVACY_POLICY_VERSION,
        }),
      });
      router.push('/contact/thanks');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '送信に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="webmcp-confirm-title"
      aria-describedby="webmcp-confirm-description"
      aria-busy={isSubmitting}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || isSubmitting) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
      }}
    >
      <section className={styles.panel}>
        <h2 id="webmcp-confirm-title" ref={titleRef} tabIndex={-1}>送信内容の最終確認</h2>
        <p id="webmcp-confirm-description">以下は確認画面を開いた時点の固定内容です。承認するとお問い合わせメールを送信します。</p>
        <dl>
          <div><dt>種別</dt><dd>{getInquiryTypeLabel(contact.inquiryType)}</dd></div>
          <div><dt>御社名・部署名</dt><dd>{contact.company || '未入力'}</dd></div>
          <div><dt>お名前</dt><dd>{contact.name}</dd></div>
          <div><dt>ヨミガナ</dt><dd>{contact.nameKana || '未入力'}</dd></div>
          <div><dt>メールアドレス</dt><dd>{contact.email}</dd></div>
          <div><dt>電話番号</dt><dd>{contact.phone || '未入力'}</dd></div>
          <div><dt>お問い合わせ内容</dt><dd className={styles.message}>{contact.message}</dd></div>
        </dl>
        <label className={styles.consent}>
          <input type="checkbox" checked={privacyConsent} onChange={(event) => onPrivacyConsentChange(event.target.checked)} />
          <span>
            <Link href="/privacy" target="_blank" rel="noopener noreferrer">プライバシーポリシー</Link>
            を確認し、送信に同意する
          </span>
        </label>
        <div className={styles.status} aria-live="polite" aria-atomic="true">
          {isSubmitting && <p>承認内容を検証して送信しています。</p>}
          {error && <p className={styles.error} role="alert">{error}</p>}
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={close} disabled={isSubmitting}>戻って修正</button>
          <button type="button" onClick={submit} disabled={!privacyConsent || isSubmitting}>
            {isSubmitting ? '送信中…' : '承認して送信'}
          </button>
        </div>
      </section>
    </dialog>
  );
}
