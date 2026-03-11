import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { ReturnInspection } from '../../../../domain/return-inspection';
import type { ReturnInspectionRepository } from '../../../ports/return-inspection.repository';
import { RETURN_INSPECTION_REPOSITORY } from '../../../ports/tokens';
import type { ReturnInspectionQueryDto } from '../../../dtos/return-inspection/query.dto';

export interface ReturnInspectionFindAllQueryInput {
  query?: ReturnInspectionQueryDto;
}

@Injectable()
export class ReturnInspectionFindAllQuery implements UseCase<
  ReturnInspectionFindAllQueryInput,
  ReturnInspection[]
> {
  constructor(
    @Inject(RETURN_INSPECTION_REPOSITORY)
    private readonly returnInspectionRepository: ReturnInspectionRepository,
  ) {}

  async execute({ query }: ReturnInspectionFindAllQueryInput = {}): Promise<
    ReturnInspection[]
  > {
    return this.returnInspectionRepository.findMany({
      bookingId: query?.bookingId,
    });
  }
}
