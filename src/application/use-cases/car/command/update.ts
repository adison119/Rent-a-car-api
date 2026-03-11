import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Car } from '../../../../domain/car';
import type { CarRepository } from '../../../ports/car.repository';
import { CAR_REPOSITORY } from '../../../ports/tokens';
import type { CarUpdateDto } from '../../../dtos/car/update.dto';

export interface CarUpdateCommandInput {
  id: string;
  body: CarUpdateDto;
}

@Injectable()
export class CarUpdateCommand implements UseCase<CarUpdateCommandInput, Car> {
  constructor(
    @Inject(CAR_REPOSITORY) private readonly carRepository: CarRepository,
  ) {}

  async execute({ id, body }: CarUpdateCommandInput): Promise<Car> {
    const existing = await this.carRepository.findById(id);
    if (!existing) throw new NotFoundException('Car not found');
    const data: Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (body.brand != null) data.brand = body.brand;
    if (body.model != null) data.model = body.model;
    if (body.year != null) data.year = body.year;
    if (body.lastInspectionAt != null)
      data.lastInspectionAt = new Date(body.lastInspectionAt);
    if (body.rentalPricePerDay != null)
      data.rentalPricePerDay = body.rentalPricePerDay;
    if (body.depositPricePerDay != null)
      data.depositPricePerDay = body.depositPricePerDay;
    if (body.imageUrls != null) data.imageUrls = body.imageUrls;
    if (body.status != null) data.status = body.status;
    if (body.plateNumber !== undefined) data.plateNumber = body.plateNumber;
    return this.carRepository.update(id, data);
  }
}
