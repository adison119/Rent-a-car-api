import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BookingQueryDto {
  @ApiPropertyOptional({
    description: 'กรองตาม ID ลูกค้า',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({
    description: 'กรองตาม ID รถ',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  carId?: string;

  @ApiPropertyOptional({
    description: 'กรองตามสถานะการจอง',
    example: 'PENDING',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
