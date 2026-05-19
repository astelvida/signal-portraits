import { NextResponse } from "next/server";
import { revalidateFromWebhook } from "@/lib/notion/revalidation";

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
