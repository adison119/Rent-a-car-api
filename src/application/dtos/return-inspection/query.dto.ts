import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReturnInspectionQueryDto {
  @ApiPropertyOptional({
    description: 'กรองตาม ID การจอง',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  bookingId?: string;
}
