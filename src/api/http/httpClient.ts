import type { APIRequestContext, APIResponse } from "@playwright/test";
import { DEFAULT_HTTP_HEADERS, DEFAULT_TIMEOUT_MS } from "../../config/httpDefaults";
import { normalizeHeaders, parseBody } from "./response";
import type { HttpResponse } from "./response";

export type RequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined | null>;
  json?: unknown;
  timeoutMs?: number;
};

export class HttpClient {
  private readonly context: APIRequestContext;

  constructor(context: APIRequestContext) {
    this.context = context;
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
    const url = this.buildUrl(path, options.query);

    const headers: Record<string, string> = {
      ...DEFAULT_HTTP_HEADERS,
      ...(options.headers || {}),
    };

    if (options.json !== undefined && !this.hasContentType(headers)) {
      headers["content-type"] = "application/json";
    }

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
}
