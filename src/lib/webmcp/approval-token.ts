import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';

export type ApprovalClaims = {
  approvalId: string;
  payloadHash: string;
  sessionHash: string;
  idempotencyKeyHash: string;
  expiresAt: number;
};

export type ApprovalVerification =
  | { ok: true; claims: ApprovalClaims }
  | { ok: false; reason: 'invalid' | 'expired' };

function secret(): string {
  const value = process.env.WEBMCP_APPROVAL_SECRET;
  if (!value || value.length < 32) throw new Error('WEBMCP_APPROVAL_SECRET must be at least 32 characters');
  return value;
}

function sign(encoded: string): string {
  return createHmac('sha256', secret()).update(encoded).digest('base64url');
}

export function createApprovalToken(claims: ApprovalClaims): string {
  const encoded = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${encoded}.${sign(encoded)}`;
}

export function inspectApprovalToken(token: string): ApprovalVerification {
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return { ok: false, reason: 'invalid' };
  const expected = sign(encoded);
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    return { ok: false, reason: 'invalid' };
  }
  try {
    const claims = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as ApprovalClaims;
    if (
      typeof claims.approvalId !== 'string' ||
      typeof claims.payloadHash !== 'string' || claims.payloadHash.length !== 64 ||
      typeof claims.sessionHash !== 'string' || claims.sessionHash.length !== 64 ||
      typeof claims.idempotencyKeyHash !== 'string' || claims.idempotencyKeyHash.length !== 64 ||
      typeof claims.expiresAt !== 'number'
    ) return { ok: false, reason: 'invalid' };
    return claims.expiresAt > Date.now()
      ? { ok: true, claims }
      : { ok: false, reason: 'expired' };
  } catch {
    return { ok: false, reason: 'invalid' };
  }
}

export function verifyApprovalToken(token: string): ApprovalClaims | null {
  const result = inspectApprovalToken(token);
  return result.ok ? result.claims : null;
}
