import { NextResponse } from "next/server";
import { revalidateFromWebhook } from "@/lib/notion/revalidation";

/**
 * Notion webhook receiver. This is what keeps the gallery live.
 *
 * Flow:
 *  1. You edit a company in the Notion Companies database.
 *  2. Notion POSTs the change here with an HMAC header
 *     (`x-notion-signature: sha256=<hex>`).
 *  3. `revalidateFromWebhook` verifies the HMAC against
 *     `process.env.NOTION_WEBHOOK_SECRET`. A bad/absent signature → 401.
 *     This is the only thing stopping a stranger from forcing cache
 *     invalidation by POSTing fake payloads.
 *  4. On a valid signature it calls `updateTag("companies")` (Next 16
 *     Cache Components), marking every page tagged `companies` stale.
 *  5. The next render refetches from Notion, the SSI score moves, the
 *     seed changes, and the portrait visibly redraws.
 *
 * Setup: Notion → Settings → Connections → integration → Webhooks.
 *  - URL:    https://portraits.anefi.vc/api/revalidate
 *  - Secret: same value as NOTION_WEBHOOK_SECRET (openssl rand -hex 32)
 *  - Subscribe: Companies + Signals data sources.
 *
 * NOTION_WEBHOOK_SECRET only verifies signatures. It does NOT authenticate
 * to Notion — that is NOTION_TOKEN. Both sides (Vercel env + Notion webhook
 * config) must hold the identical secret for the HMAC to match.
 */
export async function POST(req: Request) {
  const sig = req.headers.get("x-notion-signature") ?? req.headers.get("x-signature");
  const body = await req.text();
  const result = await revalidateFromWebhook(body, sig);

  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 401 });
  }

  return NextResponse.json({ ok: true, tagsFired: result.tagsFired });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST a signed payload from Notion to invalidate the cache by tag.",
  });
}
