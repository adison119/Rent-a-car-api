/**
 * Domain entity: Booking (car rental).
 */
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED';
export type PickupType = 'AT_STORE' | 'DELIVERY';

export interface Booking {
  id: string;
  customerId: string;
  carId: string;
  startAt: Date;
  endAt: Date;
  pickupType: PickupType;
  deliveryAddress?: string;
  deliveryNote?: string;
  status: BookingStatus;
  rentalPricePerDay: number;
  depositPricePerDay: number;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}
