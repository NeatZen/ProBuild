import { del, get, set } from "idb-keyval";

const IDB_KEY = "probuild-app-v4-json";

export async function idbWriteApp(json: string): Promise<void> {
  await set(IDB_KEY, json);
}

export async function idbReadApp(): Promise<string | null> {
  const v = await get<string>(IDB_KEY);
  return typeof v === "string" && v.length > 0 ? v : null;
}

export async function idbClearApp(): Promise<void> {
  try {
    await del(IDB_KEY);
  } catch {
    // ignore
  }
}
