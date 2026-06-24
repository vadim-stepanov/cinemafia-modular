import { Module } from "@nestjs/common";
import { MembersModule } from "../members/members.module";
import { SupportController } from "./support.controller";
import { SupportRepository } from "./support.repository";
import { SupportService } from "./support.service";

// Thin emulated context: owns support_tickets, links to a member via the members
// facade, and publishes SupportTicketCreated for the notifications listener.
@Module({
  imports: [MembersModule],
  controllers: [SupportController],
  providers: [SupportService, SupportRepository],
})
export class SupportModule {}
