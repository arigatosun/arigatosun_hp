import 'server-only';

import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// アリガトくんチャットの濫用・課金インフレ対策（永続レート制限 + 1日総量サーキットブレーカー）。
// route.ts のインメモリ制限はインスタンスをまたぐと無効化するため、Supabase の共有カウンターで補強する。
// DB 未設定・障害時はフェイルオープン（'error' を返して呼び出し側で続行）。最終的な費用の天井は
// Anthropic Console の月間上限が担保する多層防御。

// しきい値は環境変数で調整可（未設定なら既定値）。
// - IP単位: 1時間あたりの上限（同一IPからの連投を永続的に抑止）。
// - 全体: サイト全体の1日あたり上限（超過でその日は定型FAQへ自動フォールバック）。
//   Anthropic側の請求上限が未設定の間の暫定値として 100/日 にしている（最悪ケースでも
//   月額 $30 相当に収まる水準）。アカウント側の上限が整ったら ARIGATO_CHAT_DAILY_LIMIT で
//   引き上げてよい。
const IP_HOURLY_LIMIT = Number(process.env.ARIGATO_CHAT_IP_HOURLY_LIMIT ?? 60);
const DAILY_LIMIT = Number(process.env.ARIGATO_CHAT_DAILY_LIMIT ?? 100);

export type ChatGateResult = 'ok' | 'rate_limited' | 'daily_cap' | 'error';

// 生IPは保存しない。SHA-256 でハッシュ化してから DB に渡す（既存ログの個人情報配慮に合わせる）。
export function hashIp(ip: string): string {
  const salt = process.env.ARIGATO_CHAT_IP_SALT ?? 'arigato-chat';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/**
 * Supabase の原子的ゲート関数を呼び、IP時間窓と1日総量の両方を判定する。
 * 戻り値:
 *   - 'ok'           … 続行してよい
 *   - 'rate_limited' … IP単位の上限超過（429 相当）
 *   - 'daily_cap'    … サイト全体の1日上限超過（503 相当。定型FAQへ）
 *   - 'error'        … DB未設定/障害（フェイルオープン。呼び出し側は続行する）
 */
export async function checkChatGate(ipHash: string): Promise<ChatGateResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return 'error';

  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc('arigato_chat_gate', {
      p_ip_hash: ipHash,
      p_ip_hourly_limit: IP_HOURLY_LIMIT,
      p_daily_limit: DAILY_LIMIT,
    });

    if (error) {
      console.error('[arigato-chat] gate rpc error', error);
      return 'error';
    }
    return data === 'rate_limited' || data === 'daily_cap' ? data : 'ok';
  } catch (err) {
    console.error('[arigato-chat] gate exception', err);
    return 'error';
  }
}
