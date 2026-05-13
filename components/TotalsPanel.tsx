"use client";

import { estimateTotals } from "@/lib/estimateMath";
import { formatMoney } from "@/lib/formatMoney";
import { useEstimateStore } from "@/store/estimateStore";

const inputClass =
  "mt-1.5 w-full min-h-11 rounded-xl border border-stone-200 bg-white/90 px-3.5 py-2.5 text-base text-stone-900 shadow-sm shadow-stone-900/5 outline-none transition focus:border-teal-400/80 focus:bg-white focus:shadow-md focus:shadow-teal-900/5 focus:ring-2 focus:ring-teal-500/20 font-mono tabular-nums";

const labelClass = "text-[11px] font-semibold uppercase tracking-wider text-stone-500";

export function TotalsPanel() {
  const estimate = useEstimateStore((s) => s.estimate);
  const setMarkupPercent = useEstimateStore((s) => s.setMarkupPercent);
  const setTaxPercent = useEstimateStore((s) => s.setTaxPercent);

  const totals = estimateTotals(estimate);

  return (
    <aside
      aria-label="Totals and adjustments"
      className="print-show fixed inset-x-0 bottom-0 z-20 border-t border-stone-200/80 bg-white/80 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_48px_-16px_rgba(28,25,23,0.18)] backdrop-blur-xl print:static print:border-0 print:bg-transparent print:shadow-none sm:static sm:z-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0 sm:shadow-none sm:backdrop-blur-none"
    >
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-t-2xl border border-stone-200/80 bg-white/95 shadow-2xl shadow-stone-900/10 ring-1 ring-white/70 sm:mt-8 sm:rounded-2xl sm:shadow-xl">
        <div
          className="h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500"
          aria-hidden
        />

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-stone-900">Totals</h2>
              <p className="mt-0.5 text-xs text-stone-500">Markup and tax apply to the subtotal.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="markup-pct">
                Markup %
              </label>
              <input
                id="markup-pct"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={Number.isFinite(estimate.markupPercent) ? estimate.markupPercent : 0}
                onChange={(e) => setMarkupPercent(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="tax-pct">
                Tax %
              </label>
              <input
                id="tax-pct"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={Number.isFinite(estimate.taxPercent) ? estimate.taxPercent : 0}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          {totals.byCategory.length > 0 ? (
            <div className="mt-5 rounded-xl border border-stone-100 bg-stone-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                By category
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {totals.byCategory.map((row) => (
                  <li
                    key={row.category}
                    className="flex items-center justify-between gap-2 border-b border-stone-100/80 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-stone-700">{row.category}</span>
                    <span className="font-medium tabular-nums text-stone-900 font-mono">
                      {formatMoney(row.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3 tabular-nums">
              <dt className="text-stone-600">Subtotal</dt>
              <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-3 tabular-nums">
              <dt className="text-stone-600">Markup</dt>
              <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.markupAmount)}</dd>
            </div>
            <div className="flex justify-between gap-3 tabular-nums">
              <dt className="text-stone-600">Tax</dt>
              <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.taxAmount)}</dd>
            </div>

            <div className="mt-4 overflow-hidden rounded-xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-[1px] shadow-lg shadow-stone-900/25 print:border print:border-stone-300 print:bg-white print:p-0 print:shadow-none">
              <div className="flex items-center justify-between gap-3 rounded-[11px] bg-gradient-to-br from-stone-900 to-stone-800 px-4 py-3.5 text-white print:rounded-lg print:bg-white print:text-stone-900 print:shadow-none">
                <dt className="text-sm font-semibold tracking-tight">Grand total</dt>
                <dd className="text-lg font-bold tabular-nums tracking-tight font-mono sm:text-xl">
                  {formatMoney(totals.grandTotal)}
                </dd>
              </div>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  );
}
