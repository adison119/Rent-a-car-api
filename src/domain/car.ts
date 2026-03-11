/**
 * Domain entity: Car.
 */
export type CarStatus = 'AVAILABLE' | 'MAINTENANCE' | 'VOID';

export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  lastInspectionAt: Date;
  rentalPricePerDay: number;
  depositPricePerDay: number;
  imageUrls: string[];
  status: CarStatus;
  plateNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}
