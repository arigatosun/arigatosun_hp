import { describe, expect, it } from 'vitest';
import { hashContact } from './canonicalize';
import { INITIAL_CONTACT_FORM } from './constants';

describe('hashContact', () => {
  it('normalizes email case and surrounding whitespace', () => {
    const base = { ...INITIAL_CONTACT_FORM, inquiryType: 'project_request' as const, name: '太陽', email: 'User@Example.COM', message: '相談' };
    expect(hashContact(base)).toBe(hashContact({ ...base, email: ' user@example.com ' }));
  });

  it('changes when the message changes', () => {
    const base = { ...INITIAL_CONTACT_FORM, inquiryType: 'project_request' as const, name: '太陽', email: 'a@example.com', message: '相談A' };
    expect(hashContact(base)).not.toBe(hashContact({ ...base, message: '相談B' }));
  });
});
