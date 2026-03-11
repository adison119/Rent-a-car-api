import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { ReturnInspection } from '../../../../domain/return-inspection';
import type { ReturnInspectionRepository } from '../../../ports/return-inspection.repository';
import { RETURN_INSPECTION_REPOSITORY } from '../../../ports/tokens';

export interface ReturnInspectionFindByIdQueryInput {
  id: string;
}

@Injectable()
export class ReturnInspectionFindByIdQuery implements UseCase<
  ReturnInspectionFindByIdQueryInput,
  ReturnInspection
> {
  constructor(
    @Inject(RETURN_INSPECTION_REPOSITORY)
    private readonly returnInspectionRepository: ReturnInspectionRepository,
  ) {}

  async execute({
    id,
  }: ReturnInspectionFindByIdQueryInput): Promise<ReturnInspection> {
    const inspection = await this.returnInspectionRepository.findById(id);
    if (!inspection) throw new NotFoundException('Return inspection not found');
    return inspection;
  }
}
