/**
 * Injection tokens for application ports (used with @Inject() in Nest).
 */
export const USER_REPOSITORY = Symbol('UserRepository');
export const CAR_REPOSITORY = Symbol('CarRepository');
export const CUSTOMER_REPOSITORY = Symbol('CustomerRepository');
export const BOOKING_REPOSITORY = Symbol('BookingRepository');
export const RETURN_INSPECTION_REPOSITORY = Symbol(
  'ReturnInspectionRepository',
);
export const FILE_REPOSITORY = Symbol('FileRepository');
