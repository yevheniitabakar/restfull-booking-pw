import { test } from "../../src/fixtures/test";
import { BookingRequestBuilder } from "../../src/domain/builders/bookingRequestBuilder";
import { withBooking } from "../../src/test-helpers/bookingLifecycle";
import { expectBookingMatchesRequest } from "../../src/assertions/bookingAssertions";
import { expectResponseNotOk } from "../../src/assertions/responseAssertions";

test.describe("Booking Negative", () => {
  test("Get non-existent booking id should fail @negative", async ({ clients }) => {
    const response = await clients.booking.getBooking(99999999);
    expectResponseNotOk(response, "get non-existent booking");
  });

  test("Update booking without valid auth token should fail @negative", async ({
    clients,
    authToken,
  }) => {
    const original = BookingRequestBuilder.default().withRandomNames().build();
    const updated = BookingRequestBuilder.default()
      .withFirstName("NoAuth")
      .withLastName("User")
      .build();

    await withBooking(clients, authToken, original, async (bookingId) => {
      const response = await clients.booking.updateBooking(
        bookingId,
        updated,
        "invalid-token",
      );
      expectResponseNotOk(response, "update without auth");
    });
  });

  test("Delete booking with invalid token should fail and booking remains @negative", async ({
    clients,
    authToken,
  }) => {
    const payload = BookingRequestBuilder.default().withRandomNames().build();

    await withBooking(clients, authToken, payload, async (bookingId) => {
      const deleteResponse = await clients.booking.deleteBooking(
        bookingId,
        "invalid-token",
      );
      expectResponseNotOk(deleteResponse, "delete with invalid token");

      const getResponse = await clients.booking.getBooking(bookingId);
      if (!getResponse.ok) {
        throw new Error("Booking unexpectedly missing after failed delete.");
      }
    });
  });

  test("Partial update with empty patch should not break @negative", async ({
    clients,
    authToken,
  }) => {
    const original = BookingRequestBuilder.default().withRandomNames().build();

    await withBooking(clients, authToken, original, async (bookingId) => {
      const patchResponse = await clients.booking.partialUpdateBooking(
        bookingId,
        {},
        authToken,
      );

      if (patchResponse.ok) {
        const getResponse = await clients.booking.getBooking(bookingId);
        if (!getResponse.ok) {
          throw new Error("Booking not retrievable after empty patch.");
        }
        expectBookingMatchesRequest(getResponse.body as typeof original, original);
      } else {
        expectResponseNotOk(patchResponse, "empty patch rejected");
      }
    });
  });

  test("Create booking with invalid payload should fail @negative", async ({ http }) => {
    const response = await http.post("/booking", {
      json: "{",
    });

    expectResponseNotOk(response, "create invalid payload");
  });
});
