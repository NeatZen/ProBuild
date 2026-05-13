"use client";

import type { LineItem } from "@/lib/estimateTypes";
import { lineExtended } from "@/lib/estimateMath";
import { formatMoney } from "@/lib/formatMoney";
import { useEstimateStore } from "@/store/estimateStore";

const CATEGORY_SUGGESTIONS = ["Labor", "Materials", "Subcontractor", "Equipment", "Other"];

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

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-zinc-500">Line {index + 1}</p>
        <div className="print-hide flex shrink-0 gap-1">
          <button
            type="button"
            aria-label="Move line up"
            disabled={index === 0}
            onClick={() => moveLine(line.id, "up")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↑
          </button>
          <button
            type="button"
            aria-label="Move line down"
            disabled={index >= totalLines - 1}
            onClick={() => moveLine(line.id, "down")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ↓
          </button>
          <button
            type="button"
            aria-label="Remove line"
            onClick={() => removeLine(line.id)}
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg border border-red-200 px-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <div>
          <label className="text-xs font-medium text-zinc-600" htmlFor={`desc-${line.id}`}>
            Description
          </label>
          <input
            id={`desc-${line.id}`}
            value={line.description}
            onChange={(e) => setLine(line.id, { description: e.target.value })}
            placeholder="Scope of work"
            className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600" htmlFor={`cat-${line.id}`}>
            Category
          </label>
          <input
            id={`cat-${line.id}`}
            list={listId}
            value={line.category}
            onChange={(e) => setLine(line.id, { category: e.target.value })}
            placeholder="e.g. Labor"
            className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
          />
          <datalist id={listId}>
            {CATEGORY_SUGGESTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-1">
            <label className="text-xs font-medium text-zinc-600" htmlFor={`qty-${line.id}`}>
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
              className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
            />
          </div>
          <div className="col-span-1">
            <label className="text-xs font-medium text-zinc-600" htmlFor={`unit-${line.id}`}>
              Unit
            </label>
            <input
              id={`unit-${line.id}`}
              value={line.unit}
              onChange={(e) => setLine(line.id, { unit: e.target.value })}
              placeholder="ea"
              className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="text-xs font-medium text-zinc-600" htmlFor={`uc-${line.id}`}>
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
              className="mt-1 w-full min-h-11 rounded-lg border border-zinc-300 px-3 py-2 text-base outline-none ring-amber-500/30 focus:border-amber-500 focus:ring-2"
            />
          </div>
          <div className="col-span-2 flex flex-col justify-end sm:col-span-1">
            <span className="text-xs font-medium text-zinc-600">Line total</span>
            <p className="mt-1 min-h-11 rounded-lg border border-dashed border-zinc-200 bg-zinc-50 px-3 py-2 text-base font-semibold tabular-nums">
              {formatMoney(extended)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
