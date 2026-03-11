import type { Car, CarStatus } from '../../domain/car';

export interface CarRepository {
  create(data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car>;
  update(
    id: string,
    data: Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Car>;
  findById(id: string): Promise<Car | null>;
  findMany(params?: {
    brand?: string;
    model?: string;
    status?: CarStatus;
  }): Promise<Car[]>;
  delete(id: string): Promise<void>;
}
