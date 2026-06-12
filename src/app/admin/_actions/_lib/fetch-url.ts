import 'server-only';

import dns from 'node:dns/promises';
import net from 'node:net';

// AI記事生成の「参考URL」用：指定URLのページ本文テキストを安全に取得する。
// SSRF 対策として、内部/プライベートアドレスへのアクセスを遮断し、
// http/https のみ・タイムアウト・サイズ上限・リダイレクト各ホップ再検証を行う。

const TIMEOUT_MS = 8000; // 1ホップあたりの取得タイムアウト
const MAX_BYTES = 512 * 1024; // 読み取る最大バイト数（約512KB）
const MAX_TEXT = 6000; // AI に渡す最大文字数（トークン上限対策）
const MAX_REDIRECTS = 4;

export type FetchUrlResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

/** 内部・プライベート・予約済みアドレスかどうか（SSRF 対策）。判定不能は安全側で true。 */
function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    if (a === 0 || a === 10 || a === 127) return true; // 0.x / 10.x / loopback
    if (a === 169 && b === 254) return true; // link-local + クラウドメタデータ(169.254.169.254)
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16-31.x
    if (a === 192 && b === 168) return true; // 192.168.x
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT 100.64-127.x
    if (a >= 224) return true; // マルチキャスト/予約
    return false;
  }
  if (net.isIPv6(ip)) {
    const low = ip.toLowerCase();
    if (low === '::1' || low === '::') return true;
    if (low.startsWith('fe80')) return true; // link-local
    if (low.startsWith('fc') || low.startsWith('fd')) return true; // ULA
    const mapped = low.match(/::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
    if (mapped) return isBlockedIp(mapped[1]); // IPv4-mapped
    return false;
  }
  return true;
}

/** ホスト名を解決し、いずれかの解決先が遮断対象なら false。 */
async function hostIsSafe(hostname: string): Promise<boolean> {
  try {
    const addrs = await dns.lookup(hostname, { all: true });
    return addrs.length > 0 && !addrs.some((a) => isBlockedIp(a.address));
  } catch {
    return false;
  }
}

function concatChunks(chunks: Uint8Array[], total: number): Uint8Array {
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    out.set(c, off);
    off += c.length;
  }
  return out;
}

/** サイズ上限つきでレスポンス本文を読み取る。 */
async function readLimited(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return (await res.text()).slice(0, MAX_BYTES);
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => {});
  return new TextDecoder('utf-8', { fatal: false }).decode(concatChunks(chunks, total));
}

/** HTML を素のテキストに（script/style 除去 → タグ除去 → 実体参照 → 空白圧縮）。 */
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 指定 URL のページ本文テキストを安全に取得して返す。
 * 取得不可・非対応・危険なURLは ok:false（呼び出し側は best-effort で無視してよい）。
 */
export async function fetchUrlText(rawUrl: string): Promise<FetchUrlResult> {
  let current = rawUrl.trim();
  if (!current) return { ok: false, error: 'URLが空です' };

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let url: URL;
    try {
      url = new URL(current);
    } catch {
      return { ok: false, error: 'URLの形式が不正です' };
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { ok: false, error: 'http / https のURLのみ対応しています' };
    }
    if (!(await hostIsSafe(url.hostname))) {
      return { ok: false, error: 'このURLは取得できません（内部/プライベートアドレス）' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        redirect: 'manual', // リダイレクトは手動で追い、各ホップで再検証する
        headers: {
          'User-Agent': 'ArigatosunNewsBot/1.0 (+https://www.arigatosun.com)',
          Accept: 'text/html,application/xhtml+xml,text/plain',
        },
      });
    } catch {
      clearTimeout(timer);
      return { ok: false, error: 'URLの取得に失敗しました（タイムアウト等）' };
    }
    clearTimeout(timer);

    // リダイレクト: Location を解決して次ホップへ（再度 SSRF チェック）
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (!loc) return { ok: false, error: 'リダイレクト先が不明です' };
      current = new URL(loc, url).toString();
      continue;
    }
    if (!res.ok) {
      return { ok: false, error: `取得エラー（HTTP ${res.status}）` };
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
      return { ok: false, error: 'HTML/テキストのページのみ対応しています' };
    }

    const raw = await readLimited(res);
    const text = (/text\/plain/i.test(contentType) ? raw : htmlToText(raw)).slice(0, MAX_TEXT);
    if (!text) return { ok: false, error: 'ページ本文を抽出できませんでした' };
    return { ok: true, text };
  }

  return { ok: false, error: 'リダイレクトが多すぎます' };
}
