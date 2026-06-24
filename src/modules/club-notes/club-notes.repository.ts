import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Prisma } from "../../generated/prisma/client";

// Own table only — the author's display name is composed from the members facade
// in the service (the ClubNote→Member relation was cut at the module boundary).
export const clubNoteRowSelect = {
  id: true,
  body: true,
  createdAt: true,
  memberId: true,
} satisfies Prisma.ClubNoteSelect;

export type ClubNoteRow = Prisma.ClubNoteGetPayload<{ select: typeof clubNoteRowSelect }>;

@Injectable()
export class ClubNotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  listForSession(sessionId: string): Promise<ClubNoteRow[]> {
    return this.prisma.clubNote.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: clubNoteRowSelect,
    });
  }

  create(memberId: string, sessionId: string, body: string): Promise<ClubNoteRow> {
    return this.prisma.clubNote.create({
      data: { memberId, sessionId, body },
      select: clubNoteRowSelect,
    });
  }
}
