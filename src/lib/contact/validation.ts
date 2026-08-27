import { FIELD_LIMITS } from './constants';
import {
  INQUIRY_TYPES,
  type ContactErrors,
  type ContactFormData,
  type ContactFormState,
  type ContactSubmissionData,
} from './types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const KANA_PATTERN = /^[ァ-ヴーぁ-ゖ\s　]+$/;
const PHONE_PATTERN = /^[\d\-+()\sー]+$/;

export function validateContactField(
  field: keyof ContactFormState,
  value: string,
): string | undefined {
  if (value.length > FIELD_LIMITS[field]) return '入力内容が長すぎます。';
  switch (field) {
    case 'inquiryType':
      return INQUIRY_TYPES.includes(value as ContactFormData['inquiryType'])
        ? undefined
        : 'お問い合わせ種別を選択してください。';
    case 'name':
      return value.trim() ? undefined : 'お名前を入力してください。';
    case 'nameKana':
      return !value.trim() || KANA_PATTERN.test(value.trim())
        ? undefined
        : 'カタカナまたはひらがなで入力してください。';
    case 'email':
      if (!value.trim()) return 'メールアドレスを入力してください。';
      return EMAIL_PATTERN.test(value.trim()) ? undefined : '有効なメールアドレスを入力してください。';
    case 'phone':
      return !value.trim() || PHONE_PATTERN.test(value.trim())
        ? undefined
        : '電話番号は半角数字とハイフンで入力してください。';
    case 'message':
      return value.trim() ? undefined : 'お問い合わせ内容を入力してください。';
    default:
      return undefined;
  }
}

export function validateContact(data: ContactFormState | ContactFormData): ContactErrors {
  return (Object.keys(FIELD_LIMITS) as (keyof ContactFormState)[]).reduce<ContactErrors>(
    (errors, field) => {
      const error = validateContactField(field, String(data[field] ?? ''));
      if (error) errors[field] = error;
      return errors;
    },
    {},
  );
}

export function validateSubmissionContact(data: ContactSubmissionData): ContactErrors {
  if (data.inquiryType !== 'legacy_unspecified') return validateContact(data as ContactFormData);
  return (Object.keys(FIELD_LIMITS) as (keyof ContactFormState)[]).reduce<ContactErrors>(
    (errors, field) => {
      if (field === 'inquiryType') return errors;
      const error = validateContactField(field, String(data[field] ?? ''));
      if (error) errors[field] = error;
      return errors;
    },
    {},
  );
}

export function parseContactForm(value: unknown): ContactFormData | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const inquiryType = input.inquiryType;
  if (typeof inquiryType !== 'string' || !INQUIRY_TYPES.includes(inquiryType as ContactFormData['inquiryType'])) return null;
  const fields = ['company', 'name', 'nameKana', 'email', 'phone', 'message'] as const;
  if (fields.some((field) => typeof input[field] !== 'string')) return null;
  return {
    inquiryType: inquiryType as ContactFormData['inquiryType'],
    company: (input.company as string).trim(),
    name: (input.name as string).trim(),
    nameKana: (input.nameKana as string).trim(),
    email: (input.email as string).trim(),
    phone: (input.phone as string).trim(),
    message: (input.message as string).trim(),
  };
}
