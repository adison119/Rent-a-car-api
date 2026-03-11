import { Module } from '@nestjs/common';
import { CarCreateCommand } from './command/create';
import { CarUpdateCommand } from './command/update';
import { CarFindAllQuery } from './query/find-all';
import { CarFindByIdQuery } from './query/find-by-id';

const commands = [CarCreateCommand, CarUpdateCommand];
const queries = [CarFindAllQuery, CarFindByIdQuery];

@Module({
  providers: [...commands, ...queries],
  exports: [...commands, ...queries],
})
export class CarModule {}
