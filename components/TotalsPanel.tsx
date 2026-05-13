"use client";

import { estimateTotals } from "@/lib/estimateMath";
import { formatMoney } from "@/lib/formatMoney";
import { useEstimateStore } from "@/store/estimateStore";

const inputClass =
  "mt-1 w-full min-h-9 rounded-lg border border-stone-200 bg-white/90 px-2.5 py-1.5 text-sm text-stone-900 shadow-sm shadow-stone-900/5 outline-none transition focus:border-teal-400/80 focus:bg-white focus:ring-2 focus:ring-teal-500/20 font-mono tabular-nums sm:mt-1.5 sm:min-h-11 sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-base sm:focus:shadow-md sm:focus:shadow-teal-900/5";

const labelClass =
  "text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:text-[11px]";

export function TotalsPanel() {
  const estimate = useEstimateStore((s) => s.estimate);
  const setMarkupPercent = useEstimateStore((s) => s.setMarkupPercent);
  const setTaxPercent = useEstimateStore((s) => s.setTaxPercent);

  const totals = estimateTotals(estimate);

  return (
    <aside
      aria-label="Totals and adjustments"
      className="print-show fixed inset-x-0 bottom-0 z-20 flex max-h-[min(42vh,20rem)] flex-col border-t border-stone-200/80 bg-white/90 shadow-[0_-12px_40px_-14px_rgba(28,25,23,0.2)] backdrop-blur-xl max-sm:pb-[env(safe-area-inset-bottom)] print:static print:max-h-none print:flex-none print:border-0 print:bg-transparent print:pb-0 print:shadow-none sm:static sm:z-0 sm:max-h-none sm:border-0 sm:bg-transparent sm:pb-0 sm:shadow-none sm:backdrop-blur-none"
    >
      <div className="flex min-h-0 flex-1 flex-col px-3 pt-2 sm:px-0 sm:pt-0">
        <div className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden rounded-t-2xl border border-b-0 border-stone-200/80 bg-white/95 shadow-xl shadow-stone-900/10 ring-1 ring-white/70 sm:mt-8 sm:rounded-2xl sm:border-b sm:shadow-xl">
          <div
            className="h-0.5 shrink-0 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 sm:h-1"
            aria-hidden
          />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:p-6 sm:pb-6">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-stone-100 pb-2 sm:gap-3 sm:pb-4">
              <div>
                <h2 className="text-xs font-semibold tracking-tight text-stone-900 sm:text-sm">
                  Totals
                </h2>
                <p className="mt-0.5 hidden text-xs text-stone-500 sm:block">
                  Markup and tax apply to the subtotal.
                </p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-4">
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
              <div className="mt-2 max-sm:max-h-[min(28vh,12rem)] max-sm:overflow-y-auto sm:mt-5 sm:max-h-none rounded-lg border border-stone-100 bg-stone-50/60 p-2 sm:rounded-xl sm:p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 sm:text-[11px]">
                  By category
                </p>
                <ul className="mt-1.5 space-y-1 text-xs sm:mt-3 sm:space-y-2 sm:text-sm">
                  {totals.byCategory.map((row) => (
                    <li
                      key={row.category}
                      className="flex items-center justify-between gap-2 border-b border-stone-100/80 py-1 last:border-0 last:pb-0 sm:pb-2"
                    >
                      <span className="truncate text-stone-700">{row.category}</span>
                      <span className="shrink-0 font-medium tabular-nums text-stone-900 font-mono">
                        {formatMoney(row.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <dl className="mt-2 space-y-1 text-xs sm:mt-5 sm:space-y-2.5 sm:text-sm">
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

              <div className="mt-2 overflow-hidden rounded-lg bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-px shadow-md shadow-stone-900/20 print:border print:border-stone-300 print:bg-white print:p-0 print:shadow-none sm:mt-4 sm:rounded-xl sm:p-[1px] sm:shadow-lg">
                <div className="flex items-center justify-between gap-2 rounded-[9px] bg-gradient-to-br from-stone-900 to-stone-800 px-3 py-2 text-white print:rounded-md print:bg-white print:text-stone-900 print:shadow-none sm:gap-3 sm:rounded-[11px] sm:px-4 sm:py-3.5">
                  <dt className="text-xs font-semibold tracking-tight sm:text-sm">Grand total</dt>
                  <dd className="text-base font-bold tabular-nums tracking-tight font-mono sm:text-lg md:text-xl">
                    {formatMoney(totals.grandTotal)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </aside>
  );
}
