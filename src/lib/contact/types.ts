export const INQUIRY_TYPES = [
  'project_request',
  'estimate_consultation',
  'sales_solicitation',
  'recruitment',
  'partnership',
  'media_other',
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];
export type LegacyInquiryType = 'legacy_unspecified';
export type AcceptedInquiryType = InquiryType | LegacyInquiryType;

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
