import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { MembershipStatus } from "../../generated/prisma/client";
import { BookingService } from "../booking/booking.service";
import { CatalogService } from "../catalog/catalog.service";
import { MembersService } from "../members/members.service";
import { ClubNoteRow, ClubNotesRepository } from "./club-notes.repository";
import { ClubNoteResponseDto } from "./dto/club-note-response.dto";
import { CreateClubNoteDto } from "./dto/create-club-note.dto";

// Thin members-only context. Owns club_notes; every cross-context check goes
// through a facade: membership (members), session existence (catalog), a
// confirmed booking on the session (booking). Depends one-way on all three.
@Injectable()
export class ClubNotesService {
  constructor(
    private readonly repo: ClubNotesRepository,
    private readonly members: MembersService,
    private readonly catalog: CatalogService,
    private readonly booking: BookingService,
  ) {}

  async listNotes(userId: string, sessionId: string): Promise<ClubNoteResponseDto[]> {
    await this.requireActiveMember(userId);
    if (!(await this.catalog.sessionExists(sessionId))) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }
    const rows = await this.repo.listForSession(sessionId);
    return this.composeNotes(rows);
  }

  async createNote(
    userId: string,
    sessionId: string,
    dto: CreateClubNoteDto,
  ): Promise<ClubNoteResponseDto> {
    const memberId = await this.requireActiveMember(userId);
    if (!(await this.catalog.sessionExists(sessionId))) {
      throw new NotFoundException(`Session ${sessionId} not found`);
    }
    if (!(await this.booking.hasConfirmedBooking(memberId, sessionId))) {
      throw new ForbiddenException("You can only note sessions you have booked");
    }
    const row = await this.repo.create(memberId, sessionId, dto.body);
    return (await this.composeNotes([row]))[0];
  }

  private async requireActiveMember(userId: string): Promise<string> {
    const member = await this.members.findMemberForBooking(userId);
    if (!member || member.membership?.status !== MembershipStatus.ACTIVE) {
      throw new ForbiddenException("Club Notes are members-only (active membership required)");
    }
    return member.id;
  }

  private async composeNotes(rows: ClubNoteRow[]): Promise<ClubNoteResponseDto[]> {
    const memberIds = [...new Set(rows.map((row) => row.memberId))];
    const names = await this.members.getDisplayNames(memberIds);
    const byId = new Map(names.map((entry) => [entry.id, entry.displayName]));
    return rows.map((row) => ({
      id: row.id,
      body: row.body,
      createdAt: row.createdAt,
      member: { displayName: byId.get(row.memberId) ?? "" },
    }));
  }
}
