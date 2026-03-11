import { Module } from '@nestjs/common';
import { BookingModule } from '../booking/booking.module';
import { CarModule } from '../car/car.module';
import { ChatHistoryStore } from './chat-history.store';
import { ChatSendMessageCommand } from './command/send-message';
import { ChatSendMessageStreamCommand } from './command/send-message-stream.command';

@Module({
  imports: [BookingModule, CarModule],
  providers: [
    ChatHistoryStore,
    ChatSendMessageCommand,
    ChatSendMessageStreamCommand,
  ],
  exports: [ChatSendMessageCommand, ChatSendMessageStreamCommand],
})
export class ChatModule {}
