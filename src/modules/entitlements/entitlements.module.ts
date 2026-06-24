import { Module } from "@nestjs/common";
import { EntitlementsService } from "./entitlements.service";

// Public facade: only EntitlementsService is exported; consumers (members,
// booking) import this module and inject the service — never its internals.
@Module({
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
