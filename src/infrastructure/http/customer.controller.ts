import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { User } from '../../domain/user';
import { CustomerApproveCommand } from '../../application/use-cases/customer/command/approve';
import { CustomerCreateCommand } from '../../application/use-cases/customer/command/create';
import { CustomerUpdateCommand } from '../../application/use-cases/customer/command/update';
import { CustomerFindAllQuery } from '../../application/use-cases/customer/query/find-all';
import { CustomerFindByIdQuery } from '../../application/use-cases/customer/query/find-by-id';
import { CustomerCreateDto } from '../../application/dtos/customer/create.dto';
import { CustomerUpdateDto } from '../../application/dtos/customer/update.dto';
import { CustomerQueryDto } from '../../application/dtos/customer/query.dto';
import { GetByIdDto } from '../../application/dtos/common/get-by-id.dto';
import { Public } from '../../common/decorators/public.decorator';

type RequestWithUser = { user?: User };

@ApiTags('customer')
@ApiBearerAuth()
@Controller({ path: 'customer', version: '1' })
export class CustomerController {
  constructor(
    private readonly customerCreateCommand: CustomerCreateCommand,
    private readonly customerUpdateCommand: CustomerUpdateCommand,
    private readonly customerApproveCommand: CustomerApproveCommand,
    private readonly customerFindAllQuery: CustomerFindAllQuery,
    private readonly customerFindByIdQuery: CustomerFindByIdQuery,
  ) {}

  @Public()
  @Post()
  async create(@Body() body: CustomerCreateDto, @Req() req: RequestWithUser) {
    const createdById = req.user?.id;
    return this.customerCreateCommand.execute({ body, createdById });
  }

  @Public()
  @Post('get')
  @ApiBody({ type: GetByIdDto })
  async get(@Body() body: GetByIdDto) {
    return this.customerFindByIdQuery.execute({ id: body.id });
  }

  @Public()
  @Post(':id')
  async update(@Param('id') id: string, @Body() body: CustomerUpdateDto) {
    return this.customerUpdateCommand.execute({ id, body });
  }

  @Public()
  @Post(':id/approve')
  @ApiOperation({
    summary: 'อนุมัติลูกค้า',
    description: 'Admin ตรวจสอบแล้วกดอนุมัติ ให้สถานะเป็น CUSTOMER',
  })
  async approve(@Param('id') id: string) {
    return this.customerApproveCommand.execute({ id });
  }

  @Public()
  @Get()
  async list(@Query() query: CustomerQueryDto) {
    return this.customerFindAllQuery.execute({ query });
  }
}
