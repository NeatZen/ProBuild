import type { WorkspaceBranding } from "./appTypes";
import type { Estimate } from "./estimateTypes";

export type SharePayloadV1 = {
  v: 1;
  estimate: Estimate;
  branding?: Partial<WorkspaceBranding> | null;
  locale?: string;
  currency?: string;
};

function utf8Bytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function utf8String(buf: Uint8Array): string {
  return new TextDecoder().decode(buf);
}

async function gzipCompress(bytes: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  await writer.write(bytes as BufferSource);
  await writer.close();
  const ab = await new Response(cs.readable).arrayBuffer();
  return new Uint8Array(ab);
}

async function gzipDecompress(bytes: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("gzip");
  const writer = ds.writable.getWriter();
  await writer.write(bytes as BufferSource);
  await writer.close();
  const ab = await new Response(ds.readable).arrayBuffer();
  return new Uint8Array(ab);
}

function toBase64Url(data: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < data.length; i++) bin += String.fromCharCode(data[i]!);
  const b64 = typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(data).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = 4 - (s.length % 4 || 4);
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad === 4 ? 0 : pad);
  if (typeof atob !== "undefined") {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return Uint8Array.from(Buffer.from(b64, "base64"));
}

export async function encodeSharePayload(payload: SharePayloadV1): Promise<string> {
  const raw = utf8Bytes(JSON.stringify(payload));
  try {
    const gz = await gzipCompress(raw);
    return `g1.${toBase64Url(gz)}`;
  } catch {
    return `j1.${toBase64Url(raw)}`;
  }
}

export type DecodeResult =
  | { ok: true; payload: SharePayloadV1 }
  | { ok: false; error: string };

export async function decodeShareToken(token: string): Promise<DecodeResult> {
  const s = token.trim();
  if (!s) return { ok: false, error: "Missing data." };
  if (s.startsWith("g1.")) {
    try {
      const body = fromBase64Url(s.slice(3));
      const json = utf8String(await gzipDecompress(body));
      return normalizePayload(JSON.parse(json));
    } catch {
      return { ok: false, error: "Could not read shared data (compressed)." };
    }
  }
  if (s.startsWith("j1.")) {
    try {
      const body = fromBase64Url(s.slice(3));
      const json = utf8String(body);
      return normalizePayload(JSON.parse(json));
    } catch {
      return { ok: false, error: "Could not read shared data." };
    }
  }
  return { ok: false, error: "Unrecognized share format." };
}

function normalizePayload(data: unknown): DecodeResult {
  if (!data || typeof data !== "object") return { ok: false, error: "Invalid payload." };
  const o = data as Partial<SharePayloadV1>;
  if (o.v !== 1) return { ok: false, error: "Unsupported share version." };
  if (!o.estimate || typeof o.estimate !== "object") return { ok: false, error: "Missing estimate." };
  return { ok: true, payload: o as SharePayloadV1 };
}

export const SHARE_URL_WARNING_LENGTH = 6500;
