import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsISO8601, IsOptional, IsString } from 'class-validator';

export class ReturnInspectionUpdateDto {
  @ApiPropertyOptional({
    description: 'วันหมดอายุประกัน (ISO date-time)',
    format: 'date-time',
    example: '2026-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'insuranceExpiryAt ต้องเป็นรูปแบบ ISO 8601' })
  insuranceExpiryAt?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/before1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imagesBeforeUrls?: string[];

  @ApiPropertyOptional({
    type: [String],
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
