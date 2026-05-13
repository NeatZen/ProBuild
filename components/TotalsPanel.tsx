"use client";

import { estimateTotals } from "@/lib/estimateMath";
import { formatMoney } from "@/lib/formatMoney";
import { useEstimateStore } from "@/store/estimateStore";

export function TotalsPanel() {
  const estimate = useEstimateStore((s) => s.estimate);
  const setMarkupPercent = useEstimateStore((s) => s.setMarkupPercent);
  const setTaxPercent = useEstimateStore((s) => s.setTaxPercent);

  const totals = estimateTotals(estimate);

  return (
    <aside
      aria-label="Totals and adjustments"
      className="print-show fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur print:static print:border-0 print:shadow-none sm:static sm:z-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:shadow-none sm:backdrop-blur-none"
    >
      <div className="mx-auto max-w-3xl rounded-t-xl border border-zinc-200 bg-white p-4 shadow-sm sm:mt-6 sm:rounded-xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-zinc-600" htmlFor="markup-pct">
              Markup %
            </label>
            <input
              id="markup-pct"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={Number.isFinite(estimate.markupPercent) ? estimate.markupPercent : 0}
              onChange={(e) => setMarkupPercent(Number(e.target.value))}
              className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-600" htmlFor="tax-pct">
              Tax %
            </label>
            <input
              id="tax-pct"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={Number.isFinite(estimate.taxPercent) ? estimate.taxPercent : 0}
              onChange={(e) => setTaxPercent(Number(e.target.value))}
              className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
            />
          </div>
        </div>

        {totals.byCategory.length > 0 ? (
          <div className="mt-4 border-t border-zinc-100 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              By category
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {totals.byCategory.map((row) => (
                <li
                  key={row.category}
                  className="flex items-center justify-between gap-2 tabular-nums"
                >
                  <span className="text-zinc-700">{row.category}</span>
                  <span className="font-medium">{formatMoney(row.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <dl className="mt-4 space-y-2 border-t border-zinc-100 pt-3 text-sm">
          <div className="flex justify-between gap-2 tabular-nums">
            <dt className="text-zinc-600">Subtotal</dt>
            <dd className="font-medium">{formatMoney(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between gap-2 tabular-nums">
            <dt className="text-zinc-600">Markup</dt>
            <dd className="font-medium">{formatMoney(totals.markupAmount)}</dd>
          </div>
          <div className="flex justify-between gap-2 tabular-nums">
            <dt className="text-zinc-600">Tax</dt>
            <dd className="font-medium">{formatMoney(totals.taxAmount)}</dd>
          </div>
          <div className="flex justify-between gap-2 border-t border-zinc-200 pt-2 text-base font-semibold tabular-nums">
            <dt>Grand total</dt>
            <dd>{formatMoney(totals.grandTotal)}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
