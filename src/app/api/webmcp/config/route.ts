import { NextResponse } from 'next/server';
import { getWebMcpRuntimeConfig } from '@/lib/webmcp/runtime-config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getWebMcpRuntimeConfig();
  return NextResponse.json(
    { enabled: process.env.NEXT_PUBLIC_WEBMCP_ENABLED === 'true', ...config },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  );
}
