export const ESTIMATE_SCHEMA_VERSION = 1 as const;

export type LineItem = {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
};

export type Estimate = {
  version: typeof ESTIMATE_SCHEMA_VERSION;
  id: string;
  projectName: string;
  clientNotes: string;
  markupPercent: number;
  taxPercent: number;
  lines: LineItem[];
};

export function createEmptyLineItem(id: string): LineItem {
  return {
    id,
    description: "",
    category: "",
    quantity: 1,
    unit: "ea",
    unitCost: 0,
  };
}

export function createDefaultEstimate(): Estimate {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `est-${Date.now()}`;
  const lineId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `line-${Date.now()}`;
  return {
    version: ESTIMATE_SCHEMA_VERSION,
    id,
    projectName: "",
    clientNotes: "",
    markupPercent: 0,
    taxPercent: 0,
    lines: [createEmptyLineItem(lineId)],
  };
}

/** Clear fields but keep the same estimate id (stable in lists and URLs). */
export function resetEstimateInPlace(estimateId: string): Estimate {
  const lineId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `line-${Date.now()}`;
  return {
    version: ESTIMATE_SCHEMA_VERSION,
    id: estimateId,
    projectName: "",
    clientNotes: "",
    markupPercent: 0,
    taxPercent: 0,
    lines: [createEmptyLineItem(lineId)],
  };
}
