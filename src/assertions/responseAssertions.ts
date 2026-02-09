import { expect } from "@playwright/test";
import type { HttpResponse } from "../api/http/response";

/**
 * Negative response assertions for scenarios expected to fail.
 */
export function expectResponseNotOk<T>(
  response: HttpResponse<T>,
  contextMessage?: string,
): void {
  const snippet = bodySnippet(response.body);
  const prefix = contextMessage ? `${contextMessage}: ` : "";
  const message =
    `${prefix}${response.status} ${response.statusText}` +
    (snippet ? `\n${snippet}` : "");

  expect(response.ok, message).toBe(false);
  expect(response.status, message).toBeGreaterThanOrEqual(400);
}

function bodySnippet(body: unknown): string {
  if (body === null || body === undefined) {
    return "";
  }
  if (typeof body === "string") {
    return body.slice(0, 2048);
  }
  try {
    return JSON.stringify(body).slice(0, 2048);
  } catch {
    return "[unserializable body]";
  }
}
