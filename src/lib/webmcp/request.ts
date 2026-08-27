import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import { SITE_URL } from '@/lib/site';

export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export function hashClientIp(request: Request): string {
  const salt = process.env.CONTACT_IP_SALT;
  if (!salt) throw new Error('CONTACT_IP_SALT is not configured');
  return createHash('sha256').update(`${salt}:${getClientIp(request)}`).digest('hex');
}

export function hashSessionId(sessionId: string): string {
  const salt = process.env.WEBMCP_SESSION_SALT;
  if (!salt) throw new Error('WEBMCP_SESSION_SALT is not configured');
  return createHash('sha256').update(`${salt}:${sessionId}`).digest('hex');
}

export function requestId(request: Request): string {
  const supplied = request.headers.get('x-request-id');
  return supplied && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(supplied)
    ? supplied
    : randomUUID();
}

function allowedOrigins(): string[] {
  const canonical = new URL(SITE_URL).origin;
  const configured = process.env.WEBMCP_ALLOWED_ORIGINS?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];
  return [...new Set([canonical, ...configured])];
}

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';
  return allowedOrigins().includes(origin);
}

export function isValidWebMcpMutationRequest(request: Request): boolean {
  if (!isAllowedOrigin(request)) return false;
  const fetchSite = request.headers.get('sec-fetch-site');
  return fetchSite ? fetchSite === 'same-origin' : process.env.NODE_ENV !== 'production';
}

export function isValidManualMutationRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (origin && !allowedOrigins().includes(origin)) return false;
  const fetchSite = request.headers.get('sec-fetch-site');
  return !fetchSite || fetchSite === 'same-origin';
}
