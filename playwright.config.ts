import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

// Load environment variables from .env if present.
dotenv.config();

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  retries: 1,
  reporter: [["html", { open: "never" }], ["list"]],
  projects: [
    {
      name: "smoke",
      grep: /@smoke/,
      retries: 1,
    },
    {
      name: "negative",
      grep: /@negative/,
      retries: 1,
      workers: 1,
    },
    {
      name: "regression",
      grepInvert: /@smoke|@negative/,
      retries: 1,
    },
  ],
  use: {
    baseURL:
      process.env.BOOKER_BASE_URL || "https://restful-booker.herokuapp.com",
    extraHTTPHeaders: {
      Accept: "application/json",
    },
    trace: "retain-on-failure",
  },
});
