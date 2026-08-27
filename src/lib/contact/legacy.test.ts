import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseLegacyContact } from './legacy';

const legacy = { company: '', name: '感謝 太陽', nameKana: '', email: 'hello@example.com', phone: '', message: '相談です' };

describe('legacy contact compatibility', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('accepts only the exact old shape before the deadline', () => {
    vi.stubEnv('CONTACT_LEGACY_PAYLOAD_UNTIL', '2026-09-30T00:00:00Z');
    const parsed = parseLegacyContact(legacy, new Date('2026-09-01T00:00:00Z'));
    expect(parsed?.contact.inquiryType).toBe('legacy_unspecified');
    expect(parsed?.privacyPolicyVersion).toBe('pre-webmcp-legacy');
  });

  it('rejects after the deadline', () => {
    vi.stubEnv('CONTACT_LEGACY_PAYLOAD_UNTIL', '2026-09-30T00:00:00Z');
    expect(parseLegacyContact(legacy, new Date('2026-10-01T00:00:00Z'))).toBeNull();
  });

  it('does not downgrade a malformed current payload to legacy', () => {
    vi.stubEnv('CONTACT_LEGACY_PAYLOAD_UNTIL', '2026-09-30T00:00:00Z');
    expect(parseLegacyContact({ ...legacy, inquiryType: 'invalid' }, new Date('2026-09-01T00:00:00Z'))).toBeNull();
    expect(parseLegacyContact({ ...legacy, privacyConsent: false }, new Date('2026-09-01T00:00:00Z'))).toBeNull();
  });
});
