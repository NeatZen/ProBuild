import type { WorkspaceBranding } from "./appTypes";
import type { Estimate } from "./estimateTypes";
import { estimateTotals } from "./estimateMath";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Self-contained read-only HTML bundle (no server) for sharing with clients. */
export function buildClientViewHtml(
  estimate: Estimate,
  locale: string,
  currency: string,
  branding?: Partial<WorkspaceBranding> | null,
): string {
  const t = estimateTotals(estimate);
  const fmt = new Intl.NumberFormat(locale || "en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const money = (n: number) => fmt.format(Number.isFinite(n) ? n : 0);

  const title = estimate.projectName.trim() || "Construction estimate";
  const company = branding?.companyName?.trim() ?? "";
  const tagline = branding?.companyTagline?.trim() ?? "";
  const terms = branding?.proposalTerms?.trim() ?? "";
  const logo = branding?.logoDataUrl?.trim() ?? "";

  const sectionLabel = (id: string) => estimate.sections.find((s) => s.id === id)?.label ?? "—";

  const rows = estimate.lines
    .map((line) => {
      const ext = Number(line.quantity) * Number(line.unitCost);
      const safe = Number.isFinite(ext) ? ext : 0;
      return `<tr>
        <td>${escapeHtml(line.description || "—")}</td>
        <td>${escapeHtml(line.category || "—")}</td>
        <td>${escapeHtml(line.lineType)}</td>
        <td>${escapeHtml(sectionLabel(line.sectionId))}</td>
        <td class="num">${escapeHtml(String(line.quantity))}</td>
        <td>${escapeHtml(line.unit || "")}</td>
        <td class="num">${money(line.unitCost)}</td>
        <td class="num">${money(safe)}</td>
      </tr>`;
    })
    .join("");

  const json = JSON.stringify({ estimate, locale, currency, branding }).replace(/</g, "\\u003c");

  const brandHeader =
    logo || company
      ? `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
          ${logo ? `<img src="${escapeHtml(logo)}" alt="" style="max-height:48px;max-width:160px;object-fit:contain;" />` : ""}
          <div>
            ${company ? `<div style="font-size:1.05rem;font-weight:700;">${escapeHtml(company)}</div>` : ""}
            ${tagline ? `<div class="muted" style="margin:0;">${escapeHtml(tagline)}</div>` : ""}
          </div>
        </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="${escapeHtml(locale.split("-")[0] || "en")}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
    body { margin: 0; padding: 24px 18px 48px; background: #fafaf9; color: #1c1917; }
    .card { max-width: 960px; margin: 0 auto; background: #fff; border: 1px solid #e7e5e4; border-radius: 16px; padding: 20px 18px 24px; box-shadow: 0 18px 50px -30px rgba(28,25,23,0.25); }
    h1 { font-size: 1.25rem; margin: 0 0 6px; letter-spacing: -0.02em; }
    .muted { color: #78716c; font-size: 0.875rem; margin: 0 0 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
    th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #f5f5f4; vertical-align: top; }
    th { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; color: #78716c; }
    .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .tot { margin-top: 18px; border-top: 1px solid #e7e5e4; padding-top: 14px; font-size: 0.875rem; }
    .tot dl { margin: 0; display: grid; gap: 6px; }
    .tot div { display: flex; justify-content: space-between; gap: 12px; }
    .grand { margin-top: 12px; padding: 12px 14px; border-radius: 12px; background: #1c1917; color: #fff; display: flex; justify-content: space-between; align-items: center; font-weight: 700; }
    .notes { margin-top: 16px; white-space: pre-wrap; font-size: 0.8125rem; color: #44403c; }
    footer { margin-top: 22px; font-size: 0.7rem; color: #a8a29e; text-align: center; }
    @media print { body { background: #fff; } .card { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="card">
    ${brandHeader}
    <h1>${escapeHtml(company ? `${company} — ${title}` : title)}</h1>
    <p class="muted">Read-only client view · generated locally</p>
    <table>
      <thead><tr><th>Description</th><th>Category</th><th>Type</th><th>Section</th><th class="num">Qty</th><th>Unit</th><th class="num">Unit cost</th><th class="num">Extended</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="tot">
      <dl>
        <div><dt>Line subtotal</dt><dd>${money(t.subtotal)}</dd></div>
        <div><dt>After category markups</dt><dd>${money(t.adjustedSubtotal)}</dd></div>
        <div><dt>Markup</dt><dd>${money(t.markupAmount)}</dd></div>
        <div><dt>Overhead</dt><dd>${money(t.overheadAmount)}</dd></div>
        <div><dt>Bond / insurance (flat)</dt><dd>${money(t.bondInsuranceFlat)}</dd></div>
        <div><dt>Tax</dt><dd>${money(t.taxAmount)}</dd></div>
        <div><dt>Retention (hold)</dt><dd>${money(t.retentionAmount)}</dd></div>
      </dl>
      <div class="grand"><span>Grand total</span><span>${money(t.grandTotal)}</span></div>
      <div class="grand" style="background:#0f766e;margin-top:8px;"><span>Net due (after retention)</span><span>${money(t.netDue)}</span></div>
    </div>
    ${
      estimate.clientNotes.trim()
        ? `<div class="notes"><strong>Notes</strong><br/>${escapeHtml(estimate.clientNotes)}</div>`
        : ""
    }
    ${
      terms
        ? `<div class="notes" style="border-top:1px solid #e7e5e4;padding-top:14px;margin-top:18px;"><strong>Terms &amp; conditions</strong><br/>${escapeHtml(terms)}</div>`
        : ""
    }
  </div>
  <footer>ProBuild estimate export · totals computed at export time.</footer>
  <script type="application/json" id="pb-data">${json}</script>
</body>
</html>`;
}

export function defaultClientViewFilename(estimate: Estimate): string {
  const base = estimate.projectName.trim().replace(/[^\w\-]+/g, "-").slice(0, 48) || "estimate";
  return `${base}-client-view.html`;
}
