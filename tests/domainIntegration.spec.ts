import { test, expect } from "../src/fixtures/test";
import { BookingRequestBuilder } from "../src/domain/builders/bookingRequestBuilder";
import type { CreateBookingResponse } from "../src/domain/models/booking";

test("Create booking using BookingClient", async ({ clients }) => {
  const bookingRequest = BookingRequestBuilder.default().withRandomNames().build();

  const response = await clients.booking.createBooking(bookingRequest);
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);

  const body = response.body as CreateBookingResponse;
  expect(typeof body?.bookingid).toBe("number");
  expect(body?.booking.firstname).toBe(bookingRequest.firstname);
  expect(body?.booking.lastname).toBe(bookingRequest.lastname);
});
