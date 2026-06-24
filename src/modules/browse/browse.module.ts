import { Module } from "@nestjs/common";
import { BookingModule } from "../booking/booking.module";
import { CatalogModule } from "../catalog/catalog.module";
import { BrowseController } from "./browse.controller";
import { BrowseService } from "./browse.service";

// Public read facade for session browsing. Sits ABOVE catalog and booking and
// depends on both (one-way, downward) — this is what keeps the leaves acyclic:
// catalog never imports booking, booking never imports browse. In a
// microservices variant this is what would grow into the BFF/gateway that
// aggregates the catalog and booking services.
@Module({
  imports: [CatalogModule, BookingModule],
  controllers: [BrowseController],
  providers: [BrowseService],
})
export class BrowseModule {}
