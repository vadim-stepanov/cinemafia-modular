import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module";
import { configureApp } from "../src/app.setup";
import { PrismaService } from "../src/common/prisma/prisma.service";

const FAR_FUTURE = new Date("2999-01-01T18:00:00.000Z");
const FAR_FUTURE_END = new Date("2999-01-01T22:00:00.000Z");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("Loyalty accrual (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const userId = "ev-loyalty";
  let hallId: string;
  let sessionId: string;
  let memberId: string;

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

  it("BookingConfirmed accrues a loyalty degree for the member", async () => {
    const hall = await prisma.hall.create({
      data: { name: "LY Hall", seats: { create: [{ rowLabel: "A", number: 1, tier: "STANDARD" }] } },
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
    memberId = member.id;

    const held = await request(app.getHttpServer())
      .post("/api/v1/bookings/hold")
      .set("X-User-Id", userId)
      .send({ sessionId, seatIds: [hall.seats[0].id] })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/api/v1/bookings/${held.body.id as string}/confirm`)
      .set("X-User-Id", userId)
      .expect(200);

    // The accrual is a fire-and-forget reaction to BookingConfirmed — poll for it.
    let degree = 0;
    for (let attempt = 0; attempt < 20 && degree < 1; attempt++) {
      const fresh = await prisma.member.findUnique({
        where: { id: memberId },
        select: { loyaltyDegree: true },
      });
      degree = fresh?.loyaltyDegree ?? 0;
      if (degree < 1) {
        await sleep(50);
      }
    }
    expect(degree).toBe(1);
  });
});
