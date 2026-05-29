'use client';

import { useEffect, useRef } from 'react';
import styles from './ConfirmModal.module.scss';

export interface ConfirmModalFormData {
  company: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  message: string;
}

interface ConfirmModalProps {
  isOpen: boolean;
  formData: ConfirmModalFormData;
  isSubmitting: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * 送信前の入力内容確認モーダル。
 * - ESC キーまたは「修正する」で閉じる（送信中は不可）
 * - 背景クリックでは閉じない（誤操作防止）
 * - 開いた時にキャンセルボタンへ自動フォーカス
 * - role="dialog" + aria-modal で支援技術にモーダルであることを通知
 */
export default function ConfirmModal({
  isOpen,
  formData,
  isSubmitting,
  errorMessage,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // モーダルの開閉に伴う副作用: フォーカス管理 + ESC ハンドラ + 背景スクロール抑制
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, isSubmitting, onCancel]);

  if (!isOpen) return null;

  const rows: Array<{ label: string; value: string; pre?: boolean }> = [
    { label: '御社名・部署名', value: formData.company || '—' },
    { label: 'お名前', value: formData.name },
    { label: 'ヨミガナ', value: formData.nameKana || '—' },
    { label: 'メールアドレス', value: formData.email },
    { label: '電話番号', value: formData.phone || '—' },
    { label: 'お問い合わせ内容', value: formData.message, pre: true },
  ];

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className={styles.card}>
        <header className={styles.header}>
          <h2 id="confirm-modal-title" className={styles.title}>
            送信内容のご確認
          </h2>
          <p className={styles.lead}>
            以下の内容で送信します。よろしければ「送信する」を押してください。
          </p>
        </header>

        <dl className={styles.list}>
          {rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <dt className={styles.label}>{row.label}</dt>
              <dd className={`${styles.value} ${row.pre ? styles.valuePre : ''}`}>
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        {errorMessage && (
          <p className={styles.error} role="alert">
            {errorMessage}
          </p>
        )}

        <div className={styles.actions}>
          <button
            ref={cancelButtonRef}
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            &lt; 修正する
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? '送信中...' : '送信する >'}
          </button>
        </div>
      </div>
    </div>
  );
}
