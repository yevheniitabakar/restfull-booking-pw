import { test as base, expect, request as playwrightRequest } from "@playwright/test";
import { HttpClient, type AttachmentSink } from "../api/http/httpClient";
import { AuthClient } from "../api/clients/authClient";
import { BookingClient } from "../api/clients/bookingClient";

/**
 * Custom Playwright fixtures for API tests. Provides HttpClient, domain clients,
 * and a cached worker-scoped auth token.
 */
export type Clients = {
  auth: AuthClient;
  booking: BookingClient;
};

type TestFixtures = {
  http: HttpClient;
  clients: Clients;
};

type WorkerFixtures = {
  authToken: string;
};

const DEFAULT_USER = "admin";
const DEFAULT_PASS = "password123";
const DEFAULT_BASE_URL = "https://restful-booker.herokuapp.com";
const MAX_BODY_SNIPPET = 2048;

export const test = base.extend<TestFixtures, WorkerFixtures>({
  http: async ({ request }, use, testInfo) => {
    const attach: AttachmentSink = async (attachment) => {
      const body =
        typeof attachment.body === "string"
          ? Buffer.from(attachment.body, "utf-8")
          : attachment.body;
      await testInfo.attach(attachment.name, {
        body,
        contentType: attachment.contentType,
      });
    };

    await use(new HttpClient(request, { attach }));
  },

  clients: async ({ http }, use) => {
    await use({ auth: new AuthClient(http), booking: new BookingClient(http) });
  },

  /**
   * Worker-scoped token to reduce repeated /auth calls across tests.
   * Cached per worker to avoid cross-test pollution while keeping setup fast.
   */
  authToken: [
    async ({}, use) => {
      const baseURL = process.env.BOOKER_BASE_URL || DEFAULT_BASE_URL;
      const apiContext = await playwrightRequest.newContext({ baseURL });

      let token = "";
      try {
        const http = new HttpClient(apiContext);
        const authClient = new AuthClient(http);
        const response = await authClient.createToken({
          username: process.env.BOOKER_USER || DEFAULT_USER,
          password: process.env.BOOKER_PASS || DEFAULT_PASS,
        });

        if (!response.ok) {
          const snippet = bodySnippet(response.body);
          throw new Error(
            `Failed to create auth token: ${response.status} ${response.statusText}` +
              (snippet ? `\n${snippet}` : ""),
          );
        }

        token = (response.body as { token?: string } | null)?.token ?? "";
        if (!token) {
          const snippet = bodySnippet(response.body);
          throw new Error(
            `Auth token missing in response.` + (snippet ? `\n${snippet}` : ""),
          );
        }
      } finally {
        await apiContext.dispose();
      }

      await use(token);
    },
    { scope: "worker" },
  ],
});

export { expect };

function bodySnippet(body: unknown): string {
  if (body === null || body === undefined) {
    return "";
  }
  if (typeof body === "string") {
    return body.slice(0, MAX_BODY_SNIPPET);
  }
  try {
    return JSON.stringify(body).slice(0, MAX_BODY_SNIPPET);
  } catch {
    return "[unserializable body]";
  }
}
