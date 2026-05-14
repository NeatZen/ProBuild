export const ESTIMATE_SCHEMA_VERSION = 4 as const;

export type CategoryMarkup = {
  category: string;
  percent: number;
};

/** Which line economics are included in sales/use tax (heuristic, proportional to adjusted subtotal). */
export type TaxScope =
  | "all"
  | "materials_equipment"
  | "labor"
  | "subcontractor"
  | "exclude_allowances";

/** Marginal bands on adjusted subtotal (after category markups). `upto` is cumulative ceiling; null = remainder. */
export type MarkupTier = {
  upto: number | null;
  percent: number;
};

export type MarkupMode = "flat" | "tiered";

/** For grouping base bid vs alternates; subtotals per section in UI. */
export type EstimateSection = {
  id: string;
  label: string;
  /** Base scope vs optional alternate scope */
  kind: "base" | "alternate";
  /** Optional schedule note for proposals (ISO date yyyy-mm-dd) */
  startDate?: string;
  endDate?: string;
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

/** Optional SF takeoff scratchpad (does not auto-sync qty until user applies). */
export type LineTakeoffHint = {
  lf?: number;
  heightFt?: number;
  wastePercent?: number;
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
  /** Labor / material / allowance — used for grouping and reporting. */
  lineType: LineType;
  /** Phase or alternate bucket; must match an entry in estimate.sections. */
  sectionId: string;
  /** Internal estimator notes (not on client export unless toggled). */
  internalNote?: string;
  /** Flag for review / RFI */
  needsReview?: boolean;
  /** Optional takeoff scratch values (LF × height → SF, etc.) */
  takeoff?: LineTakeoffHint;
};

export type Estimate = {
  version: number;
  id: string;
  projectName: string;
  clientNotes: string;
  /** Global markup when markupMode is flat; ignored for tiered except as fallback when tiers empty. */
  markupPercent: number;
  markupMode: MarkupMode;
  /** When markupMode is tiered, marginal brackets on adjusted subtotal. */
  markupTiers: MarkupTier[];
  taxPercent: number;
  /** Controls which line types contribute to the taxable portion (proportional method). */
  taxScope: TaxScope;
  /** Free-text jurisdiction label for proposals (state, city tax notes). */
  jurisdictionLabel: string;
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

/** Fixed ids shared by server/client for the empty store bootstrap (avoid React hydration mismatches). */
export function createBootstrapEstimate(): Estimate {
  const sid = "pb-seed-section";
  return {
    version: ESTIMATE_SCHEMA_VERSION,
    id: "pb-seed-estimate",
    projectName: "",
    clientNotes: "",
    markupPercent: 0,
    markupMode: "flat",
    markupTiers: [],
    taxPercent: 0,
    taxScope: "all",
    jurisdictionLabel: "",
    overheadPercent: 0,
    bondInsuranceFlat: 0,
    retentionPercent: 0,
    categoryMarkups: [],
    sections: [{ id: sid, label: "Base bid", kind: "base" }],
    lines: [createEmptyLineItem("pb-seed-line", sid)],
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
    markupMode: "flat",
    markupTiers: [],
    taxPercent: 0,
    taxScope: "all",
    jurisdictionLabel: "",
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
    markupMode: "flat",
    markupTiers: [],
    taxPercent: 0,
    taxScope: "all",
    jurisdictionLabel: "",
    overheadPercent: 0,
    bondInsuranceFlat: 0,
    retentionPercent: 0,
    categoryMarkups: [],
    sections: [{ id: sectionId, label: "Base bid", kind: "base" }],
    lines: [createEmptyLineItem(lineId, sectionId)],
  };
}
