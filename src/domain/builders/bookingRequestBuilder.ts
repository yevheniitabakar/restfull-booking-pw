import type { CreateBookingRequest } from "../models/booking";
import { isoDatePlusDays, isoDateToday } from "../../utils/dates";
import { randomAlpha, randomInt } from "../../utils/random";

/**
 * Builder for creating valid Restful-Booker booking request payloads in tests.
 * Use the fluent API to override fields while keeping defaults valid.
 */
export class BookingRequestBuilder {
  private data: CreateBookingRequest;

  private constructor(data: CreateBookingRequest) {
    this.data = data;
  }

  /**
   * Returns a builder prepopulated with a valid booking payload.
   */
  static default(): BookingRequestBuilder {
    return new BookingRequestBuilder({
      firstname: "John",
      lastname: "Doe",
      totalprice: 123,
      depositpaid: true,
      bookingdates: {
        checkin: isoDateToday(),
        checkout: isoDatePlusDays(3),
      },
      additionalneeds: "Breakfast",
    });
  }

  /**
   * Builds a deep copy of the current payload to avoid shared references.
   */
  build(): CreateBookingRequest {
    const booking: CreateBookingRequest = {
      firstname: this.data.firstname,
      lastname: this.data.lastname,
      totalprice: this.data.totalprice,
      depositpaid: this.data.depositpaid,
      bookingdates: {
        checkin: this.data.bookingdates.checkin,
        checkout: this.data.bookingdates.checkout,
      },
      ...(this.data.additionalneeds !== undefined
        ? { additionalneeds: this.data.additionalneeds }
        : {}),
    };

    return booking;
  }

  withFirstName(name: string): this {
    this.data.firstname = name;
    return this;
  }

  withLastName(name: string): this {
    this.data.lastname = name;
    return this;
  }

  withTotalPrice(price: number): this {
    this.data.totalprice = price;
    return this;
  }

  withDepositPaid(flag: boolean): this {
    this.data.depositpaid = flag;
    return this;
  }

  withDates(checkin: string, checkout: string): this {
    this.data.bookingdates = { checkin, checkout };
    return this;
  }

  /**
   * When passed undefined, removes additionalneeds from the payload.
   */
  withAdditionalNeeds(needs?: string): this {
    this.data.additionalneeds = needs;
    return this;
  }

  /**
   * Replaces first/last name with simple random alpha values for uniqueness.
   */
  withRandomNames(seed?: string): this {
    const suffix = seed ? seed.toLowerCase() : randomAlpha(5);
    this.data.firstname = `Test${suffix}`;
    this.data.lastname = `User${randomAlpha(4)}`;
    this.data.totalprice = randomInt(50, 500);
    return this;
  }
}
