import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Customer } from '../../../../domain/customer';
import type { CustomerRepository } from '../../../ports/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../../ports/tokens';

export interface CustomerFindByIdQueryInput {
  id: string;
}

@Injectable()
export class CustomerFindByIdQuery implements UseCase<
  CustomerFindByIdQueryInput,
  Customer
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute({ id }: CustomerFindByIdQueryInput): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
