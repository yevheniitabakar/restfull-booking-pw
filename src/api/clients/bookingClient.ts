import type { HttpClient } from "../http/httpClient";
import type { HttpResponse } from "../http/response";
import type {
  Booking,
  BookingIdItem,
  CreateBookingRequest,
  CreateBookingResponse,
  PartialUpdateBookingRequest,
} from "../../domain/models/booking";

export type BookingSearchQuery = Partial<{
  firstname: string;
  lastname: string;
  checkin: string;
  checkout: string;
}>;

/**
 * Thin client for booking endpoints. Token auth is sent via Cookie header.
 */
export class BookingClient {
  private readonly http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  getBookingIds(
    query?: BookingSearchQuery,
  ): Promise<HttpResponse<BookingIdItem[]>> {
    return this.http.get<BookingIdItem[]>("/booking", { query });
  }

  getBooking(id: number): Promise<HttpResponse<Booking>> {
    return this.http.get<Booking>(`/booking/${id}`);
  }

  createBooking(
    payload: CreateBookingRequest,
  ): Promise<HttpResponse<CreateBookingResponse>> {
    return this.http.post<CreateBookingResponse>("/booking", { json: payload });
  }

  updateBooking(
    id: number,
    payload: CreateBookingRequest,
    token: string,
  ): Promise<HttpResponse<Booking>> {
    return this.http.put<Booking>(`/booking/${id}`, {
      json: payload,
      headers: this.authHeaders(token),
    });
  }

  partialUpdateBooking(
    id: number,
    patch: PartialUpdateBookingRequest,
    token: string,
  ): Promise<HttpResponse<Booking>> {
    return this.http.patch<Booking>(`/booking/${id}`, {
      json: patch,
      headers: this.authHeaders(token),
    });
  }

  deleteBooking(
    id: number,
    token: string,
  ): Promise<HttpResponse<string | null>> {
    return this.http.delete<string | null>(`/booking/${id}`, {
      headers: this.authHeaders(token),
    });
  }

  /**
   * Builds auth headers for token-based cookie authentication.
   */
  private authHeaders(
    token: string,
    extra: Record<string, string> = {},
  ): Record<string, string> {
    return { ...extra, Cookie: `token=${token}` };
  }
}
