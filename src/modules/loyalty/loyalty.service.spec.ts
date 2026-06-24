import { describe, expect, it, vi } from "vitest";
import { MembersService } from "../members/members.service";
import { DEGREES_PER_CONFIRMED_BOOKING, LoyaltyService } from "./loyalty.service";

describe("LoyaltyService", () => {
  it("accrues a fixed degree per confirmed booking via the members facade", async () => {
    const incrementLoyalty = vi.fn().mockResolvedValue(undefined);
    const service = new LoyaltyService({ incrementLoyalty } as unknown as MembersService);

    await service.accrueForConfirmedBooking("member-1");

    expect(incrementLoyalty).toHaveBeenCalledWith("member-1", DEGREES_PER_CONFIRMED_BOOKING);
  });
});
