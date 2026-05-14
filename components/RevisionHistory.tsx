"use client";

import { useMemo, useState } from "react";

import { estimateTotals } from "@/lib/estimateMath";
import { useMoneyFormatter } from "@/hooks/useMoneyFormatter";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { selectActiveEstimate, useProBuildStore } from "@/store/proBuildStore";

import { cardSurface, headingClass, labelClassCompact } from "@/lib/uiTokens";

export function RevisionHistory() {
  const estimate = useProBuildStore(selectActiveEstimate);
  const revisionsByEstimateId = useProBuildStore((s) => s.revisionsByEstimateId);
  const saveRevisionSnapshot = useProBuildStore((s) => s.saveRevisionSnapshot);
  const restoreRevisionSnapshot = useProBuildStore((s) => s.restoreRevisionSnapshot);
  const removeRevisionSnapshot = useProBuildStore((s) => s.removeRevisionSnapshot);
  const formatMoney = useMoneyFormatter();

  const [note, setNote] = useState("");
  const [compareId, setCompareId] = useState<string | null>(null);

  const list = useMemo(
    () => revisionsByEstimateId[estimate.id] ?? [],
    [revisionsByEstimateId, estimate.id],
  );

  const compareRev = useMemo(
    () => (compareId ? list.find((r) => r.id === compareId) : undefined),
    [compareId, list],
  );

  const activeTotals = estimateTotals(estimate);
  const compareTotals = compareRev ? estimateTotals(compareRev.payload) : null;

  const d = useDensityClasses();

  return (
    <section
      aria-label="Revision history"
      className={`${cardSurface} ${d.revisionSectionMt} ${d.cardPadTight}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className={`${headingClass} text-sm`}>Revision snapshots</h2>
          <p className="mt-1 text-xs text-stone-500">
            Saved on this device only. Restore replaces the current estimate (you can save another snapshot first).
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:max-w-sm">
          <label className={labelClassCompact} htmlFor="rev-note">
            Note (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="rev-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Before pricing meeting"
              className={`min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus-visible:border-teal-600/80 focus-visible:ring-2 focus-visible:ring-teal-600/15 ${d.formFieldMinH}`}
            />
            <button
              type="button"
              onClick={() => {
                saveRevisionSnapshot(note);
                setNote("");
              }}
              className="inline-flex min-h-11 min-w-[44px] shrink-0 items-center justify-center rounded-lg bg-teal-700 px-4 text-xs font-semibold text-white shadow-sm hover:bg-teal-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600/40"
            >
              Save snapshot
            </button>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-4 text-xs text-stone-500">No snapshots yet for this estimate.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.map((rev) => {
            const t = estimateTotals(rev.payload);
            return (
              <li
                key={rev.id}
                className="flex flex-col gap-2 rounded-lg border border-stone-200 bg-stone-50/50 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-900">{rev.note}</p>
                  <p className="text-[11px] text-stone-500">
                    {new Date(rev.createdAt).toLocaleString()} · {rev.payload.lines.length} lines · grand{" "}
                    {formatMoney(t.grandTotal)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCompareId(rev.id)}
                    className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg border border-stone-200/80 bg-white px-3 text-[11px] font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600/35"
                  >
                    Compare
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Restore this snapshot? Current unsaved work stays in history only if you saved a snapshot first.")) {
                        return;
                      }
                      restoreRevisionSnapshot(rev.id);
                    }}
                    className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg border border-teal-200/80 bg-teal-50/80 px-3 text-[11px] font-semibold uppercase tracking-wide text-teal-900 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600/35"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRevisionSnapshot(rev.id)}
                    className="inline-flex min-h-11 min-w-[44px] items-center justify-center rounded-lg border border-stone-200/80 bg-white px-3 text-[11px] font-semibold uppercase tracking-wide text-stone-500 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400/40"
                    aria-label="Delete snapshot"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {compareRev && compareTotals ? (
        <div
          className="mt-4 rounded-xl border border-indigo-200/60 bg-indigo-50/40 p-3 text-xs sm:text-sm"
          role="region"
          aria-label="Comparison with snapshot"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-stone-900">Compare: {compareRev.note}</p>
            <button
              type="button"
              onClick={() => setCompareId(null)}
              className="rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-semibold text-stone-700 hover:bg-stone-50"
            >
              Close
            </button>
          </div>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-white/80 p-2 ring-1 ring-stone-200/40">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">Current</dt>
              <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-stone-900">
                {formatMoney(activeTotals.grandTotal)}
              </dd>
              <p className="mt-1 text-[11px] text-stone-500">{estimate.lines.length} lines</p>
            </div>
            <div className="rounded-lg bg-white/80 p-2 ring-1 ring-stone-200/40">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">Snapshot</dt>
              <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-stone-900">
                {formatMoney(compareTotals.grandTotal)}
              </dd>
              <p className="mt-1 text-[11px] text-stone-500">{compareRev.payload.lines.length} lines</p>
            </div>
            <div className="sm:col-span-2 rounded-lg bg-white/80 p-2 ring-1 ring-stone-200/40">
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">Δ Grand total</dt>
              <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-stone-900">
                {formatMoney(activeTotals.grandTotal - compareTotals.grandTotal)}
              </dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
}
