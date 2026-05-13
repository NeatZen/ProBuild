"use client";

import { defaultOnboardingChecklist } from "@/lib/appTypes";
import { useProBuildStore } from "@/store/proBuildStore";

export function OnboardingChecklistBar() {
  const hydrated = useProBuildStore((s) => s.hydrated);
  const complete = useProBuildStore((s) => s.ui.onboardingComplete);
  const checklist = useProBuildStore((s) => s.ui.onboardingChecklist);
  const setPatch = useProBuildStore((s) => s.setOnboardingChecklist);
  const setDone = useProBuildStore((s) => s.setOnboardingComplete);

  if (!hydrated || complete) return null;

  const c = { ...defaultOnboardingChecklist, ...checklist };
  const rows: { id: keyof typeof c; label: string }[] = [
    { id: "namedProject", label: "Name the project" },
    { id: "addedDetailLine", label: "Add at least one detailed line" },
    { id: "reviewedTotals", label: "Review totals & tax settings" },
    { id: "exportedOrBackup", label: "Export a backup or client HTML" },
  ];

  const doneCount = rows.filter((r) => c[r.id]).length;

  return (
    <section
      aria-label="Getting started checklist"
      className="print-hide mb-4 rounded-xl border border-teal-200/80 bg-teal-50/50 px-3 py-3 sm:px-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-900">
          Getting started — {doneCount}/{rows.length}
        </p>
        <button
          type="button"
          className="text-xs font-semibold text-teal-900 underline"
          onClick={() => setDone(true)}
        >
          Dismiss checklist
        </button>
      </div>
      <ul className="mt-2 space-y-1.5 text-sm text-stone-800">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={c[r.id]}
              onChange={(e) => setPatch({ [r.id]: e.target.checked })}
              className="h-4 w-4 rounded border-stone-300"
            />
            <span className={c[r.id] ? "text-stone-500 line-through" : ""}>{r.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
