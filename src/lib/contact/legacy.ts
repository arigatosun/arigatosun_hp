import 'server-only';

import type { ContactSubmissionData } from './types';

export type LegacyContact = {
  contact: ContactSubmissionData;
  privacyPolicyVersion: 'pre-webmcp-legacy';
  privacyConsentedAt: string;
};

export function parseLegacyContact(
  input: Record<string, unknown>,
  now = new Date(),
): LegacyContact | null {
  if ('inquiryType' in input || 'privacyConsent' in input || 'privacyPolicyVersion' in input) return null;
  const until = process.env.CONTACT_LEGACY_PAYLOAD_UNTIL;
  if (!until) return null;
  const deadline = Date.parse(until);
  if (!Number.isFinite(deadline) || now.getTime() > deadline) return null;
  const fields = ['company', 'name', 'nameKana', 'email', 'phone', 'message'] as const;
  if (fields.some((field) => typeof input[field] !== 'string')) return null;
  return {
    contact: {
      inquiryType: 'legacy_unspecified',
      company: (input.company as string).trim(),
      name: (input.name as string).trim(),
      nameKana: (input.nameKana as string).trim(),
      email: (input.email as string).trim(),
      phone: (input.phone as string).trim(),
      message: (input.message as string).trim(),
    },
    privacyPolicyVersion: 'pre-webmcp-legacy',
    privacyConsentedAt: now.toISOString(),
  };
}
