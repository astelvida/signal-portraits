import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { updateTag } from "next/cache";

/**
 * Notion webhook handling.
 *
 * Notion's webhook model is NOT a GitHub-style self-generated secret. The flow:
 *
 *  1. You create the webhook subscription in Notion pointing at /api/revalidate.
 *  2. Notion POSTs a one-time challenge: { "verification_token": "secret_..." }.
 *     This request is UNSIGNED. We must return 200 and surface the token.
 *  3. You copy that token, paste it into Notion's "Verify" form, AND store it as
 *     the NOTION_WEBHOOK_SECRET env var. The token IS the signing secret.
 *  4. Every later event carries an `X-Notion-Signature: sha256=<hex>` header,
 *     HMAC-SHA256 of the raw body keyed by the verification_token.
 *
 * So NOTION_WEBHOOK_SECRET must hold the verification_token Notion generated —
 * not a value you made up with `openssl rand`.
 */

// Notion webhook event payload (subset we care about).
interface NotionWebhookEvent {
  type?: string;
  entity?: { id?: string; type?: string };
  data?: {
    page?: { id: string };
    parent?: { id?: string; type?: string; data_source_id?: string };
  };
}

interface VerificationChallenge {
  verification_token: string;
}

export interface WebhookResult {
  ok: boolean;
  status: number;
  tagsFired: string[];
  reason?: string;
  /** Present only for the one-time verification challenge. */
  verificationToken?: string;
}

export function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
): boolean {
  if (!secret || !signatureHeader) return false;
  // Notion signs the raw request body: HMAC-SHA256, hex, prefixed "sha256=".
  const expectedSig = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signatureHeader.replace(/^sha256=/, "").trim();
  if (provided.length !== expectedSig.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}

function isVerificationChallenge(v: unknown): v is VerificationChallenge {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).verification_token === "string"
  );
}

/**
 * Process an inbound Notion webhook POST. Handles both the one-time
 * verification challenge and ordinary signed events.
 */
export async function handleNotionWebhook(
  rawBody: string,
  signatureHeader: string | null,
): Promise<WebhookResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return { ok: false, status: 400, tagsFired: [], reason: "invalid json" };
  }

  // --- One-time verification challenge (unsigned) ---
  if (isVerificationChallenge(parsed)) {
    const token = parsed.verification_token;
    // The token is delivered exactly once and cannot be retrieved later.
    // Log it so the operator can copy it from `vercel logs` into Notion's
    // Verify form and into the NOTION_WEBHOOK_SECRET env var.
    console.log(
      "[notion-webhook] verification challenge received. " +
        "Paste this token into Notion's Verify form AND set it as " +
        `NOTION_WEBHOOK_SECRET:\n${token}`,
    );
    return { ok: true, status: 200, tagsFired: [], verificationToken: token };
  }

  // --- Ordinary signed event ---
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (!secret) {
    return { ok: false, status: 401, tagsFired: [], reason: "no secret configured" };
  }
  if (!verifySignature(rawBody, signatureHeader, secret)) {
    return { ok: false, status: 401, tagsFired: [], reason: "bad signature" };
  }

  const event = parsed as NotionWebhookEvent;
  const tagsFired: string[] = [];

  // Any companies/signals change invalidates the global companies tag.
  updateTag("companies");
  tagsFired.push("companies");

  // If the event names a specific page, tag-revalidate that page too.
  const pageId = event.entity?.id ?? event.data?.page?.id;
  if (pageId) {
    updateTag(`company:${pageId}`);
    tagsFired.push(`company:${pageId}`);
  }

  return { ok: true, status: 200, tagsFired };
}
