import { test, expect } from "../src/fixtures/test";

test("GET /ping should return 201", async ({ http }) => {
  const response = await http.get<string>("/ping");

  expect(response.status).toBe(201);
  const contentType = response.headers["content-type"];
  expect(contentType).toBeTruthy();
  if (contentType) {
    expect(contentType).toContain("text/plain");
  }
});

test("GET /booking should return 200 and JSON", async ({ http }) => {
  const response = await http.get<unknown>("/booking");

  expect(response.status).toBe(200);
  const contentType = response.headers["content-type"];
  expect(contentType).toBeTruthy();
  if (contentType) {
    expect(contentType).toContain("application/json");
  }

  expect(Array.isArray(response.body)).toBe(true);
});
