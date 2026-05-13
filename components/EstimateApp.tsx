"use client";

import { useEffect, useRef } from "react";

import { defaultCsvFilename, downloadCsv, estimateToCsv } from "@/lib/csvExport";
import { createDefaultEstimate } from "@/lib/estimateTypes";
import {
  clearStorage,
  DEBOUNCE_MS,
  debounce,
  hydrateOrDefault,
  saveToStorage,
} from "@/lib/persistence";
import { useEstimateStore } from "@/store/estimateStore";

import { EstimateHeader } from "./EstimateHeader";
import { EstimateToolbar } from "./EstimateToolbar";
import { LineItemRow } from "./LineItemRow";
import { TotalsPanel } from "./TotalsPanel";

export function EstimateApp() {
  const estimate = useEstimateStore((s) => s.estimate);
  const replaceEstimate = useEstimateStore((s) => s.replaceEstimate);
  const addLine = useEstimateStore((s) => s.addLine);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    replaceEstimate(hydrateOrDefault());
  }, [replaceEstimate]);

  useEffect(() => {
    const save = debounce(() => {
      saveToStorage(useEstimateStore.getState().estimate);
    }, DEBOUNCE_MS);
    const unsub = useEstimateStore.subscribe(() => {
      if (!hydrated.current) return;
      save();
    });
    return () => {
      unsub();
    };
  }, []);

  const handleClear = () => {
    if (!window.confirm("Clear this estimate and start fresh? This removes saved data.")) {
      return;
    }
    clearStorage();
    replaceEstimate(createDefaultEstimate());
  };

  const handleExportCsv = () => {
    const csv = estimateToCsv(estimate);
    downloadCsv(defaultCsvFilename(estimate), csv);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-root relative flex min-h-0 flex-1 flex-col bg-gradient-to-b from-stone-100 via-stone-50 to-teal-50/40 text-stone-900">
      <div
        className="print-hide pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(45,212,191,0.14),transparent_55%)]"
        aria-hidden
      />

      <header className="print-hide relative border-b border-stone-200/80 bg-white/75 px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_8px_32px_-12px_rgba(28,25,23,0.12)] backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-teal-700 text-sm font-bold tracking-tight text-white shadow-md shadow-teal-900/25 ring-1 ring-white/25"
            aria-hidden
          >
            PB
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800/90">
              ProBuild
            </p>
            <h1 className="mt-0.5 text-balance text-xl font-semibold tracking-tight text-stone-900 sm:text-2xl">
              Construction estimate
            </h1>
            <p className="mt-1 max-w-xl text-pretty text-sm leading-relaxed text-stone-600">
              Line items, categories, and totals—saved on this device as you work.
            </p>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-[calc(min(42vh,20rem)+env(safe-area-inset-bottom,0px)+1rem)] pt-6 sm:pb-12">
        <EstimateHeader />
        <EstimateToolbar
          onAddLine={addLine}
          onExportCsv={handleExportCsv}
          onPrint={handlePrint}
          onClear={handleClear}
        />

        <div className="mt-8 print-show">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-stone-900">Line items</h2>
              <p className="mt-0.5 text-xs text-stone-500">
                {estimate.lines.length} line{estimate.lines.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <section aria-label="Line items" className="flex flex-col gap-4">
            {estimate.lines.map((line, index) => (
              <LineItemRow
                key={line.id}
                line={line}
                index={index}
                totalLines={estimate.lines.length}
              />
            ))}
          </section>
        </div>
      </div>

      <TotalsPanel />
    </div>
  );
}
