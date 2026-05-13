"use client";

import type { ChangeEvent } from "react";

import { cardSurface, headingClass, inputClass, labelClass } from "@/lib/uiTokens";
import { useDensityClasses } from "@/hooks/useDensityClasses";
import { useProBuildStore } from "@/store/proBuildStore";

const LOGO_MAX_CHARS = 450_000;

export function BrandingBar() {
  const branding = useProBuildStore((s) => s.branding);
  const setBranding = useProBuildStore((s) => s.setBranding);
  const d = useDensityClasses();

  const onLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 240 * 1024) {
      window.alert("Choose a smaller image (under 240 KB) for Local Storage.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (dataUrl.length > LOGO_MAX_CHARS) {
        window.alert("Image encodes too large for storage. Try a smaller file.");
        return;
      }
      setBranding({ logoDataUrl: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  return (
    <section
      aria-label="Company branding"
      className={`print-hide ${cardSurface} ${d.cardPad}`}
    >
      <h2 className={`${headingClass} text-sm`}>Branding & terms</h2>
      <p className="mt-1 text-xs text-stone-500">
        Shown on client HTML export and printable views. Keep logos small so backups stay reliable.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="brand-company">
            Company name
          </label>
          <input
            id="brand-company"
            value={branding.companyName}
            onChange={(e) => setBranding({ companyName: e.target.value })}
            className={`${inputClass} ${d.formFieldMinH}`}
            placeholder="Your company LLC"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brand-tag">
            Tagline
          </label>
          <input
            id="brand-tag"
            value={branding.companyTagline}
            onChange={(e) => setBranding({ companyTagline: e.target.value })}
            className={`${inputClass} ${d.formFieldMinH}`}
            placeholder="Licensed & insured"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brand-license">
            Contractor license #
          </label>
          <input
            id="brand-license"
            value={branding.contractorLicense ?? ""}
            onChange={(e) => setBranding({ contractorLicense: e.target.value })}
            className={`${inputClass} ${d.formFieldMinH}`}
            placeholder="Optional — shown on client export"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brand-ins">
            Insurance summary
          </label>
          <input
            id="brand-ins"
            value={branding.insuranceSummary ?? ""}
            onChange={(e) => setBranding({ insuranceSummary: e.target.value })}
            className={`${inputClass} ${d.formFieldMinH}`}
            placeholder="GL / WC carrier & limits"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="brand-accept">
            Acceptance intro
          </label>
          <textarea
            id="brand-accept"
            value={branding.acceptanceIntro ?? ""}
            onChange={(e) => setBranding({ acceptanceIntro: e.target.value })}
            rows={2}
            className={`${inputClass} min-h-[3.5rem] py-2`}
            placeholder="Text above client signature / acceptance block"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="brand-terms">
            Proposal terms / disclaimer
          </label>
          <textarea
            id="brand-terms"
            value={branding.proposalTerms}
            onChange={(e) => setBranding({ proposalTerms: e.target.value })}
            rows={3}
            className={`${inputClass} min-h-[5rem] py-2`}
            placeholder="Payment terms, warranty, exclusions…"
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="brand-logo">
            Logo (optional)
          </label>
          <input id="brand-logo" type="file" accept="image/*" onChange={onLogo} className="text-xs" />
          {branding.logoDataUrl ? (
            <button
              type="button"
              className="mt-2 text-xs font-semibold text-rose-800 underline"
              onClick={() => setBranding({ logoDataUrl: "" })}
            >
              Remove logo
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
