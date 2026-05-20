import { describe, it, expect } from "vitest";
import { createHmac } from "node:crypto";
import { verifySignature } from "@/lib/notion/revalidation";

/** Sign a body the way Notion does: HMAC-SHA256, hex, "sha256=" prefix. */
function sign(body: string, token: string): string {
  return `sha256=${createHmac("sha256", token).update(body).digest("hex")}`;
}

describe("verifySignature", () => {
  // Arbitrary non-secret string — HMAC keys are just bytes; this is a test fixture.
  const token = "test-verification-token-fixture";
  const body = JSON.stringify({ type: "page.updated", entity: { id: "abc" } });

  it("accepts a correctly signed body", () => {
    expect(verifySignature(body, sign(body, token), token)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const sig = sign(body, token);
    expect(verifySignature(body + " ", sig, token)).toBe(false);
  });

  it("rejects the wrong secret", () => {
    expect(verifySignature(body, sign(body, token), "wrong-token")).toBe(false);
  });

  it("rejects a missing signature header", () => {
    expect(verifySignature(body, null, token)).toBe(false);
  });

  it("rejects a missing secret", () => {
    expect(verifySignature(body, sign(body, token), undefined)).toBe(false);
  });

  it("accepts a bare hex signature with no sha256= prefix", () => {
    const bare = createHmac("sha256", token).update(body).digest("hex");
    expect(verifySignature(body, bare, token)).toBe(true);
  });
});
