"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { validateEstimate } from "@/lib/estimateValidation";
import { defaultCsvFilename, estimateToCsv } from "@/lib/csvExport";
import { downloadTextFile } from "@/lib/downloadText";
import type { LineItem } from "@/lib/estimateTypes";
import { debounce, DEBOUNCE_MS, saveAppPersistToStorage } from "@/lib/persistence";
import {
  persistSnapshot,
  selectActiveEstimate,
  useProBuildStore,
} from "@/store/proBuildStore";

import { AppFooterNotes } from "./AppFooterNotes";
import { EmptyEstimateTips } from "./EmptyEstimateTips";
import { EstimateHeader } from "./EstimateHeader";
import { EstimateToolbar } from "./EstimateToolbar";
import { EstimatesShelf } from "./EstimatesShelf";
import { LineItemRow } from "./LineItemRow";
import { RevisionHistory } from "./RevisionHistory";
import { SaveStatusBadge } from "./SaveStatusBadge";
import { TotalsPanel } from "./TotalsPanel";
import { ValidationBanner } from "./ValidationBanner";
import { WorkspaceDataMenu } from "./WorkspaceDataMenu";
import { LineSearchBar } from "./LineSearchBar";

export function EstimateShell() {
  const didHydrate = useRef(false);

  useLayoutEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    useProBuildStore.getState().hydrateFromStorage();
  }, []);

  const estimate = useProBuildStore(selectActiveEstimate);
  const lineFilter = useProBuildStore((s) => s.ui.lineFilter);
  const addLine = useProBuildStore((s) => s.addLine);
  const resetCurrentEstimateWorkspace = useProBuildStore((s) => s.resetCurrentEstimateWorkspace);
  const setLineFilter = useProBuildStore((s) => s.setLineFilter);
  useEffect(() => {
    const save = debounce(() => {
      const state = useProBuildStore.getState();
      if (!state.hydrated) return;
      const ok = saveAppPersistToStorage(persistSnapshot(state));
      useProBuildStore.setState({
        saveStatus: ok ? "saved" : "error",
        saveErrorMessage: ok ? null : "Could not save to local storage.",
      });
      if (ok) {
        window.setTimeout(() => {
          useProBuildStore.setState((s) => (s.saveStatus === "saved" ? { saveStatus: "idle" } : {}));
        }, 2000);
      }
    }, DEBOUNCE_MS);

    const unsub = useProBuildStore.subscribe(() => {
      if (!useProBuildStore.getState().hydrated) return;
      useProBuildStore.setState({ saveStatus: "pending" });
      save();
    });
    return () => {
      unsub();
    };
  }, []);

  const query = lineFilter.trim().toLowerCase();

  const lineMatches = useCallback(
    (line: LineItem) => {
      if (!query) return true;
      return (
        line.description.toLowerCase().includes(query) ||
        line.category.toLowerCase().includes(query) ||
        line.unit.toLowerCase().includes(query)
      );
    },
    [query],
  );

  const matchCount = useMemo(
    () => estimate.lines.filter(lineMatches).length,
    [estimate.lines, lineMatches],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        useProBuildStore.getState().addLine();
      }
      if (e.key === "Escape") {
        setLineFilter("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setLineFilter]);

  const handleClear = () => {
    if (!window.confirm("Clear all fields on this estimate? Lines reset to one empty row.")) {
      return;
    }
    resetCurrentEstimateWorkspace();
  };

  const handleExportCsv = () => {
    const csv = estimateToCsv(estimate);
    downloadTextFile(defaultCsvFilename(estimate), csv, "text/csv;charset=utf-8");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-root relative flex min-h-0 flex-1 flex-col overflow-x-hidden text-stone-900">
      <a href="#totals-panel-start" className="skip-link">
        Skip to totals
      </a>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[var(--background)]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_-20%,var(--pb-canvas-mesh),transparent_50%)]"
        aria-hidden
      />

      <header className="print-hide relative border-b border-stone-200 bg-white px-4 py-5 shadow-sm shadow-stone-900/[0.04] sm:py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-xs font-bold tracking-tight text-white shadow-sm sm:h-12 sm:w-12 sm:text-sm"
              aria-hidden
            >
              PB
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                  ProBuild
                </p>
                <span className="hidden h-px w-8 bg-stone-200 sm:inline" aria-hidden />
                <p className="hidden text-[11px] font-medium text-stone-400 sm:inline">Estimate workspace</p>
              </div>
              <h1 className="mt-1.5 text-balance text-2xl font-semibold tracking-tight text-stone-900 sm:text-[1.625rem] sm:leading-snug">
                Construction estimate
              </h1>
              <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-stone-600">
                Line items, categories, and totals—saved on this device as you work.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <EstimatesShelf />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <SaveStatusBadge />
              <WorkspaceDataMenu onExportCsv={handleExportCsv} />
            </div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-[calc(min(42vh,20rem)+env(safe-area-inset-bottom,0px)+1rem)] pt-7 sm:pb-14 sm:pt-8">
        <ValidationBanner warnings={validateEstimate(estimate)} />
        <RevisionHistory />
        <EstimateHeader />
        <LineSearchBar matchCount={matchCount} totalLines={estimate.lines.length} />
        <EstimateToolbar
          onAddLine={addLine}
          onExportCsv={handleExportCsv}
          onPrint={handlePrint}
          onClear={handleClear}
        />

        <EmptyEstimateTips estimate={estimate} />

        <div className="mt-10 print-show">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-[13px] font-semibold tracking-tight text-stone-900 sm:text-sm">
                Line items
              </h2>
              <p className="text-xs text-stone-500">
                {query
                  ? `${matchCount} match${matchCount === 1 ? "" : "es"} — non-matching rows are dimmed.`
                  : "Tap fields to edit. Use arrows to reorder."}
              </p>
            </div>
            <span
              data-testid="line-count-badge"
              className="inline-flex items-center rounded-md border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium tabular-nums text-stone-600 shadow-sm"
            >
              {estimate.lines.length} line{estimate.lines.length === 1 ? "" : "s"}
            </span>
          </div>

          <section aria-label="Line items" className="flex flex-col gap-5">
            {estimate.lines.map((line, index) => (
              <LineItemRow
                key={line.id}
                line={line}
                index={index}
                totalLines={estimate.lines.length}
                searchMatch={lineMatches(line)}
                searchActive={Boolean(query)}
              />
            ))}
          </section>
        </div>

        <AppFooterNotes />
      </div>

      <TotalsPanel />
    </div>
  );
}
