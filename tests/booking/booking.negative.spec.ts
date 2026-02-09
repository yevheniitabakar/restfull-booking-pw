import { test } from "../../src/fixtures/test";
import { BookingRequestBuilder } from "../../src/domain/builders/bookingRequestBuilder";
import { withBooking } from "../../src/test-helpers/bookingLifecycle";
import { expectBookingMatchesRequest } from "../../src/assertions/bookingAssertions";
import { expectResponseNotOk } from "../../src/assertions/responseAssertions";

test.describe("Booking Negative @negative", () => {
  test("Get non-existent booking id should fail @negative", async ({ clients }) => {
    await test.step("Get non-existent booking", async () => {
      const response = await clients.booking.getBooking(99999999);
      expectResponseNotOk(response, "get non-existent booking");
    });
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
      await test.step("Attempt update with invalid token", async () => {
        const response = await clients.booking.updateBooking(
          bookingId,
          updated,
          "invalid-token",
        );
        expectResponseNotOk(response, "update without auth");
      });
    });
  });

  test("Delete booking with invalid token should fail and booking remains @negative", async ({
    clients,
    authToken,
  }) => {
    const payload = BookingRequestBuilder.default().withRandomNames().build();

    await withBooking(clients, authToken, payload, async (bookingId) => {
      await test.step("Attempt delete with invalid token", async () => {
        const deleteResponse = await clients.booking.deleteBooking(
          bookingId,
          "invalid-token",
        );
        expectResponseNotOk(deleteResponse, "delete with invalid token");
      });

      await test.step("Verify booking still exists", async () => {
        const getResponse = await clients.booking.getBooking(bookingId);
        if (!getResponse.ok) {
          throw new Error("Booking unexpectedly missing after failed delete.");
        }
      });
    });
  });

  test("Partial update with empty patch should not break @negative", async ({
    clients,
    authToken,
  }) => {
    const original = BookingRequestBuilder.default().withRandomNames().build();

    await withBooking(clients, authToken, original, async (bookingId) => {
      await test.step("Attempt empty patch", async () => {
        const patchResponse = await clients.booking.partialUpdateBooking(
          bookingId,
          {},
          authToken,
        );

        if (patchResponse.ok) {
          await test.step("Verify booking unchanged", async () => {
            const getResponse = await clients.booking.getBooking(bookingId);
            if (!getResponse.ok) {
              throw new Error("Booking not retrievable after empty patch.");
            }
            expectBookingMatchesRequest(getResponse.body as typeof original, original);
          });
        } else {
          expectResponseNotOk(patchResponse, "empty patch rejected");
        }
      });
    });
  });

  test("Create booking with invalid payload should fail @negative", async ({ http }) => {
    await test.step("Create booking with invalid payload", async () => {
      const response = await http.post("/booking", {
        json: "{",
      });

      expectResponseNotOk(response, "create invalid payload");
    });
  });
});
