"use client";

import { headingClass } from "@/lib/uiTokens";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ROWS: { keys: string; desc: string }[] = [
  { keys: "⌘/Ctrl+N", desc: "Add a new line item" },
  { keys: "⌘/Ctrl+K", desc: "Command palette (quick actions)" },
  { keys: "Escape", desc: "Clear the line search filter" },
  { keys: "?", desc: "Open this shortcuts reference" },
  { keys: "G then T", desc: "Focus totals panel (tap sequence)" },
];

export function ShortcutsModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="print-hide fixed inset-0 z-[55] flex items-center justify-center bg-stone-900/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="shortcuts-title" className={`${headingClass} text-lg`}>
          Shortcuts
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          {ROWS.map((r) => (
            <div key={r.keys} className="flex justify-between gap-4">
              <dt className="font-mono text-xs text-stone-600">{r.keys}</dt>
              <dd className="text-right text-stone-800">{r.desc}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-stone-500">
          Tip: use swipe-left on a line row (mobile) to delete after confirmation.
        </p>
        <button
          type="button"
          className="mt-5 w-full rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
