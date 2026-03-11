import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Car } from '../../../../domain/car';
import type { CarRepository } from '../../../ports/car.repository';
import { CAR_REPOSITORY } from '../../../ports/tokens';
import type { CarCreateDto } from '../../../dtos/car/create.dto';

export interface CarCreateCommandInput {
  body: CarCreateDto;
}

@Injectable()
export class CarCreateCommand implements UseCase<CarCreateCommandInput, Car> {
  constructor(
    @Inject(CAR_REPOSITORY) private readonly carRepository: CarRepository,
  ) {}

  async execute({ body }: CarCreateCommandInput): Promise<Car> {
    return this.carRepository.create({
      brand: body.brand,
      model: body.model,
      year: body.year,
      lastInspectionAt: new Date(body.lastInspectionAt),
      rentalPricePerDay: body.rentalPricePerDay,
      depositPricePerDay: body.depositPricePerDay,
      imageUrls: body.imageUrls ?? [],
      status: (body.status ?? 'AVAILABLE') as Car['status'],
      plateNumber: body.plateNumber,
    });
  }
}
