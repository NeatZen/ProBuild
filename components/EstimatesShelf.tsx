"use client";

import { secondaryButton } from "@/lib/uiTokens";
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
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-stone-200 bg-white px-3 text-sm font-medium text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus-visible:border-teal-600/80 focus-visible:ring-2 focus-visible:ring-teal-600/15 sm:flex-none sm:min-w-[12rem]"
        >
          {estimates.map((e) => (
            <option key={e.id} value={e.id}>
              {labelFor(e)}
            </option>
          ))}
        </select>
        <button type="button" onClick={() => createNewEstimate()} className={secondaryButton}>
          New
        </button>
        <button type="button" onClick={() => duplicateActiveEstimate()} className={secondaryButton}>
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
          className={`${secondaryButton} border-rose-200 text-rose-900 hover:border-rose-300 hover:bg-rose-50`}
        >
          {estimates.length > 1 ? "Remove" : "Reset"}
        </button>
      </div>
    </div>
  );
}
