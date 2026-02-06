import { test, expect } from "@playwright/test";
import { HttpClient } from "../../src/api/http/httpClient";
import { AuthClient } from "../../src/api/clients/authClient";
import { BookingClient } from "../../src/api/clients/bookingClient";
import { BookingRequestBuilder } from "../../src/domain/builders/bookingRequestBuilder";
import type { CreateBookingResponse } from "../../src/domain/models/booking";

const DEFAULT_USER = "admin";
const DEFAULT_PASS = "password123";

test("createBooking then getBooking should match payload", async ({ request }) => {
  const http = new HttpClient(request);
  const bookingClient = new BookingClient(http);
  const authClient = new AuthClient(http);

  const bookingRequest = BookingRequestBuilder.default().withRandomNames().build();

  const createResponse = await bookingClient.createBooking(bookingRequest);
  expect(createResponse.ok).toBe(true);
  expect(createResponse.status).toBe(200);

  const created = createResponse.body as CreateBookingResponse;
  expect(typeof created?.bookingid).toBe("number");
  expect(created?.booking).toBeTruthy();

  const bookingId = created.bookingid;

  const getResponse = await bookingClient.getBooking(bookingId);
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

  const tokenResponse = await authClient.createToken({
    username: process.env.BOOKER_USER || DEFAULT_USER,
    password: process.env.BOOKER_PASS || DEFAULT_PASS,
  });

  const token = (tokenResponse.body as { token?: string }).token;
  if (token) {
    await bookingClient.deleteBooking(bookingId, token);
  }
});

test("getBookingIds returns array", async ({ request }) => {
  const http = new HttpClient(request);
  const bookingClient = new BookingClient(http);

  const response = await bookingClient.getBookingIds();
  expect(response.ok).toBe(true);
  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});
