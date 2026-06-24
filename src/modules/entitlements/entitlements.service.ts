import { Injectable } from "@nestjs/common";
import { MembershipStatus, MembershipTier } from "../../generated/prisma/client";
import {
  BASE_GUEST_QUOTA,
  DISCOUNT_PERCENT,
  EARLY_ACCESS_TIERS,
  LOYALTY_GUEST_BONUS_CAP,
  LOYALTY_GUEST_BONUS_PER_DEGREES,
} from "./entitlements.constants";

export interface MembershipInput {
  tier: MembershipTier;
  status: MembershipStatus;
}

export interface Entitlements {
  effectiveGuestQuota: number;
  discountPercent: number;
  canEarlyAccess: boolean;
}

export interface SessionAccessInput {
  minLoyaltyDegree: number;
  earlyAccessUntil: Date | null;
}

/**
 * Signature domain logic: entitlements resolved from (membership tier + loyalty
 * degree). In the Modular Monolith this lives in its own module exposing only
 * EntitlementsService; members and booking depend on it as a node in the module
 * graph (imports: [EntitlementsModule]). Still a plain anemic service — domain
 * isolation behind a port (#3) or a policy/aggregate (#4) comes later.
 */
@Injectable()
export class EntitlementsService {
  resolve(membership: MembershipInput | null, loyaltyDegree: number): Entitlements {
    const loyaltyBonus = Math.min(
      Math.floor(loyaltyDegree / LOYALTY_GUEST_BONUS_PER_DEGREES),
      LOYALTY_GUEST_BONUS_CAP,
    );

    // EXPIRED / absent membership grants no base — only loyalty-earned slots apply.
    if (!membership || membership.status !== MembershipStatus.ACTIVE) {
      return { effectiveGuestQuota: loyaltyBonus, discountPercent: 0, canEarlyAccess: false };
    }

    return {
      effectiveGuestQuota: BASE_GUEST_QUOTA[membership.tier] + loyaltyBonus,
      discountPercent: DISCOUNT_PERCENT[membership.tier],
      canEarlyAccess: EARLY_ACCESS_TIERS[membership.tier],
    };
  }

  canAccessSession(
    loyaltyDegree: number,
    canEarlyAccess: boolean,
    session: SessionAccessInput,
    now: Date,
  ): boolean {
    if (loyaltyDegree < session.minLoyaltyDegree) {
      return false;
    }
    // Inside the early-access window only early-access members may enter.
    if (session.earlyAccessUntil && now < session.earlyAccessUntil && !canEarlyAccess) {
      return false;
    }
    return true;
  }
}
