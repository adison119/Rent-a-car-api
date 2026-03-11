import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export enum ContactChannelDto {
  FACEBOOK = 'FACEBOOK',
  LINE = 'LINE',
}

export enum CustomerStatusDto {
  VISITOR = 'VISITOR',
  CUSTOMER = 'CUSTOMER',
  RENTER = 'RENTER',
  VOID = 'VOID',
}

export class CustomerCreateDto {
  @ApiProperty({ description: 'ชื่อลูกค้า', example: 'สมชาย ใจดี' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'เบอร์โทร', example: '0812345678' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ description: 'ที่อยู่', example: '123 ถ.สุขุมวิท' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'ช่องทางติดต่อ',
    enum: ContactChannelDto,
    example: ContactChannelDto.LINE,
  })
  @IsEnum(ContactChannelDto)
  contactChannel!: ContactChannelDto;

  @ApiPropertyOptional({
    type: [String],
    default: [],
    example: ['https://example.com/id.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  idDocumentUrls?: string[];
}
