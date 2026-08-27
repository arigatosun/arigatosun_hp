'use client';

export type PublicWebMcpConfig = {
  enabled: boolean;
  readToolsEnabled: boolean;
  prepareContactEnabled: boolean;
  submitContactEnabled: boolean;
};

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((body as { error?: string }).error || 'リクエストに失敗しました。');
  }
  return body as T;
}

export function createWebMcpSessionId(): string {
  const key = 'arigatosun:webmcp:session';
  const current = sessionStorage.getItem(key);
  if (current) return current;
  const value = crypto.randomUUID();
  sessionStorage.setItem(key, value);
  return value;
}

