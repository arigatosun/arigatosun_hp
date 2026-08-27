import 'server-only';

import { randomUUID } from 'node:crypto';
import { createWebMcpAdminClient } from './db';

export type WebMcpAuditResult =
  | 'APPROVAL_CREATED' | 'CONTACT_SENT' | 'AUTO_REPLY_FAILED'
  | 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'PAYLOAD_MISMATCH'
  | 'SESSION_MISMATCH' | 'IDEMPOTENCY_MISMATCH' | 'APPROVAL_CONSUMED'
  | 'TYPE_NOT_ALLOWED' | 'RATE_LIMITED' | 'ORIGIN_REJECTED'
  | 'RUNTIME_DISABLED' | 'MANUAL_RATE_FALLBACK'
  | 'MANUAL_IDEMPOTENCY_FALLBACK' | 'LEGACY_CONTACT_ACCEPTED'
  | 'DB_ERROR' | 'EMAIL_ERROR';

type AuditInput = {
  requestId?: string;
  event: string;
  toolName?: string;
  result: WebMcpAuditResult;
  inquiryType?: string;
  payloadHash?: string;
  sessionHash?: string;
  errorCode?: string;
};

export async function writeWebMcpAudit(input: AuditInput): Promise<void> {
  try {
    const { error } = await createWebMcpAdminClient().from('webmcp_audit_logs').insert({
      request_id: input.requestId || randomUUID(),
      event: input.event,
      tool_name: input.toolName ?? null,
      outcome: input.result,
      inquiry_type: input.inquiryType ?? null,
      payload_hash: input.payloadHash ?? null,
      session_hash: input.sessionHash ?? null,
      metadata: input.errorCode ? { error_code: input.errorCode.slice(0, 80) } : {},
    });
    if (error) console.warn(`[webmcp:audit] ${input.result}: ${error.code || 'DB_ERROR'}`);
  } catch (error) {
    const code = error instanceof Error ? error.name : 'DB_ERROR';
    console.warn(`[webmcp:audit] ${input.result}: ${code}`);
  }
}

