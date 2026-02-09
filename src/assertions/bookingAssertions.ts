import { expect } from "@playwright/test";
import type { HttpResponse } from "../api/http/response";
import type { Booking, CreateBookingRequest, PartialUpdateBookingRequest } from "../domain/models/booking";

/**
 * Reusable Booking assertions to keep tests scenario-focused and consistent.
 * These helpers avoid deep-equals to provide clearer failure messages.
 */
export function expectBookingMatchesRequest(
  actual: Booking,
  expected: CreateBookingRequest,
): void {
  expect(actual.firstname).toBe(expected.firstname);
  expect(actual.lastname).toBe(expected.lastname);
  expect(actual.totalprice).toBe(expected.totalprice);
  expect(actual.depositpaid).toBe(expected.depositpaid);
  expect(actual.bookingdates.checkin).toBe(expected.bookingdates.checkin);
  expect(actual.bookingdates.checkout).toBe(expected.bookingdates.checkout);

  if (expected.additionalneeds === undefined) {
    expect(actual.additionalneeds).toBeUndefined();
  } else {
    expect(actual.additionalneeds).toBe(expected.additionalneeds);
  }
}

export function expectBookingContainsPatch(
  actual: Booking,
  patch: PartialUpdateBookingRequest,
): void {
  if (patch.firstname !== undefined) {
    expect(actual.firstname).toBe(patch.firstname);
  }
  if (patch.lastname !== undefined) {
    expect(actual.lastname).toBe(patch.lastname);
  }
  if (patch.totalprice !== undefined) {
    expect(actual.totalprice).toBe(patch.totalprice);
  }
  if (patch.depositpaid !== undefined) {
    expect(actual.depositpaid).toBe(patch.depositpaid);
  }
  if (patch.additionalneeds !== undefined) {
    expect(actual.additionalneeds).toBe(patch.additionalneeds);
  }
  if (patch.bookingdates) {
    if (patch.bookingdates.checkin !== undefined) {
      expect(actual.bookingdates.checkin).toBe(patch.bookingdates.checkin);
    }
    if (patch.bookingdates.checkout !== undefined) {
      expect(actual.bookingdates.checkout).toBe(patch.bookingdates.checkout);
    }
  }
}

/**
 * Centralized ok-checking with context and response details on failure.
 */
export function expectResponseOk<T>(
  response: HttpResponse<T>,
  contextMessage?: string,
): void {
  if (response.ok) {
    expect(response.ok).toBe(true);
    return;
  }

  const snippet = bodySnippet(response.body);
  const prefix = contextMessage ? `${contextMessage}: ` : "";
  const message =
    `${prefix}${response.status} ${response.statusText}` +
    (snippet ? `\n${snippet}` : "");

  expect(response.ok, message).toBe(true);
}

function bodySnippet(body: unknown): string {
  if (body === null || body === undefined) {
    return "";
  }
  if (typeof body === "string") {
    return body.slice(0, 2048);
  }
  try {
    return JSON.stringify(body).slice(0, 2048);
  } catch {
    return "[unserializable body]";
  }
}
