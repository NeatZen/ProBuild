import { describe, expect, it } from "vitest";

import { formatMoney } from "../formatMoney";

describe("formatMoney", () => {
  it("formats USD by default", () => {
    expect(formatMoney(1234.5)).toContain("234");
    expect(formatMoney(1234.5)).toMatch(/\$/);
  });

  it("accepts alternate currency codes", () => {
    const s = formatMoney(10, "EUR", "en-US");
    expect(s).toMatch(/€|EUR/);
  });
});
