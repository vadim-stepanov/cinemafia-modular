import { Module } from "@nestjs/common";
import { EntitlementsModule } from "../entitlements/entitlements.module";
import { MembersController } from "./members.controller";
import { MembersRepository } from "./members.repository";
import { MembersService } from "./members.service";

// Imports EntitlementsModule and injects only its public service. Exports
// MembersService as this module's public facade (consumed later by booking,
// loyalty, club-notes); the repository stays internal and unexported.
@Module({
  imports: [EntitlementsModule],
  controllers: [MembersController],
  providers: [MembersService, MembersRepository],
  exports: [MembersService],
})
export class MembersModule {}
