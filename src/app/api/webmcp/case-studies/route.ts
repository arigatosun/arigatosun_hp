import { NextResponse } from 'next/server';
import { getAllWorks } from '@/data/works';
import { SITE_URL } from '@/lib/site';
import { getWebMcpRuntimeConfig } from '@/lib/webmcp/runtime-config';
import { HttpInputError, readJsonObject } from '@/lib/http/read-json';
import { fitToolArrayResponse } from '@/lib/webmcp/output-limit';

const CATEGORIES = ['AI / DEVELOPMENT', 'DESIGN / BRANDING', 'IP / CREATIVE', 'CREATIVE PROJECT'];
const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

function normalizeSearch(value: string): string {
  return value.normalize('NFKC').trim().toLocaleLowerCase('ja-JP');
}

export async function POST(request: Request) {
  const config = await getWebMcpRuntimeConfig();
  if (!config.readToolsEnabled) return NextResponse.json({ error: 'WebMCP is disabled.' }, { status: 503, headers: NO_STORE });
  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request);
  } catch (error) {
    if (error instanceof HttpInputError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status, headers: NO_STORE });
    throw error;
  }
  const query = typeof body.query === 'string' ? normalizeSearch(body.query).slice(0, 100) : '';
  const category = typeof body.category === 'string' && CATEGORIES.includes(body.category) ? body.category : '';
  const limit = typeof body.limit === 'number' ? Math.min(5, Math.max(1, Math.trunc(body.limit))) : 3;
  const works = await getAllWorks();
  const results = works.filter((work) => {
    if (category && !work.categories.includes(category as never)) return false;
    if (!query) return true;
    return normalizeSearch([
      work.client,
      work.title,
      work.term,
      ...work.categories,
      ...work.details.flatMap((detail) => [detail.label, detail.value]),
    ].join(' ')).includes(query);
  }).slice(0, limit).map((work) => ({
    id: work.id,
    client: work.client,
    title: work.title.replaceAll('\n', ' '),
    categories: work.categories,
    scope: work.details.map((detail) => detail.value),
    term: work.term,
    url: `${SITE_URL}/works/${work.id}`,
  }));
  const message = results.length === 0 ? '条件に一致する公開実績はありませんでした。' : undefined;
  return NextResponse.json(fitToolArrayResponse('results', results, message ? { message } : {}), { headers: NO_STORE });
}
