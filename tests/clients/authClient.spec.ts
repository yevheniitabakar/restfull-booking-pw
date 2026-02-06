import { test, expect } from "@playwright/test";
import { HttpClient } from "../../src/api/http/httpClient";
import { AuthClient } from "../../src/api/clients/authClient";

const DEFAULT_USER = "admin";
const DEFAULT_PASS = "password123";

test("createToken returns token", async ({ request }) => {
  const http = new HttpClient(request);
  const authClient = new AuthClient(http);

  const response = await authClient.createToken({
    username: process.env.BOOKER_USER || DEFAULT_USER,
    password: process.env.BOOKER_PASS || DEFAULT_PASS,
  });

  expect(response.status).toBe(200);
  expect(response.ok).toBe(true);

  const body = response.body;
  expect(body).not.toBeNull();
  if (!body || typeof body !== "object") {
    throw new Error("Unexpected auth response body");
  }

  const token = (body as { token?: string }).token;
  expect(typeof token).toBe("string");
  expect(token && token.length > 0).toBe(true);
});
