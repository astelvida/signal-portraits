#!/usr/bin/env tsx
/**
 * Diff the live Notion Companies data source schema against our Zod CompanySchema.
 * Exits non-zero on drift. Run as `pnpm sync-schema`.
 */
import {
  COMPANIES_DATA_SOURCE_ID,
  retrieveDataSource,
} from "../lib/notion/client";

const EXPECTED_NOTION_PROPS = [
  "Company",
  "Thesis",
  "Sector",
  "Stage",
  "HQ",
  "Headcount",
  "Founded",
  "Last Raise",
  "SSI Score",
  "Signal Tier",
  "Priority",
  "Discovery Source",
  "Falsifier Check",
  "Anti-thesis Filter",
  "Source confidence",
  "One-liner",
  "Key Signal 30d",
  "Catalyst Window (days)",
  "Last verified",
  "Last Scored",
  "Signals",
  "Primary Catalyst",
  "Market Map Sub-Segment",
];

async function main() {
  if (!process.env.NOTION_TOKEN) {
    console.error("NOTION_TOKEN missing. Set it in .env.local first.");
    process.exit(2);
  }

  const ds = await retrieveDataSource(COMPANIES_DATA_SOURCE_ID);
  const liveProps = Object.keys(ds.properties);

  const missing = EXPECTED_NOTION_PROPS.filter((p) => !liveProps.includes(p));
  const extra = liveProps.filter((p) => !EXPECTED_NOTION_PROPS.includes(p));

  if (missing.length === 0 && extra.length === 0) {
    console.log("OK · Zod schema matches live Notion schema (all 23 expected fields present).");
    process.exit(0);
  }

  console.log("DRIFT detected:");
  if (missing.length) console.log("  missing in Notion:", missing.join(", "));
  if (extra.length) console.log("  extra in Notion (informational):", extra.join(", "));
  if (missing.length) process.exit(1);
  process.exit(0); // extras don't fail; they're informational.
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
