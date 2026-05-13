"use client";

import { estimateTotals } from "@/lib/estimateMath";
import { useMoneyFormatter } from "@/hooks/useMoneyFormatter";
import { selectActiveEstimate, useProBuildStore } from "@/store/proBuildStore";

import { inputClass, labelClassCompact } from "@/lib/uiTokens";

export function TotalsPanel() {
  const estimate = useProBuildStore(selectActiveEstimate);
  const setMarkupPercent = useProBuildStore((s) => s.setMarkupPercent);
  const setTaxPercent = useProBuildStore((s) => s.setTaxPercent);
  const formatMoney = useMoneyFormatter();

  const totals = estimateTotals(estimate);

  return (
    <aside
      aria-label="Totals and adjustments"
      className="print-show fixed inset-x-0 bottom-0 z-20 flex max-h-[min(42vh,20rem)] flex-col border-t border-stone-200/55 bg-white/55 shadow-[0_-18px_50px_-22px_rgba(28,25,23,0.22)] backdrop-blur-2xl max-sm:pb-[max(0.35rem,env(safe-area-inset-bottom))] print:static print:max-h-none print:flex-none print:border-0 print:bg-transparent print:pb-0 print:shadow-none sm:static sm:z-0 sm:max-h-none sm:border-0 sm:bg-transparent sm:pb-0 sm:shadow-none sm:backdrop-blur-none"
    >
      <div className="flex min-h-0 flex-1 flex-col px-3 pt-2 sm:px-0 sm:pt-0">
        <div
          className="relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden rounded-t-2xl rounded-b-none border border-stone-200/55 border-b-0 bg-white/[0.68] shadow-[0_22px_60px_-38px_rgba(28,25,23,0.28)] ring-1 ring-white/45 backdrop-blur-md sm:mt-10 sm:rounded-2xl sm:border-b sm:shadow-[0_26px_70px_-40px_rgba(28,25,23,0.22)]"
        >
          <div
            className="h-0.5 shrink-0 bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-400 sm:h-1"
            aria-hidden
          />

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:p-6 sm:pb-6">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-stone-200/40 pb-2 sm:gap-3 sm:pb-4">
              <div>
                <h2 className="text-xs font-semibold tracking-tight text-stone-900 sm:text-sm">Totals</h2>
                <p className="mt-0.5 hidden text-xs leading-relaxed text-stone-500 sm:block">
                  Markup and tax apply to the subtotal.
                </p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-4 sm:gap-4">
              <div>
                <label className={labelClassCompact} htmlFor="markup-pct">
                  Markup %
                </label>
                <input
                  id="markup-pct"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={Number.isFinite(estimate.markupPercent) ? estimate.markupPercent : 0}
                  onChange={(e) => setMarkupPercent(Number(e.target.value))}
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClassCompact} htmlFor="tax-pct">
                  Tax %
                </label>
                <input
                  id="tax-pct"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={Number.isFinite(estimate.taxPercent) ? estimate.taxPercent : 0}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className={`${inputClass} font-mono tabular-nums`}
                />
              </div>
            </div>

            {totals.byCategory.length > 0 ? (
              <div className="mt-2 max-sm:max-h-[min(28vh,12rem)] max-sm:overflow-y-auto sm:mt-5 sm:max-h-none rounded-xl border border-stone-200/45 bg-gradient-to-b from-stone-50/90 to-white/40 p-2.5 sm:rounded-2xl sm:p-4">
                <p className={labelClassCompact}>By category</p>
                <ul className="mt-2 space-y-1.5 text-xs sm:mt-3 sm:space-y-2 sm:text-sm">
                  {totals.byCategory.map((row) => (
                    <li
                      key={row.category}
                      className="flex items-center justify-between gap-2 border-b border-stone-200/35 py-1 last:border-0 last:pb-0 sm:pb-2"
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

            <dl className="mt-2 space-y-1.5 text-xs sm:mt-5 sm:space-y-2.5 sm:text-sm">
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

              <div className="mt-2 overflow-hidden rounded-xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 p-px shadow-lg shadow-stone-900/30 print:border print:border-stone-300 print:bg-white print:p-0 print:shadow-none sm:mt-4 sm:rounded-2xl">
                <div className="relative flex items-center justify-between gap-2 overflow-hidden rounded-[11px] bg-gradient-to-br from-stone-900 to-stone-800 px-3 py-2.5 text-white print:rounded-lg print:bg-white print:text-stone-900 print:shadow-none sm:gap-3 sm:rounded-[15px] sm:px-4 sm:py-3.5">
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_120%_at_0%_0%,rgba(255,255,255,0.14),transparent_55%)]"
                    aria-hidden
                  />
                  <dt className="relative text-xs font-semibold tracking-tight sm:text-sm">Grand total</dt>
                  <dd className="relative text-base font-bold tabular-nums tracking-tight font-mono sm:text-lg md:text-xl">
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
