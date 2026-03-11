import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Customer } from '../../../../domain/customer';
import type { CustomerRepository } from '../../../ports/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../../ports/tokens';
import type { CustomerQueryDto } from '../../../dtos/customer/query.dto';

export interface CustomerFindAllQueryInput {
  query?: CustomerQueryDto;
}

@Injectable()
export class CustomerFindAllQuery implements UseCase<
  CustomerFindAllQueryInput,
  Customer[]
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute(input: CustomerFindAllQueryInput = {}): Promise<Customer[]> {
    const q = input.query ?? {};
    return this.customerRepository.findMany({
      status: q.status as Customer['status'] | undefined,
    });
  }
}
