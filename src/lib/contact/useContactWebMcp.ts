'use client';

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { canAutoSubmitInquiry } from './constants';
import { INQUIRY_TYPES, type ContactFormData, type ContactFormState } from './types';
import { validateContact } from './validation';
import { fetchJson, type PublicWebMcpConfig } from '@/lib/webmcp/client';
import { useWebMcpTool } from '@/lib/webmcp/useWebMcpTool';

export type ContactField = keyof ContactFormState;
export type AgentContactDraft = Partial<ContactFormState>;
export type AgentDraftConflict = {
  field: ContactField;
  currentValue: string;
  proposedValue: string;
};

type PendingDraft = { draft: AgentContactDraft; conflicts: AgentDraftConflict[] };
type UseContactWebMcpOptions = {
  formData: ContactFormState;
  setFormData: Dispatch<SetStateAction<ContactFormState>>;
  confirmationInProgress: boolean;
  onAgentPrepared: (next: ContactFormState) => void;
  openConfirmation: (contact: ContactFormData) => void;
};

const CONTACT_FIELDS: ContactField[] = ['inquiryType', 'company', 'name', 'nameKana', 'email', 'phone', 'message'];

export function parseAgentContactDraft(input: Record<string, unknown>): AgentContactDraft | null {
  const draft: AgentContactDraft = {};
  for (const field of CONTACT_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(input, field)) continue;
    const value = input[field];
    if (typeof value !== 'string') return null;
    if (field === 'inquiryType' && !INQUIRY_TYPES.includes(value as ContactFormData['inquiryType'])) return null;
    Object.assign(draft, { [field]: value });
  }
  return Object.keys(draft).length > 0 ? draft : null;
}

export function findAgentDraftConflicts(
  current: ContactFormState,
  draft: AgentContactDraft,
): AgentDraftConflict[] {
  return CONTACT_FIELDS.flatMap((field) => {
    const proposed = draft[field];
    const existing = current[field];
    return proposed !== undefined && existing !== '' && proposed !== existing
      ? [{ field, currentValue: existing, proposedValue: proposed }]
      : [];
  });
}

export function mergeAgentDraft(
  current: ContactFormState,
  draft: AgentContactDraft,
  preserveConflicts = false,
): ContactFormState {
  const conflicts = new Set(findAgentDraftConflicts(current, draft).map(({ field }) => field));
  return CONTACT_FIELDS.reduce<ContactFormState>((next, field) => {
    const proposed = draft[field];
    if (proposed !== undefined && (!preserveConflicts || !conflicts.has(field))) {
      Object.assign(next, { [field]: proposed });
    }
    return next;
  }, { ...current });
}

export function useContactWebMcp({
  formData,
  setFormData,
  confirmationInProgress,
  onAgentPrepared,
  openConfirmation,
}: UseContactWebMcpOptions) {
  const [config, setConfig] = useState<PublicWebMcpConfig | null>(null);
  const [pendingDraft, setPendingDraft] = useState<PendingDraft | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_WEBMCP_ENABLED !== 'true' || !document.modelContext) return;
    fetchJson<PublicWebMcpConfig>('/api/webmcp/config').then(setConfig).catch(() => setConfig(null));
  }, []);

  const resultForPreparedForm = useCallback((next: ContactFormState) => {
    const errors = validateContact(next);
    if (Object.keys(errors).length > 0) return { status: 'needs_input', errors };
    const contact = next as ContactFormData;
    if (!canAutoSubmitInquiry(contact.inquiryType)) {
      return { status: 'manual_required', message: 'この種別は自動送信できません。フォーム内容を本人が確認して送信してください。' };
    }
    openConfirmation({ ...contact });
    return { status: 'confirmation_required', message: 'フォームに入力しました。本人が画面で内容とプライバシー同意を確認する必要があります。' };
  }, [openConfirmation]);

  const inputSchema = useMemo(() => ({
    type: 'object',
    properties: {
      inquiryType: { type: 'string', enum: [...INQUIRY_TYPES], description: '問い合わせ種別。営業目的は sales_solicitation を選択すること。' },
      company: { type: 'string', maxLength: 200 },
      name: { type: 'string', maxLength: 100 },
      nameKana: { type: 'string', maxLength: 100 },
      email: { type: 'string', maxLength: 200 },
      phone: { type: 'string', maxLength: 50 },
      message: { type: 'string', maxLength: 5000 },
    },
    required: ['inquiryType'],
    additionalProperties: false,
  }), []);

  const prepareTool = useMemo<WebMCP.ModelContextTool>(() => ({
    name: 'prepare_contact_inquiry',
    title: 'お問い合わせフォームを準備',
    description: '指定された項目だけをフォームへ入力します。既存入力と異なる値は本人に選択を求め、プライバシー同意は変更しません。送信前には必ず画面確認が必要です。',
    inputSchema,
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: (input) => {
      if (confirmationInProgress) return { status: 'confirmation_in_progress', message: '確認画面を閉じてからフォームを変更してください。' };
      const draft = parseAgentContactDraft(input);
      if (!draft) return { status: 'invalid_input', message: '入力項目を確認してください。' };
      const conflicts = findAgentDraftConflicts(formData, draft);
      if (conflicts.length > 0) {
        setPendingDraft({ draft, conflicts });
        return { status: 'user_choice_required', conflictFields: conflicts.map(({ field }) => field), message: '既存入力と異なる項目があります。本人の選択待ちです。' };
      }
      const next = mergeAgentDraft(formData, draft);
      setFormData(next);
      onAgentPrepared(next);
      return resultForPreparedForm(next);
    },
  }), [confirmationInProgress, formData, inputSchema, onAgentPrepared, resultForPreparedForm, setFormData]);

  const submitTool = useMemo<WebMCP.ModelContextTool>(() => ({
    name: 'submit_project_request',
    title: '承認画面を表示して依頼を送信',
    description: '現在のご依頼・見積りフォームについて本人確認画面を表示します。ツール実行だけでは送信されず、本人の明示承認後にのみ送信します。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: () => {
      if (confirmationInProgress) return { status: 'confirmation_in_progress', message: 'すでに本人の確認待ちです。' };
      const errors = validateContact(formData);
      if (Object.keys(errors).length > 0) return { status: 'needs_input', errors };
      const contact = formData as ContactFormData;
      if (!canAutoSubmitInquiry(contact.inquiryType)) return { status: 'manual_required', message: 'この種別は自動送信できません。' };
      openConfirmation({ ...contact });
      return { status: 'confirmation_required', message: '本人の確認待ちです。' };
    },
  }), [confirmationInProgress, formData, openConfirmation]);

  const resolvePendingDraft = useCallback((resolution: 'preserve' | 'replace' | 'cancel') => {
    if (!pendingDraft) return;
    if (resolution === 'cancel') {
      setPendingDraft(null);
      return;
    }
    const next = mergeAgentDraft(formData, pendingDraft.draft, resolution === 'preserve');
    setPendingDraft(null);
    setFormData(next);
    onAgentPrepared(next);
    resultForPreparedForm(next);
  }, [formData, onAgentPrepared, pendingDraft, resultForPreparedForm, setFormData]);

  useWebMcpTool(Boolean(config?.enabled && config.prepareContactEnabled), prepareTool);
  useWebMcpTool(Boolean(config?.enabled && config.submitContactEnabled), submitTool);
  return {
    webMcpEnabled: Boolean(config?.enabled && config.prepareContactEnabled),
    pendingDraft,
    resolvePendingDraft,
  };
}
