import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Car } from '../../../../domain/car';
import type { CarRepository } from '../../../ports/car.repository';
import type { BookingRepository } from '../../../ports/booking.repository';
import { CAR_REPOSITORY, BOOKING_REPOSITORY } from '../../../ports/tokens';
import type { AvailableCarsQueryDto } from '../../../dtos/booking/available-cars-query.dto';
import { getStartOfToday } from '../../../utils/date.utils';

export interface GetAvailableCarsQueryInput {
  query: AvailableCarsQueryDto;
}

@Injectable()
export class GetAvailableCarsQuery implements UseCase<
  GetAvailableCarsQueryInput,
  Car[]
> {
  constructor(
    @Inject(CAR_REPOSITORY) private readonly carRepository: CarRepository,
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingRepository,
  ) {}

  async execute({ query }: GetAvailableCarsQueryInput): Promise<Car[]> {
    const startAt = new Date(query.startAt);
    const endAt = new Date(query.endAt);

    const startOfToday = getStartOfToday();
    if (startAt < startOfToday) {
      throw new BadRequestException(
        'ห้ามค้นหารถว่างแบบย้อนอดีต วันที่เริ่มเช่าต้องเป็นวันนี้หรือวันถัดไป',
      );
    }
    if (endAt < startAt) {
      throw new BadRequestException('วันเวลาคืนรถต้องไม่ก่อนวันเวลาเริ่มเช่า');
    }
    const allCars = await this.carRepository.findMany({
      brand: query.brand,
      model: query.model,
      status: 'AVAILABLE',
    });
    const available: Car[] = [];
    for (const car of allCars) {
      const overlapping = await this.bookingRepository.findOverlappingBookings(
        car.id,
        startAt,
        endAt,
      );
      if (overlapping.length === 0) available.push(car);
    }
    return available;
  }
}
