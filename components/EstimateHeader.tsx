"use client";

import { cardSurface, inputClass, labelClass } from "@/lib/uiTokens";
import { useEstimateStore } from "@/store/estimateStore";

export function EstimateHeader() {
  const projectName = useEstimateStore((s) => s.estimate.projectName);
  const clientNotes = useEstimateStore((s) => s.estimate.clientNotes);
  const setProjectName = useEstimateStore((s) => s.setProjectName);
  const setClientNotes = useEstimateStore((s) => s.setClientNotes);

  return (
    <div className={`print-show overflow-hidden p-5 sm:p-6 ${cardSurface}`}>
      <div className="flex items-center gap-3 border-b border-stone-200/50 pb-4">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600/15 to-teal-700/5 ring-1 ring-teal-700/10"
          aria-hidden
        >
          <span className="h-2 w-2 rounded-full bg-teal-600 shadow-[0_0_0_4px_rgba(13,148,136,0.12)]" />
        </span>
        <div>
          <p className="text-xs font-semibold text-stone-800">Project details</p>
          <p className="text-[11px] text-stone-500">Shown on print and export</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        <div>
          <label className={labelClass} htmlFor="project-name">
            Project name
          </label>
          <input
            id="project-name"
            name="projectName"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="e.g. Oak St. kitchen remodel"
            className={inputClass}
            autoComplete="off"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="client-notes">
            Client / site notes
          </label>
          <textarea
            id="client-notes"
            name="clientNotes"
            value={clientNotes}
            onChange={(e) => setClientNotes(e.target.value)}
            placeholder="Optional details, allowances, exclusions…"
            rows={3}
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </div>
      </div>
    </div>
  );
}
