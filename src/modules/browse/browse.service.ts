import { Injectable } from "@nestjs/common";
import { BookingService } from "../booking/booking.service";
import { CatalogService } from "../catalog/catalog.service";
import { ListSessionsQueryDto } from "./dto/list-sessions.query.dto";
import { SessionDetailResponseDto } from "./dto/session-detail-response.dto";
import { SessionSummaryResponseDto } from "./dto/session-summary-response.dto";

// Composition facade: the only place that depends on BOTH catalog and booking.
// It keeps the catalog↔booking cycle from forming — catalog stays unaware of
// booking, booking depends only downward. Reads session data from catalog and
// live seat availability from booking, and merges them for the public view.
@Injectable()
export class BrowseService {
  constructor(
    private readonly catalog: CatalogService,
    private readonly booking: BookingService,
  ) {}

  listSessions(query: ListSessionsQueryDto): Promise<SessionSummaryResponseDto[]> {
    return this.catalog.listSessions({ kind: query.kind, from: query.from, to: query.to });
  }

  async getSession(id: string): Promise<SessionDetailResponseDto> {
    const session = await this.catalog.getSessionDetail(id);
    const takenSeatIds = await this.booking.getTakenSeatIds(id);
    return { ...session, takenSeatIds };
  }
}
