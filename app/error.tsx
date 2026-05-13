"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-stone-100 px-4 text-stone-900">
        <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-lg">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-stone-600">
            ProBuild hit an unexpected error. Your data may still be saved in this browser.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-600"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
