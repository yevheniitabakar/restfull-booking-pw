import { test, expect } from "../src/fixtures/test";

test("HttpClient GET /ping returns string body", async ({ http }) => {
  const response = await http.get<string>("/ping");

  expect(response.ok).toBe(true);
  expect(response.status).toBe(201);
  expect(typeof response.body).toBe("string");
});

test("HttpClient GET /booking returns JSON array", async ({ http }) => {
  const response = await http.get<unknown>("/booking");

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

test("HttpClient query builder encodes params", async ({ http }) => {
  const response = await http.get("/booking", {
    query: { firstname: "Susan", lastname: "Brown", note: "a b" },
  });

  expect(response.url).toContain("firstname=Susan");
  expect(response.url).toContain("lastname=Brown");
  expect(response.url).toContain("note=a+b");
});
