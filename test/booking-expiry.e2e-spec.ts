import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/app.setup";
import { PrismaService } from "../src/common/prisma/prisma.service";
import { BookingExpiryService } from "../src/modules/booking/booking-expiry.service";

const FAR_FUTURE = new Date("2999-01-01T18:00:00.000Z");
const FAR_FUTURE_END = new Date("2999-01-01T22:00:00.000Z");

describe("Booking expiry sweep (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const userId = "ev-expiry";
  let hallId: string;
  let sessionId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { sessionId } });
    await prisma.member.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { hallId } });
    await prisma.hall.deleteMany({ where: { id: hallId } });
    await app.close();
  });

  it("moves a past-TTL hold to EXPIRED and frees its seat", async () => {
    const hall = await prisma.hall.create({
      data: { name: "EV Hall", seats: { create: [{ rowLabel: "A", number: 1, tier: "STANDARD" }] } },
      select: { id: true, seats: { select: { id: true } } },
    });
    hallId = hall.id;
    const session = await prisma.session.create({
      data: {
        hallId,
        kind: "PREMIERE",
        startsAt: FAR_FUTURE,
        endsAt: FAR_FUTURE_END,
        minLoyaltyDegree: 0,
        basePriceStandardCents: 1000,
        basePriceReclinerCents: 2000,
        basePricePremiumCents: 3000,
        cabinPriceCents: 10000,
      },
    });
    sessionId = session.id;
    const member = await prisma.member.create({
      data: { userId, displayName: userId, loyaltyDegree: 0 },
    });

    const booking = await prisma.booking.create({
      data: {
        memberId: member.id,
        sessionId,
        status: "HELD",
        guestCount: 0,
        totalPriceCents: 1000,
        expiresAt: new Date(Date.now() - 1000),
        seats: { create: [{ sessionId, seatId: hall.seats[0].id }] },
      },
    });

    const swept = await app.get(BookingExpiryService).sweepExpiredHolds();
    expect(swept).toBeGreaterThanOrEqual(1);

    const after = await prisma.booking.findUnique({
      where: { id: booking.id },
      select: { status: true, seats: { select: { active: true } } },
    });
    expect(after?.status).toBe("EXPIRED");
    expect(after?.seats[0].active).toBe(false);
  });
});
