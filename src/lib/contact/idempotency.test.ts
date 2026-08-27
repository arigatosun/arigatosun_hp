import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/webmcp/db', () => ({ createWebMcpAdminClient: vi.fn() }));
vi.mock('@/lib/webmcp/audit', () => ({ writeWebMcpAudit: vi.fn() }));

import { claimManualSubmission, completeManualSubmission, normalizeIdempotencyKey } from './idempotency';

describe('normalizeIdempotencyKey', () => {
  it('accepts the allowed character set through 200 characters', () => {
    expect(normalizeIdempotencyKey(`request:${'a'.repeat(192)}`)).toHaveLength(200);
  });

  it('rejects long, whitespace and non-ASCII keys', () => {
    expect(normalizeIdempotencyKey('a'.repeat(201))).toBeNull();
    expect(normalizeIdempotencyKey('has space')).toBeNull();
    expect(normalizeIdempotencyKey('日本語')).toBeNull();
  });

  it('generates a UUID when the manual header is missing', () => {
    expect(normalizeIdempotencyKey(null)).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('falls back to memory, deduplicates, and rejects key reuse with changed content', async () => {
    const key = 'fallback-test-key';
    const first = await claimManualSubmission({
      idempotencyKey: key,
      payloadHash: 'a'.repeat(64),
      source: 'manual_form',
      privacyPolicyVersion: '2026-08-27',
      privacyConsentedAt: new Date().toISOString(),
    });
    expect(first).toMatchObject({ status: 'claimed', backend: 'memory' });
    await completeManualSubmission(first, 'sent');
    await expect(claimManualSubmission({
      idempotencyKey: key,
      payloadHash: 'a'.repeat(64),
      source: 'manual_form',
      privacyPolicyVersion: '2026-08-27',
      privacyConsentedAt: new Date().toISOString(),
    })).resolves.toMatchObject({ status: 'duplicate_sent', publicReceiptId: first.publicReceiptId });
    await expect(claimManualSubmission({
      idempotencyKey: key,
      payloadHash: 'b'.repeat(64),
      source: 'manual_form',
      privacyPolicyVersion: '2026-08-27',
      privacyConsentedAt: new Date().toISOString(),
    })).resolves.toMatchObject({ status: 'conflict' });
  });
});
