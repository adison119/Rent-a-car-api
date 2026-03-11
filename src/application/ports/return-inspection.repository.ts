import type { ReturnInspection } from '../../domain/return-inspection';

export interface ReturnInspectionRepository {
  create(
    data: Omit<ReturnInspection, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ReturnInspection>;
  update(
    id: string,
    data: Partial<
      Omit<ReturnInspection, 'id' | 'bookingId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<ReturnInspection>;
  findById(id: string): Promise<ReturnInspection | null>;
  findByBookingId(bookingId: string): Promise<ReturnInspection | null>;
  findMany(params?: { bookingId?: string }): Promise<ReturnInspection[]>;
}
