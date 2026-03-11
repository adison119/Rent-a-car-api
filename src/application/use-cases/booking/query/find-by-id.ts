import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Booking } from '../../../../domain/booking';
import type { BookingRepository } from '../../../ports/booking.repository';
import { BOOKING_REPOSITORY } from '../../../ports/tokens';

export interface BookingFindByIdQueryInput {
  id: string;
}

@Injectable()
export class BookingFindByIdQuery implements UseCase<
  BookingFindByIdQueryInput,
  Booking
> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute({ id }: BookingFindByIdQueryInput): Promise<Booking> {
    const booking = await this.bookingRepository.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }
}
