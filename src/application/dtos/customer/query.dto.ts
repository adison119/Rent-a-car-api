import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CustomerStatusDto } from './create.dto';

export class CustomerQueryDto {
  @ApiPropertyOptional({
    description: 'กรองตามสถานะลูกค้า',
    enum: CustomerStatusDto,
    example: CustomerStatusDto.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(CustomerStatusDto)
  status?: CustomerStatusDto;
}
