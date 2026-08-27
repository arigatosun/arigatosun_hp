import 'server-only';

export class HttpInputError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'HttpInputError';
  }
}

export async function readJsonObject(
  request: Request,
  maxBytes = 64 * 1024,
): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type')?.split(';')[0]?.trim().toLowerCase();
  if (!contentType || (contentType !== 'application/json' && !/^application\/[^/]+\+json$/.test(contentType))) {
    throw new HttpInputError(415, 'UNSUPPORTED_MEDIA_TYPE', 'JSON形式で送信してください。');
  }
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new HttpInputError(413, 'PAYLOAD_TOO_LARGE', '送信内容が大きすぎます。');
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) {
    throw new HttpInputError(413, 'PAYLOAD_TOO_LARGE', '送信内容が大きすぎます。');
  }
  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('not an object');
    return value as Record<string, unknown>;
  } catch {
    throw new HttpInputError(400, 'INVALID_JSON', 'JSON形式を確認してください。');
  }
}

