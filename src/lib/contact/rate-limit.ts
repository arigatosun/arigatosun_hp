import 'server-only';

import { createHash } from 'node:crypto';
import { createWebMcpAdminClient } from '@/lib/webmcp/db';
import { writeWebMcpAudit } from '@/lib/webmcp/audit';
import { getClientIp } from '@/lib/webmcp/request';

const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_KEYS = 5000;

type RateStore = Map<string, number[]>;
const globalRate = globalThis as typeof globalThis & { __contactRateStore?: RateStore };
const localStore = globalRate.__contactRateStore ?? new Map<string, number[]>();
globalRate.__contactRateStore = localStore;

function localAllowed(ip: string, now = Date.now()): boolean {
  for (const [key, hits] of localStore) {
    const active = hits.filter((time) => now - time < WINDOW_MS);
    if (active.length === 0) localStore.delete(key);
    else if (active.length !== hits.length) localStore.set(key, active);
  }
  if (localStore.size >= MAX_KEYS && !localStore.has(ip)) {
    const oldest = localStore.keys().next().value as string | undefined;
    if (oldest) localStore.delete(oldest);
  }
  const hits = (localStore.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  if (hits.length >= RATE_LIMIT) return false;
  hits.push(now);
  localStore.set(ip, hits);
  return true;
}

export async function checkManualContactRate(request: Request): Promise<boolean> {
  const ip = getClientIp(request);
  const salt = process.env.CONTACT_IP_SALT;
  if (salt) {
    try {
      const ipHash = createHash('sha256').update(`${salt}:${ip}`).digest('hex');
      const { data, error } = await createWebMcpAdminClient().rpc('webmcp_contact_gate', {
        p_ip_hash: ipHash,
        p_limit: RATE_LIMIT,
        p_window_seconds: WINDOW_MS / 1000,
      });
      if (!error && typeof data === 'boolean') return data;
    } catch {
      // Availability of the normal form takes priority; fall through to local control.
    }
  }
  await writeWebMcpAudit({ event: 'manual_rate_fallback', result: 'MANUAL_RATE_FALLBACK' });
  return localAllowed(ip);
}

