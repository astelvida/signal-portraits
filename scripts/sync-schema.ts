#!/usr/bin/env tsx
/**
 * Diff the live Notion Companies data source schema against our Zod CompanySchema.
 * Exits non-zero on drift. Run as `pnpm sync-schema`.
 */
import {
  COMPANIES_DATA_SOURCE_ID,
  retrieveDataSource,
} from "../lib/notion/client";

// SSI v3.0 contract. These are the live Notion property names the app reads
// (lib/notion/mappers.ts). Keep in sync when the Companies data source changes.
const EXPECTED_NOTION_PROPS = [
  "Company",
  "Active Thesis",
  "Stage",
  "HQ Country",
  "Headcount",
  "Founded",
  "Last Raise",
  // Score formulas (the headline SSI is derived from these).
  "Adjusted Active Score",
  "Active Score",
  "GAO Score",
  "VSRAI Score",
  "Adjusted SSI",
  "Signal Tier",
  "Priority",
  "Discovery Source",
  "Falsifier Check",
  "Anti-thesis Filter",
  "Status",
  "One-liner",
  "Key Signal 30d",
  "Catalyst Window (days)",
  "Last verified",
  "Last Scored",
  "Last Signal Date",
  "Signals",
  "Primary Catalyst",
  "Market Map Sub-Segment",
  // SSI v3.0 per-dimension rubric.
  "G1 · Regulatory Embeddedness",
  "G2 · Runtime Governance",
  "G3 · Team Fit",
  "G4 · Velocity",
  "G5 · Buyer Traction",
  "G6 · Technical Moat",
  "G7 · Capital Efficiency",
  "G8 · Investor Signal",
  "V1 · SoR Integration Depth",
  "V2 · Domain Data Advantage",
  "V3 · Team Domain Pedigree",
  "V4 · Workflow Lock-In",
  "V5 · Regulatory Alignment",
  "V6 · Switching Cost",
  "V7 · Market Timing",
  "V8 · Capital Efficiency",
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

  if (missing.length === 0) {
    console.log(
      `OK · all ${EXPECTED_NOTION_PROPS.length} expected Notion props present.` +
        (extra.length ? ` (${extra.length} extra props in Notion, informational)` : ""),
    );
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
