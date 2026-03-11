import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

export enum PickupTypeDto {
  AT_STORE = 'AT_STORE',
  DELIVERY = 'DELIVERY',
}

export class BookingCreateDto {
  @ApiProperty({
    description: 'ID ลูกค้า',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsString()
  customerId!: string;

  @ApiProperty({ description: 'ID รถ', example: 'clxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsString()
  carId!: string;

  @ApiProperty({
    description: 'วันเวลาเริ่มเช่า (ISO date-time)',
    format: 'date-time',
    example: '2025-07-01T09:00:00.000Z',
  })
  @IsISO8601({}, { message: 'startAt ต้องเป็นรูปแบบ ISO 8601' })
  startAt!: string;

  @ApiProperty({
    description: 'วันเวลาคืนรถ (ISO date-time)',
    format: 'date-time',
    example: '2025-07-03T18:00:00.000Z',
  })
  @IsISO8601({}, { message: 'endAt ต้องเป็นรูปแบบ ISO 8601' })
  endAt!: string;

  @ApiProperty({
    description: 'วิธีรับรถ',
    enum: PickupTypeDto,
    example: PickupTypeDto.AT_STORE,
  })
  @IsEnum(PickupTypeDto)
  pickupType!: PickupTypeDto;

  @ApiPropertyOptional({
    description: 'ที่อยู่จัดส่ง (เมื่อเลือก DELIVERY)',
    example: '123 ถ.สุขุมวิท',
  })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiPropertyOptional({
    description: 'หมายเหตุการจัดส่ง',
    example: 'โทรก่อนถึง 30 นาที',
  })
  @IsOptional()
  @IsString()
  deliveryNote?: string;

  @ApiPropertyOptional({
    description: 'User ID ผู้สร้างการจอง',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  createdById?: string;
}
