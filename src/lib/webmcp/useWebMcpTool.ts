'use client';

import { useEffect, useRef } from 'react';

export function useWebMcpTool(
  enabled: boolean,
  tool: WebMCP.ModelContextTool,
): void {
  const toolRef = useRef(tool);

  useEffect(() => {
    toolRef.current = tool;
  }, [tool]);

  useEffect(() => {
    if (!enabled || !document.modelContext) return;
    const controller = new AbortController();
    const registeredTool: WebMCP.ModelContextTool = {
      ...toolRef.current,
      execute: (input, options) => toolRef.current.execute(input, options),
    };
    document.modelContext.registerTool(registeredTool, { signal: controller.signal }).catch(() => {
      console.warn(`[webmcp] tool registration failed: ${registeredTool.name}`);
    });
    return () => controller.abort();
  }, [enabled, tool.name]);
}
