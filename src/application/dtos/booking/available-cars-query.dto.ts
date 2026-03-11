import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AvailableCarsQueryDto {
  @ApiProperty({
    description: 'วันเวลาเริ่ม (ISO date-time)',
    format: 'date-time',
    example: '2025-07-01T09:00:00.000Z',
  })
  @IsNotEmpty({ message: 'startAt ต้องไม่ว่าง' })
  @IsISO8601({}, { message: 'startAt ต้องเป็นรูปแบบ ISO 8601' })
  startAt!: string;

  @ApiProperty({
    description: 'วันเวลาคืน (ISO date-time)',
    format: 'date-time',
    example: '2025-07-03T18:00:00.000Z',
  })
  @IsNotEmpty({ message: 'endAt ต้องไม่ว่าง' })
  @IsISO8601({}, { message: 'endAt ต้องเป็นรูปแบบ ISO 8601' })
  endAt!: string;

  @ApiPropertyOptional({ description: 'กรองตามยี่ห้อ', example: 'Toyota' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'กรองตามรุ่น', example: 'Camry' })
  @IsOptional()
  @IsString()
  model?: string;
}
