import { Body, Controller, Get, HttpCode, Param, Post, SerializeOptions } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from "@nestjs/swagger";
import { CurrentUserId } from "../../common/auth/current-user.decorator";
import { BookingService } from "./booking.service";
import { BookingResponseDto, BookingSummaryResponseDto } from "./dto/booking-response.dto";
import { HoldBookingDto } from "./dto/hold-booking.dto";

@ApiTags("booking")
@ApiBearerAuth()
@ApiSecurity("X-User-Id")
@Controller("bookings")
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Post("hold")
  @ApiCreatedResponse({ type: BookingResponseDto })
  @SerializeOptions({ type: BookingResponseDto, excludeExtraneousValues: true })
  hold(@CurrentUserId() userId: string, @Body() dto: HoldBookingDto): Promise<BookingResponseDto> {
    return this.booking.hold(userId, dto);
  }

  @Post(":id/confirm")
  @HttpCode(200)
  @ApiOkResponse({ type: BookingResponseDto })
  @SerializeOptions({ type: BookingResponseDto, excludeExtraneousValues: true })
  confirm(@CurrentUserId() userId: string, @Param("id") id: string): Promise<BookingResponseDto> {
    return this.booking.confirm(userId, id);
  }

  @Post(":id/cancel")
  @HttpCode(200)
  @ApiOkResponse({ type: BookingResponseDto })
  @SerializeOptions({ type: BookingResponseDto, excludeExtraneousValues: true })
  cancel(@CurrentUserId() userId: string, @Param("id") id: string): Promise<BookingResponseDto> {
    return this.booking.cancel(userId, id);
  }

  @Get()
  @ApiOkResponse({ type: BookingSummaryResponseDto, isArray: true })
  @SerializeOptions({ type: BookingSummaryResponseDto, excludeExtraneousValues: true })
  list(@CurrentUserId() userId: string): Promise<BookingSummaryResponseDto[]> {
    return this.booking.listForUser(userId);
  }

  @Get(":id")
  @ApiOkResponse({ type: BookingResponseDto })
  @SerializeOptions({ type: BookingResponseDto, excludeExtraneousValues: true })
  get(@CurrentUserId() userId: string, @Param("id") id: string): Promise<BookingResponseDto> {
    return this.booking.getForUser(userId, id);
  }
}
