"use client";

import type { LineItem } from "@/lib/estimateTypes";
import { lineExtended } from "@/lib/estimateMath";
import { formatMoney } from "@/lib/formatMoney";
import { cardSurfaceElevated, inputClass, labelClass } from "@/lib/uiTokens";
import { useEstimateStore } from "@/store/estimateStore";

const CATEGORY_SUGGESTIONS = ["Labor", "Materials", "Subcontractor", "Equipment", "Other"];

function ChevronUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 15l-6-6-6 6" />
    </svg>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

type Props = {
  line: LineItem;
  index: number;
  totalLines: number;
};

export function LineItemRow({ line, index, totalLines }: Props) {
  const setLine = useEstimateStore((s) => s.setLine);
  const removeLine = useEstimateStore((s) => s.removeLine);
  const moveLine = useEstimateStore((s) => s.moveLine);

  const extended = lineExtended(line);
  const listId = `categories-${line.id}`;

  const iconBtn =
    "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/75 bg-white/70 text-stone-600 shadow-sm shadow-stone-900/[0.03] ring-1 ring-white/40 backdrop-blur-sm transition duration-150 ease-out hover:border-teal-200/90 hover:bg-teal-50/70 hover:text-teal-900 disabled:cursor-not-allowed disabled:border-stone-100/90 disabled:bg-stone-50 disabled:text-stone-300 disabled:shadow-none";

  return (
    <article
      className={`group relative overflow-hidden p-5 sm:p-6 ${cardSurfaceElevated} before:pointer-events-none before:absolute before:inset-y-4 before:left-0 before:w-[3px] before:rounded-full before:bg-gradient-to-b before:from-teal-500 before:via-teal-600 before:to-cyan-600 before:opacity-90 before:shadow-[0_0_20px_rgba(20,184,166,0.35)]`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-stone-200/70 bg-gradient-to-b from-white/90 to-stone-50/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-600 shadow-sm shadow-stone-900/[0.04] ring-1 ring-white/55">
          Line {index + 1}
        </span>
        <div className="print-hide flex shrink-0 gap-1.5">
          <button
            type="button"
            aria-label="Move line up"
            disabled={index === 0}
            onClick={() => moveLine(line.id, "up")}
            className={iconBtn}
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Move line down"
            disabled={index >= totalLines - 1}
            onClick={() => moveLine(line.id, "down")}
            className={iconBtn}
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Remove line"
            onClick={() => removeLine(line.id)}
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-rose-200/80 bg-white/70 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-800 shadow-sm ring-1 ring-white/35 transition duration-150 hover:bg-rose-50/90"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <label className={labelClass} htmlFor={`desc-${line.id}`}>
            Description
          </label>
          <input
            id={`desc-${line.id}`}
            value={line.description}
            onChange={(e) => setLine(line.id, { description: e.target.value })}
            placeholder="Scope of work"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor={`cat-${line.id}`}>
            Category
          </label>
          <input
            id={`cat-${line.id}`}
            list={listId}
            value={line.category}
            onChange={(e) => setLine(line.id, { category: e.target.value })}
            placeholder="e.g. Labor"
            className={inputClass}
          />
          <datalist id={listId}>
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="col-span-1">
            <label className={labelClass} htmlFor={`qty-${line.id}`}>
              Qty
            </label>
            <input
              id={`qty-${line.id}`}
              inputMode="decimal"
              type="number"
              min={0}
              step="any"
              value={Number.isFinite(line.quantity) ? line.quantity : 0}
              onChange={(e) => setLine(line.id, { quantity: Number(e.target.value) })}
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>
          <div className="col-span-1">
            <label className={labelClass} htmlFor={`unit-${line.id}`}>
              Unit
            </label>
            <input
              id={`unit-${line.id}`}
              value={line.unit}
              onChange={(e) => setLine(line.id, { unit: e.target.value })}
              placeholder="ea"
              className={`${inputClass} font-mono text-sm uppercase tracking-wide sm:text-base`}
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className={labelClass} htmlFor={`uc-${line.id}`}>
              Unit cost
            </label>
            <input
              id={`uc-${line.id}`}
              inputMode="decimal"
              type="number"
              min={0}
              step="0.01"
              value={Number.isFinite(line.unitCost) ? line.unitCost : 0}
              onChange={(e) => setLine(line.id, { unitCost: Number(e.target.value) })}
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>
          <div className="col-span-2 flex flex-col justify-end sm:col-span-1">
            <span className={labelClass}>Line total</span>
            <p className="mt-1.5 flex min-h-11 items-center rounded-xl border border-teal-200/55 bg-gradient-to-br from-teal-50/95 via-white/80 to-white px-3.5 py-2.5 text-base font-semibold tabular-nums text-teal-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] shadow-sm font-mono max-sm:min-h-9 max-sm:rounded-lg max-sm:py-1.5 max-sm:text-sm">
              {formatMoney(extended)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
