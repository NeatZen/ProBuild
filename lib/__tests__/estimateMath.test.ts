import { describe, expect, it } from "vitest";
import type { LineItem } from "../estimateTypes";
import {
  categorySubtotals,
  computeTotals,
  lineExtended,
  roundMoney,
  subtotalFromLines,
} from "../estimateMath";

function line(partial: Partial<LineItem> & Pick<LineItem, "id">): LineItem {
  return {
    description: "",
    category: "",
    quantity: 1,
    unit: "ea",
    unitCost: 0,
    ...partial,
  };
}

describe("roundMoney", () => {
  it("rounds to two decimals (half away from zero on cents)", () => {
    expect(roundMoney(10.125)).toBe(10.13);
    expect(roundMoney(-10.125)).toBe(-10.13);
    expect(roundMoney(10.999)).toBe(11);
  });

  it("returns 0 for non-finite values", () => {
    expect(roundMoney(Number.NaN)).toBe(0);
    expect(roundMoney(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("lineExtended", () => {
  it("multiplies quantity by unit cost", () => {
    expect(
      lineExtended(
        line({ id: "1", quantity: 3, unitCost: 10.5 }),
      ),
    ).toBe(31.5);
  });

  it("returns 0 for non-finite inputs", () => {
    expect(lineExtended(line({ id: "1", quantity: NaN, unitCost: 10 }))).toBe(0);
    expect(lineExtended(line({ id: "1", quantity: 1, unitCost: Number.POSITIVE_INFINITY }))).toBe(
      0,
    );
  });
});

describe("subtotalFromLines", () => {
  it("sums line extensions", () => {
    const lines = [
      line({ id: "a", quantity: 2, unitCost: 15 }),
      line({ id: "b", quantity: 1, unitCost: 7.25 }),
    ];
    expect(subtotalFromLines(lines)).toBe(37.25);
  });
});

describe("categorySubtotals", () => {
  it("groups empty category as Uncategorized", () => {
    const m = categorySubtotals([
      line({ id: "1", category: "", unitCost: 10 }),
      line({ id: "2", category: "  ", unitCost: 5 }),
    ]);
    expect(m.get("Uncategorized")).toBe(15);
  });

  it("trims category keys", () => {
    const m = categorySubtotals([
      line({ id: "1", category: " Labor ", unitCost: 100 }),
      line({ id: "2", category: "Labor", unitCost: 50 }),
    ]);
    expect(m.get("Labor")).toBe(150);
  });
});

describe("computeTotals", () => {
  it("applies markup then tax on taxable base", () => {
    const lines = [line({ id: "1", quantity: 1, unitCost: 100 })];
    const t = computeTotals(lines, 10, 8);
    expect(t.subtotal).toBe(100);
    expect(t.markupAmount).toBe(10);
    expect(t.taxableBase).toBe(110);
    expect(t.taxAmount).toBe(8.8);
    expect(t.grandTotal).toBe(118.8);
  });

  it("handles zero markup and tax", () => {
    const lines = [line({ id: "1", quantity: 2, unitCost: 0.33 })];
    const t = computeTotals(lines, 0, 0);
    expect(t.subtotal).toBe(0.66);
    expect(t.grandTotal).toBe(0.66);
  });
});
