import { Module } from "@nestjs/common";
import { CatalogModule } from "../catalog/catalog.module";
import { MembersModule } from "../members/members.module";
import { EntitlementsModule } from "../entitlements/entitlements.module";
import { BookingController } from "./booking.controller";
import { BookingExpiryService } from "./booking-expiry.service";
import { BookingRepository } from "./booking.repository";
import { BookingService } from "./booking.service";

// Booking owns the booking aggregate and seat occupancy. Depends one-way and
// downward only: on catalog (session/seat/cabin data), members (member profile)
// and entitlements (the signature resolve) — never the reverse, so no cycle.
// Exports only BookingService; the repository and expiry sweep stay internal.
@Module({
  imports: [CatalogModule, MembersModule, EntitlementsModule],
  controllers: [BookingController],
  providers: [BookingService, BookingRepository, BookingExpiryService],
  exports: [BookingService],
})
export class BookingModule {}
