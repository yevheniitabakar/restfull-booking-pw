import { test, expect } from "../../src/fixtures/test";
import { BookingRequestBuilder } from "../../src/domain/builders/bookingRequestBuilder";
import {
  createBookingOrThrow,
  deleteBookingQuietly,
  withBooking,
} from "../../src/test-helpers/bookingLifecycle";
import {
  expectBookingContainsPatch,
  expectBookingMatchesRequest,
  expectResponseOk,
} from "../../src/assertions/bookingAssertions";


test.describe("Booking CRUD", () => {
  test("Create booking -> Get booking matches @smoke", async ({ clients, authToken }) => {
    const payload = BookingRequestBuilder.default().withRandomNames().build();

    await test.step("Create booking", async () => {
      await withBooking(clients, authToken, payload, async (bookingId) => {
        await test.step("Get booking", async () => {
          const getResponse = await clients.booking.getBooking(bookingId);
          expectResponseOk(getResponse, "get booking");

          await test.step("Verify booking matches request", async () => {
            const booking = getResponse.body as typeof payload;
            expectBookingMatchesRequest(booking, payload);
          });
        });
      });
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
      await test.step("Update booking", async () => {
        const updateResponse = await clients.booking.updateBooking(
          bookingId,
          updated,
          authToken,
        );
        expectResponseOk(updateResponse, "update booking");
      });

      await test.step("Get booking after update", async () => {
        const getResponse = await clients.booking.getBooking(bookingId);
        expectResponseOk(getResponse, "get booking after update");

        await test.step("Verify booking matches update", async () => {
          const booking = getResponse.body as typeof updated;
          expectBookingMatchesRequest(booking, updated);
        });
      });
    });
  });

  test("Partial update booking (PATCH) updates only provided fields", async ({
    clients,
    authToken,
  }) => {
    const original = BookingRequestBuilder.default().withRandomNames().build();
    const patch = { firstname: "Patch", totalprice: 777 };

    await withBooking(clients, authToken, original, async (bookingId) => {
      await test.step("Patch booking", async () => {
        const patchResponse = await clients.booking.partialUpdateBooking(
          bookingId,
          patch,
          authToken,
        );
        expectResponseOk(patchResponse, "patch booking");
      });

      await test.step("Get booking after patch", async () => {
        const getResponse = await clients.booking.getBooking(bookingId);
        expectResponseOk(getResponse, "get booking after patch");

        await test.step("Verify patched and unchanged fields", async () => {
          const booking = getResponse.body as typeof original;
          expectBookingContainsPatch(booking, patch);
          expect(booking.lastname).toBe(original.lastname);
          expect(booking.bookingdates.checkin).toBe(original.bookingdates.checkin);
        });
      });
    });
  });

  test("Delete booking -> subsequent get should fail", async ({
    clients,
    authToken,
  }) => {
    const payload = BookingRequestBuilder.default().withRandomNames().build();
    const { bookingId } = await createBookingOrThrow(clients, payload);

    try {
      await test.step("Delete booking", async () => {
        const deleteResponse = await clients.booking.deleteBooking(
          bookingId,
          authToken,
        );
        expectResponseOk(deleteResponse, "delete booking");
      });

      await test.step("Verify booking is no longer accessible", async () => {
        const getResponse = await clients.booking.getBooking(bookingId);
        expect(getResponse.ok).toBe(false);
      });
    } finally {
      await deleteBookingQuietly(clients, authToken, bookingId);
    }
  });
});
