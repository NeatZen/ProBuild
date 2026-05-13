export const ESTIMATE_SCHEMA_VERSION = 2 as const;

export type CategoryMarkup = {
  category: string;
  percent: number;
};

export type LineItem = {
  id: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  unitCost: number;
  /** When set, this line was created from an assembly/kit with siblings sharing the same id. */
  kitId?: string;
  kitName?: string;
};

export type Estimate = {
  version: number;
  id: string;
  projectName: string;
  clientNotes: string;
  /** Global markup applied after optional per-category markups. */
  markupPercent: number;
  taxPercent: number;
  /** Overhead % applied after global markup (on subtotal + markup). */
  overheadPercent: number;
  /** Flat bond/insurance add-on before tax. */
  bondInsuranceFlat: number;
  /** Retention % of grand total (including tax); shown as a hold against net due. */
  retentionPercent: number;
  /** Per trimmed category name: % uplift on that category's raw subtotal before global markup. */
  categoryMarkups: CategoryMarkup[];
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
    overheadPercent: 0,
    bondInsuranceFlat: 0,
    retentionPercent: 0,
    categoryMarkups: [],
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
    overheadPercent: 0,
    bondInsuranceFlat: 0,
    retentionPercent: 0,
    categoryMarkups: [],
    lines: [createEmptyLineItem(lineId)],
  };
}
