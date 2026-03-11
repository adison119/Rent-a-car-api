import { Inject, Injectable } from '@nestjs/common';
import { UseCase } from '../../../../core/use-case';
import type { Customer } from '../../../../domain/customer';
import type { CustomerRepository } from '../../../ports/customer.repository';
import { CUSTOMER_REPOSITORY } from '../../../ports/tokens';
import type { CustomerCreateDto } from '../../../dtos/customer/create.dto';

export interface CustomerCreateCommandInput {
  body: CustomerCreateDto;
  createdById?: string;
}

function toContactChannel(
  c: import('../../../dtos/customer/create.dto').ContactChannelDto,
): Customer['contactChannel'] {
  return c as Customer['contactChannel'];
}

@Injectable()
export class CustomerCreateCommand implements UseCase<
  CustomerCreateCommandInput,
  Customer
> {
  constructor(
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepository,
  ) {}

  async execute({
    body,
    createdById,
  }: CustomerCreateCommandInput): Promise<Customer> {
    return this.customerRepository.create({
      name: body.name,
      phone: body.phone,
      address: body.address,
      contactChannel: toContactChannel(body.contactChannel),
      idDocumentUrls: body.idDocumentUrls ?? [],
      status: 'VISITOR',
      createdById,
    });
  }
}
