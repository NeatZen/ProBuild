import type {
  CategoryMarkup,
  Estimate,
  EstimateSection,
  LineItem,
  MarkupMode,
  MarkupTier,
  TaxScope,
} from "./estimateTypes";

/** Two-decimal currency rounding (half away from zero at .005). */
export function roundMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const scaled = value * 100;
  const sign = scaled < 0 ? -1 : 1;
  const rounded = Math.round(Math.abs(scaled));
  return (sign * rounded) / 100;
}

export function lineExtended(line: LineItem): number {
  const raw = Number(line.quantity) * Number(line.unitCost);
  if (!Number.isFinite(raw)) return 0;
  return roundMoney(raw);
}

export function subtotalFromLines(lines: LineItem[]): number {
  let sum = 0;
  for (const line of lines) {
    sum += lineExtended(line);
  }
  return roundMoney(sum);
}

export function categorySubtotals(lines: LineItem[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of lines) {
    const key = line.category.trim() || "Uncategorized";
    const ext = lineExtended(line);
    map.set(key, roundMoney((map.get(key) ?? 0) + ext));
  }
  return map;
}

function categoryMarkupLookup(rows: CategoryMarkup[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const row of rows) {
    const key = row.category.trim();
    if (!key) continue;
    const p = Number(row.percent);
    m.set(key, Number.isFinite(p) ? p : 0);
  }
  return m;
}

export function lineInTaxScope(line: LineItem, scope: TaxScope): boolean {
  switch (scope) {
    case "all":
      return true;
    case "materials_equipment":
      return line.lineType === "material" || line.lineType === "equipment";
    case "labor":
      return line.lineType === "labor";
    case "subcontractor":
      return line.lineType === "subcontractor";
    case "exclude_allowances":
      return line.lineType !== "allowance";
    default:
      return true;
  }
}

/** Sort tiers by cumulative ceiling ascending; null last. */
export function sortMarkupTiers(tiers: MarkupTier[]): MarkupTier[] {
  return [...tiers].sort((a, b) => {
    const au = a.upto == null ? Infinity : a.upto;
    const bu = b.upto == null ? Infinity : b.upto;
    return au - bu;
  });
}

/**
 * Marginal markup on adjusted subtotal: each tier applies to the slice between the previous
 * cumulative cap and this tier's upto (e.g. first 50k at 10%, next 150k at 8%, remainder at 5%).
 */
export function progressiveMarkupAmount(adjustedSubtotal: number, tiers: MarkupTier[]): number {
  if (!Number.isFinite(adjustedSubtotal) || adjustedSubtotal <= 0) return 0;
  const sorted = sortMarkupTiers(tiers).filter((t) => t.upto == null || t.upto > 0);
  if (sorted.length === 0) return 0;

  let remaining = adjustedSubtotal;
  let prevCeiling = 0;
  let markup = 0;
  for (const t of sorted) {
    const cap = t.upto == null ? Infinity : t.upto;
    const bandWidth = Math.max(0, cap - prevCeiling);
    const slice = Math.min(remaining, bandWidth);
    if (slice > 0) {
      markup += slice * (Number(t.percent) / 100);
      remaining -= slice;
    }
    prevCeiling = cap;
    if (remaining <= 0) break;
  }
  return roundMoney(markup);
}

export function resolveMarkupAmount(
  adjustedSubtotal: number,
  markupPercent: number,
  markupMode: MarkupMode,
  markupTiers: MarkupTier[],
): number {
  if (markupMode === "tiered" && markupTiers.length > 0) {
    return progressiveMarkupAmount(adjustedSubtotal, markupTiers);
  }
  return roundMoney(adjustedSubtotal * (Number(markupPercent) / 100));
}

export type TotalsBreakdown = {
  /** Raw sum of line extensions (before per-category markups). */
  subtotal: number;
  /** After per-category markups (still before global markup). */
  adjustedSubtotal: number;
  /** Share of adjusted subtotal that is in the selected tax scope (0–1). */
  taxScopeFraction: number;
  markupAmount: number;
  overheadAmount: number;
  bondInsuranceFlat: number;
  taxableBase: number;
  taxAmount: number;
  grandTotal: number;
  retentionAmount: number;
  netDue: number;
  byCategory: { category: string; amount: number; markupPercent: number; adjusted: number }[];
};

/**
 * Order: line subtotal → per-category % → global markup (flat or tiered) → overhead % → flat bond/insurance
 * → tax % on pretax subtotal (optionally scoped) → grand total → retention % of grand → net due.
 */
export function computeTotals(
  lines: LineItem[],
  markupPercent: number,
  markupMode: MarkupMode,
  markupTiers: MarkupTier[],
  taxPercent: number,
  taxScope: TaxScope,
  overheadPercent: number,
  bondInsuranceFlat: number,
  retentionPercent: number,
  categoryMarkups: CategoryMarkup[],
): TotalsBreakdown {
  const rawSubtotal = subtotalFromLines(lines);
  const catMap = categorySubtotals(lines);
  const mk = categoryMarkupLookup(categoryMarkups);

  const byCategory = [...catMap.entries()]
    .map(([category, amount]) => {
      const p = mk.get(category) ?? 0;
      const adj = roundMoney(amount * (1 + p / 100));
      return { category, amount, markupPercent: p, adjusted: adj };
    })
    .sort((a, b) => a.category.localeCompare(b.category));

  let adjustedSubtotal = 0;
  for (const row of byCategory) {
    adjustedSubtotal += row.adjusted;
  }
  adjustedSubtotal = roundMoney(adjustedSubtotal);

  /** Per-line adjusted amounts for tax scope ratio. */
  let scopeAdjusted = 0;
  for (const line of lines) {
    const cat = line.category.trim() || "Uncategorized";
    const raw = lineExtended(line);
    const p = mk.get(cat) ?? 0;
    const adj = roundMoney(raw * (1 + p / 100));
    if (lineInTaxScope(line, taxScope)) {
      scopeAdjusted = roundMoney(scopeAdjusted + adj);
    }
  }
  const taxScopeFraction =
    adjustedSubtotal > 0 ? Math.min(1, Math.max(0, scopeAdjusted / adjustedSubtotal)) : taxScope === "all" ? 1 : 0;

  const markup = resolveMarkupAmount(adjustedSubtotal, markupPercent, markupMode, markupTiers);
  const afterMarkup = roundMoney(adjustedSubtotal + markup);
  const overhead = roundMoney(afterMarkup * (Number(overheadPercent) / 100));
  const afterOverhead = roundMoney(afterMarkup + overhead);
  const bond = roundMoney(Number(bondInsuranceFlat));
  const taxableBase = roundMoney(afterOverhead + bond);
  const taxBaseScoped = roundMoney(taxableBase * taxScopeFraction);
  const tax = roundMoney(taxBaseScoped * (Number(taxPercent) / 100));
  const grandTotal = roundMoney(taxableBase + tax);
  const retention = roundMoney(grandTotal * (Number(retentionPercent) / 100));
  const netDue = roundMoney(grandTotal - retention);

  return {
    subtotal: rawSubtotal,
    adjustedSubtotal,
    taxScopeFraction,
    markupAmount: markup,
    overheadAmount: overhead,
    bondInsuranceFlat: bond,
    taxableBase,
    taxAmount: tax,
    grandTotal,
    retentionAmount: retention,
    netDue,
    byCategory,
  };
}

export function estimateTotals(
  estimate: Pick<
    Estimate,
    | "lines"
    | "markupPercent"
    | "markupMode"
    | "markupTiers"
    | "taxPercent"
    | "taxScope"
    | "overheadPercent"
    | "bondInsuranceFlat"
    | "retentionPercent"
    | "categoryMarkups"
  >,
): TotalsBreakdown {
  return computeTotals(
    estimate.lines,
    estimate.markupPercent,
    estimate.markupMode ?? "flat",
    estimate.markupTiers ?? [],
    estimate.taxPercent,
    estimate.taxScope ?? "all",
    estimate.overheadPercent ?? 0,
    estimate.bondInsuranceFlat ?? 0,
    estimate.retentionPercent ?? 0,
    estimate.categoryMarkups ?? [],
  );
}

export type SectionSubtotal = {
  sectionId: string;
  label: string;
  kind: EstimateSection["kind"];
  amount: number;
};

/** Raw extension sum per bid section (base vs alternates) before markups/tax. */
export function sectionSubtotals(estimate: Pick<Estimate, "sections" | "lines">): SectionSubtotal[] {
  const bySection = new Map<string, number>();
  for (const line of estimate.lines) {
    const ext = lineExtended(line);
    bySection.set(line.sectionId, roundMoney((bySection.get(line.sectionId) ?? 0) + ext));
  }
  return estimate.sections.map((s) => ({
    sectionId: s.id,
    label: s.label,
    kind: s.kind,
    amount: bySection.get(s.id) ?? 0,
  }));
}
