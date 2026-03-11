import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/persistence/prisma/prisma.service';
import { UseCase } from '../../../../core/use-case';
import type { Booking } from '../../../../domain/booking';
import type { BookingRepository } from '../../../ports/booking.repository';
import type { CarRepository } from '../../../ports/car.repository';
import type { CustomerRepository } from '../../../ports/customer.repository';
import {
  BOOKING_REPOSITORY,
  CAR_REPOSITORY,
  CUSTOMER_REPOSITORY,
} from '../../../ports/tokens';
import type { BookingCreateDto } from '../../../dtos/booking/create.dto';
import { getStartOfToday } from '../../../utils/date.utils';

export interface BookingCreateCommandInput {
  body: BookingCreateDto;
}

export const BOOKING_CONFLICT_MESSAGE = 'รถถูกจองไปแล้ว';

function toPickupType(
  t: import('../../../dtos/booking/create.dto').PickupTypeDto,
): Booking['pickupType'] {
  return t as Booking['pickupType'];
}

@Injectable()
export class BookingCreateCommand implements UseCase<
  BookingCreateCommandInput,
  Booking
> {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepository,
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
    @Inject(CAR_REPOSITORY) private readonly carRepository: CarRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute({ body }: BookingCreateCommandInput): Promise<Booking> {
    const [customer, car] = await Promise.all([
      this.customerRepository.findById(body.customerId),
      this.carRepository.findById(body.carId),
    ]);
    if (!customer) throw new NotFoundException('Customer not found');
    if (!car) throw new NotFoundException('Car not found');
    if (car.status !== 'AVAILABLE') {
      throw new ConflictException('รถคันนี้ไม่พร้อมให้เช่าในขณะนี้');
    }

    const isApproved =
      customer.status === 'CUSTOMER' || customer.status === 'RENTER';
    if (!isApproved) {
      throw new ConflictException(
        'ลูกค้าที่จองได้ต้องได้รับการอนุมัติแล้ว (สถานะ CUSTOMER หรือ RENTER)',
      );
    }

    const startAt = new Date(body.startAt);
    const endAt = new Date(body.endAt);

    const startOfToday = getStartOfToday();
    if (startAt < startOfToday) {
      throw new BadRequestException(
        'ห้ามจองรถเช่าแบบย้อนอดีต วันที่เริ่มเช่าต้องเป็นวันนี้หรือวันถัดไป',
      );
    }
    if (endAt < startAt) {
      throw new BadRequestException('วันเวลาคืนรถต้องไม่ก่อนวันเวลาเริ่มเช่า');
    }

    return this.prisma.$transaction(async (tx) => {
      const overlapping = await this.bookingRepository.findOverlappingBookings(
        body.carId,
        startAt,
        endAt,
        tx,
      );
      if (overlapping.length > 0) {
        throw new ConflictException(BOOKING_CONFLICT_MESSAGE);
      }
      const booking = await this.bookingRepository.create(
        {
          customerId: body.customerId,
          carId: body.carId,
          startAt,
          endAt,
          pickupType: toPickupType(body.pickupType),
          deliveryAddress: body.deliveryAddress,
          deliveryNote: body.deliveryNote,
          status: 'PENDING',
          rentalPricePerDay: car.rentalPricePerDay,
          depositPricePerDay: car.depositPricePerDay,
          createdById: body.createdById,
        },
        tx,
      );
      await (tx as PrismaClient).customer.update({
        where: { id: body.customerId },
        data: { status: 'RENTER' },
      });
      return booking;
    });
  }
}
