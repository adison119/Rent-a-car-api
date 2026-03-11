import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import type { User } from '../../domain/user';
import { BookingCreateCommand } from '../../application/use-cases/booking/command/create';
import { BookingUpdateCommand } from '../../application/use-cases/booking/command/update';
import { BookingFindAllQuery } from '../../application/use-cases/booking/query/find-all';
import { BookingFindByIdQuery } from '../../application/use-cases/booking/query/find-by-id';
import { GetAvailableCarsQuery } from '../../application/use-cases/booking/query/get-available-cars';
import { BookingCreateDto } from '../../application/dtos/booking/create.dto';
import { BookingUpdateDto } from '../../application/dtos/booking/update.dto';
import { BookingQueryDto } from '../../application/dtos/booking/query.dto';
import { AvailableCarsQueryDto } from '../../application/dtos/booking/available-cars-query.dto';
import { GetByIdDto } from '../../application/dtos/common/get-by-id.dto';
import { Public } from '../../common/decorators/public.decorator';

type RequestWithUser = { user?: User };

@ApiTags('booking')
@ApiBearerAuth()
@Controller({ path: 'booking', version: '1' })
export class BookingController {
  constructor(
    private readonly bookingCreateCommand: BookingCreateCommand,
    private readonly bookingUpdateCommand: BookingUpdateCommand,
    private readonly bookingFindAllQuery: BookingFindAllQuery,
    private readonly bookingFindByIdQuery: BookingFindByIdQuery,
    private readonly getAvailableCarsQuery: GetAvailableCarsQuery,
  ) {}

  @Public()
  @Get('available-cars')
  async availableCars(@Query() query: AvailableCarsQueryDto) {
    return this.getAvailableCarsQuery.execute({ query });
  }

  @Public()
  @Post()
  async create(@Body() body: BookingCreateDto, @Req() req: RequestWithUser) {
    return this.bookingCreateCommand.execute({
      body: { ...body, createdById: req.user?.id },
    });
  }

  @Public()
  @Post('get')
  @ApiBody({ type: GetByIdDto })
  async get(@Body() body: GetByIdDto) {
    return this.bookingFindByIdQuery.execute({ id: body.id });
  }

  @Public()
  @Post(':id')
  async update(@Param('id') id: string, @Body() body: BookingUpdateDto) {
    return this.bookingUpdateCommand.execute({ id, body });
  }

  @Public()
  @Get()
  async list(@Query() query: BookingQueryDto) {
    return this.bookingFindAllQuery.execute({ query });
  }
}
