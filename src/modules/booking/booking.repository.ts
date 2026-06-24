import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { BookingStatus, Prisma } from "../../generated/prisma/client";
import { BookingSummaryResponseDto } from "./dto/booking-response.dto";

// Booking reads only its OWN tables. Seat/cabin display data and session timing
// are composed from the catalog facade in the service — never joined here, since
// those relations were deliberately cut at the module boundary.
export const bookingOwnDetailSelect = {
  id: true,
  status: true,
  sessionId: true,
  cabinId: true,
  guestCount: true,
  totalPriceCents: true,
  expiresAt: true,
  confirmedAt: true,
  cancelledAt: true,
  createdAt: true,
  seats: { where: { active: true }, select: { seatId: true } },
  payment: { select: { status: true, amountCents: true } },
} satisfies Prisma.BookingSelect;

export const bookingSummarySelect = {
  id: true,
  status: true,
  sessionId: true,
  guestCount: true,
  totalPriceCents: true,
  expiresAt: true,
  createdAt: true,
} satisfies Prisma.BookingSelect;

export const bookingControlSelect = {
  id: true,
  status: true,
  expiresAt: true,
  totalPriceCents: true,
  memberId: true,
  sessionId: true,
} satisfies Prisma.BookingSelect;

export type BookingOwnDetail = Prisma.BookingGetPayload<{ select: typeof bookingOwnDetailSelect }>;
export type BookingControl = Prisma.BookingGetPayload<{ select: typeof bookingControlSelect }>;

@Injectable()
export class BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveTakenSeatIds(sessionId: string): Promise<string[]> {
    const rows = await this.prisma.bookingSeat.findMany({
      where: { sessionId, active: true },
      select: { seatId: true },
    });
    return rows.map((row) => row.seatId);
  }

  findControl(id: string): Promise<BookingControl | null> {
    return this.prisma.booking.findUnique({ where: { id }, select: bookingControlSelect });
  }

  findOwnDetail(id: string): Promise<BookingOwnDetail | null> {
    return this.prisma.booking.findUnique({ where: { id }, select: bookingOwnDetailSelect });
  }

  findOwnDetailForMember(id: string, memberId: string): Promise<BookingOwnDetail | null> {
    return this.prisma.booking.findFirst({
      where: { id, memberId },
      select: bookingOwnDetailSelect,
    });
  }

  listForMember(memberId: string): Promise<BookingSummaryResponseDto[]> {
    return this.prisma.booking.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
      select: bookingSummarySelect,
    });
  }

  async hasConfirmedBooking(memberId: string, sessionId: string): Promise<boolean> {
    const booking = await this.prisma.booking.findFirst({
      where: { memberId, sessionId, status: BookingStatus.CONFIRMED },
      select: { id: true },
    });
    return booking !== null;
  }
}
