"use client";

import { useRef } from "react";

import type { LineItem } from "@/lib/estimateTypes";
import { lineExtended } from "@/lib/estimateMath";
import { cardSurfaceElevated, inputClass, labelClass } from "@/lib/uiTokens";
import { useMoneyFormatter } from "@/hooks/useMoneyFormatter";
import { useProBuildStore } from "@/store/proBuildStore";

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
  searchMatch: boolean;
  searchActive: boolean;
};

export function LineItemRow({ line, index, totalLines, searchMatch, searchActive }: Props) {
  const formatMoney = useMoneyFormatter();
  const setLine = useProBuildStore((s) => s.setLine);
  const removeLine = useProBuildStore((s) => s.removeLine);
  const moveLine = useProBuildStore((s) => s.moveLine);
  const duplicateLine = useProBuildStore((s) => s.duplicateLine);
  const copyLineFromPrevious = useProBuildStore((s) => s.copyLineFromPrevious);
  const collapsed = useProBuildStore((s) => s.ui.collapsedLineIds.includes(line.id));
  const toggleLineCollapsed = useProBuildStore((s) => s.toggleLineCollapsed);

  const touchStartX = useRef<number | null>(null);

  const extended = lineExtended(line);
  const listId = `categories-${line.id}`;

  const iconBtn =
    "inline-flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-600 shadow-sm transition duration-150 ease-out hover:border-stone-300 hover:bg-stone-50 hover:text-teal-900 disabled:cursor-not-allowed disabled:border-stone-100 disabled:bg-stone-50 disabled:text-stone-300 disabled:shadow-none";

  const dimmed = searchActive && !searchMatch;

  if (collapsed) {
    return (
      <article
        className={`relative overflow-hidden rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition-opacity ${dimmed ? "opacity-35" : ""}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
              Line {index + 1}
            </p>
            <p className="truncate text-sm font-medium text-stone-900">
              {line.description.trim() || "Empty description"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <p className="font-mono text-sm font-semibold tabular-nums text-teal-950">{formatMoney(extended)}</p>
            <button
              type="button"
              onClick={() => toggleLineCollapsed(line.id)}
              className="rounded-lg border border-stone-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-50"
            >
              Expand
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      onTouchStart={(e) => {
        touchStartX.current = e.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start == null || totalLines <= 1) return;
        const end = e.changedTouches[0]?.clientX;
        if (end == null) return;
        if (end - start < -88) {
          if (window.confirm("Remove this line?")) removeLine(line.id);
        }
      }}
      className={`group relative overflow-hidden p-5 sm:p-6 ${cardSurfaceElevated} before:pointer-events-none before:absolute before:inset-y-5 before:left-0 before:w-0.5 before:rounded-full before:bg-teal-600 ${dimmed ? "opacity-35" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-stone-600">
            Line {index + 1}
          </span>
          {line.kitName ? (
            <p className="mt-2 text-[11px] font-medium text-teal-800/90">Assembly: {line.kitName}</p>
          ) : null}
        </div>
        <div className="print-hide flex max-w-[70%] flex-wrap justify-end gap-1.5 sm:max-w-none">
          <button
            type="button"
            onClick={() => toggleLineCollapsed(line.id)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Collapse
          </button>
          <button
            type="button"
            onClick={() => duplicateLine(line.id)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm hover:bg-stone-50"
          >
            Duplicate
          </button>
          <button
            type="button"
            disabled={index === 0}
            onClick={() => copyLineFromPrevious(line.id)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stone-200/80 bg-white/70 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-stone-700 shadow-sm hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            Copy prev
          </button>
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
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-rose-200/80 bg-white/70 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-800 shadow-sm ring-1 ring-white/35 transition duration-150 hover:bg-rose-50/90"
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
