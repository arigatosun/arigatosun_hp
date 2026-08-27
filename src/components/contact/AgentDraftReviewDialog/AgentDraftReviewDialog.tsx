'use client';

import { useEffect, useRef } from 'react';
import { getInquiryTypeLabel } from '@/lib/contact/constants';
import type { AgentDraftConflict, ContactField } from '@/lib/contact/useContactWebMcp';
import type { InquiryType } from '@/lib/contact/types';
import styles from './AgentDraftReviewDialog.module.scss';

const FIELD_LABELS: Record<ContactField, string> = {
  inquiryType: 'お問い合わせ種別',
  company: '御社名・部署名',
  name: 'お名前',
  nameKana: 'ヨミガナ',
  email: 'メールアドレス',
  phone: '電話番号',
  message: 'お問い合わせ内容',
};

function displayValue(field: ContactField, value: string) {
  return field === 'inquiryType' ? getInquiryTypeLabel(value as InquiryType) : value;
}

type Props = {
  conflicts: AgentDraftConflict[];
  onResolve: (resolution: 'preserve' | 'replace' | 'cancel') => void;
};

export default function AgentDraftReviewDialog({ conflicts, onResolve }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const open = conflicts.length > 0;

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
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="agent-draft-title"
      aria-describedby="agent-draft-description"
      onCancel={(event) => {
        event.preventDefault();
        onResolve('cancel');
      }}
    >
      <section className={styles.panel}>
        <h2 id="agent-draft-title" ref={titleRef} tabIndex={-1}>AI入力との違いを確認</h2>
        <p id="agent-draft-description">入力済みの値とAIの提案が異なります。既存の値を残すか、AIの提案に置き換えるか選択してください。</p>
        <div className={styles.conflicts}>
          {conflicts.map((conflict) => (
            <section key={conflict.field} className={styles.conflict}>
              <h3>{FIELD_LABELS[conflict.field]}</h3>
              <div><span>現在の入力</span><p>{displayValue(conflict.field, conflict.currentValue)}</p></div>
              <div><span>AIの提案</span><p>{displayValue(conflict.field, conflict.proposedValue)}</p></div>
            </section>
          ))}
        </div>
        <div className={styles.actions}>
          <button type="button" onClick={() => onResolve('cancel')}>キャンセル</button>
          <button type="button" onClick={() => onResolve('preserve')}>現在の入力を残す</button>
          <button type="button" onClick={() => onResolve('replace')}>AIの提案に置き換える</button>
        </div>
      </section>
    </dialog>
  );
}
