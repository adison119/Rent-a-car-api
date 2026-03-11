import { Module } from '@nestjs/common';
import { ApplicationModule } from '../../application/application.module';
import { AuthController } from './auth.controller';
import { BookingController } from './booking.controller';
import { CarController } from './car.controller';
import { ChatController } from './chat.controller';
import { CustomerController } from './customer.controller';
import { FileController } from './file.controller';
import { ReturnInspectionController } from './return-inspection.controller';

@Module({
  imports: [ApplicationModule],
  controllers: [
    AuthController,
    BookingController,
    CarController,
    ChatController,
    CustomerController,
    FileController,
    ReturnInspectionController,
  ],
})
export class HttpModule {}
