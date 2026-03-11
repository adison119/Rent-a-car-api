/**
 * Domain entity: ReturnInspection (post-rental inspection).
 */
export interface ReturnInspection {
  id: string;
  bookingId: string;
  insuranceExpiryAt: Date;
  imagesBeforeUrls: string[];
  imagesAfterUrls: string[];
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
