import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export enum CarStatusDto {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  VOID = 'VOID',
}

export class CarCreateDto {
  @ApiProperty({ description: 'ยี่ห้อรถ', example: 'Toyota' })
  @IsString()
  brand!: string;

  @ApiProperty({ description: 'รุ่น', example: 'Camry' })
  @IsString()
  model!: string;

  @ApiProperty({ description: 'ปีผลิต', example: 2022 })
  @IsInt()
  @Min(1900)
  year!: number;

  @ApiProperty({
    description: 'วันที่ตรวจสภาพล่าสุด (ISO date-time)',
    format: 'date-time',
    example: '2025-01-15T00:00:00.000Z',
  })
  @IsISO8601({}, { message: 'lastInspectionAt ต้องเป็นรูปแบบ ISO 8601' })
  lastInspectionAt!: string;

  @ApiProperty({ description: 'ราคาเช่าต่อวัน (บาท)', example: 1500 })
  @IsNumber()
  @Min(0)
  rentalPricePerDay!: number;

  @ApiProperty({ description: 'เงินมัดจำต่อวัน (บาท)', example: 5000 })
  @IsNumber()
  @Min(0)
  depositPricePerDay!: number;

  @ApiPropertyOptional({
    type: [String],
    default: [],
    example: ['https://example.com/car1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageUrls?: string[];

  @ApiPropertyOptional({
    description: 'สถานะรถ',
    enum: CarStatusDto,
    default: CarStatusDto.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(CarStatusDto)
  status?: CarStatusDto;

  @ApiPropertyOptional({ description: 'ทะเบียนรถ', example: 'กก 1234' })
  @IsOptional()
  @IsString()
  plateNumber?: string;
}
