import type { Estimate, LineItem } from "./estimateTypes";
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

export function normalizeLineItem(raw: unknown): LineItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || !o.id) return null;
  return {
    id: o.id,
    description: typeof o.description === "string" ? o.description : "",
    category: typeof o.category === "string" ? o.category : "",
    quantity: coalesceNum(o.quantity, 1),
    unit: typeof o.unit === "string" ? o.unit : "ea",
    unitCost: coalesceNum(o.unitCost, 0),
    kitId: typeof o.kitId === "string" && o.kitId ? o.kitId : undefined,
    kitName: typeof o.kitName === "string" && o.kitName ? o.kitName : undefined,
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

  const linesIn = Array.isArray(o.lines) ? o.lines : [];
  const lines = linesIn.map(normalizeLineItem).filter((x): x is LineItem => x != null);
  const safeLines = lines.length > 0 ? lines : [createEmptyLineItem(newId())];

  return {
    version: ESTIMATE_SCHEMA_VERSION,
    id,
    projectName: typeof o.projectName === "string" ? o.projectName : "",
    clientNotes: typeof o.clientNotes === "string" ? o.clientNotes : "",
    markupPercent: coalesceNum(o.markupPercent, 0),
    taxPercent: coalesceNum(o.taxPercent, 0),
    overheadPercent: coalesceNum(o.overheadPercent, 0),
    bondInsuranceFlat: coalesceNum(o.bondInsuranceFlat, 0),
    retentionPercent: coalesceNum(o.retentionPercent, 0),
    categoryMarkups: normalizeCategoryMarkups(o.categoryMarkups),
    lines: safeLines,
  };
}
