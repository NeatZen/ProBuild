export const ESTIMATE_SCHEMA_VERSION = 3 as const;

export type CategoryMarkup = {
  category: string;
  percent: number;
};

/** For grouping base bid vs alternates; subtotals per section in UI. */
export type EstimateSection = {
  id: string;
  label: string;
  /** Base scope vs optional alternate scope */
  kind: "base" | "alternate";
};

export type LineType =
  | "labor"
  | "material"
  | "allowance"
  | "subcontractor"
  | "equipment"
  | "other";

export function inferLineTypeFromCategory(category: string): LineType {
  const c = category.trim().toLowerCase();
  if (c.includes("labor")) return "labor";
  if (c.includes("material")) return "material";
  if (c.includes("allow")) return "allowance";
  if (c.includes("subcontract")) return "subcontractor";
  if (c.includes("equipment") || c.includes("equip") || c.includes("rental")) return "equipment";
  return "other";
}

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
  /** Labor / material / allowance — used for grouping and reporting. */
  lineType: LineType;
  /** Phase or alternate bucket; must match an entry in estimate.sections. */
  sectionId: string;
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
  /** Bid phases: base bid and optional alternates. */
  sections: EstimateSection[];
  lines: LineItem[];
};

export function createEmptyLineItem(id: string, sectionId: string): LineItem {
  return {
    id,
    description: "",
    category: "",
    quantity: 1,
    unit: "ea",
    unitCost: 0,
    lineType: "other",
    sectionId,
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
  const sectionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sec-${Date.now()}`;
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
    sections: [{ id: sectionId, label: "Base bid", kind: "base" }],
    lines: [createEmptyLineItem(lineId, sectionId)],
  };
}

/** Clear fields but keep the same estimate id (stable in lists and URLs). */
export function resetEstimateInPlace(estimateId: string): Estimate {
  const lineId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `line-${Date.now()}`;
  const sectionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sec-${Date.now()}`;
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
    sections: [{ id: sectionId, label: "Base bid", kind: "base" }],
    lines: [createEmptyLineItem(lineId, sectionId)],
  };
}
