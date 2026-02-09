import { test, expect } from "../../src/fixtures/test";
import { BookingRequestBuilder } from "../../src/domain/builders/bookingRequestBuilder";
import {
  createBookingOrThrow,
  deleteBookingQuietly,
  withBooking,
} from "../../src/test-helpers/bookingLifecycle";


test.describe("Booking CRUD", () => {
  test("Create booking -> Get booking matches @smoke", async ({ clients, authToken }) => {
    const payload = BookingRequestBuilder.default().withRandomNames().build();

    await withBooking(clients, authToken, payload, async (bookingId) => {
      const getResponse = await clients.booking.getBooking(bookingId);
      expect(getResponse.ok).toBe(true);
      expect(getResponse.status).toBe(200);

      const booking = getResponse.body as typeof payload;
      expect(booking.firstname).toBe(payload.firstname);
      expect(booking.lastname).toBe(payload.lastname);
      expect(booking.totalprice).toBe(payload.totalprice);
      expect(booking.depositpaid).toBe(payload.depositpaid);
      expect(booking.bookingdates.checkin).toBe(payload.bookingdates.checkin);
      expect(booking.bookingdates.checkout).toBe(payload.bookingdates.checkout);
      if (payload.additionalneeds !== undefined) {
        expect(booking.additionalneeds).toBe(payload.additionalneeds);
      }
    });
  });

  test("Update booking (PUT) replaces values", async ({ clients, authToken }) => {
    const original = BookingRequestBuilder.default().withRandomNames().build();
    const updated = BookingRequestBuilder.default()
      .withFirstName("Updated")
      .withLastName("User")
      .withTotalPrice(999)
      .withDepositPaid(false)
      .withDates("2025-02-01", "2025-02-05")
      .withAdditionalNeeds("Late Checkout")
      .build();

    await withBooking(clients, authToken, original, async (bookingId) => {
      const updateResponse = await clients.booking.updateBooking(
        bookingId,
        updated,
        authToken,
      );
      expect(updateResponse.ok).toBe(true);
      expect(updateResponse.status).toBe(200);

      const getResponse = await clients.booking.getBooking(bookingId);
      expect(getResponse.ok).toBe(true);
      expect(getResponse.status).toBe(200);

      const booking = getResponse.body as typeof updated;
      expect(booking.firstname).toBe(updated.firstname);
      expect(booking.lastname).toBe(updated.lastname);
      expect(booking.totalprice).toBe(updated.totalprice);
      expect(booking.depositpaid).toBe(updated.depositpaid);
      expect(booking.bookingdates.checkin).toBe(updated.bookingdates.checkin);
      expect(booking.bookingdates.checkout).toBe(updated.bookingdates.checkout);
      expect(booking.additionalneeds).toBe(updated.additionalneeds);
    });
  });

  test("Partial update booking (PATCH) updates only provided fields", async ({
    clients,
    authToken,
  }) => {
    const original = BookingRequestBuilder.default().withRandomNames().build();
    const patch = { firstname: "Patch", totalprice: 777 };

    await withBooking(clients, authToken, original, async (bookingId) => {
      const patchResponse = await clients.booking.partialUpdateBooking(
        bookingId,
        patch,
        authToken,
      );
      expect(patchResponse.ok).toBe(true);
      expect(patchResponse.status).toBe(200);

      const getResponse = await clients.booking.getBooking(bookingId);
      expect(getResponse.ok).toBe(true);
      expect(getResponse.status).toBe(200);

      const booking = getResponse.body as typeof original;
      expect(booking.firstname).toBe(patch.firstname);
      expect(booking.totalprice).toBe(patch.totalprice);
      expect(booking.lastname).toBe(original.lastname);
      expect(booking.depositpaid).toBe(original.depositpaid);
      expect(booking.bookingdates.checkin).toBe(original.bookingdates.checkin);
      expect(booking.bookingdates.checkout).toBe(original.bookingdates.checkout);
    });
  });

  test("Delete booking -> subsequent get should fail", async ({
    clients,
    authToken,
  }) => {
    const payload = BookingRequestBuilder.default().withRandomNames().build();
    const { bookingId } = await createBookingOrThrow(clients, payload);

    try {
      const deleteResponse = await clients.booking.deleteBooking(
        bookingId,
        authToken,
      );
      expect(deleteResponse.ok).toBe(true);

      const getResponse = await clients.booking.getBooking(bookingId);
      expect(getResponse.ok).toBe(false);
    } finally {
      await deleteBookingQuietly(clients, authToken, bookingId);
    }
  });
});
