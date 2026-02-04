import type { APIResponse } from "@playwright/test";

export type HttpResponse<T> = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  url: string;
  body: T | string | null;
  raw: APIResponse;
};

export function normalizeHeaders(
  headers: Record<string, string>,
): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

export function isJsonContentType(headers: Record<string, string>): boolean {
  const contentType = headers["content-type"] || "";
  return (
    contentType.includes("application/json") ||
    contentType.includes("+json")
  );
}

export async function parseBody<T>(
  response: APIResponse,
  headers: Record<string, string>,
): Promise<T | string | null> {
  const status = response.status();
  if (status === 204) {
    return null;
  }

  const contentLength = headers["content-length"];
  if (contentLength === "0") {
    return null;
  }

  if (isJsonContentType(headers)) {
    try {
      return (await response.json()) as T;
    } catch {
      try {
        return await response.text();
      } catch {
        return null;
      }
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}
