import { describe, expect, it } from "vitest";

import { APP_SCHEMA_VERSION } from "@/lib/appTypes";
import type { AppPersist } from "@/lib/appTypes";
import { normalizeAppPersist } from "@/lib/persistence";

describe("persistence migration", () => {
  it("upgrades app v2 storage into app v3 shape with sections", () => {
    const legacy = {
      version: 2,
      estimates: [
        {
          version: 2,
          id: "est-1",
          projectName: "Demo",
          clientNotes: "",
          markupPercent: 0,
          taxPercent: 0,
          overheadPercent: 0,
          bondInsuranceFlat: 0,
          retentionPercent: 0,
          categoryMarkups: [],
          lines: [
            {
              id: "line-1",
              description: "Test line",
              category: "Labor",
              quantity: 2,
              unit: "hr",
              unitCost: 50,
            },
          ],
        },
      ],
      activeEstimateId: "est-1",
      settings: { currency: "USD", locale: "en-US", density: "comfortable" },
      ui: { lineFilter: "", collapsedLineIds: [] },
      revisionsByEstimateId: {},
    } as unknown as AppPersist;

    const next = normalizeAppPersist(legacy);
    expect(next.version).toBe(APP_SCHEMA_VERSION);
    expect(next.estimates[0].sections.length).toBeGreaterThan(0);
    expect(next.estimates[0].lines[0].lineType).toBe("other");
    expect(next.estimates[0].lines[0].sectionId).toBe(next.estimates[0].sections[0].id);
    expect(next.branding).toBeDefined();
  });
});
