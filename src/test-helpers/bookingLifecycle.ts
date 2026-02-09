import type { Clients } from "../fixtures/test";
import type { Booking, CreateBookingRequest, CreateBookingResponse } from "../domain/models/booking";

const MAX_BODY_SNIPPET = 2048;

export async function createBookingOrThrow(
  clients: Clients,
  payload: CreateBookingRequest,
): Promise<{ bookingId: number; booking: Booking }> {
  const response = await clients.booking.createBooking(payload);
  if (!response.ok) {
    const snippet = bodySnippet(response.body);
    throw new Error(
      `Failed to create booking: ${response.status} ${response.statusText}` +
        (snippet ? `\n${snippet}` : ""),
    );
  }

  const body = response.body as CreateBookingResponse | null;
  const bookingId = body?.bookingid;
  const booking = body?.booking;
  if (!bookingId || !booking) {
    const snippet = bodySnippet(response.body);
    throw new Error(`Create booking response missing fields.` + (snippet ? `\n${snippet}` : ""));
  }

  return { bookingId, booking };
}

export async function deleteBookingQuietly(
  clients: Clients,
  authToken: string,
  bookingId: number,
): Promise<void> {
  try {
    const response = await clients.booking.deleteBooking(bookingId, authToken);
    if (!response.ok) {
      const snippet = bodySnippet(response.body);
      console.warn(
        `Failed to delete booking ${bookingId}: ${response.status} ${response.statusText}` +
          (snippet ? `\n${snippet}` : ""),
      );
    }
  } catch (error) {
    console.warn(`Failed to delete booking ${bookingId}: ${String(error)}`);
  }
}

/**
 * Creates a booking, executes the callback, and always attempts cleanup in finally.
 * Use this to keep CRUD tests isolated and avoid leaked test data.
 */
export async function withBooking<T>(
  clients: Clients,
  authToken: string,
  payload: CreateBookingRequest,
  fn: (bookingId: number, booking: Booking) => Promise<T>,
): Promise<T> {
  const { bookingId, booking } = await createBookingOrThrow(clients, payload);
  try {
    return await fn(bookingId, booking);
  } finally {
    await deleteBookingQuietly(clients, authToken, bookingId);
  }
}

function bodySnippet(body: unknown): string {
  if (body === null || body === undefined) {
    return "";
  }
  if (typeof body === "string") {
    return body.slice(0, MAX_BODY_SNIPPET);
  }
  try {
    return JSON.stringify(body).slice(0, MAX_BODY_SNIPPET);
  } catch {
    return "[unserializable body]";
  }
}
