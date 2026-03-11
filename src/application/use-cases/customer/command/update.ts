import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Customer } from '../../../../domain/customer';
import type { CustomerRepository } from '../../../ports/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../../ports/tokens';
import type { CustomerUpdateDto } from '../../../dtos/customer/update.dto';

export interface CustomerUpdateCommandInput {
  id: string;
  body: CustomerUpdateDto;
}

@Injectable()
export class CustomerUpdateCommand implements UseCase<
  CustomerUpdateCommandInput,
  Customer
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute({ id, body }: CustomerUpdateCommandInput): Promise<Customer> {
    const existing = await this.customerRepository.findById(id);
    if (!existing) throw new NotFoundException('Customer not found');
    const data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>> = {};
    if (body.name != null) data.name = body.name;
    if (body.phone != null) data.phone = body.phone;
    if (body.address !== undefined) data.address = body.address;
    if (body.contactChannel != null)
      data.contactChannel = body.contactChannel as Customer['contactChannel'];
    if (body.idDocumentUrls != null) data.idDocumentUrls = body.idDocumentUrls;
    if (body.status !== undefined)
      data.status = body.status as Customer['status'] | undefined;
    return this.customerRepository.update(id, data);
  }
}
