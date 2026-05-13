import type { AppPersist } from "./appTypes";

/** Browser-safe checksum (FNV-1a-ish) for export manifest integrity hints. */
export function fingerprintString(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export type ExportAuditManifest = {
  exportedAt: string;
  appSchemaVersion: number;
  estimateSchemaVersionHint: string;
  estimateCount: number;
  activeEstimateId: string;
  currency: string;
  locale: string;
  payloadChecksum: string;
};

export function buildExportAuditManifest(persist: AppPersist, payloadJson: string): ExportAuditManifest {
  const ev = persist.estimates[0]?.version;
  return {
    exportedAt: new Date().toISOString(),
    appSchemaVersion: persist.version,
    estimateSchemaVersionHint: typeof ev === "number" ? String(ev) : "unknown",
    estimateCount: persist.estimates.length,
    activeEstimateId: persist.activeEstimateId,
    currency: persist.settings.currency,
    locale: persist.settings.locale,
    payloadChecksum: fingerprintString(payloadJson),
  };
}

/** Wraps normalized persist with an audit manifest for traceable offline backups. */
export function wrapPersistWithAudit(persist: AppPersist): string {
  const core = JSON.stringify(persist);
  const manifest = buildExportAuditManifest(persist, core);
  return JSON.stringify({ exportAudit: manifest, workspace: persist }, null, 2);
}
