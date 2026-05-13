"use client";

export function AppFooterNotes() {
  return (
    <footer className="print-hide mt-12 border-t border-stone-200/50 pt-6 text-xs leading-relaxed text-stone-500">
      <p>
        Amounts are rounded to two decimal places. Markup is applied to the line subtotal, then tax is applied to
        subtotal + markup.
      </p>
      <p className="mt-2">
        <span className="font-medium text-stone-600">Shortcuts:</span>{" "}
        <kbd className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-[10px]">⌘/Ctrl</kbd>{" "}
        +{" "}
        <kbd className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-[10px]">N</kbd> add line ·{" "}
        <kbd className="rounded border border-stone-200 bg-stone-50 px-1 font-mono text-[10px]">Esc</kbd> clear line
        search.
      </p>
      <p className="mt-3 text-stone-400">
        Offline-first: data stays in this browser until you export it. Sign-in and cloud sync can be added later if
        you want multi-device workflows.
      </p>
    </footer>
  );
}
