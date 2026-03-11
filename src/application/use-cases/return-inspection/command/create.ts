import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { ReturnInspection } from '../../../../domain/return-inspection';
import type { ReturnInspectionRepository } from '../../../ports/return-inspection.repository';
import type { BookingRepository } from '../../../ports/booking.repository';
import {
  RETURN_INSPECTION_REPOSITORY,
  BOOKING_REPOSITORY,
} from '../../../ports/tokens';
import type { ReturnInspectionCreateDto } from '../../../dtos/return-inspection/create.dto';

export interface ReturnInspectionCreateCommandInput {
  body: ReturnInspectionCreateDto;
}

@Injectable()
export class ReturnInspectionCreateCommand implements UseCase<
  ReturnInspectionCreateCommandInput,
  ReturnInspection
> {
  constructor(
    @Inject(RETURN_INSPECTION_REPOSITORY)
    private readonly returnInspectionRepository: ReturnInspectionRepository,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute({
    body,
  }: ReturnInspectionCreateCommandInput): Promise<ReturnInspection> {
    const booking = await this.bookingRepository.findById(body.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    const existing = await this.returnInspectionRepository.findByBookingId(
      body.bookingId,
    );
    if (existing)
      throw new ConflictException(
        'Return inspection already exists for this booking',
      );
    return this.returnInspectionRepository.create({
      bookingId: body.bookingId,
      insuranceExpiryAt: new Date(body.insuranceExpiryAt),
      imagesBeforeUrls: body.imagesBeforeUrls ?? [],
      imagesAfterUrls: body.imagesAfterUrls ?? [],
      note: body.note,
    });
  }
}
