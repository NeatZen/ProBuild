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
    <div className="print-root flex min-h-0 flex-1 flex-col bg-zinc-50 text-zinc-900">
      <header className="print-hide border-b border-zinc-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800">
            ProBuild
          </p>
          <h1 className="text-lg font-semibold leading-tight sm:text-xl">
            Construction estimate
          </h1>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-40 pt-4 sm:pb-36">
        <EstimateHeader />
        <EstimateToolbar
          onAddLine={addLine}
          onExportCsv={handleExportCsv}
          onPrint={handlePrint}
          onClear={handleClear}
        />
        <section
          aria-label="Line items"
          className="mt-4 flex flex-col gap-3 print-show"
        >
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

      <TotalsPanel />
    </div>
  );
}
