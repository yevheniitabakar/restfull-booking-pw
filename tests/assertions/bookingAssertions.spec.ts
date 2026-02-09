import { test } from "../../src/fixtures/test";
import {
  expectBookingContainsPatch,
  expectBookingMatchesRequest,
} from "../../src/assertions/bookingAssertions";
import type { Booking, CreateBookingRequest } from "../../src/domain/models/booking";

test("booking assertion helpers accept valid data", () => {
  const request: CreateBookingRequest = {
    firstname: "John",
    lastname: "Doe",
    totalprice: 123,
    depositpaid: true,
    bookingdates: {
      checkin: "2025-01-01",
      checkout: "2025-01-05",
    },
    additionalneeds: "Breakfast",
  };

  const booking: Booking = { ...request };

  expectBookingMatchesRequest(booking, request);
  expectBookingContainsPatch(booking, { firstname: "John", totalprice: 123 });
});
