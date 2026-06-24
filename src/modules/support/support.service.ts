import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import {
  SUPPORT_TICKET_CREATED,
  SupportTicketCreatedEvent,
} from "../../common/events/support.events";
import { MembersService } from "../members/members.service";
import { SupportRepository } from "./support.repository";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { SupportTicketResponseDto } from "./dto/support-ticket-response.dto";

@Injectable()
export class SupportService {
  constructor(
    private readonly repo: SupportRepository,
    private readonly members: MembersService,
    private readonly events: EventEmitter2,
  ) {}

  async createTicket(userId: string, dto: CreateSupportTicketDto): Promise<SupportTicketResponseDto> {
    // Link the ticket to a member profile if there is one — resolved through the
    // members facade, not by reading the members table.
    const member = await this.members.findMemberForBooking(userId);
    const ticket = await this.repo.create(member?.id ?? null, dto.subject, dto.body);

    this.events.emit(SUPPORT_TICKET_CREATED, {
      ticketId: ticket.id,
      userId,
      subject: ticket.subject,
    } satisfies SupportTicketCreatedEvent);

    return ticket;
  }
}
