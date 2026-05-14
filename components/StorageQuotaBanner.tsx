"use client";

import { useEffect, useState } from "react";

import { estimateStoragePressure } from "@/lib/persistence";

export function StorageQuotaBanner() {
  const [level, setLevel] = useState<"ok" | "high" | "unknown">("unknown");

  useEffect(() => {
    let cancelled = false;
    void estimateStoragePressure().then((x) => {
      if (!cancelled) setLevel(x);
    });
    const id = window.setInterval(() => {
      void estimateStoragePressure().then((x) => {
        if (!cancelled) setLevel(x);
      });
    }, 120_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  if (level !== "high") return null;

  return (
    <div
      role="status"
      className="print-hide mx-auto mb-3 max-w-3xl rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-950"
    >
      <strong className="font-semibold">Storage is nearly full.</strong> Export a backup soon, or clear old estimates to
      avoid save failures.
    </div>
  );
}
