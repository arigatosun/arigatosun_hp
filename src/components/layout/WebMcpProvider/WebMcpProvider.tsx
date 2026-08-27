'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchJson, type PublicWebMcpConfig } from '@/lib/webmcp/client';
import { useWebMcpTool } from '@/lib/webmcp/useWebMcpTool';

const DISABLED: PublicWebMcpConfig = {
  enabled: false,
  readToolsEnabled: false,
  prepareContactEnabled: false,
  submitContactEnabled: false,
};

export default function WebMcpProvider() {
  const [config, setConfig] = useState(DISABLED);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_WEBMCP_ENABLED !== 'true' || !document.modelContext) return;
    fetchJson<PublicWebMcpConfig>('/api/webmcp/config')
      .then(setConfig)
      .catch(() => setConfig(DISABLED));
  }, []);

  const servicesTool = useMemo<WebMCP.ModelContextTool>(() => ({
    name: 'get_company_services',
    title: 'アリガトサンのサービスを取得',
    description: '株式会社アリガトサンが提供しているサービスの正式な一覧と説明、詳細ページURLを取得します。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: () => fetchJson('/api/webmcp/services'),
  }), []);

  const worksTool = useMemo<WebMCP.ModelContextTool>(() => ({
    name: 'find_case_studies',
    title: '制作実績を検索',
    description: '株式会社アリガトサンの公開済み制作実績をカテゴリやキーワードで検索します。',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', maxLength: 100 },
        category: { type: 'string', enum: ['AI / DEVELOPMENT', 'DESIGN / BRANDING', 'IP / CREATIVE', 'CREATIVE PROJECT'] },
        limit: { type: 'integer', minimum: 1, maximum: 5, default: 3 },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, untrustedContentHint: false },
    execute: (input) => fetchJson('/api/webmcp/case-studies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),
  }), []);

  useWebMcpTool(config.enabled && config.readToolsEnabled, servicesTool);
  useWebMcpTool(config.enabled && config.readToolsEnabled, worksTool);
  return null;
}
