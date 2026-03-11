import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CarStatusDto } from './create.dto';

export class CarUpdateDto {
  @ApiPropertyOptional({ description: 'ยี่ห้อรถ', example: 'Toyota' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'รุ่น', example: 'Camry' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ description: 'ปีผลิต', example: 2022 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;

  @ApiPropertyOptional({
    description: 'วันที่ตรวจสภาพล่าสุด (ISO date-time)',
    format: 'date-time',
    example: '2025-01-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({}, { message: 'lastInspectionAt ต้องเป็นรูปแบบ ISO 8601' })
  lastInspectionAt?: string;

  @ApiPropertyOptional({ description: 'ราคาเช่าต่อวัน (บาท)', example: 1500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rentalPricePerDay?: number;

  @ApiPropertyOptional({ description: 'เงินมัดจำต่อวัน (บาท)', example: 5000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositPricePerDay?: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/car1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({
    description: 'สถานะรถ',
    enum: CarStatusDto,
    example: 'AVAILABLE',
  })
  @IsOptional()
  @IsEnum(CarStatusDto)
  status?: CarStatusDto;

  @ApiPropertyOptional({ description: 'ทะเบียนรถ', example: 'กก 1234' })
  @IsOptional()
  @IsString()
  plateNumber?: string;
}
