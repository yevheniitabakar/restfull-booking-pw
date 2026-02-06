import { test, expect } from "@playwright/test";
import { HttpClient } from "../src/api/http/httpClient";
import { BookingClient } from "../src/api/clients/bookingClient";
import { BookingRequestBuilder } from "../src/domain/builders/bookingRequestBuilder";
import type { CreateBookingResponse } from "../src/domain/models/booking";

test("Create booking using BookingClient", async ({ request }) => {
  const http = new HttpClient(request);
  const bookingClient = new BookingClient(http);

  const bookingRequest = BookingRequestBuilder.default().withRandomNames().build();

  const response = await bookingClient.createBooking(bookingRequest);
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const body = response.body as CreateBookingResponse;
  expect(typeof body?.bookingid).toBe("number");
  expect(body?.booking.firstname).toBe(bookingRequest.firstname);
  expect(body?.booking.lastname).toBe(bookingRequest.lastname);
});
