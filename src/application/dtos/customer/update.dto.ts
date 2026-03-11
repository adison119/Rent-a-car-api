import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ContactChannelDto, CustomerStatusDto } from './create.dto';

export class CustomerUpdateDto {
  @ApiPropertyOptional({ description: 'ชื่อลูกค้า', example: 'สมชาย ใจดี' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'เบอร์โทร', example: '0812345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'ที่อยู่', example: '123 ถ.สุขุมวิท' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'ช่องทางติดต่อ',
    enum: ContactChannelDto,
    example: ContactChannelDto.LINE,
  })
  @IsOptional()
  @IsEnum(ContactChannelDto)
  contactChannel?: ContactChannelDto;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/id.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  idDocumentUrls?: string[];

  @ApiPropertyOptional({
    description: 'สถานะลูกค้า',
    enum: CustomerStatusDto,
    example: CustomerStatusDto.CUSTOMER,
  })
  @IsOptional()
  @IsEnum(CustomerStatusDto)
  status?: CustomerStatusDto;
}
