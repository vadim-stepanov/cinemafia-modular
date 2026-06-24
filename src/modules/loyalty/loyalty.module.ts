import { Module } from "@nestjs/common";
import { MembersModule } from "../members/members.module";
import { LoyaltyListener } from "./loyalty.listener";
import { LoyaltyService } from "./loyalty.service";

// Reactive integration: loyalty subscribes to BookingConfirmed and accrues rank
// through the members facade. Depends one-way on members; no own tables, no
// controller. The publisher (booking) never knows loyalty exists.
@Module({
  imports: [MembersModule],
  providers: [LoyaltyService, LoyaltyListener],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
