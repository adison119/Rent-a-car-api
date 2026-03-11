import type { Customer } from '../../domain/customer';

export interface CustomerRepository {
  create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Customer>;
  update(
    id: string,
    data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findMany(params?: { status?: Customer['status'] }): Promise<Customer[]>;
  delete(id: string): Promise<void>;
}
