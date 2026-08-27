import { createHash } from 'node:crypto';
import type { ContactSubmissionData } from './types';

export function canonicalizeContact(data: ContactSubmissionData): string {
  return JSON.stringify({
    inquiryType: data.inquiryType,
    company: data.company.trim(),
    name: data.name.trim(),
    nameKana: data.nameKana.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    message: data.message.trim(),
  });
}

export function hashContact(data: ContactSubmissionData): string {
  return createHash('sha256').update(canonicalizeContact(data)).digest('hex');
}

export function hashIdempotencyKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}
