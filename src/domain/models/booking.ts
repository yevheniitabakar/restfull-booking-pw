export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface CreateBookingRequest {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

export type Booking = CreateBookingRequest;

export interface CreateBookingResponse {
  bookingid: number;
  booking: Booking;
}

export interface PartialUpdateBookingRequest {
  firstname?: string;
  lastname?: string;
  totalprice?: number;
  depositpaid?: boolean;
  bookingdates?: Partial<BookingDates>;
  additionalneeds?: string;
}

export interface BookingIdItem {
  bookingid: number;
}
