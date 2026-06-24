import { Module } from "@nestjs/common";
import { BookingModule } from "../booking/booking.module";
import { CatalogModule } from "../catalog/catalog.module";
import { MembersModule } from "../members/members.module";
import { ClubNotesController } from "./club-notes.controller";
import { ClubNotesRepository } from "./club-notes.repository";
import { ClubNotesService } from "./club-notes.service";

// Thin context above members, catalog and booking — depends one-way on all
// three facades, none depend on it. Owns club_notes; repository stays internal.
@Module({
  imports: [MembersModule, CatalogModule, BookingModule],
  controllers: [ClubNotesController],
  providers: [ClubNotesService, ClubNotesRepository],
})
export class ClubNotesModule {}
