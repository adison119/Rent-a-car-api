import { Injectable } from '@nestjs/common';
import type { Content } from '@google/genai';

const MAX_CONVERSATIONS = 500;
const MAX_TURNS_PER_CONVERSATION = 20; // 20 user+model pairs => 40 Content items

@Injectable()
export class ChatHistoryStore {
  private readonly store = new Map<string, Content[]>();
  private readonly order: string[] = []; // for eviction by oldest

  get(conversationId: string): Content[] | undefined {
    return this.store.get(conversationId);
  }

  set(conversationId: string, contents: Content[]): void {
    const trimmed = this.trimTurns(contents);
    this.store.set(conversationId, trimmed);
    if (!this.order.includes(conversationId)) {
      this.order.push(conversationId);
    } else {
      this.order.splice(this.order.indexOf(conversationId), 1);
      this.order.push(conversationId);
    }
    this.evictIfNeeded();
  }

  private trimTurns(contents: Content[]): Content[] {
    const maxItems = MAX_TURNS_PER_CONVERSATION * 2;
    if (contents.length <= maxItems) return contents;
    return contents.slice(-maxItems);
  }

  private evictIfNeeded(): void {
    while (this.store.size > MAX_CONVERSATIONS && this.order.length > 0) {
      const oldest = this.order.shift();
      if (oldest) this.store.delete(oldest);
    }
  }
}
