import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Prisma } from "../../generated/prisma/client";

export const sessionSummarySelect = {
  id: true,
  kind: true,
  startsAt: true,
  endsAt: true,
  earlyAccessUntil: true,
  minLoyaltyDegree: true,
  basePriceStandardCents: true,
  basePriceReclinerCents: true,
  basePricePremiumCents: true,
  cabinPriceCents: true,
  hall: { select: { id: true, name: true } },
  movies: {
    orderBy: { position: "asc" },
    select: { position: true, movie: { select: { id: true, title: true } } },
  },
} satisfies Prisma.SessionSelect;

export const sessionDetailSelect = {
  ...sessionSummarySelect,
  movies: {
    orderBy: { position: "asc" },
    select: {
      position: true,
      movie: {
        select: { id: true, title: true, durationMin: true, releaseYear: true, synopsis: true },
      },
    },
  },
  hall: {
    select: {
      id: true,
      name: true,
      seats: {
        orderBy: [{ rowLabel: "asc" }, { number: "asc" }],
        select: { id: true, rowLabel: true, number: true, tier: true },
      },
      cabins: {
        orderBy: { name: "asc" },
        select: { id: true, name: true, capacity: true },
      },
    },
  },
} satisfies Prisma.SessionSelect;

// Lean projection booking needs at hold/cancel: pricing, gating and the hall the
// seats/cabin must belong to. Exposed through the facade so booking never reads
// the sessions table itself.
export const sessionForBookingSelect = {
  id: true,
  startsAt: true,
  minLoyaltyDegree: true,
  earlyAccessUntil: true,
  hallId: true,
  basePriceStandardCents: true,
  basePriceReclinerCents: true,
  basePricePremiumCents: true,
  cabinPriceCents: true,
} satisfies Prisma.SessionSelect;

export const seatInfoSelect = {
  id: true,
  hallId: true,
  rowLabel: true,
  number: true,
  tier: true,
} satisfies Prisma.SeatSelect;

export const cabinInfoSelect = {
  id: true,
  hallId: true,
  name: true,
} satisfies Prisma.CabinSelect;

export type SessionSummary = Prisma.SessionGetPayload<{ select: typeof sessionSummarySelect }>;
export type SessionDetail = Prisma.SessionGetPayload<{ select: typeof sessionDetailSelect }>;
export type SessionForBooking = Prisma.SessionGetPayload<{
  select: typeof sessionForBookingSelect;
}>;
export type SeatInfo = Prisma.SeatGetPayload<{ select: typeof seatInfoSelect }>;
export type CabinInfo = Prisma.CabinGetPayload<{ select: typeof cabinInfoSelect }>;

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManySummaries(where: Prisma.SessionWhereInput): Promise<SessionSummary[]> {
    return this.prisma.session.findMany({
      where,
      orderBy: { startsAt: "asc" },
      select: sessionSummarySelect,
    });
  }

  findDetail(id: string): Promise<SessionDetail | null> {
    return this.prisma.session.findUnique({ where: { id }, select: sessionDetailSelect });
  }

  findSessionForBooking(id: string): Promise<SessionForBooking | null> {
    return this.prisma.session.findUnique({ where: { id }, select: sessionForBookingSelect });
  }

  findSeatsByIds(seatIds: string[]): Promise<SeatInfo[]> {
    return this.prisma.seat.findMany({ where: { id: { in: seatIds } }, select: seatInfoSelect });
  }

  findCabinById(cabinId: string): Promise<CabinInfo | null> {
    return this.prisma.cabin.findUnique({ where: { id: cabinId }, select: cabinInfoSelect });
  }

  async sessionExists(id: string): Promise<boolean> {
    const session = await this.prisma.session.findUnique({ where: { id }, select: { id: true } });
    return session !== null;
  }
}
