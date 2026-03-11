import { Module, Global } from '@nestjs/common';
import {
  USER_REPOSITORY,
  CAR_REPOSITORY,
  CUSTOMER_REPOSITORY,
  BOOKING_REPOSITORY,
  RETURN_INSPECTION_REPOSITORY,
  FILE_REPOSITORY,
} from '../../../application/ports/tokens';
import { PrismaService } from './prisma.service';
import { PrismaUserRepository } from './repositories/prisma-user.repository';
import { PrismaCarRepository } from './repositories/prisma-car.repository';
import { PrismaCustomerRepository } from './repositories/prisma-customer.repository';
import { PrismaBookingRepository } from './repositories/prisma-booking.repository';
import { PrismaReturnInspectionRepository } from './repositories/prisma-return-inspection.repository';
import { PrismaFileRepository } from './repositories/prisma-file.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: CAR_REPOSITORY, useClass: PrismaCarRepository },
    { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository },
    { provide: BOOKING_REPOSITORY, useClass: PrismaBookingRepository },
    {
      provide: RETURN_INSPECTION_REPOSITORY,
      useClass: PrismaReturnInspectionRepository,
    },
    { provide: FILE_REPOSITORY, useClass: PrismaFileRepository },
  ],
  exports: [
    PrismaService,
    USER_REPOSITORY,
    CAR_REPOSITORY,
    CUSTOMER_REPOSITORY,
    BOOKING_REPOSITORY,
    RETURN_INSPECTION_REPOSITORY,
    FILE_REPOSITORY,
  ],
})
export class PrismaModule {}
