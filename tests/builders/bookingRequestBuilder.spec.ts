import { expect, test } from "../../src/fixtures/test";
import { BookingRequestBuilder } from "../../src/domain/builders/bookingRequestBuilder";

const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

test("default builder returns required fields", () => {
  const booking = BookingRequestBuilder.default().build();

  expect(booking.firstname).toBeTruthy();
  expect(booking.lastname).toBeTruthy();
  expect(booking.totalprice).toBeTruthy();
  expect(typeof booking.depositpaid).toBe("boolean");
  expect(booking.bookingdates.checkin).toBeTruthy();
  expect(booking.bookingdates.checkout).toBeTruthy();
});

test("withAdditionalNeeds(undefined) removes additionalneeds", () => {
  const booking = BookingRequestBuilder.default()
    .withAdditionalNeeds(undefined)
    .build();

  expect("additionalneeds" in booking).toBe(false);
  expect(isDefined(booking.additionalneeds)).toBe(false);
});

test("withDates sets both checkin and checkout", () => {
  const booking = BookingRequestBuilder.default()
    .withDates("2025-01-01", "2025-01-05")
    .build();

  expect(booking.bookingdates.checkin).toBe("2025-01-01");
  expect(booking.bookingdates.checkout).toBe("2025-01-05");
});

test("build returns a copy", () => {
  const builder = BookingRequestBuilder.default();
  const first = builder.build();

  first.firstname = "Changed";
  first.bookingdates.checkin = "2020-01-01";

  const second = builder.build();
  expect(second.firstname).not.toBe("Changed");
  expect(second.bookingdates.checkin).not.toBe("2020-01-01");
});
