import { Module } from '@nestjs/common';
import { BookingCreateCommand } from './command/create';
import { BookingUpdateCommand } from './command/update';
import { BookingFindAllQuery } from './query/find-all';
import { BookingFindByIdQuery } from './query/find-by-id';
import { GetAvailableCarsQuery } from './query/get-available-cars';

const commands = [BookingCreateCommand, BookingUpdateCommand];
const queries = [
  BookingFindAllQuery,
  BookingFindByIdQuery,
  GetAvailableCarsQuery,
];

@Module({
  providers: [...commands, ...queries],
  exports: [...commands, ...queries],
})
export class BookingModule {}
