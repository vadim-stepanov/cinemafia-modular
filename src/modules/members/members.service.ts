import { Injectable, NotFoundException } from "@nestjs/common";
import { MembershipStatus, MembershipTier } from "../../generated/prisma/client";
import { EntitlementsService } from "../entitlements/entitlements.service";
import { MembersRepository } from "./members.repository";
import { MeResponseDto } from "./dto/me-response.dto";

// Public shape the booking module needs: the internal member id plus the inputs
// to entitlement resolution. Exposed through the facade so booking never reads
// the members tables.
export interface MemberForBooking {
  id: string;
  loyaltyDegree: number;
  membership: { tier: MembershipTier; status: MembershipStatus } | null;
}

@Injectable()
export class MembersService {
  constructor(
    private readonly repo: MembersRepository,
    private readonly entitlements: EntitlementsService,
  ) {}

  // Members owns the loyaltyDegree column; the loyalty module accrues rank by
  // calling this facade instead of writing to the members table itself.
  incrementLoyalty(memberId: string, by: number): Promise<void> {
    return this.repo.incrementLoyaltyDegree(memberId, by);
  }

  // Author display names for consumers that render notes/tickets owned elsewhere
  // (club-notes) without joining into the members table.
  getDisplayNames(memberIds: string[]): Promise<{ id: string; displayName: string }[]> {
    return this.repo.findDisplayNamesByIds(memberIds);
  }

  async findMemberForBooking(userId: string): Promise<MemberForBooking | null> {
    const member = await this.repo.findByUserId(userId);
    if (!member) {
      return null;
    }
    return {
      id: member.id,
      loyaltyDegree: member.loyaltyDegree,
      membership: member.membership
        ? { tier: member.membership.tier, status: member.membership.status }
        : null,
    };
  }

  async getMe(userId: string): Promise<MeResponseDto> {
    const member = await this.repo.findByUserId(userId);
    if (!member) {
      throw new NotFoundException(`No member profile for user ${userId}`);
    }

    const membership = member.membership;
    const entitlements = this.entitlements.resolve(
      membership ? { tier: membership.tier, status: membership.status } : null,
      member.loyaltyDegree,
    );

    return {
      userId: member.userId,
      displayName: member.displayName,
      loyaltyDegree: member.loyaltyDegree,
      membership: membership
        ? {
            tier: membership.tier,
            status: membership.status,
            validUntil: membership.validUntil,
          }
        : null,
      entitlements,
    };
  }
}
