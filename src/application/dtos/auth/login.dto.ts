import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'อีเมล', example: 'admin@rentacar.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ description: 'รหัสผ่าน', example: 'admin123' })
  @IsString()
  @MinLength(1, { message: 'รหัสผ่านต้องไม่ว่าง' })
  password!: string;
}
