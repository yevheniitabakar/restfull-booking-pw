import { test, expect } from "../../src/fixtures/test";
import { expectResponseNotOk } from "../../src/assertions/responseAssertions";

const DEFAULT_USER = "admin";

test.describe("Auth Negative @negative", () => {
  test("Auth with invalid credentials should fail @negative", async ({ clients }) => {
    await test.step("Attempt auth with invalid credentials", async () => {
      const response = await clients.auth.createToken({
        username: DEFAULT_USER,
        password: "wrong",
      });

      await test.step("Verify auth failed", async () => {
        if (response.ok) {
          const token =
            response.body && typeof response.body === "object"
              ? (response.body as { token?: string }).token
              : undefined;
          expect(token, "auth invalid credentials: token should be absent").toBeFalsy();
        } else {
          expectResponseNotOk(response, "auth invalid credentials");
        }
      });
    });
  });

  test("Auth with missing fields should fail @negative", async ({ http }) => {
    await test.step("Attempt auth with missing fields", async () => {
      const response = await http.post("/auth", {
        json: { username: DEFAULT_USER },
      });

      await test.step("Verify auth failed", async () => {
        if (response.ok) {
          const token =
            response.body && typeof response.body === "object"
              ? (response.body as { token?: string }).token
              : undefined;
          expect(token, "auth missing fields: token should be absent").toBeFalsy();
        } else {
          expectResponseNotOk(response, "auth missing fields");
        }
      });
    });
  });
});
