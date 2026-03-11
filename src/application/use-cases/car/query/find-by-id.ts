import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Car } from '../../../../domain/car';
import type { CarRepository } from '../../../ports/car.repository';
import { CAR_REPOSITORY } from '../../../ports/tokens';

export interface CarFindByIdQueryInput {
  id: string;
}

@Injectable()
export class CarFindByIdQuery implements UseCase<CarFindByIdQueryInput, Car> {
  constructor(
    @Inject(CAR_REPOSITORY) private readonly carRepository: CarRepository,
  ) {}

  async execute({ id }: CarFindByIdQueryInput): Promise<Car> {
    const car = await this.carRepository.findById(id);
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }
}
