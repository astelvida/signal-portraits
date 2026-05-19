import "server-only";
import { Client } from "@notionhq/client";
import { cache } from "react";

// Companies data source — verified 19 May 2026 via Notion MCP.
export const COMPANIES_DATA_SOURCE_ID = "6abacccb-e24b-46c6-9f9f-6a2a3cfc9a0f";
// Signals data source.
export const SIGNALS_DATA_SOURCE_ID = "d67eb9f0-8bcf-443f-ba4f-2b528c4a6cb1";
// Methodology page (SSI v3.0).
export const METHODOLOGY_PAGE_ID = "e29a4e77-e168-41c8-9901-fc2beee52c4e";

let _notion: Client | null = null;

function getClient(): Client {
  if (_notion) return _notion;
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_TOKEN missing. Set it in .env.local (development) or in Vercel project env (production). Create at https://www.notion.so/profile/integrations.",
    );
  }
  _notion = new Client({ auth: token, notionVersion: "2025-09-03" });
  return _notion;
}

// React cache() dedups per-request fetches across components within one render.
export const notion = cache((): Client => getClient());

// Convenience wrappers that throw helpful errors rather than the SDK's raw shapes.
export async function queryDataSource(
  dataSourceId: string,
  options: { pageSize?: number; startCursor?: string; filter?: unknown } = {},
) {
  const client = notion();
  try {
    // The new multi-source database API: data sources are queried via the dataSources endpoint.
    // For compatibility across SDK versions, we use the generic request method.
    const response = await client.request({
      path: `data_sources/${dataSourceId}/query`,
      method: "post",
      body: {
        page_size: options.pageSize ?? 100,
        start_cursor: options.startCursor,
        filter: options.filter,
      },
    });
    return response as {
      results: Array<{ id: string; properties: Record<string, unknown> }>;
      has_more: boolean;
      next_cursor: string | null;
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Notion query failed for ${dataSourceId}: ${message}`);
  }
}

export async function retrieveDataSource(dataSourceId: string) {
  const client = notion();
  return client.request({
    path: `data_sources/${dataSourceId}`,
    method: "get",
  }) as Promise<{
    id: string;
    properties: Record<string, { id: string; name: string; type: string }>;
  }>;
}

export async function retrievePage(pageId: string) {
  const client = notion();
  return client.pages.retrieve({ page_id: pageId });
}

export async function listPageBlocks(pageId: string) {
  const client = notion();
  return client.blocks.children.list({ block_id: pageId, page_size: 100 });
}
