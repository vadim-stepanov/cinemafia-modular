import { Body, Controller, Post, SerializeOptions } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { CurrentUserId } from "../../common/auth/current-user.decorator";
import { SupportService } from "./support.service";
import { CreateSupportTicketDto } from "./dto/create-support-ticket.dto";
import { SupportTicketResponseDto } from "./dto/support-ticket-response.dto";

@ApiTags("support")
@ApiBearerAuth()
@ApiSecurity("X-User-Id")
@Controller("support")
@SerializeOptions({ type: SupportTicketResponseDto, excludeExtraneousValues: true })
export class SupportController {
  constructor(private readonly support: SupportService) {}

  @Post()
  @ApiCreatedResponse({ type: SupportTicketResponseDto })
  create(
    @CurrentUserId() userId: string,
    @Body() dto: CreateSupportTicketDto,
  ): Promise<SupportTicketResponseDto> {
    return this.support.createTicket(userId, dto);
  }
}
