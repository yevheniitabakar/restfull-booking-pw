import { test, expect } from "@playwright/test";
import { HttpClient } from "../src/api/http/httpClient";
import { BookingRequestBuilder } from "../src/domain/builders/bookingRequestBuilder";
import type { CreateBookingResponse } from "../src/domain/models/booking";

test("Create booking using builder payload", async ({ request }) => {
  const client = new HttpClient(request);
  const bookingRequest = BookingRequestBuilder.default().withRandomNames().build();

  const response = await client.post<CreateBookingResponse>("/booking", {
    json: bookingRequest,
  });

  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const body = response.body;
  expect(body).not.toBeNull();
  expect(typeof body).toBe("object");

  if (!body || typeof body !== "object") {
    throw new Error("Unexpected response body");
  }

  const created = body as CreateBookingResponse;
  expect(typeof created.bookingid).toBe("number");
  expect(created.booking.firstname).toBe(bookingRequest.firstname);
  expect(created.booking.lastname).toBe(bookingRequest.lastname);
  expect(created.booking.totalprice).toBe(bookingRequest.totalprice);
  expect(created.booking.depositpaid).toBe(bookingRequest.depositpaid);
  expect(created.booking.bookingdates.checkin).toBe(
    bookingRequest.bookingdates.checkin,
  );
  expect(created.booking.bookingdates.checkout).toBe(
    bookingRequest.bookingdates.checkout,
  );
});
