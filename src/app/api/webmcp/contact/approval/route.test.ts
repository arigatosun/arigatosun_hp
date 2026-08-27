import { createHash } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  insert: vi.fn(),
  from: vi.fn(),
  audit: vi.fn(),
}));

vi.mock('@/lib/webmcp/db', () => ({ createWebMcpAdminClient: () => ({ rpc: mocks.rpc, from: mocks.from }) }));
vi.mock('@/lib/webmcp/audit', () => ({ writeWebMcpAudit: mocks.audit }));
vi.mock('@/lib/webmcp/runtime-config', () => ({ getWebMcpRuntimeConfig: () => Promise.resolve({ readToolsEnabled: true, prepareContactEnabled: true, submitContactEnabled: true }) }));
vi.mock('@/lib/webmcp/request', () => ({
  hashClientIp: () => '1'.repeat(64),
  hashSessionId: () => '2'.repeat(64),
  isValidWebMcpMutationRequest: () => true,
  requestId: () => '72c5255a-9e68-47e2-8c41-324742e59144',
}));

import { POST } from './route';

const contact = {
  inquiryType: 'project_request',
  company: '',
  name: '感謝 太陽',
  nameKana: '',
  email: 'user@example.com',
  phone: '',
  message: '相談です',
};

function request(body: Record<string, unknown>, contentType = 'application/json') {
  return new Request('https://www.arigatosun.com/api/webmcp/contact/approval', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: JSON.stringify(body),
  });
}

describe('WebMCP approval route', () => {
  beforeEach(() => {
    vi.stubEnv('WEBMCP_APPROVAL_SECRET', 'test-secret-that-is-at-least-32-characters-long');
    mocks.rpc.mockReset().mockResolvedValue({ data: true, error: null });
    mocks.insert.mockReset().mockResolvedValue({ error: null });
    mocks.from.mockReset().mockReturnValue({ insert: mocks.insert });
    mocks.audit.mockReset().mockResolvedValue(undefined);
  });
  afterEach(() => vi.unstubAllEnvs());

  it('stores only the idempotency hash and returns a no-store token response', async () => {
    const idempotencyKey = 'approval-key';
    const response = await POST(request({
      contact,
      sessionId: 'session-id',
      idempotencyKey,
      userConfirmed: true,
      privacyConsent: true,
      privacyPolicyVersion: '2026-08-27',
    }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0');
    expect((await response.json()).approvalToken).toEqual(expect.any(String));
    expect(mocks.insert).toHaveBeenCalledWith(expect.objectContaining({
      idempotency_key_hash: createHash('sha256').update(idempotencyKey).digest('hex'),
      privacy_policy_version: '2026-08-27',
      ip_hash: '1'.repeat(64),
    }));
    expect(JSON.stringify(mocks.insert.mock.calls[0][0])).not.toContain(idempotencyKey);
  });

  it('rejects manual-only inquiry types before creating approval state', async () => {
    const response = await POST(request({
      contact: { ...contact, inquiryType: 'sales_solicitation' },
      sessionId: 'session-id',
      idempotencyKey: 'key',
      userConfirmed: true,
      privacyConsent: true,
      privacyPolicyVersion: '2026-08-27',
    }));
    expect(response.status).toBe(403);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.audit).toHaveBeenCalledWith(expect.objectContaining({ result: 'TYPE_NOT_ALLOWED' }));
  });

  it('enforces the JSON media type boundary', async () => {
    const response = await POST(request({}, 'text/plain'));
    expect(response.status).toBe(415);
  });
});
