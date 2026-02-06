import { test, expect } from "../../src/fixtures/test";
import { BookingRequestBuilder } from "../../src/domain/builders/bookingRequestBuilder";
import type { CreateBookingResponse } from "../../src/domain/models/booking";

test("createBooking then getBooking should match payload", async ({ clients, authToken }) => {
  const bookingRequest = BookingRequestBuilder.default().withRandomNames().build();

  const createResponse = await clients.booking.createBooking(bookingRequest);
  expect(createResponse.ok).toBe(true);
  expect(createResponse.status).toBe(200);

  const created = createResponse.body as CreateBookingResponse;
  expect(typeof created?.bookingid).toBe("number");
  expect(created?.booking).toBeTruthy();

  const bookingId = created.bookingid;

  const getResponse = await clients.booking.getBooking(bookingId);
  expect(getResponse.ok).toBe(true);
  expect(getResponse.status).toBe(200);

  const fetched = getResponse.body;
  expect(fetched).toBeTruthy();
  if (!fetched || typeof fetched !== "object") {
    throw new Error("Unexpected booking response body");
  }

  const booking = fetched as typeof bookingRequest;
  expect(booking.firstname).toBe(bookingRequest.firstname);
  expect(booking.lastname).toBe(bookingRequest.lastname);
  expect(booking.totalprice).toBe(bookingRequest.totalprice);
  expect(booking.depositpaid).toBe(bookingRequest.depositpaid);
  expect(booking.bookingdates.checkin).toBe(bookingRequest.bookingdates.checkin);
  expect(booking.bookingdates.checkout).toBe(bookingRequest.bookingdates.checkout);
  expect(booking.additionalneeds).toBe(bookingRequest.additionalneeds);

  await clients.booking.deleteBooking(bookingId, authToken);
});

test("getBookingIds returns array", async ({ clients }) => {
  const response = await clients.booking.getBookingIds();
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
