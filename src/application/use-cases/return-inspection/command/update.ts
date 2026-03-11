import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { ReturnInspection } from '../../../../domain/return-inspection';
import type { ReturnInspectionRepository } from '../../../ports/return-inspection.repository';
import { RETURN_INSPECTION_REPOSITORY } from '../../../ports/tokens';
import type { ReturnInspectionUpdateDto } from '../../../dtos/return-inspection/update.dto';

export interface ReturnInspectionUpdateCommandInput {
  id: string;
  body: ReturnInspectionUpdateDto;
}

@Injectable()
export class ReturnInspectionUpdateCommand implements UseCase<
  ReturnInspectionUpdateCommandInput,
  ReturnInspection
> {
  constructor(
    @Inject(RETURN_INSPECTION_REPOSITORY)
    private readonly returnInspectionRepository: ReturnInspectionRepository,
  ) {}

  async execute({
    id,
    body,
  }: ReturnInspectionUpdateCommandInput): Promise<ReturnInspection> {
    const existing = await this.returnInspectionRepository.findById(id);
    if (!existing) throw new NotFoundException('Return inspection not found');
    const data: Parameters<ReturnInspectionRepository['update']>[1] = {};
    if (body.insuranceExpiryAt != null)
      data.insuranceExpiryAt = new Date(body.insuranceExpiryAt);
    if (body.imagesBeforeUrls != null)
      data.imagesBeforeUrls = body.imagesBeforeUrls;
    if (body.imagesAfterUrls != null)
      data.imagesAfterUrls = body.imagesAfterUrls;
    if (body.note !== undefined) data.note = body.note;
    return this.returnInspectionRepository.update(id, data);
  }
}
