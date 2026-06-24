import { Injectable } from "@nestjs/common";
import { MembersService } from "../members/members.service";

// Loyalty is an accumulating rank, not spendable currency: each confirmed
// booking earns one degree.
export const DEGREES_PER_CONFIRMED_BOOKING = 1;

// Loyalty owns no tables — the degree is a stat on Member. It accrues rank by
// calling the members facade, never by writing to the members table (the #1
// Layered version reached into that table directly).
@Injectable()
export class LoyaltyService {
  constructor(private readonly members: MembersService) {}

  accrueForConfirmedBooking(memberId: string): Promise<void> {
    return this.members.incrementLoyalty(memberId, DEGREES_PER_CONFIRMED_BOOKING);
  }
}
