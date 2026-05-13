"use client";

type Props = {
  onAddLine: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
  onClear: () => void;
};

export function EstimateToolbar({ onAddLine, onExportCsv, onPrint, onClear }: Props) {
  return (
    <div className="print-hide mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <button
        type="button"
        onClick={onAddLine}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 active:bg-amber-800"
      >
        Add line item
      </button>
      <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
        <button
          type="button"
          onClick={onExportCsv}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 sm:flex-none"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={onPrint}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 sm:flex-none"
        >
          Print / PDF
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-red-200 bg-white px-4 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 sm:flex-none"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
