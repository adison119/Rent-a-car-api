import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LoggedInUser } from '../../common/decorators/logged-in-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { LoginCommand } from '../../application/use-cases/auth/command/login';
import { LoginDto } from '../../application/dtos/auth/login.dto';
import type { User } from '../../domain/user';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly loginCommand: LoginCommand) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() body: LoginDto) {
    const { accessToken } = await this.loginCommand.execute({ body });
    return { type: 'bearer', token: accessToken };
  }

  @Get()
  @ApiBearerAuth()
  getSession(@LoggedInUser() user: User) {
    return user;
  }
}
