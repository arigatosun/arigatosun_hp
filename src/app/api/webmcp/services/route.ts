import { NextResponse } from 'next/server';
import { SERVICE_CARDS } from '@/data/services';
import { SITE_URL } from '@/lib/site';
import { getWebMcpRuntimeConfig } from '@/lib/webmcp/runtime-config';
import { fitToolArrayResponse } from '@/lib/webmcp/output-limit';

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

export async function GET() {
  const config = await getWebMcpRuntimeConfig();
  if (!config.readToolsEnabled) return NextResponse.json({ error: 'WebMCP is disabled.' }, { status: 503, headers: NO_STORE });
  const services = SERVICE_CARDS.map((service) => ({
      id: service.id,
      category: service.category,
      name: service.categoryLabel,
      description: service.description.replaceAll('\n', ' '),
      url: `${SITE_URL}/service/${service.id}`,
    }));
  return NextResponse.json(fitToolArrayResponse('services', services), { headers: NO_STORE });
}
