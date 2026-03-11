import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { ReturnInspectionCreateCommand } from '../../application/use-cases/return-inspection/command/create';
import { ReturnInspectionUpdateCommand } from '../../application/use-cases/return-inspection/command/update';
import { ReturnInspectionFindAllQuery } from '../../application/use-cases/return-inspection/query/find-all';
import { ReturnInspectionFindByIdQuery } from '../../application/use-cases/return-inspection/query/find-by-id';
import { ReturnInspectionCreateDto } from '../../application/dtos/return-inspection/create.dto';
import { ReturnInspectionUpdateDto } from '../../application/dtos/return-inspection/update.dto';
import { ReturnInspectionQueryDto } from '../../application/dtos/return-inspection/query.dto';
import { GetByIdDto } from '../../application/dtos/common/get-by-id.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('return-inspection')
@ApiBearerAuth()
@Controller({ path: 'return-inspection', version: '1' })
export class ReturnInspectionController {
  constructor(
    private readonly returnInspectionCreateCommand: ReturnInspectionCreateCommand,
    private readonly returnInspectionUpdateCommand: ReturnInspectionUpdateCommand,
    private readonly returnInspectionFindAllQuery: ReturnInspectionFindAllQuery,
    private readonly returnInspectionFindByIdQuery: ReturnInspectionFindByIdQuery,
  ) {}

  @Public()
  @Post()
  async createInspection(@Body() body: ReturnInspectionCreateDto) {
    return this.returnInspectionCreateCommand.execute({
      body,
    });
  }

  @Public()
  @Post('get')
  @ApiBody({ type: GetByIdDto })
  async getOne(@Body() body: GetByIdDto) {
    return this.returnInspectionFindByIdQuery.execute({ id: body.id });
  }

  @Public()
  @Post(':id')
  async updateInspection(
    @Param('id') id: string,
    @Body() body: ReturnInspectionUpdateDto,
  ) {
    return this.returnInspectionUpdateCommand.execute({ id, body });
  }

  @Public()
  @Get()
  async listAll(@Query() query: ReturnInspectionQueryDto) {
    return this.returnInspectionFindAllQuery.execute({ query });
  }
}
