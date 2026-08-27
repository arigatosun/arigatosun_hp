import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getClientIp,
  hashClientIp,
  hashSessionId,
  isAllowedOrigin,
  isValidManualMutationRequest,
  isValidWebMcpMutationRequest,
  requestId,
} from './request';

function request(headers: Record<string, string> = {}) {
  return new Request('https://www.arigatosun.com/api/test', { method: 'POST', headers });
}

describe('mutation request boundaries', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('allows missing browser headers on the normal form', () => {
    expect(isValidManualMutationRequest(request())).toBe(true);
  });

  it('rejects present but mismatched normal-form headers', () => {
    expect(isValidManualMutationRequest(request({ origin: 'https://evil.example' }))).toBe(false);
    expect(isValidManualMutationRequest(request({ 'sec-fetch-site': 'cross-site' }))).toBe(false);
  });

  it('requires strict WebMCP headers in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(isValidWebMcpMutationRequest(request())).toBe(false);
    expect(isValidWebMcpMutationRequest(request({ origin: 'https://www.arigatosun.com', 'sec-fetch-site': 'same-origin' }))).toBe(true);
  });

  it('accepts an explicitly configured staging origin', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('WEBMCP_ALLOWED_ORIGINS', 'https://staging.arigatosun.com');
    expect(isValidWebMcpMutationRequest(request({ origin: 'https://staging.arigatosun.com', 'sec-fetch-site': 'same-origin' }))).toBe(true);
  });

  it('extracts and hashes identifiers with separate required salts', () => {
    expect(getClientIp(request({ 'x-forwarded-for': '203.0.113.1, 10.0.0.1' }))).toBe('203.0.113.1');
    expect(getClientIp(request())).toBe('unknown');
    expect(() => hashClientIp(request())).toThrow('CONTACT_IP_SALT');
    expect(() => hashSessionId('session')).toThrow('WEBMCP_SESSION_SALT');
    vi.stubEnv('CONTACT_IP_SALT', 'ip-salt');
    vi.stubEnv('WEBMCP_SESSION_SALT', 'session-salt');
    expect(hashClientIp(request())).toMatch(/^[0-9a-f]{64}$/);
    expect(hashSessionId('session')).toMatch(/^[0-9a-f]{64}$/);
    expect(hashClientIp(request())).not.toBe(hashSessionId('unknown'));
  });

  it('accepts only UUID request ids and handles development origin defaults', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    expect(requestId(request({ 'x-request-id': id }))).toBe(id);
    expect(requestId(request({ 'x-request-id': 'attacker-controlled' }))).toMatch(/^[0-9a-f-]{36}$/);
    expect(isAllowedOrigin(request())).toBe(true);
    expect(isAllowedOrigin(request({ origin: 'https://evil.example' }))).toBe(false);
    expect(isValidWebMcpMutationRequest(request({ origin: 'https://www.arigatosun.com', 'sec-fetch-site': 'cross-site' }))).toBe(false);
    expect(isValidManualMutationRequest(request({ origin: 'https://www.arigatosun.com', 'sec-fetch-site': 'same-origin' }))).toBe(true);
  });
});
