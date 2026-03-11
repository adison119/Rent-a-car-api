import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CarStatusDto } from './create.dto';

export class CarQueryDto {
  @ApiPropertyOptional({ description: 'กรองตามยี่ห้อ', example: 'Toyota' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'กรองตามรุ่น', example: 'Camry' })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({
    description: 'กรองตามสถานะ',
    enum: CarStatusDto,
    example: CarStatusDto.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(CarStatusDto)
  status?: CarStatusDto;
}
