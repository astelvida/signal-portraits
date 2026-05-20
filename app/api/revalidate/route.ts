import { NextResponse } from "next/server";
import { handleNotionWebhook } from "@/lib/notion/revalidation";

/**
 * Notion webhook receiver. This is what keeps the gallery live.
 *
 * Notion's webhook is NOT a GitHub-style self-generated secret. Setup flow:
 *
 *  1. Notion → Settings → Connections → your integration → Webhooks → add a
 *     subscription with URL https://<host>/api/revalidate.
 *  2. Notion POSTs a one-time UNSIGNED challenge: { verification_token }.
 *     This route returns 200 and logs the token (visible in `vercel logs`).
 *  3. Copy that token. Paste it into Notion's "Verify" form to activate the
 *     subscription, AND set it as the NOTION_WEBHOOK_SECRET env var in Vercel.
 *     The verification_token IS the HMAC signing secret.
 *  4. Every later event carries `X-Notion-Signature: sha256=<hex>` — HMAC-SHA256
 *     of the raw body keyed by that token. A bad/absent signature → 401.
 *  5. On a valid event the route calls `updateTag("companies")` (Next 16 Cache
 *     Components), the next render refetches Notion, and the portrait redraws.
 *
 * NOTION_WEBHOOK_SECRET must hold the verification_token Notion generated — it
 * is not a value you invent. NOTION_TOKEN is separate: that authenticates the
 * read API; this only verifies webhook signatures.
 */
export async function POST(req: Request) {
  // Raw body — the exact bytes Notion signed. Do not parse-and-restringify.
  const body = await req.text();
  const sig = req.headers.get("x-notion-signature");
  const result = await handleNotionWebhook(body, sig);

  if (result.verificationToken) {
    return NextResponse.json({ ok: true, challenge: "received" }, { status: 200 });
  }
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: result.status });
  }
  return NextResponse.json({ ok: true, tagsFired: result.tagsFired }, { status: result.status });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    note: "POST endpoint for Notion webhooks. See route source for the setup flow.",
  });
}
