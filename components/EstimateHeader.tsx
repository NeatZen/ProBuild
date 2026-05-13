"use client";

import { cardSurface, headingClass, inputClass, labelClass } from "@/lib/uiTokens";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { selectActiveEstimate, useProBuildStore } from "@/store/proBuildStore";

export function EstimateHeader() {
  const projectName = useProBuildStore((s) => selectActiveEstimate(s).projectName);
  const clientNotes = useProBuildStore((s) => selectActiveEstimate(s).clientNotes);
  const setProjectName = useProBuildStore((s) => s.setProjectName);
  const setClientNotes = useProBuildStore((s) => s.setClientNotes);
  const d = useDensityClasses();

  return (
    <div className={`print-show overflow-hidden ${cardSurface} ${d.cardPad}`}>
      <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 bg-stone-50 text-stone-500"
          aria-hidden
        >
          <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
        </span>
        <div>
          <p className={`${headingClass} text-sm`}>Project details</p>
          <p className="text-xs text-stone-500">Shown on print and export</p>
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
            onChange={(e) => {
              setProjectName(e.target.value);
              if (e.target.value.trim()) {
                useProBuildStore.getState().setOnboardingChecklist({ namedProject: true });
              }
            }}
            placeholder="e.g. Oak St. kitchen remodel"
            className={`${inputClass} ${d.formFieldMinH}`}
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
            className={`${inputClass} ${d.formFieldMinH} resize-y leading-relaxed`}
          />
        </div>
      </div>
    </div>
  );
}
