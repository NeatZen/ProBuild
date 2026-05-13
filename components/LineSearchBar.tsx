"use client";

import type { CurrencyCode } from "@/lib/appTypes";
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

export function LineSearchBar({ matchCount, totalLines }: Props) {
  const lineFilter = useProBuildStore((s) => s.ui.lineFilter);
  const setLineFilter = useProBuildStore((s) => s.setLineFilter);
  const currency = useProBuildStore((s) => s.settings.currency);
  const locale = useProBuildStore((s) => s.settings.locale);
  const setCurrency = useProBuildStore((s) => s.setCurrency);
  const setLocale = useProBuildStore((s) => s.setLocale);

  return (
    <div className="print-hide mt-5 flex flex-col gap-2.5 rounded-xl border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end sm:gap-4">
      <div className="min-w-0 flex-1">
        <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="line-search">
          Find lines
        </label>
        <input
          id="line-search"
          value={lineFilter}
          onChange={(e) => setLineFilter(e.target.value)}
          placeholder="Filter by description, category, unit…"
          className="mt-1.5 w-full min-h-11 rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-sm text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus-visible:border-teal-600/80 focus-visible:ring-2 focus-visible:ring-teal-600/15"
        />
        {lineFilter.trim() ? (
          <p className="mt-1 text-[11px] text-stone-500">
            {matchCount} of {totalLines} visible (dimmed rows still scroll in order). Press Esc to clear.
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
            className="mt-1.5 block min-h-11 w-full min-w-[6.5rem] rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus-visible:border-teal-600/80 focus-visible:ring-2 focus-visible:ring-teal-600/15 sm:w-auto"
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
            className="mt-1.5 w-full min-h-11 rounded-lg border border-stone-200 bg-white px-3 font-mono text-sm text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus-visible:border-teal-600/80 focus-visible:ring-2 focus-visible:ring-teal-600/15"
          />
        </div>
      </div>
    </div>
  );
}
