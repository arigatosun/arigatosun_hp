import 'server-only';

import { createWebMcpAdminClient } from './db';

export type WebMcpRuntimeConfig = {
  readToolsEnabled: boolean;
  prepareContactEnabled: boolean;
  submitContactEnabled: boolean;
};

const DISABLED: WebMcpRuntimeConfig = {
  readToolsEnabled: false,
  prepareContactEnabled: false,
  submitContactEnabled: false,
};

export async function getWebMcpRuntimeConfig(): Promise<WebMcpRuntimeConfig> {
  if (process.env.NEXT_PUBLIC_WEBMCP_ENABLED !== 'true') return DISABLED;
  try {
    const { data, error } = await createWebMcpAdminClient()
      .from('webmcp_runtime_config')
      .select('key, enabled');
    if (error) throw error;
    const flags = new Map((data ?? []).map((row) => [row.key, row.enabled]));
    return {
      readToolsEnabled: flags.get('read_tools') === true,
      prepareContactEnabled: flags.get('prepare_contact') === true,
      submitContactEnabled: flags.get('submit_contact') === true,
    };
  } catch {
    console.error('[webmcp] runtime config unavailable');
    return DISABLED;
  }
}

