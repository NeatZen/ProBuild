"use client";

import type { Estimate } from "@/lib/estimateTypes";
import { lineExtended } from "@/lib/estimateMath";
import { useDensityClasses } from "@/hooks/useDensityClasses";

import { cardSurface, headingClass } from "@/lib/uiTokens";

function hasMeaningfulContent(estimate: Estimate): boolean {
  return estimate.lines.some((line) => {
    if (line.description.trim()) return true;
    if (line.category.trim()) return true;
    if (lineExtended(line) !== 0) return true;
    return false;
  });
}

type Props = {
  estimate: Estimate;
};

export function EmptyEstimateTips({ estimate }: Props) {
  const d = useDensityClasses();

  if (hasMeaningfulContent(estimate)) return null;

  return (
    <div
      className={`${cardSurface} border-teal-100 bg-gradient-to-b from-teal-50/60 to-white ${d.emptyTipsMt} ${d.cardPadTight}`}
    >
      <h2 className={`${headingClass} text-sm`}>First-run tips</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
        <li>Name the project, then add line items or insert a template or assembly from the toolbar.</li>
        <li>
          Assemblies add several linked lines at once—adjust quantities per line (for example, rooms or pads).
        </li>
        <li>Use category markups in the totals dock when Labor and Materials need different uplifts.</li>
        <li>Save a revision snapshot before big pricing changes so you can compare or roll back locally.</li>
        <li>Export a read-only client HTML file from Data when you need a simple share bundle without a server.</li>
      </ul>
    </div>
  );
}
