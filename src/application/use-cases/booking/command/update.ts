import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Booking } from '../../../../domain/booking';
import type { BookingRepository } from '../../../ports/booking.repository';
import type { CustomerRepository } from '../../../ports/customer.repository';
import { BOOKING_REPOSITORY, CUSTOMER_REPOSITORY } from '../../../ports/tokens';
import type { BookingUpdateDto } from '../../../dtos/booking/update.dto';

export interface BookingUpdateCommandInput {
  id: string;
  body: BookingUpdateDto;
}

@Injectable()
export class BookingUpdateCommand implements UseCase<
  BookingUpdateCommandInput,
  Booking
> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute({ id, body }: BookingUpdateCommandInput): Promise<Booking> {
    const existing = await this.bookingRepository.findById(id);
    if (!existing) throw new NotFoundException('Booking not found');
    const data: Parameters<BookingRepository['update']>[1] = {};
    if (body.status != null) data.status = body.status as Booking['status'];
    if (body.pickupType != null)
      data.pickupType = body.pickupType as Booking['pickupType'];
    if (body.deliveryAddress !== undefined)
      data.deliveryAddress = body.deliveryAddress;
    if (body.deliveryNote !== undefined) data.deliveryNote = body.deliveryNote;
    if (body.createdById !== undefined) data.createdById = body.createdById;
    const updated = await this.bookingRepository.update(id, data);
    if (updated.status === 'COMPLETED') {
      await this.customerRepository.update(updated.customerId, {
        status: 'RENTER',
      });
    }
    return updated;
  }
}
