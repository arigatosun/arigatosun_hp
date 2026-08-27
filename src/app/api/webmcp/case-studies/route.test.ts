import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getAllWorks: vi.fn() }));
vi.mock('@/data/works', () => ({ getAllWorks: mocks.getAllWorks }));
vi.mock('@/lib/webmcp/runtime-config', () => ({ getWebMcpRuntimeConfig: () => Promise.resolve({ readToolsEnabled: true }) }));

import { POST } from './route';

const works = Array.from({ length: 5 }, (_, index) => ({
  id: `work-${index}`,
  client: `クライアント${index}`,
  title: index === 4 ? 'ＡＩプロジェクト' : `制作実績${index}`,
  term: '2026',
  categories: [index === 4 ? 'AI / DEVELOPMENT' : 'DESIGN / BRANDING'],
  details: [{ label: index === 3 ? '担当領域' : '制作内容', value: index === 3 ? '戦略設計' : 'デザイン' }],
}));

function request(body: Record<string, unknown>) {
  return new Request('https://www.arigatosun.com/api/webmcp/case-studies', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('case study search route', () => {
  beforeEach(() => mocks.getAllWorks.mockResolvedValue(works));

  it('defaults to three results and disables caching', async () => {
    const response = await POST(request({}));
    const body = await response.json();
    expect(body.count).toBe(3);
    expect(response.headers.get('cache-control')).toBe('private, no-store, max-age=0');
  });

  it('normalizes NFKC and searches categories and detail labels/values', async () => {
    const fullWidth = await (await POST(request({ query: 'ＡＩ' }))).json();
    expect(fullWidth.results[0].id).toBe('work-4');
    const detailLabel = await (await POST(request({ query: '担当領域' }))).json();
    expect(detailLabel.results[0].id).toBe('work-3');
    const category = await (await POST(request({ query: 'development' }))).json();
    expect(category.results[0].id).toBe('work-4');
  });

  it('returns a short explanation for zero results', async () => {
    const response = await POST(request({ query: '該当なし' }));
    const body = await response.json();
    expect(body).toMatchObject({ results: [], count: 0, message: expect.any(String) });
    expect(JSON.stringify(body).length).toBeLessThanOrEqual(1500);
  });
});
