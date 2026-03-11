import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CarCreateCommand } from '../../application/use-cases/car/command/create';
import { CarUpdateCommand } from '../../application/use-cases/car/command/update';
import { CarFindAllQuery } from '../../application/use-cases/car/query/find-all';
import { CarFindByIdQuery } from '../../application/use-cases/car/query/find-by-id';
import { CarCreateDto } from '../../application/dtos/car/create.dto';
import { CarUpdateDto } from '../../application/dtos/car/update.dto';
import { CarQueryDto } from '../../application/dtos/car/query.dto';
import { GetByIdDto } from '../../application/dtos/common/get-by-id.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('car')
@ApiBearerAuth()
@Controller({ path: 'car', version: '1' })
export class CarController {
  constructor(
    private readonly carCreateCommand: CarCreateCommand,
    private readonly carUpdateCommand: CarUpdateCommand,
    private readonly carFindAllQuery: CarFindAllQuery,
    private readonly carFindByIdQuery: CarFindByIdQuery,
  ) {}

  @Public()
  @Post()
  async create(@Body() body: CarCreateDto) {
    return this.carCreateCommand.execute({ body });
  }

  @Public()
  @Post('get')
  @ApiBody({ type: GetByIdDto })
  async get(@Body() body: GetByIdDto) {
    return this.carFindByIdQuery.execute({ id: body.id });
  }

  @Public()
  @Post(':id')
  async update(@Param('id') id: string, @Body() body: CarUpdateDto) {
    return this.carUpdateCommand.execute({ id, body });
  }

  @Public()
  @Get()
  async list(@Query() query: CarQueryDto) {
    return this.carFindAllQuery.execute({ query });
  }
}
