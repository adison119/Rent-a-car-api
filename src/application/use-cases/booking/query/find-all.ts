import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Booking } from '../../../../domain/booking';
import type { BookingRepository } from '../../../ports/booking.repository';
import { BOOKING_REPOSITORY } from '../../../ports/tokens';
import type { BookingQueryDto } from '../../../dtos/booking/query.dto';

export interface BookingFindAllQueryInput {
  query?: BookingQueryDto;
}

@Injectable()
export class BookingFindAllQuery implements UseCase<
  BookingFindAllQueryInput,
  Booking[]
> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute(input: BookingFindAllQueryInput = {}): Promise<Booking[]> {
    const q = input.query ?? {};
    return this.bookingRepository.findMany({
      customerId: q.customerId,
      carId: q.carId,
      status: q.status as Booking['status'] | undefined,
    });
  }
}
