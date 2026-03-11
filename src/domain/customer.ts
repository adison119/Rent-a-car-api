/**
 * Domain entity: Customer (renter / client, not system User).
 */
export type ContactChannel = 'FACEBOOK' | 'LINE';
export type CustomerStatus = 'VISITOR' | 'CUSTOMER' | 'RENTER' | 'VOID';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  contactChannel: ContactChannel;
  idDocumentUrls: string[];
  status?: CustomerStatus;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}
