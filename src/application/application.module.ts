import { Module } from '@nestjs/common';
import { AuthModule } from './use-cases/auth/auth.module';
import { BookingModule } from './use-cases/booking/booking.module';
import { CarModule } from './use-cases/car/car.module';
import { ChatModule } from './use-cases/chat/chat.module';
import { CustomerModule } from './use-cases/customer/customer.module';
import { FileModule } from './use-cases/file/file.module';
import { ReturnInspectionModule } from './use-cases/return-inspection/return-inspection.module';

@Module({
  imports: [
    AuthModule,
    BookingModule,
    CarModule,
    ChatModule,
    CustomerModule,
    FileModule,
    ReturnInspectionModule,
  ],
  exports: [
    AuthModule,
    BookingModule,
    CarModule,
    ChatModule,
    CustomerModule,
    FileModule,
    ReturnInspectionModule,
  ],
})
export class ApplicationModule {}
