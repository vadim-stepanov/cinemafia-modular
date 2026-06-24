// Shared event vocabulary (in-process, NestJS EventEmitter). Lives in common/ so
// publisher (booking) and subscribers (loyalty, notifications) depend only on a
// neutral contract — never on each other's modules. Booking → loyalty + notifications.
export const BOOKING_CONFIRMED = "booking.confirmed";

export interface BookingConfirmedEvent {
  bookingId: string;
  memberId: string;
  sessionId: string;
}
