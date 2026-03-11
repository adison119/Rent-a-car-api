import { Module } from '@nestjs/common';
import { CustomerApproveCommand } from './command/approve';
import { CustomerCreateCommand } from './command/create';
import { CustomerUpdateCommand } from './command/update';
import { CustomerFindAllQuery } from './query/find-all';
import { CustomerFindByIdQuery } from './query/find-by-id';

const commands = [
  CustomerApproveCommand,
  CustomerCreateCommand,
  CustomerUpdateCommand,
];
const queries = [CustomerFindAllQuery, CustomerFindByIdQuery];

@Module({
  providers: [...commands, ...queries],
  exports: [...commands, ...queries],
})
export class CustomerModule {}
