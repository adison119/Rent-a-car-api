import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Customer } from '../../../../domain/customer';
import type { CustomerRepository } from '../../../ports/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../../ports/tokens';

export interface CustomerApproveCommandInput {
  id: string;
}

@Injectable()
export class CustomerApproveCommand implements UseCase<
  CustomerApproveCommandInput,
  Customer
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute({ id }: CustomerApproveCommandInput): Promise<Customer> {
    const existing = await this.customerRepository.findById(id);
    if (!existing) throw new NotFoundException('Customer not found');
    return this.customerRepository.update(id, { status: 'CUSTOMER' });
  }
}
