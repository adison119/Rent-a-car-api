import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PickupTypeDto } from './create.dto';

export enum BookingStatusDto {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class BookingUpdateDto {
  @ApiPropertyOptional({
    description: 'สถานะการจอง',
    enum: BookingStatusDto,
    example: BookingStatusDto.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(BookingStatusDto)
  status?: BookingStatusDto;

  @ApiPropertyOptional({
    description: 'วิธีรับรถ',
    enum: PickupTypeDto,
    example: PickupTypeDto.AT_STORE,
  })
  @IsOptional()
  @IsEnum(PickupTypeDto)
  pickupType?: PickupTypeDto;

  @ApiPropertyOptional({
    description: 'ที่อยู่จัดส่ง',
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
