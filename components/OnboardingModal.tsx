"use client";

import { headingClass } from "@/lib/uiTokens";
import { useProBuildStore } from "@/store/proBuildStore";

export function OnboardingModal() {
  const complete = useProBuildStore((s) => s.ui.onboardingComplete);
  const setOnboardingComplete = useProBuildStore((s) => s.setOnboardingComplete);

  if (complete) return null;

  return (
    <div
      className="print-hide fixed inset-0 z-[60] flex items-end justify-center bg-stone-900/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboard-title"
    >
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 shadow-xl">
        <h2 id="onboard-title" className={`${headingClass} text-lg`}>
          Welcome to ProBuild
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Estimates save automatically in this browser. Use sections for base bid vs alternates,
          pick line types for cleaner exports, and capture a snapshot before big changes.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1.5 text-sm text-stone-700">
          <li>Import vendor CSV under Data.</li>
          <li>Client HTML and PDF use your branding below the header.</li>
          <li>Press ? anytime for keyboard shortcuts.</li>
        </ul>
        <button
          type="button"
          data-testid="onboarding-dismiss"
          className="mt-6 w-full rounded-xl bg-teal-700 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-600"
          onClick={() => setOnboardingComplete(true)}
        >
          Get started
        </button>
      </div>
    </div>
  );
}
