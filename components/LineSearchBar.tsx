"use client";

import type { CurrencyCode, DensityMode } from "@/lib/appTypes";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { useProBuildStore } from "@/store/proBuildStore";

const CURRENCIES: { value: CurrencyCode; label: string }[] = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
  { value: "CAD", label: "CAD" },
  { value: "AUD", label: "AUD" },
];

type Props = {
  matchCount: number;
  totalLines: number;
};

const densityBtn =
  "flex-1 rounded-md px-2.5 py-1.5 text-center text-[11px] font-medium transition sm:min-w-[7.5rem] sm:flex-none sm:text-xs";

export function LineSearchBar({ matchCount, totalLines }: Props) {
  const lineFilter = useProBuildStore((s) => s.ui.lineFilter);
  const setLineFilter = useProBuildStore((s) => s.setLineFilter);
  const currency = useProBuildStore((s) => s.settings.currency);
  const locale = useProBuildStore((s) => s.settings.locale);
  const densitySetting = useProBuildStore((s) => s.settings.density);
  const setCurrency = useProBuildStore((s) => s.setCurrency);
  const setLocale = useProBuildStore((s) => s.setLocale);
  const setDensity = useProBuildStore((s) => s.setDensity);

  const d = useDensityClasses();

  const setMode = (mode: DensityMode) => setDensity(mode);

  return (
    <div
      className={`print-hide flex flex-col rounded-xl border border-stone-200 bg-white shadow-sm ${d.searchBarMt} ${d.searchBarStackGap} ${d.searchBarPad} sm:flex-row sm:flex-wrap sm:items-end`}
    >
      <div className={`flex min-w-0 flex-1 flex-col ${d.searchBarInnerGap}`}>
        <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="line-search">
          Find lines
        </label>
        <input
          id="line-search"
          value={lineFilter}
          onChange={(e) => setLineFilter(e.target.value)}
          placeholder="Filter by description, category, unit…"
          className={`mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus-visible:border-teal-600/80 focus-visible:ring-2 focus-visible:ring-teal-600/15 ${d.formFieldMinH}`}
        />
        {lineFilter.trim() ? (
          <p className="mt-1 text-[11px] text-stone-500">
            {matchCount} of {totalLines} visible (dimmed rows still scroll in order). Press Esc to clear.
          </p>
        ) : null}
      </div>
      <div className={`flex flex-col ${d.searchBarControlsGap} sm:flex-1 sm:flex-row sm:flex-wrap sm:items-end`}>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className={`mt-1.5 block w-full min-w-[6.5rem] rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus-visible:border-teal-600/80 focus-visible:ring-2 focus-visible:ring-teal-600/15 sm:w-auto ${d.formFieldMinH}`}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[8rem] flex-1 sm:max-w-[10rem]">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="locale">
            Locale
          </label>
          <input
            id="locale"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            placeholder="en-US"
            className={`mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-3 font-mono text-sm text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus-visible:border-teal-600/80 focus-visible:ring-2 focus-visible:ring-teal-600/15 ${d.formFieldMinH}`}
          />
        </div>
        <div className="min-w-0 sm:min-w-[14rem]">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500" id="density-label">
            Layout
          </p>
          <div
            className="mt-1.5 flex rounded-lg border border-stone-200 bg-stone-50 p-0.5"
            role="group"
            aria-labelledby="density-label"
          >
            <button
              type="button"
              onClick={() => setMode("comfortable")}
              className={`${densityBtn} ${
                densitySetting === "comfortable"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Comfortable
            </button>
            <button
              type="button"
              onClick={() => setMode("compact")}
              className={`${densityBtn} ${
                densitySetting === "compact"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Compact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
