import { createHash } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hashContact } from '@/lib/contact/canonicalize';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  from: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  audit: vi.fn(),
  sendEmails: vi.fn(),
  verification: { ok: false, reason: 'invalid' } as unknown,
}));

vi.mock('@/lib/webmcp/db', () => ({ createWebMcpAdminClient: () => ({ rpc: mocks.rpc, from: mocks.from }) }));
vi.mock('@/lib/webmcp/audit', () => ({ writeWebMcpAudit: mocks.audit }));
vi.mock('@/lib/webmcp/runtime-config', () => ({ getWebMcpRuntimeConfig: () => Promise.resolve({ readToolsEnabled: true, prepareContactEnabled: true, submitContactEnabled: true }) }));
vi.mock('@/lib/webmcp/request', () => ({
  hashSessionId: () => '2'.repeat(64),
  isValidWebMcpMutationRequest: () => true,
  requestId: () => '72c5255a-9e68-47e2-8c41-324742e59144',
}));
vi.mock('@/lib/webmcp/approval-token', () => ({ inspectApprovalToken: () => mocks.verification }));
vi.mock('@/lib/contact/email', () => ({ sendContactEmails: mocks.sendEmails }));

import { POST } from './route';

const contact = {
  inquiryType: 'project_request' as const,
  company: '',
  name: '感謝 太陽',
  nameKana: '',
  email: 'user@example.com',
  phone: '',
  message: '相談です',
};
const idempotencyKey = 'submit-key';

function request() {
  return new Request('https://www.arigatosun.com/api/webmcp/contact/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contact,
      sessionId: 'session-id',
      idempotencyKey,
      approvalToken: 'token',
      privacyConsent: true,
      privacyPolicyVersion: '2026-08-27',
    }),
  });
}

describe('WebMCP submit route', () => {
  beforeEach(() => {
    const claims = {
      approvalId: '72c5255a-9e68-47e2-8c41-324742e59144',
      payloadHash: hashContact(contact),
      sessionHash: '2'.repeat(64),
      idempotencyKeyHash: createHash('sha256').update(idempotencyKey).digest('hex'),
      expiresAt: Date.now() + 60_000,
    };
    mocks.verification = { ok: true, claims };
    mocks.rpc.mockReset();
    mocks.audit.mockReset().mockResolvedValue(undefined);
    mocks.sendEmails.mockReset().mockResolvedValue({ autoReplySent: true });
    mocks.eq.mockReset().mockResolvedValue({ error: null });
    mocks.update.mockReset().mockReturnValue({ eq: mocks.eq });
    mocks.from.mockReset().mockReturnValue({ update: mocks.update });
  });

  it('returns an existing sent receipt directly without sending again', async () => {
    mocks.rpc.mockResolvedValue({ data: { result: 'sent', public_receipt_id: 'receipt-id' }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, duplicate: true, receiptId: 'receipt-id' });
    expect(mocks.sendEmails).not.toHaveBeenCalled();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it('rejects a payload mismatch before the atomic claim RPC', async () => {
    const verification = mocks.verification as { ok: true; claims: { payloadHash: string } };
    verification.claims.payloadHash = 'f'.repeat(64);
    const response = await POST(request());
    expect(response.status).toBe(409);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'PAYLOAD_MISMATCH' }));
  });

  it('sends once and marks the atomically claimed receipt sent', async () => {
    mocks.rpc.mockResolvedValue({ data: { result: 'claimed', public_receipt_id: 'receipt-id' }, error: null });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.sendEmails).toHaveBeenCalledWith(contact, 'webmcp');
    expect(mocks.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'sent' }));
    expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0');
  });
});
