import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsOptional, IsString } from 'class-validator';

export class ReturnInspectionCreateDto {
  @ApiProperty({
    description: 'ID การจอง',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsString()
  bookingId!: string;

  @ApiProperty({
    description: 'วันหมดอายุประกัน (ISO date-time)',
    format: 'date-time',
    example: '2026-12-31T00:00:00.000Z',
  })
  @IsISO8601({}, { message: 'insuranceExpiryAt ต้องเป็นรูปแบบ ISO 8601' })
  insuranceExpiryAt!: string;

  @ApiPropertyOptional({
    type: [String],
    default: [],
    example: ['https://example.com/before1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagesBeforeUrls?: string[];

  @ApiPropertyOptional({
    type: [String],
    default: [],
    example: ['https://example.com/after1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagesAfterUrls?: string[];

  @ApiPropertyOptional({ description: 'หมายเหตุ', example: 'สภาพปกติ' })
  @IsOptional()
  @IsString()
  note?: string;
}
