/** Placeholder for future cloud sync: push/pull estimates with conflict handling. */

export type RemoteEstimateEnvelope = {
  id: string;
  updatedAt: string;
  payload: unknown;
};

export type CloudSyncConfig = {
  endpointBaseUrl?: string;
  conflictStrategy: "last-write-wins" | "keep-local";
};

export const cloudSyncStub: Readonly<CloudSyncConfig> = {
  conflictStrategy: "last-write-wins",
};

/** Reserved for background sync wiring; local-first app remains authoritative today. */
export async function syncPushStub(envelope: RemoteEstimateEnvelope): Promise<{ ok: boolean }> {
  void envelope;
  return { ok: true };
}
