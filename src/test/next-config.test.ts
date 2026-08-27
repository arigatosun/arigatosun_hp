import { afterEach, describe, expect, it, vi } from 'vitest';
import nextConfig from '../../next.config';

describe('WebMCP response headers', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('uses the current tools Permissions-Policy token on every route', async () => {
    vi.stubEnv('WEBMCP_ORIGIN_TRIAL_TOKEN', '');
    const rules = await nextConfig.headers?.();
    const globalRule = rules?.find((rule) => rule.source === '/:path*');
    expect(globalRule?.headers).toContainEqual({ key: 'Permissions-Policy', value: 'tools=(self)' });
    expect(globalRule?.headers.some((header) => header.value.includes('model-context'))).toBe(false);
  });

  it('adds the Origin Trial header only when a token is configured', async () => {
    vi.stubEnv('WEBMCP_ORIGIN_TRIAL_TOKEN', 'public-origin-trial-token');
    const rules = await nextConfig.headers?.();
    const globalRule = rules?.find((rule) => rule.source === '/:path*');
    expect(globalRule?.headers).toContainEqual({ key: 'Origin-Trial', value: 'public-origin-trial-token' });
  });
});
