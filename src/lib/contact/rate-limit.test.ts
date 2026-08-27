import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ audit: vi.fn() }));
vi.mock('@/lib/webmcp/db', () => ({ createWebMcpAdminClient: () => { throw new Error('database unavailable'); } }));
vi.mock('@/lib/webmcp/audit', () => ({ writeWebMcpAudit: mocks.audit }));

import { checkManualContactRate } from './rate-limit';

describe('manual contact rate fallback', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('remains available without DB credentials and enforces a local limit', async () => {
    vi.stubEnv('CONTACT_IP_SALT', 'test-salt');
    const ip = '203.0.113.77';
    const request = new Request('https://www.arigatosun.com/api/contact', { headers: { 'x-forwarded-for': ip } });
    for (let count = 0; count < 5; count += 1) await expect(checkManualContactRate(request)).resolves.toBe(true);
    await expect(checkManualContactRate(request)).resolves.toBe(false);
    expect(mocks.audit).toHaveBeenCalledWith({ event: 'manual_rate_fallback', result: 'MANUAL_RATE_FALLBACK' });
  });
});
