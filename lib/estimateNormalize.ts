import type {
  Estimate,
  EstimateSection,
  LineItem,
  LineType,
  MarkupMode,
  MarkupTier,
  TaxScope,
} from "./estimateTypes";
import {
  ESTIMATE_SCHEMA_VERSION,
  createEmptyLineItem,
  createDefaultEstimate,
  type CategoryMarkup,
} from "./estimateTypes";

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function coalesceNum(v: unknown, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const LINE_TYPES: LineType[] = [
  "labor",
  "material",
  "allowance",
  "subcontractor",
  "equipment",
  "other",
];

function normalizeLineType(v: unknown): LineType {
  if (typeof v === "string" && LINE_TYPES.includes(v as LineType)) return v as LineType;
  return "other";
}

function normalizeSection(raw: unknown): EstimateSection | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id) return null;
  const label = typeof o.label === "string" ? o.label : "Section";
  const kind = o.kind === "alternate" ? "alternate" : "base";
  const startDate = typeof o.startDate === "string" ? o.startDate : undefined;
  const endDate = typeof o.endDate === "string" ? o.endDate : undefined;
  return { id: o.id, label, kind, startDate, endDate };
}

const TAX_SCOPES: TaxScope[] = [
  "all",
  "materials_equipment",
  "labor",
  "subcontractor",
  "exclude_allowances",
];

function normalizeTaxScope(v: unknown): TaxScope {
  if (typeof v === "string" && TAX_SCOPES.includes(v as TaxScope)) return v as TaxScope;
  return "all";
}

function normalizeMarkupMode(v: unknown): MarkupMode {
  return v === "tiered" ? "tiered" : "flat";
}

function normalizeMarkupTiers(raw: unknown): MarkupTier[] {
  if (!Array.isArray(raw)) return [];
  const out: MarkupTier[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const upto = r.upto === null || r.upto === undefined ? null : coalesceNum(r.upto, 0);
    const percent = coalesceNum(r.percent, 0);
    out.push({ upto, percent });
  }
  return out.slice(0, 20);
}

function normalizeSections(raw: unknown): EstimateSection[] {
  if (!Array.isArray(raw)) return [];
  const out: EstimateSection[] = [];
  for (const row of raw) {
    const s = normalizeSection(row);
    if (s) out.push(s);
  }
  return out;
}

export function normalizeLineItem(raw: unknown, defaultSectionId: string): LineItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id) return null;
  const sectionId =
    typeof o.sectionId === "string" && o.sectionId.trim() ? o.sectionId : defaultSectionId;
  const internalNote = typeof o.internalNote === "string" ? o.internalNote : undefined;
  const needsReview = Boolean(o.needsReview);
  let takeoff: LineItem["takeoff"];
  if (o.takeoff && typeof o.takeoff === "object") {
    const t = o.takeoff as Record<string, unknown>;
    takeoff = {
      lf: Number.isFinite(Number(t.lf)) ? Number(t.lf) : undefined,
      heightFt: Number.isFinite(Number(t.heightFt)) ? Number(t.heightFt) : undefined,
      wastePercent: Number.isFinite(Number(t.wastePercent)) ? Number(t.wastePercent) : undefined,
    };
    if (!takeoff.lf && !takeoff.heightFt && takeoff.wastePercent === undefined) takeoff = undefined;
  }

  return {
    id: o.id,
    description: typeof o.description === "string" ? o.description : "",
    category: typeof o.category === "string" ? o.category : "",
    quantity: coalesceNum(o.quantity, 1),
    unit: typeof o.unit === "string" ? o.unit : "ea",
    unitCost: coalesceNum(o.unitCost, 0),
    kitId: typeof o.kitId === "string" && o.kitId ? o.kitId : undefined,
    kitName: typeof o.kitName === "string" && o.kitName ? o.kitName : undefined,
    lineType: normalizeLineType(o.lineType),
    sectionId,
    internalNote,
    needsReview: needsReview || undefined,
    takeoff,
  };
}

function normalizeCategoryMarkups(raw: unknown): CategoryMarkup[] {
  if (!Array.isArray(raw)) return [];
  const out: CategoryMarkup[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const category = typeof r.category === "string" ? r.category : "";
    const percent = coalesceNum(r.percent, 0);
    if (category.trim()) out.push({ category, percent });
  }
  return out;
}

/** Coerce any persisted estimate shape into the current schema. */
export function normalizeEstimate(raw: unknown): Estimate {
  const seed = createDefaultEstimate();
  if (!raw || typeof raw !== "object") return seed;

  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" && o.id ? o.id : seed.id;

  let sections = normalizeSections(o.sections);
  if (sections.length === 0) {
    const sid = newId();
    sections = [{ id: sid, label: "Base bid", kind: "base" }];
  }
  const primarySectionId = sections[0].id;
  const sectionIds = new Set(sections.map((s) => s.id));

  const linesIn = Array.isArray(o.lines) ? o.lines : [];
  const lines = linesIn
    .map((row) => normalizeLineItem(row, primarySectionId))
    .filter((x): x is LineItem => x != null);

  const fixedLines = lines.map((line) => {
    if (!sectionIds.has(line.sectionId)) {
      return { ...line, sectionId: primarySectionId };
    }
    return line;
  });

  const safeLines =
    fixedLines.length > 0 ? fixedLines : [createEmptyLineItem(newId(), primarySectionId)];

  const jurisdictionLabel = typeof o.jurisdictionLabel === "string" ? o.jurisdictionLabel : "";

  return {
    version: ESTIMATE_SCHEMA_VERSION,
    id,
    projectName: typeof o.projectName === "string" ? o.projectName : "",
    clientNotes: typeof o.clientNotes === "string" ? o.clientNotes : "",
    markupPercent: coalesceNum(o.markupPercent, 0),
    markupMode: normalizeMarkupMode(o.markupMode),
    markupTiers: normalizeMarkupTiers(o.markupTiers),
    taxPercent: coalesceNum(o.taxPercent, 0),
    taxScope: normalizeTaxScope(o.taxScope),
    jurisdictionLabel,
    overheadPercent: coalesceNum(o.overheadPercent, 0),
    bondInsuranceFlat: coalesceNum(o.bondInsuranceFlat, 0),
    retentionPercent: coalesceNum(o.retentionPercent, 0),
    categoryMarkups: normalizeCategoryMarkups(o.categoryMarkups),
    sections,
    lines: safeLines,
  };
}
