export const INQUIRY_TYPES = [
  'project_request',
  'estimate_consultation',
  'sales_solicitation',
  'recruitment',
  'partnership',
  'media_other',
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];
// 'unspecified' = 通常フォーム送信（種別UIは表示しない方針のため常に未指定）
// 'legacy_unspecified' = デプロイ跨ぎの旧payload互換受付
export type UntypedInquiryType = 'unspecified' | 'legacy_unspecified';
export type AcceptedInquiryType = InquiryType | UntypedInquiryType;

export type ContactFormData = {
  inquiryType: InquiryType;
  company: string;
  name: string;
  nameKana: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactFormState = Omit<ContactFormData, 'inquiryType'> & {
  inquiryType: InquiryType | '';
};

export type ContactSubmissionData = Omit<ContactFormData, 'inquiryType'> & {
  inquiryType: AcceptedInquiryType;
};

export type ContactPayload = ContactFormData & {
  privacyConsent: boolean;
  privacyPolicyVersion: string;
  website?: string;
  _t?: number;
};

export type ContactErrors = Partial<Record<keyof ContactFormState, string>>;
export type SubmissionSource = 'manual_form' | 'webmcp' | 'legacy_manual';
