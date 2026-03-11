import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChatSendMessageDto {
  @ApiProperty({
    description: 'ข้อความแชทจากผู้ใช้',
    example: 'มีรถ Toyota ว่างวันที่ 10–12 กรกฎาคมไหม',
  })
  @IsString()
  @MinLength(1, { message: 'ข้อความต้องไม่ว่าง' })
  message!: string;

  @ApiPropertyOptional({
    description: 'รหัสสนทนา (ส่งคืนเมื่อมีประวัติ multi-turn)',
    example: 'conv_abc123',
  })
  @IsOptional()
  @IsString()
  conversationId?: string;
}
