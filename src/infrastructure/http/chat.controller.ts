import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Response } from 'express';
import { ChatSendMessageCommand } from '../../application/use-cases/chat/command/send-message';
import { ChatSendMessageStreamCommand } from '../../application/use-cases/chat/command/send-message-stream.command';
import { ChatSendMessageDto } from '../../application/dtos/chat/send-message.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('chat')
@ApiBearerAuth()
@Controller({ path: 'chat', version: '1' })
@UseGuards(ThrottlerGuard)
@Public()
export class ChatController {
  constructor(
    private readonly chatSendMessageCommand: ChatSendMessageCommand,
    private readonly chatSendMessageStreamCommand: ChatSendMessageStreamCommand,
  ) {}

  @Post()
  @ApiBody({ type: ChatSendMessageDto })
  @ApiResponse({
    status: 200,
    description: 'คำตอบจาก AI (มี conversationId เมื่อส่ง conversationId มา)',
  })
  @ApiResponse({
    status: 429,
    description: 'Too Many Requests — เกินจำนวนข้อความที่อนุญาตต่อนาที',
  })
  async sendMessage(@Body() body: ChatSendMessageDto) {
    return this.chatSendMessageCommand.execute({
      message: body.message,
      conversationId: body.conversationId,
    });
  }

  @Post('stream')
  @ApiBody({ type: ChatSendMessageDto })
  @ApiResponse({
    status: 200,
    description:
      'Server-Sent Events (SSE): event "message" สำหรับแต่ละ chunk ข้อความ, event "done" สุดท้าย (data เป็น JSON { done: true, conversationId? }). ใช้ EventSource หรือ fetch + ReadableStream',
  })
  @ApiResponse({ status: 429, description: 'Too Many Requests' })
  streamMessage(@Body() body: ChatSendMessageDto, @Res() res: Response): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    this.chatSendMessageStreamCommand
      .execute({
        message: body.message,
        conversationId: body.conversationId,
      })
      .subscribe({
        next: (event) => {
          const raw =
            typeof event.data === 'string'
              ? event.data
              : JSON.stringify(event.data);
          const data = raw.replace(/\n/g, '\ndata: ');
          const type = event.type ? `event: ${event.type}\n` : '';
          res.write(`${type}data: ${data}\n\n`);
          const flush = (res as { flush?: () => void }).flush;
          if (typeof flush === 'function') flush.call(res);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          res.write(
            `event: error\ndata: ${JSON.stringify({ error: message })}\n\n`,
          );
          res.end();
        },
        complete: () => {
          res.end();
        },
      });
  }
}
