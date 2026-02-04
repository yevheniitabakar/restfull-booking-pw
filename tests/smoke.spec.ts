import { test, expect } from "@playwright/test";

test("GET /ping should return 201", async ({ request }) => {
  const response = await request.get("/ping");

  expect(response.status()).toBe(201);
  const contentType = response.headers()["content-type"];
  expect(contentType).toBeTruthy();
  if (contentType) {
    expect(contentType).toContain("text/plain");
  }
});

test("GET /booking should return 200 and JSON", async ({ request }) => {
  const response = await request.get("/booking");

  expect(response.status()).toBe(200);
  const contentType = response.headers()["content-type"];
  expect(contentType).toBeTruthy();
  if (contentType) {
    expect(contentType).toContain("application/json");
  }

  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
});
