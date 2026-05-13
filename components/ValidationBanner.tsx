"use client";

import type { EstimateWarning } from "@/lib/estimateValidation";
import { useDensityClasses } from "@/hooks/useDensityClasses";

type Props = {
  warnings: EstimateWarning[];
};

export function ValidationBanner({ warnings }: Props) {
  const d = useDensityClasses();
  if (warnings.length === 0) return null;

  const shown = warnings.slice(0, 4);
  const extra = warnings.length - shown.length;

  return (
    <div
      className={`print-hide rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm ${d.validationBannerMb}`}
      role="status"
    >
      <p className="font-heading font-semibold text-amber-950">Review before you send this estimate</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/90">
        {shown.map((w) => (
          <li key={w.id}>{w.message}</li>
        ))}
      </ul>
      {extra > 0 ? <p className="mt-2 text-xs text-amber-800/90">+{extra} more…</p> : null}
    </div>
  );
}
