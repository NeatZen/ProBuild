"use client";

import { useProBuildStore } from "@/store/proBuildStore";

function labelFor(e: { id: string; projectName: string }) {
  const t = e.projectName.trim();
  return t || "Untitled estimate";
}

export function EstimatesShelf() {
  const estimates = useProBuildStore((s) => s.estimates);
  const activeId = useProBuildStore((s) => s.activeEstimateId);
  const switchEstimate = useProBuildStore((s) => s.switchEstimate);
  const createNewEstimate = useProBuildStore((s) => s.createNewEstimate);
  const duplicateActiveEstimate = useProBuildStore((s) => s.duplicateActiveEstimate);
  const archiveEstimate = useProBuildStore((s) => s.archiveEstimate);

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[14rem]">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-stone-500" htmlFor="estimate-select">
        Active estimate
      </label>
      <div className="flex flex-wrap gap-2">
        <select
          id="estimate-select"
          value={activeId}
          onChange={(e) => switchEstimate(e.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-stone-200/90 bg-white/80 px-3 text-sm font-medium text-stone-900 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-teal-500/25 sm:flex-none sm:min-w-[12rem]"
        >
          {estimates.map((e) => (
            <option key={e.id} value={e.id}>
              {labelFor(e)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => createNewEstimate()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-3 text-xs font-semibold uppercase tracking-wide text-stone-800 shadow-sm hover:bg-white"
        >
          New
        </button>
        <button
          type="button"
          onClick={() => duplicateActiveEstimate()}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-3 text-xs font-semibold uppercase tracking-wide text-stone-800 shadow-sm hover:bg-white"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              !window.confirm(
                estimates.length > 1
                  ? "Remove this estimate from this device?"
                  : "Reset this estimate to blank? (You only have one estimate.)",
              )
            ) {
              return;
            }
            archiveEstimate(activeId);
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-rose-200/80 bg-white/70 px-3 text-xs font-semibold uppercase tracking-wide text-rose-800 shadow-sm hover:bg-rose-50"
        >
          {estimates.length > 1 ? "Remove" : "Reset"}
        </button>
      </div>
    </div>
  );
}
