"use client";

import { useMemo } from "react";

import { estimateTotals, sectionSubtotals } from "@/lib/estimateMath";
import { useMoneyFormatter } from "@/hooks/useMoneyFormatter";
import type { CategoryMarkup } from "@/lib/estimateTypes";
import { selectActiveEstimate, useProBuildStore } from "@/store/proBuildStore";

import { cardSurfaceDock, headingClass, inputClass, labelClassCompact } from "@/lib/uiTokens";
import { useDensityClasses } from "@/hooks/useDensityClasses";

export function TotalsPanel() {
  const estimate = useProBuildStore(selectActiveEstimate);
  const d = useDensityClasses();
  const dockInputClass = `${inputClass} ${d.dockFieldMinH}`;
  const setMarkupPercent = useProBuildStore((s) => s.setMarkupPercent);
  const setTaxPercent = useProBuildStore((s) => s.setTaxPercent);
  const setOverheadPercent = useProBuildStore((s) => s.setOverheadPercent);
  const setBondInsuranceFlat = useProBuildStore((s) => s.setBondInsuranceFlat);
  const setRetentionPercent = useProBuildStore((s) => s.setRetentionPercent);
  const setCategoryMarkups = useProBuildStore((s) => s.setCategoryMarkups);
  const formatMoney = useMoneyFormatter();

  const totals = estimateTotals(estimate);
  const sectionRows = sectionSubtotals(estimate);
  const totalsKey = useMemo(
    () =>
      [
        totals.grandTotal,
        totals.netDue,
        totals.taxAmount,
        totals.markupAmount,
        totals.adjustedSubtotal,
      ].join("|"),
    [totals],
  );

  const liveTotalsAnnouncement = `Totals updated. Grand total ${formatMoney(totals.grandTotal)}. Net due after retention ${formatMoney(totals.netDue)}.`;

  const updateCategoryRow = (index: number, patch: Partial<CategoryMarkup>) => {
    const next = estimate.categoryMarkups.map((row, i) => (i === index ? { ...row, ...patch } : row));
    setCategoryMarkups(next);
  };

  const addCategoryRow = () => {
    setCategoryMarkups([...estimate.categoryMarkups, { category: "", percent: 0 }]);
  };

  const removeCategoryRow = (index: number) => {
    setCategoryMarkups(estimate.categoryMarkups.filter((_, i) => i !== index));
  };

  return (
    <aside
      id="totals-panel"
      aria-label="Totals and adjustments"
      className={`print-show fixed inset-x-0 bottom-0 z-20 flex ${d.totalsAsideMaxH} flex-col border-t border-stone-200 bg-white/95 shadow-[0_-4px_28px_-6px_rgba(15,23,42,0.08)] backdrop-blur-sm ${d.dockSafeBottom} print:static print:max-h-none print:flex-none print:border-0 print:bg-transparent print:pb-0 print:shadow-none sm:static sm:z-0 sm:max-h-none sm:border-0 sm:bg-transparent sm:pb-0 sm:shadow-none sm:backdrop-blur-none`}
    >
      <span id="totals-panel-start" tabIndex={-1} className="sr-only">
        Totals panel
      </span>
      <div
        key={totalsKey}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveTotalsAnnouncement}
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-3 pt-2 sm:px-0 sm:pt-0">
        <div
          className={`relative mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden sm:mt-10 ${cardSurfaceDock}`}
        >
          <div className="h-px shrink-0 bg-teal-600" aria-hidden />

          <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${d.totalsScrollPadding}`}>
            <div className={`flex flex-wrap items-end justify-between gap-2 border-b border-stone-200/40 sm:gap-3 ${d.totalsSectionTitlePb}`}>
              <div>
                <h2 className={`${headingClass} text-xs sm:text-sm`}>Totals</h2>
                <p className="mt-0.5 hidden text-xs leading-relaxed text-stone-500 sm:block">
                  Category markups adjust each group first, then global markup, overhead, bond/insurance flat, tax, and
                  retention.
                </p>
              </div>
            </div>

            {estimate.sections.length > 1 ? (
              <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50/90 px-3 py-2.5 text-xs">
                <p className="font-heading text-[11px] font-semibold uppercase tracking-wide text-stone-600">
                  By section (raw extensions)
                </p>
                <ul className="mt-2 space-y-1">
                  {sectionRows.map((r) => (
                    <li key={r.sectionId} className="flex justify-between gap-3 text-stone-800">
                      <span className="min-w-0 truncate">{r.label}</span>
                      <span className="shrink-0 font-mono tabular-nums text-stone-900">{formatMoney(r.amount)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

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
                  className={`${dockInputClass} font-mono tabular-nums`}
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
                  className={`${dockInputClass} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClassCompact} htmlFor="overhead-pct">
                  Overhead %
                </label>
                <input
                  id="overhead-pct"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={Number.isFinite(estimate.overheadPercent) ? estimate.overheadPercent : 0}
                  onChange={(e) => setOverheadPercent(Number(e.target.value))}
                  className={`${dockInputClass} font-mono tabular-nums`}
                />
              </div>
              <div>
                <label className={labelClassCompact} htmlFor="retention-pct">
                  Retention %
                </label>
                <input
                  id="retention-pct"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={Number.isFinite(estimate.retentionPercent) ? estimate.retentionPercent : 0}
                  onChange={(e) => setRetentionPercent(Number(e.target.value))}
                  className={`${dockInputClass} font-mono tabular-nums`}
                />
              </div>
              <div className="col-span-2">
                <label className={labelClassCompact} htmlFor="bond-flat">
                  Bond / insurance (flat)
                </label>
                <input
                  id="bond-flat"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={Number.isFinite(estimate.bondInsuranceFlat) ? estimate.bondInsuranceFlat : 0}
                  onChange={(e) => setBondInsuranceFlat(Number(e.target.value))}
                  className={`${dockInputClass} font-mono tabular-nums`}
                />
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-2.5 sm:mt-4 sm:p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className={labelClassCompact}>Markup by category</p>
                <button
                  type="button"
                  onClick={addCategoryRow}
                  className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg border border-stone-200/80 bg-white/90 px-3 text-[11px] font-semibold uppercase tracking-wide text-stone-800 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600/40"
                >
                  Add row
                </button>
              </div>
              {estimate.categoryMarkups.length === 0 ? (
                <p className="mt-2 text-[11px] text-stone-500">
                  Optional: match the category label on your lines (e.g. Labor) and apply an extra % on that group before
                  global markup.
                </p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {estimate.categoryMarkups.map((row, index) => (
                    <li key={`${index}-${row.category}`} className="flex flex-wrap items-end gap-2">
                      <div className="min-w-0 flex-1">
                        <label className={labelClassCompact} htmlFor={`cat-name-${index}`}>
                          Category
                        </label>
                        <input
                          id={`cat-name-${index}`}
                          value={row.category}
                          onChange={(e) => updateCategoryRow(index, { category: e.target.value })}
                          placeholder="Labor"
                          className={`${dockInputClass} text-sm`}
                        />
                      </div>
                      <div className="w-24 sm:w-28">
                        <label className={labelClassCompact} htmlFor={`cat-pct-${index}`}>
                          %
                        </label>
                        <input
                          id={`cat-pct-${index}`}
                          type="number"
                          inputMode="decimal"
                          step="0.1"
                          value={row.percent}
                          onChange={(e) => updateCategoryRow(index, { percent: Number(e.target.value) })}
                          className={`${dockInputClass} font-mono text-sm tabular-nums`}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCategoryRow(index)}
                        className="mb-0.5 inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-rose-200/80 bg-white/90 text-rose-800 hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400/50"
                        aria-label={`Remove category markup row ${index + 1}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {totals.byCategory.length > 0 ? (
              <div className="mt-2 max-sm:max-h-[min(28vh,12rem)] max-sm:overflow-y-auto sm:mt-5 sm:max-h-none rounded-lg border border-stone-200 bg-stone-50 p-2.5 sm:p-4">
                <p className={labelClassCompact}>By category</p>
                <ul className="mt-2 space-y-1.5 text-xs sm:mt-3 sm:space-y-2 sm:text-sm">
                  {totals.byCategory.map((row) => (
                    <li
                      key={row.category}
                      className="flex items-center justify-between gap-2 border-b border-stone-200/35 py-1 last:border-0 last:pb-0 sm:pb-2"
                    >
                      <span className="truncate text-stone-700">
                        {row.category}
                        {row.markupPercent ? (
                          <span className="text-stone-400"> · +{row.markupPercent}%</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums text-stone-900 font-mono">
                        {formatMoney(row.adjusted)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <dl className="mt-2 space-y-1.5 text-xs sm:mt-5 sm:space-y-2.5 sm:text-sm">
              <div className="flex justify-between gap-3 tabular-nums">
                <dt className="text-stone-600">Line subtotal</dt>
                <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <dt className="text-stone-600">After category markups</dt>
                <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.adjustedSubtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <dt className="text-stone-600">Markup</dt>
                <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.markupAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <dt className="text-stone-600">Overhead</dt>
                <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.overheadAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <dt className="text-stone-600">Bond / insurance</dt>
                <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.bondInsuranceFlat)}</dd>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <dt className="text-stone-600">Tax</dt>
                <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.taxAmount)}</dd>
              </div>
              <div className="flex justify-between gap-3 tabular-nums">
                <dt className="text-stone-600">Retention (hold)</dt>
                <dd className="font-medium text-stone-900 font-mono">{formatMoney(totals.retentionAmount)}</dd>
              </div>

              <div
                className={`flex items-center justify-between gap-3 rounded-lg bg-stone-900 px-4 py-3 text-white shadow-sm print:border print:border-stone-300 print:bg-white print:text-stone-900 ${d.grandTotalStackMt}`}
              >
                <dt className="font-heading text-xs font-semibold tracking-tight text-white sm:text-sm print:text-stone-900">
                  Grand total
                </dt>
                <dd className="text-base font-bold tabular-nums tracking-tight font-mono sm:text-lg md:text-xl" aria-live="off">
                  {formatMoney(totals.grandTotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-3 rounded-lg border border-teal-200 bg-teal-50 px-3 py-2.5 tabular-nums">
                <dt className="text-sm font-medium text-teal-950">Net due (after retention)</dt>
                <dd className="font-semibold text-teal-950 font-mono">{formatMoney(totals.netDue)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </aside>
  );
}
