import { Controller, Get, Param, Query, SerializeOptions } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/auth/public.decorator";
import { BrowseService } from "./browse.service";
import { ListSessionsQueryDto } from "./dto/list-sessions.query.dto";
import { SessionDetailResponseDto } from "./dto/session-detail-response.dto";
import { SessionSummaryResponseDto } from "./dto/session-summary-response.dto";

@ApiTags("catalog")
@Public()
@Controller("sessions")
export class BrowseController {
  constructor(private readonly browse: BrowseService) {}

  @Get()
  @ApiOkResponse({ type: SessionSummaryResponseDto, isArray: true })
  @SerializeOptions({ type: SessionSummaryResponseDto, excludeExtraneousValues: true })
  listSessions(@Query() query: ListSessionsQueryDto): Promise<SessionSummaryResponseDto[]> {
    return this.browse.listSessions(query);
  }

  @Get(":id")
  @ApiOkResponse({ type: SessionDetailResponseDto })
  @ApiNotFoundResponse({ description: "Session not found." })
  @SerializeOptions({ type: SessionDetailResponseDto, excludeExtraneousValues: true })
  getSession(@Param("id") id: string): Promise<SessionDetailResponseDto> {
    return this.browse.getSession(id);
  }
}
