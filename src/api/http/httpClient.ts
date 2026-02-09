import type { APIRequestContext, APIResponse } from "@playwright/test";
import { DEFAULT_HTTP_HEADERS, DEFAULT_TIMEOUT_MS } from "../../config/httpDefaults";
import { normalizeHeaders, parseBody } from "./response";
import type { HttpResponse } from "./response";

export type Attachment = {
  name: string;
  contentType: string;
  body: string | Buffer;
};

export type AttachmentSink = (attachment: Attachment) => Promise<void> | void;

export type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  timeoutMs?: number;
};

export class HttpClient {
  private readonly context: APIRequestContext;
  private readonly attach?: AttachmentSink;

  /**
   * Optional attachment hook for reporting (e.g., Allure). Attachments are sanitized
   * and size-limited to prevent leaking secrets and bloating reports.
   */
  constructor(context: APIRequestContext, options?: { attach?: AttachmentSink }) {
    this.context = context;
    this.attach = options?.attach;
  }

  async get<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("GET", path, options);
  }

  async post<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("POST", path, options);
  }

  async put<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", path, options);
  }

  async patch<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("PATCH", path, options);
  }

  async delete<T>(
    path: string,
    options?: RequestOptions,
  ): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", path, options);
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const query = this.normalizeQuery(options.query);
    const url = this.buildUrl(path, query);

    const headers: Record<string, string> = {
      ...DEFAULT_HTTP_HEADERS,
      ...(options.headers || {}),
    };

    if (options.json !== undefined && !this.hasContentType(headers)) {
      headers["content-type"] = "application/json";
    }

    await this.attachRequest(method, url, path, headers, query, options.json);

    const response = await this.context.fetch(url, {
      method,
      headers,
      data: options.json,
      timeout: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });

    return this.adaptResponse<T>(response, method, url);
  }

  private async adaptResponse<T>(
    response: APIResponse,
    method: string,
    url: string,
  ): Promise<HttpResponse<T>> {
    const headers = normalizeHeaders(response.headers());
    const body = await parseBody<T>(response, headers);
    const result: HttpResponse<T> = {
      ok: response.ok(),
      status: response.status(),
      statusText: response.statusText?.() ?? "",
      headers,
      url: response.url(),
      body,
      raw: response,
    };

    await this.attachResponse(method, url, result);

    if (!result.ok) {
      this.logFailure(method, url, result);
    }

    return result;
  }

  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined | null>,
  ): string {
    if (!query) {
      return path;
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue;
      }
      params.append(key, String(value));
    }

    const queryString = params.toString();
    if (!queryString) {
      return path;
    }

    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}${queryString}`;
  }

  private normalizeQuery(
    query?: Record<string, string | number | boolean | undefined | null>,
  ): Record<string, string | number | boolean> | undefined {
    if (!query) {
      return undefined;
    }
    const cleaned: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue;
      }
      cleaned[key] = value;
    }
    return Object.keys(cleaned).length ? cleaned : undefined;
  }

  private hasContentType(headers: Record<string, string>): boolean {
    return Object.keys(headers).some(
      (key) => key.toLowerCase() === "content-type",
    );
  }

  private logFailure(
    method: string,
    path: string,
    response: HttpResponse<unknown>,
  ): void {
    const snippet = this.bodySnippet(response.body, 2048);
    const message = `${method} ${path} -> ${response.status} ${response.statusText}`;
    console.warn(message, snippet ? `\n${snippet}` : "");
  }

  private bodySnippet(body: unknown, limit: number): string {
    if (body === null || body === undefined) {
      return "";
    }
    if (typeof body === "string") {
      return body.slice(0, limit);
    }
    try {
      return JSON.stringify(body).slice(0, limit);
    } catch {
      return "[unserializable body]";
    }
  }

  private async attachRequest(
    method: string,
    url: string,
    path: string,
    headers: Record<string, string>,
    query: Record<string, string | number | boolean> | undefined,
    body: unknown,
  ): Promise<void> {
    if (!this.attach) {
      return;
    }

    const payload = {
      method,
      path,
      url,
      headers: sanitizeHeaders(headers),
      query,
      body: sanitizeJson(body),
    };

    const content = safeJsonStringify(payload, 20 * 1024);
    await this.safeAttach({
      name: `API Request: ${method} ${path}`,
      contentType: "application/json",
      body: content,
    });
  }

  private async attachResponse<T>(
    method: string,
    url: string,
    response: HttpResponse<T>,
  ): Promise<void> {
    if (!this.attach) {
      return;
    }

    const payload = {
      status: response.status,
      statusText: response.statusText,
      url: response.url || url,
      headers: sanitizeHeaders(response.headers),
      body: sanitizeJson(response.body),
    };

    const content = safeJsonStringify(payload, 20 * 1024);
    await this.safeAttach({
      name: `API Response: ${response.status} ${method} ${url}`,
      contentType: "application/json",
      body: content,
    });
  }

  private async safeAttach(attachment: Attachment): Promise<void> {
    if (!this.attach) {
      return;
    }
    try {
      await this.attach(attachment);
    } catch (error) {
      console.warn(`Failed to attach Allure data: ${String(error)}`);
    }
  }
}

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-api_key",
]);

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    sanitized[key] = SENSITIVE_HEADERS.has(lower) ? "***" : value;
  }
  return sanitized;
}

const SENSITIVE_BODY_KEYS = new Set([
  "password",
  "pass",
  "token",
  "authorization",
  "cookie",
  "set-cookie",
  "apikey",
  "x-api-key",
]);

function sanitizeJson(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJson(item));
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_BODY_KEYS.has(lowerKey)) {
        result[key] = "***";
      } else {
        result[key] = sanitizeJson(val);
      }
    }
    return result;
  }

  return value;
}

function safeJsonStringify(value: unknown, limitBytes: number): string {
  let text: string;
  try {
    const json = JSON.stringify(value, null, 2);
    text = json ?? String(value);
  } catch {
    text = String(value);
  }
  return truncateToBytes(text, limitBytes);
}

function truncateToBytes(text: string, limitBytes: number): string {
  const buffer = Buffer.from(text, "utf-8");
  if (buffer.length <= limitBytes) {
    return text;
  }
  return buffer.subarray(0, limitBytes).toString("utf-8");
}
