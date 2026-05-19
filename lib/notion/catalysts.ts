import type { CatalystKey } from "./schema";

// External catalyst URLs (PRD §14 default: link to the regulator's own page, not the Notion mirror).
// Substack readers don't have Notion access.
export const CATALYST_URLS: Record<CatalystKey, string> = {
  "EU AI Act":
    "https://artificialintelligenceact.eu/",
  DORA:
    "https://www.eiopa.europa.eu/digital-operational-resilience-act-dora_en",
  AMLA:
    "https://anti-money-laundering-authority.europa.eu/",
  MDR:
    "https://health.ec.europa.eu/medical-devices-sector/new-regulations_en",
  IVDR:
    "https://health.ec.europa.eu/medical-devices-sector/new-regulations_en",
  EHDS:
    "https://health.ec.europa.eu/ehealth-digital-health-and-care/european-health-data-space_en",
  NIS2:
    "https://digital-strategy.ec.europa.eu/en/policies/nis2-directive",
  GDPR:
    "https://gdpr-info.eu/",
  "MiFID II":
    "https://www.esma.europa.eu/policy-rules/mifid-ii-and-mifir",
  DSA:
    "https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package",
  DMA:
    "https://competition-policy.ec.europa.eu/dma_en",
};

export function catalystUrl(key: CatalystKey): string {
  return CATALYST_URLS[key];
}
