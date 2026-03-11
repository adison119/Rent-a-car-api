import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Car } from '../../../../domain/car';
import type { CarRepository } from '../../../ports/car.repository';
import { CAR_REPOSITORY } from '../../../ports/tokens';
import type { CarQueryDto } from '../../../dtos/car/query.dto';

export interface CarFindAllQueryInput {
  query?: CarQueryDto;
}

@Injectable()
export class CarFindAllQuery implements UseCase<CarFindAllQueryInput, Car[]> {
  constructor(
    @Inject(CAR_REPOSITORY) private readonly carRepository: CarRepository,
  ) {}

  async execute(input: CarFindAllQueryInput = {}): Promise<Car[]> {
    const q = input.query ?? {};
    return this.carRepository.findMany({
      brand: q.brand,
      model: q.model,
      status: q.status as Car['status'] | undefined,
    });
  }
}
