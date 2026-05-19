import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { updateTag } from "next/cache";

// Notion webhook payload (subset we care about).
interface NotionWebhookPayload {
  type: string;
  data?: {
    page?: { id: string; properties?: Record<string, unknown> };
    parent?: { data_source_id?: string };
  };
}

export function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || !signatureHeader) return false;
  // Notion sends signatures as "sha256=<hex>" (matches GitHub-style HMAC).
  const expectedSig = createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const provided = signatureHeader.replace(/^sha256=/, "").trim();
  if (provided.length !== expectedSig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

export async function revalidateFromWebhook(
  rawBody: string,
  signatureHeader: string | null,
): Promise<{ ok: boolean; tagsFired: string[]; reason?: string }> {
  const ok = verifySignature(
    rawBody,
    signatureHeader,
    process.env.NOTION_WEBHOOK_SECRET,
  );
  if (!ok) return { ok: false, tagsFired: [], reason: "bad signature" };

  let payload: NotionWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as NotionWebhookPayload;
  } catch {
    return { ok: false, tagsFired: [], reason: "invalid json" };
  }

  const tagsFired: string[] = [];

  // Always revalidate the global companies tag on any companies-db change.
  updateTag("companies");
  tagsFired.push("companies");

  // If the payload identifies a specific page, tag-revalidate it too.
  // The slug isn't always in the payload — for Phase 1, we revalidate by `companies` tag
  // and let the next render dedupe through cache().
  const pageId = payload.data?.page?.id;
  if (pageId) {
    updateTag(`company:${pageId}`);
    tagsFired.push(`company:${pageId}`);
  }

  return { ok: true, tagsFired };
}
