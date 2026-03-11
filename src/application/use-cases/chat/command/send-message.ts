import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import {
  createModelContent,
  createPartFromFunctionCall,
  createPartFromFunctionResponse,
  createUserContent,
  type Content,
  type FunctionDeclaration,
  type FunctionCall,
} from '@google/genai';
import { UseCase } from '../../../../core/use-case';
import { GetAvailableCarsQuery } from '../../booking/query/get-available-cars';
import { CarFindByIdQuery } from '../../car/query/find-by-id';
import { CarFindAllQuery } from '../../car/query/find-all';
import type { CarStatusDto } from '../../../dtos/car/create.dto';
import { ChatHistoryStore } from '../chat-history.store';

function toStr(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

const SYSTEM_INSTRUCTION = `คุณเป็นผู้ช่วยแนะนำรถเช่า ตอบเป็นภาษาไทย สั้น กระชับ เป็นกันเอง
ใช้ tools เพื่อดูรถที่ว่าง รายละเอียดรถ และค้นหารถ
เมื่อลูกค้าถามรถที่ต้องการแต่รถถูกเช่าอยู่ ให้ใช้ get_available_cars เพื่อเสนอรถทางเลือกและอธิบาย`;

const MAX_FUNCTION_CALL_ROUNDS = 5;

const CHAT_FUNCTION_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'get_available_cars',
    description:
      'ค้นหารถที่ว่างในช่วงวันที่กำหนด (ต้องส่ง startAt และ endAt เป็น ISO date-time)',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        startAt: { type: 'string', description: 'วันเวลาเริ่มเช่า ISO 8601' },
        endAt: { type: 'string', description: 'วันเวลาคืนรถ ISO 8601' },
        brand: { type: 'string', description: 'กรองตามยี่ห้อ (optional)' },
        model: { type: 'string', description: 'กรองตามรุ่น (optional)' },
      },
      required: ['startAt', 'endAt'],
    },
  },
  {
    name: 'get_car_by_id',
    description: 'ดึงรายละเอียดรถจากรหัส (id)',
    parametersJsonSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'รหัสรถ' } },
      required: ['id'],
    },
  },
  {
    name: 'search_cars',
    description: 'ค้นหารถตามยี่ห้อ รุ่น หรือสถานะ',
    parametersJsonSchema: {
      type: 'object',
      properties: {
        brand: { type: 'string', description: 'ยี่ห้อ (optional)' },
        model: { type: 'string', description: 'รุ่น (optional)' },
        status: {
          type: 'string',
          description: 'AVAILABLE, MAINTENANCE, VOID (optional)',
        },
      },
    },
  },
];

export interface ChatSendMessageCommandInput {
  message: string;
  conversationId?: string;
}

export interface ChatSendMessageCommandOutput {
  reply: string;
  conversationId?: string;
}

@Injectable()
export class ChatSendMessageCommand implements UseCase<
  ChatSendMessageCommandInput,
  ChatSendMessageCommandOutput
> {
  constructor(
    private readonly getAvailableCarsQuery: GetAvailableCarsQuery,
    private readonly carFindByIdQuery: CarFindByIdQuery,
    private readonly carFindAllQuery: CarFindAllQuery,
    private readonly chatHistoryStore: ChatHistoryStore,
  ) {}

  async execute({
    message,
    conversationId: inputConversationId,
  }: ChatSendMessageCommandInput): Promise<ChatSendMessageCommandOutput> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey?.trim()) {
      throw new ServiceUnavailableException(
        'Chat ไม่พร้อมใช้งาน (ไม่มี GEMINI_API_KEY)',
      );
    }

    const model = process.env.GEMINI_CHAT_MODEL?.trim() || 'gemini-2.5-flash';
    const ai = new GoogleGenAI({ apiKey });

    const conversationId = inputConversationId ?? crypto.randomUUID();
    const history = this.chatHistoryStore.get(conversationId) ?? [];
    let contents: Content[] = [...history, createUserContent(message)];
    let round = 0;

    while (round < MAX_FUNCTION_CALL_ROUNDS) {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [{ functionDeclarations: CHAT_FUNCTION_DECLARATIONS }],
        },
      });

      const text = response.text?.trim();
      const functionCalls = response.functionCalls;

      if (functionCalls?.length) {
        const modelPart = createModelContent(
          functionCalls.map((fc: FunctionCall) =>
            createPartFromFunctionCall(fc.name ?? '', fc.args ?? {}),
          ),
        );
        const responseParts: ReturnType<
          typeof createPartFromFunctionResponse
        >[] = [];
        for (const fc of functionCalls) {
          const result = await this.handleFunctionCall(fc);
          responseParts.push(
            createPartFromFunctionResponse(fc.id ?? '', fc.name ?? '', {
              result,
            }),
          );
        }
        const userPart = createUserContent(responseParts);
        contents = [...contents, modelPart, userPart];
        round++;
        continue;
      }

      const reply = text ?? 'ขออภัย ตอบไม่ได้ในขณะนี้';
      const finalContents = [...contents, createModelContent(reply)];
      this.chatHistoryStore.set(conversationId, finalContents);
      return { reply, conversationId };
    }

    const fallbackReply = 'ขออภัย ใช้คำสั่งมากเกินไป กรุณาถามใหม่';
    const finalContents = [...contents, createModelContent(fallbackReply)];
    this.chatHistoryStore.set(conversationId, finalContents);
    return { reply: fallbackReply, conversationId };
  }

  private async handleFunctionCall(fc: FunctionCall): Promise<string> {
    const name = fc.name ?? '';
    const args = fc.args ?? {};

    try {
      if (name === 'get_available_cars') {
        const startAt = toStr(args.startAt);
        const endAt = toStr(args.endAt);
        const cars = await this.getAvailableCarsQuery.execute({
          query: {
            startAt,
            endAt,
            brand: toStr(args.brand) || undefined,
            model: toStr(args.model) || undefined,
          },
        });
        return JSON.stringify(
          cars.map((c) => ({
            id: c.id,
            brand: c.brand,
            model: c.model,
            year: c.year,
            rentalPricePerDay: c.rentalPricePerDay,
            status: c.status,
          })),
          null,
          2,
        );
      }
      if (name === 'get_car_by_id') {
        const id = toStr(args.id);
        const car = await this.carFindByIdQuery.execute({ id });
        return JSON.stringify(
          {
            id: car.id,
            brand: car.brand,
            model: car.model,
            year: car.year,
            rentalPricePerDay: car.rentalPricePerDay,
            depositPricePerDay: car.depositPricePerDay,
            status: car.status,
          },
          null,
          2,
        );
      }
      if (name === 'search_cars') {
        const cars = await this.carFindAllQuery.execute({
          query: {
            brand: toStr(args.brand) || undefined,
            model: toStr(args.model) || undefined,
            status: (toStr(args.status) as CarStatusDto) || undefined,
          },
        });
        return JSON.stringify(
          cars.map((c) => ({
            id: c.id,
            brand: c.brand,
            model: c.model,
            year: c.year,
            status: c.status,
          })),
          null,
          2,
        );
      }
      return JSON.stringify({ error: `Unknown function: ${name}` });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return JSON.stringify({ error: message });
    }
  }
}
