import { test, expect } from "@playwright/test";
import { HttpClient } from "../src/api/http/httpClient";

test("HttpClient GET /ping returns string body", async ({ request }) => {
  const client = new HttpClient(request);
  const response = await client.get<string>("/ping");

  expect(response.ok).toBe(true);
  expect(response.status).toBe(201);
  expect(typeof response.body).toBe("string");
});

test("HttpClient GET /booking returns JSON array", async ({ request }) => {
  const client = new HttpClient(request);
  const response = await client.get<unknown>("/booking");

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

test("HttpClient query builder encodes params", async ({ request }) => {
  const client = new HttpClient(request);
  const response = await client.get("/booking", {
    query: { firstname: "Susan", lastname: "Brown", note: "a b" },
  });

  expect(response.url).toContain("firstname=Susan");
  expect(response.url).toContain("lastname=Brown");
  expect(response.url).toContain("note=a+b");
});
