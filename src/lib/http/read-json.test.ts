import { describe, expect, it } from 'vitest';
import { HttpInputError, readJsonObject } from './read-json';

function request(body: string, headers: Record<string, string> = {}) {
  return new Request('https://www.arigatosun.com/api/test', { method: 'POST', headers, body });
}

describe('readJsonObject', () => {
  it('accepts JSON objects', async () => {
    await expect(readJsonObject(request('{"ok":true}', { 'content-type': 'application/json' }))).resolves.toEqual({ ok: true });
  });

  it('rejects unsupported content type', async () => {
    await expect(readJsonObject(request('{}', { 'content-type': 'text/plain' }))).rejects.toMatchObject({ status: 415, code: 'UNSUPPORTED_MEDIA_TYPE' } satisfies Partial<HttpInputError>);
  });

  it('rejects an oversized declared body', async () => {
    await expect(readJsonObject(request('{}', { 'content-type': 'application/json', 'content-length': '70000' }))).rejects.toMatchObject({ status: 413, code: 'PAYLOAD_TOO_LARGE' } satisfies Partial<HttpInputError>);
  });

  it('rejects arrays and invalid JSON', async () => {
    await expect(readJsonObject(request('[]', { 'content-type': 'application/json' }))).rejects.toMatchObject({ status: 400 });
    await expect(readJsonObject(request('{', { 'content-type': 'application/json' }))).rejects.toMatchObject({ status: 400 });
  });
});
