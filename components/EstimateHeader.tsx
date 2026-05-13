"use client";

import { useEstimateStore } from "@/store/estimateStore";

const inputClass =
  "mt-1.5 w-full min-h-11 rounded-xl border border-stone-200 bg-white/90 px-3.5 py-2.5 text-base text-stone-900 shadow-sm shadow-stone-900/5 outline-none transition placeholder:text-stone-400 focus:border-teal-400/80 focus:bg-white focus:shadow-md focus:shadow-teal-900/5 focus:ring-2 focus:ring-teal-500/20";

const labelClass = "text-[11px] font-semibold uppercase tracking-wider text-stone-500";

export function EstimateHeader() {
  const projectName = useEstimateStore((s) => s.estimate.projectName);
  const clientNotes = useEstimateStore((s) => s.estimate.clientNotes);
  const setProjectName = useEstimateStore((s) => s.setProjectName);
  const setClientNotes = useEstimateStore((s) => s.setClientNotes);

  return (
    <div className="print-show overflow-hidden rounded-2xl border border-stone-200/80 bg-white/85 p-5 shadow-lg shadow-stone-900/5 ring-1 ring-white/60 backdrop-blur-sm">
      <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
        <span
          className="h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.2)]"
          aria-hidden
        />
        <p className="text-xs font-medium text-stone-600">Project details</p>
      </div>

      <div className="mt-4 flex flex-col gap-5">
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
