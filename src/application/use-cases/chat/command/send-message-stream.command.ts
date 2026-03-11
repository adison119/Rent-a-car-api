import { Injectable } from '@nestjs/common';
import { Observable, concat, from, of } from 'rxjs';
import { concatMap, delay } from 'rxjs/operators';
import type { MessageEvent } from '@nestjs/common';
import { ChatSendMessageCommand } from './send-message';

const CHUNK_SIZE = 40;
const CHUNK_DELAY_MS = 30;

export interface ChatSendMessageStreamCommandInput {
  message: string;
  conversationId?: string;
}

/**
 * Returns an Observable of SSE MessageEvents: first text chunks (event data = chunk),
 * then a final event with data = JSON.stringify({ done: true, conversationId? }).
 */
@Injectable()
export class ChatSendMessageStreamCommand {
  constructor(
    private readonly chatSendMessageCommand: ChatSendMessageCommand,
  ) {}

  execute(input: ChatSendMessageStreamCommandInput): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      this.chatSendMessageCommand
        .execute({
          message: input.message,
          conversationId: input.conversationId,
        })
        .then(({ reply, conversationId }) => {
          const chunks = this.chunkString(reply, CHUNK_SIZE);
          const chunkEvents$ = from(chunks).pipe(
            concatMap((chunk) =>
              of({ data: chunk } as MessageEvent).pipe(delay(CHUNK_DELAY_MS)),
            ),
          );
          const doneEvent$ = of({
            data: JSON.stringify({ done: true, conversationId }),
            type: 'done',
          } as MessageEvent);
          concat(chunkEvents$, doneEvent$).subscribe(subscriber);
        })
        .catch((err) => subscriber.error(err));
    });
  }

  private chunkString(str: string, size: number): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks.length ? chunks : [''];
  }
}
