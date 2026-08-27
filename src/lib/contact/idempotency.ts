import 'server-only';

import { randomUUID } from 'node:crypto';
import { createWebMcpAdminClient } from '@/lib/webmcp/db';
import { writeWebMcpAudit } from '@/lib/webmcp/audit';
import type { SubmissionSource } from './types';

const IDEMPOTENCY_PATTERN = /^[A-Za-z0-9._:-]{1,200}$/;
const LOCAL_TTL_MS = 15 * 60 * 1000;
const MAX_LOCAL_KEYS = 5000;

type LocalReceipt = {
  status: 'processing' | 'sent' | 'failed';
  createdAt: number;
  publicReceiptId: string;
  payloadHash: string;
  source: Extract<SubmissionSource, 'manual_form' | 'legacy_manual'>;
};
type LocalStore = Map<string, LocalReceipt>;
const globalReceipts = globalThis as typeof globalThis & { __contactReceiptStore?: LocalStore };
const localStore = globalReceipts.__contactReceiptStore ?? new Map<string, LocalReceipt>();
globalReceipts.__contactReceiptStore = localStore;

export type ManualClaim = {
  status: 'claimed' | 'duplicate_sent' | 'duplicate_pending' | 'conflict';
  backend: 'database' | 'memory';
  idempotencyKey: string;
  publicReceiptId: string;
};

export function normalizeIdempotencyKey(value: string | null): string | null {
  if (!value) return randomUUID();
  return IDEMPOTENCY_PATTERN.test(value) ? value : null;
}

function claimLocal(
  key: string,
  payloadHash: string,
  source: Extract<SubmissionSource, 'manual_form' | 'legacy_manual'>,
  now = Date.now(),
): ManualClaim {
  for (const [storedKey, receipt] of localStore) {
    if (now - receipt.createdAt > LOCAL_TTL_MS) localStore.delete(storedKey);
  }
  const existing = localStore.get(key);
  if (existing) {
    if (existing.payloadHash !== payloadHash || existing.source !== source) {
      return { status: 'conflict', backend: 'memory', idempotencyKey: key, publicReceiptId: '' };
    }
    return {
      status: existing.status === 'sent' ? 'duplicate_sent' : 'duplicate_pending',
      backend: 'memory', idempotencyKey: key, publicReceiptId: existing.publicReceiptId,
    };
  }
  if (localStore.size >= MAX_LOCAL_KEYS) {
    const oldest = localStore.keys().next().value as string | undefined;
    if (oldest) localStore.delete(oldest);
  }
  const publicReceiptId = randomUUID();
  localStore.set(key, { status: 'processing', createdAt: now, publicReceiptId, payloadHash, source });
  return { status: 'claimed', backend: 'memory', idempotencyKey: key, publicReceiptId };
}

export async function claimManualSubmission(input: {
  idempotencyKey: string;
  payloadHash: string;
  source: Extract<SubmissionSource, 'manual_form' | 'legacy_manual'>;
  privacyPolicyVersion: string;
  privacyConsentedAt: string;
}): Promise<ManualClaim> {
  try {
    const { data, error } = await createWebMcpAdminClient().rpc('claim_manual_contact_submission', {
      p_payload_hash: input.payloadHash,
      p_idempotency_key: input.idempotencyKey,
      p_source: input.source,
      p_privacy_policy_version: input.privacyPolicyVersion,
      p_privacy_consented_at: input.privacyConsentedAt,
    });
    if (error) throw error;
    const result = data as { result?: string; public_receipt_id?: string } | null;
    if (result?.result === 'conflict') {
      return {
        status: 'conflict',
        backend: 'database',
        idempotencyKey: input.idempotencyKey,
        publicReceiptId: '',
      };
    }
    if (result?.result && result.public_receipt_id) {
      return {
        status: result.result === 'claimed'
          ? 'claimed'
          : result.result === 'sent' ? 'duplicate_sent' : 'duplicate_pending',
        backend: 'database',
        idempotencyKey: input.idempotencyKey,
        publicReceiptId: result.public_receipt_id,
      };
    }
    throw new Error('Unexpected manual claim response');
  } catch {
    await writeWebMcpAudit({ event: 'manual_idempotency_fallback', result: 'MANUAL_IDEMPOTENCY_FALLBACK' });
    return claimLocal(input.idempotencyKey, input.payloadHash, input.source);
  }
}

export async function completeManualSubmission(
  claim: ManualClaim,
  status: 'sent' | 'failed',
): Promise<void> {
  if (claim.backend === 'memory') {
    const current = localStore.get(claim.idempotencyKey);
    if (current) localStore.set(claim.idempotencyKey, { ...current, status });
    return;
  }
  try {
    const { error } = await createWebMcpAdminClient()
      .from('contact_submission_receipts')
      .update({ status, completed_at: new Date().toISOString() })
      .eq('idempotency_key', claim.idempotencyKey);
    if (error) console.warn(`[contact] receipt update failed: ${error.code || 'DB_ERROR'}`);
  } catch (error) {
    const code = error instanceof Error ? error.name : 'DB_ERROR';
    console.warn(`[contact] receipt update failed: ${code}`);
  }
}
