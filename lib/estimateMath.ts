import type { CategoryMarkup, Estimate, LineItem } from "./estimateTypes";

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

export type TotalsBreakdown = {
  /** Raw sum of line extensions (before per-category markups). */
  subtotal: number;
  /** After per-category markups (still before global markup). */
  adjustedSubtotal: number;
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
 * Order: line subtotal → per-category % → global markup % → overhead % → flat bond/insurance
 * → tax % on pretax subtotal → grand total → retention % of grand → net due.
 */
export function computeTotals(
  lines: LineItem[],
  markupPercent: number,
  taxPercent: number,
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

  const markup = roundMoney(adjustedSubtotal * (Number(markupPercent) / 100));
  const afterMarkup = roundMoney(adjustedSubtotal + markup);
  const overhead = roundMoney(afterMarkup * (Number(overheadPercent) / 100));
  const afterOverhead = roundMoney(afterMarkup + overhead);
  const bond = roundMoney(Number(bondInsuranceFlat));
  const taxableBase = roundMoney(afterOverhead + bond);
  const tax = roundMoney(taxableBase * (Number(taxPercent) / 100));
  const grandTotal = roundMoney(taxableBase + tax);
  const retention = roundMoney(grandTotal * (Number(retentionPercent) / 100));
  const netDue = roundMoney(grandTotal - retention);

  return {
    subtotal: rawSubtotal,
    adjustedSubtotal,
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
    | "taxPercent"
    | "overheadPercent"
    | "bondInsuranceFlat"
    | "retentionPercent"
    | "categoryMarkups"
  >,
): TotalsBreakdown {
  return computeTotals(
    estimate.lines,
    estimate.markupPercent,
    estimate.taxPercent,
    estimate.overheadPercent ?? 0,
    estimate.bondInsuranceFlat ?? 0,
    estimate.retentionPercent ?? 0,
    estimate.categoryMarkups ?? [],
  );
}
