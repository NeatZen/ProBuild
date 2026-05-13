"use client";

import { useEstimateStore } from "@/store/estimateStore";

export function EstimateHeader() {
  const projectName = useEstimateStore((s) => s.estimate.projectName);
  const clientNotes = useEstimateStore((s) => s.estimate.clientNotes);
  const setProjectName = useEstimateStore((s) => s.setProjectName);
  const setClientNotes = useEstimateStore((s) => s.setClientNotes);

  return (
    <div className="print-show flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div>
        <label
          className="text-xs font-medium text-zinc-600"
          htmlFor="project-name"
        >
          Project name
        </label>
        <input
          id="project-name"
          name="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="e.g. Oak St. kitchen remodel"
          className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
          autoComplete="off"
        />
      </div>
      <div>
        <label
          className="text-xs font-medium text-zinc-600"
          htmlFor="client-notes"
        >
          Client / site notes
        </label>
        <textarea
          id="client-notes"
          name="clientNotes"
          value={clientNotes}
          onChange={(e) => setClientNotes(e.target.value)}
          placeholder="Optional details, allowances, exclusions…"
          rows={3}
          className="mt-1 w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 shadow-sm outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
        />
      </div>
    </div>
  );
}
