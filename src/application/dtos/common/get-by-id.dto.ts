import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetByIdDto {
  @ApiProperty({
    description: 'รหัส ID ของรายการ',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsString()
  id!: string;
}
