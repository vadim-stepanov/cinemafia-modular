import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, SessionKind } from "../../generated/prisma/client";
import { CatalogRepository, SessionDetail, SessionSummary } from "./catalog.repository";

// Re-export the read shapes as part of the public surface so consumers (browse,
// booking) depend on CatalogService, not the internal repository.
export type {
  SessionDetail,
  SessionSummary,
  SessionForBooking,
  SeatInfo,
  CabinInfo,
} from "./catalog.repository";

// Plain query input owned by catalog — keeps the module independent of any
// transport DTO (the browse facade maps its HTTP query into this).
export interface SessionListFilter {
  kind?: SessionKind;
  from?: string;
  to?: string;
}

@Injectable()
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  listSessions(filter: SessionListFilter): Promise<SessionSummary[]> {
    const where: Prisma.SessionWhereInput = {};
    if (filter.kind) {
      where.kind = filter.kind;
    }
    if (filter.from || filter.to) {
      where.startsAt = {
        ...(filter.from ? { gte: new Date(filter.from) } : {}),
        ...(filter.to ? { lte: new Date(filter.to) } : {}),
      };
    }
    return this.repo.findManySummaries(where);
  }

  async getSessionDetail(id: string): Promise<SessionDetail> {
    const session = await this.repo.findDetail(id);
    if (!session) {
      throw new NotFoundException(`Session ${id} not found`);
    }
    return session;
  }

  // Facade reads for the booking module — booking validates and prices a hold
  // against this catalog data instead of touching catalog's tables.
  getSessionForBooking(id: string) {
    return this.repo.findSessionForBooking(id);
  }

  getSeatsByIds(seatIds: string[]) {
    return this.repo.findSeatsByIds(seatIds);
  }

  getCabinById(cabinId: string) {
    return this.repo.findCabinById(cabinId);
  }

  sessionExists(id: string): Promise<boolean> {
    return this.repo.sessionExists(id);
  }
}
