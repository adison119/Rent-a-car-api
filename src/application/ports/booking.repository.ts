import type { Booking } from '../../domain/booking';

/** Optional transaction client (e.g. Prisma tx) for use in create/findOverlappingBookings */
export type TransactionClient = unknown;

export interface BookingRepository {
  create(
    data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>,
    tx?: TransactionClient,
  ): Promise<Booking>;
  update(
    id: string,
    data: Partial<
      Omit<
        Booking,
        | 'id'
        | 'customerId'
        | 'carId'
        | 'startAt'
        | 'endAt'
        | 'rentalPricePerDay'
        | 'depositPricePerDay'
        | 'createdAt'
        | 'updatedAt'
      >
    >,
  ): Promise<Booking>;
  findById(id: string): Promise<Booking | null>;
  findMany(params?: {
    customerId?: string;
    carId?: string;
    status?: Booking['status'];
  }): Promise<Booking[]>;
  findOverlappingBookings(
    carId: string,
    startAt: Date,
    endAt: Date,
    tx?: TransactionClient,
  ): Promise<Booking[]>;
}
