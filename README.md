# Playwright API FW

Playwright Test + TypeScript setup for Restful-Booker API tests with transport, clients, fixtures, builders, and suites.

## Setup

Install dependencies:

```bash
npm i
```

Create a local env file:

```bash
cp .env.example .env
```

## Run Tests

```bash
npm test
```

Default `npm test` runs the regression project (excludes `@smoke` and `@negative`).

## Running Test Suites

```bash
npm run test:smoke
npm run test:negative
npm run test:regression
```

Tagging:
- Use `@smoke` for minimal health checks.
- Use `@negative` for error handling tests.
- Everything else runs in regression by default.

## Scope

Stage 0+ focuses on building a layered, maintainable API test framework with clear separation of concerns.
