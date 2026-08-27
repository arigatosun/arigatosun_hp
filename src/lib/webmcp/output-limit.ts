import 'server-only';

const DEFAULT_MAX_CHARS = 1500;

function compactStrings(value: unknown): unknown {
  if (typeof value === 'string') return value.length > 400 ? `${value.slice(0, 397)}...` : value;
  if (Array.isArray(value)) return value.map(compactStrings);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, compactStrings(item)]));
  }
  return value;
}

export function fitToolArrayResponse<T>(
  key: string,
  items: T[],
  extra: Record<string, unknown> = {},
  maxChars = DEFAULT_MAX_CHARS,
): Record<string, unknown> {
  const compacted = items.map((item) => compactStrings(item));
  const included: unknown[] = [];
  for (const item of compacted) {
    const candidate = { ...extra, [key]: [...included, item], count: included.length + 1, truncated: included.length + 1 < items.length };
    if (JSON.stringify(candidate).length > maxChars) break;
    included.push(item);
  }
  const response = { ...extra, [key]: included, count: included.length, truncated: included.length < items.length };
  if (JSON.stringify(response).length > maxChars) return { [key]: [], count: 0, truncated: items.length > 0 };
  return response;
}
