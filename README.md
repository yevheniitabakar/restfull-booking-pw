# Playwright API FW (Stage 0)

Stage 0 is a minimal, runnable Playwright Test + TypeScript setup for Restful-Booker API tests. No custom clients or fixtures yet.

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

## Scope

Stage 0 focuses on bootstrapping only. Future stages will add architecture layers (clients, fixtures, data factories, etc.).
