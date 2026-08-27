import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApprovalToken, inspectApprovalToken } from './approval-token';

const claims = {
  approvalId: '72c5255a-9e68-47e2-8c41-324742e59144',
  payloadHash: 'a'.repeat(64),
  sessionHash: 'b'.repeat(64),
  idempotencyKeyHash: 'c'.repeat(64),
  expiresAt: Date.now() + 60_000,
};

describe('approval token', () => {
  beforeEach(() => vi.stubEnv('WEBMCP_APPROVAL_SECRET', 'test-secret-that-is-at-least-32-characters-long'));
  afterEach(() => vi.unstubAllEnvs());

  it('round trips all binding claims', () => {
    expect(inspectApprovalToken(createApprovalToken(claims))).toEqual({ ok: true, claims });
  });

  it('rejects a modified signature', () => {
    const token = createApprovalToken(claims);
    expect(inspectApprovalToken(`${token.slice(0, -1)}x`)).toEqual({ ok: false, reason: 'invalid' });
  });

  it('distinguishes an expired token', () => {
    const token = createApprovalToken({ ...claims, expiresAt: Date.now() - 1 });
    expect(inspectApprovalToken(token)).toEqual({ ok: false, reason: 'expired' });
  });

  it('rejects malformed claim hashes', () => {
    const token = createApprovalToken({ ...claims, payloadHash: 'short' });
    expect(inspectApprovalToken(token)).toEqual({ ok: false, reason: 'invalid' });
  });
});
