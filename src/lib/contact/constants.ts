import type { AcceptedInquiryType, ContactFormState, InquiryType } from './types';

export const PRIVACY_POLICY_VERSION = '2026-08-27';

export const INQUIRY_TYPE_OPTIONS: readonly {
  value: InquiryType;
  label: string;
  description: string;
}[] = [
  { value: 'project_request', label: '制作・開発のご依頼', description: '具体的なプロジェクトや制作・開発のご相談' },
  { value: 'estimate_consultation', label: 'お見積り・事前相談', description: '費用、期間、進め方などのご相談' },
  { value: 'sales_solicitation', label: '営業・サービスのご提案', description: '商品・サービス等の営業目的のご連絡' },
  { value: 'recruitment', label: '採用について', description: '採用、インターン、業務委託等のご連絡' },
  { value: 'partnership', label: '協業・パートナーシップ', description: '協業、提携、共同プロジェクトのご提案' },
  { value: 'media_other', label: '取材・その他', description: '取材、登壇、その他のご連絡' },
];

export const AUTO_SUBMIT_TYPES: readonly InquiryType[] = [
  'project_request',
  'estimate_consultation',
];

export const FIELD_LIMITS: Record<keyof ContactFormState, number> = {
  inquiryType: 40,
  company: 200,
  name: 100,
  nameKana: 100,
  email: 200,
  phone: 50,
  message: 5000,
};

export const INITIAL_CONTACT_FORM: ContactFormState = {
  inquiryType: '',
  company: '',
  name: '',
  nameKana: '',
  email: '',
  phone: '',
  message: '',
};

export function canAutoSubmitInquiry(type: InquiryType): boolean {
  return AUTO_SUBMIT_TYPES.includes(type);
}

export function getInquiryTypeLabel(type: AcceptedInquiryType): string {
  if (type === 'legacy_unspecified') return '未分類（旧フォーム互換受付）';
  return INQUIRY_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}
