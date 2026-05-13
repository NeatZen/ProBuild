"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { buildClientViewHtml } from "@/lib/clientViewHtml";
import { decodeShareToken } from "@/lib/shareCodec";

function ShareView() {
  const sp = useSearchParams();
  const param = sp.get("p");
  const [srcDoc, setSrcDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!param) return;
    let cancelled = false;
    void decodeShareToken(param).then((r) => {
      if (cancelled) return;
      if (!r.ok) {
        setSrcDoc("");
        return;
      }
      const { estimate, branding, locale, currency } = r.payload;
      setSrcDoc(
        buildClientViewHtml(estimate, locale ?? "en-US", currency ?? "USD", branding ?? undefined),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [param]);

  if (!param) {
    return (
      <main className="mx-auto max-w-lg p-6 text-stone-800">
        <h1 className="text-lg font-semibold">Shared estimate</h1>
        <p className="mt-2 text-sm text-stone-600" data-testid="share-missing">
          Missing share payload. Use Copy share link from the workspace menu.
        </p>
      </main>
    );
  }

  if (srcDoc === "") {
    return (
      <main className="mx-auto max-w-lg p-6 text-stone-800">
        <h1 className="text-lg font-semibold">Shared estimate</h1>
        <p className="mt-2 text-sm text-stone-600">This link could not be read or is invalid.</p>
      </main>
    );
  }

  if (srcDoc === null) {
    return (
      <main className="p-6 text-stone-600">
        <p>Loading shared estimate…</p>
      </main>
    );
  }

  return (
    <iframe title="Shared estimate" srcDoc={srcDoc} className="min-h-screen w-full border-0 bg-stone-100" />
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <main className="p-6 text-stone-600">
          <p>Loading…</p>
        </main>
      }
    >
      <ShareView />
    </Suspense>
  );
}
