import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { Prisma } from "../../generated/prisma/client";
import { SupportTicketResponseDto } from "./dto/support-ticket-response.dto";

export const supportTicketSelect = {
  id: true,
  subject: true,
  body: true,
  status: true,
  createdAt: true,
} satisfies Prisma.SupportTicketSelect;

@Injectable()
export class SupportRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(memberId: string | null, subject: string, body: string): Promise<SupportTicketResponseDto> {
    return this.prisma.supportTicket.create({
      data: { memberId, subject, body },
      select: supportTicketSelect,
    });
  }
}
