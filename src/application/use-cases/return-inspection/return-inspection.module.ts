import { Module } from '@nestjs/common';
import { ReturnInspectionCreateCommand } from './command/create';
import { ReturnInspectionUpdateCommand } from './command/update';
import { ReturnInspectionFindAllQuery } from './query/find-all';
import { ReturnInspectionFindByIdQuery } from './query/find-by-id';

const commands = [ReturnInspectionCreateCommand, ReturnInspectionUpdateCommand];
const queries = [ReturnInspectionFindAllQuery, ReturnInspectionFindByIdQuery];

@Module({
  providers: [...commands, ...queries],
  exports: [...commands, ...queries],
})
export class ReturnInspectionModule {}
