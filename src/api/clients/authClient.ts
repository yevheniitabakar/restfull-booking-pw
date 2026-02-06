import type { HttpResponse } from "../http/response";
import type { HttpClient } from "../http/httpClient";
import type { AuthRequest, AuthResponse } from "../../domain/models/auth";

/**
 * Thin client for auth endpoints, wrapping HttpClient with typed payloads.
 */
export class AuthClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  createToken(request: AuthRequest): Promise<HttpResponse<AuthResponse>> {
    return this.http.post<AuthResponse>("/auth", { json: request });
  }
}
