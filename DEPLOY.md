# Deploy — Signal Portraits

Phase 1 is build-complete and ready to ship to Vercel. Run the steps below in order.

## 1. Set environment variables

In a fresh `.env.local` for local dev, and in the Vercel project env for production:

```env
# Notion integration token. Create at https://www.notion.so/profile/integrations
# Then share the Companies + Signals data sources with the integration.
NOTION_TOKEN=secret_xxx

# The Notion webhook verification_token. NOT self-generated — Notion
# sends it as a one-time challenge when you create the webhook
# subscription. See the Webhook section in README.md for the flow.
NOTION_WEBHOOK_SECRET=...

NEXT_PUBLIC_SITE_URL=https://signal-portraits.vercel.app
```

Until `NOTION_TOKEN` is set, the app renders 10 representative fixture companies (see `lib/notion/fixtures.ts`). The moment the token lands, live Notion data takes over.

## 2. Vercel login + first deploy

The Claude Code Vercel MCP doesn't deploy directly — it dispatches to the CLI. Run:

```bash
pnpm dlx vercel login            # interactive browser OAuth
pnpm dlx vercel link              # link to a new or existing project; pick org + project name "signal-portraits"
pnpm dlx vercel env pull .env.local   # pull any existing env vars
pnpm dlx vercel --prod            # ship to production
```

When prompted, accept defaults except project name (`signal-portraits`).

## 3. Domain

Production runs on the Vercel-assigned URL: `https://signal-portraits.vercel.app`.
No DNS work is required.

**Optional — custom domain.** To serve from a custom domain later:

```bash
pnpm dlx vercel domains add <your-domain> signal-portraits
```

Add the **CNAME** record Vercel prints at your DNS provider (target
`cname.vercel-dns.com`), then update `NEXT_PUBLIC_SITE_URL` to match and
redeploy. SSL provisioning usually completes within 5 minutes.

## 4. Wire the Notion webhook

In Notion → Settings → Connections → your integration → Webhooks:

1. Add a subscription with URL `https://<host>/api/revalidate`, subscribed
   to the Companies + Signals data sources.
2. Notion immediately POSTs a one-time `{ verification_token }` challenge.
   The route returns 200 and logs the token. Retrieve it:
   `vercel logs https://<host> | grep notion-webhook`
3. Click **Verify** in the Notion Webhooks tab and paste that token.
4. Set the same token as the `NOTION_WEBHOOK_SECRET` env var in Vercel
   (`vercel env` or the dashboard), then redeploy so it takes effect.

The `verification_token` is both the verify-form value and the HMAC
signing key. It is not self-generated.

Smoke test: edit one company's SSI Score by ±1 in Notion. Within 30s, hit `https://<host>/portraits/<slug>?_=$(date +%s)`. The portrait should visibly shift (different seed → different structure). The `/api/og/<slug>` should regenerate.

## 5. Acceptance criteria

After deploy:

```bash
# Verify schema in sync
NOTION_TOKEN=... pnpm sync-schema    # expect: OK

# Full test suite
pnpm test                             # expect: 18/18 green

# Production build sanity
pnpm build                            # expect: clean

# Generate the three OG variants and eyeball them
curl -o /tmp/og-p0.png  https://signal-portraits.vercel.app/api/og/<some-p0-slug>
curl -o /tmp/og-mute.png https://signal-portraits.vercel.app/api/og/<some-mute-slug>
```

## 6. Optional — install Claude Code hooks

Copy the template into `.claude/settings.json` to enable lint+typecheck on every Edit/Write and the secret-leak Bash guard:

```bash
cp docs/settings.json.template .claude/settings.json
```

The user must explicitly authorise the hooks (Claude Code asks once).
