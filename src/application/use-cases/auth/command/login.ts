import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { UseCase } from '../../../../core/use-case';
import type { UserRepository } from '../../../ports/user.repository';
import { USER_REPOSITORY } from '../../../ports/tokens';
import type { LoginDto } from '../../../dtos/auth/login.dto';

export interface LoginCommandInput {
  body: LoginDto;
}

export interface LoginCommandOutput {
  accessToken: string;
  user: { id: string; email: string; name?: string };
}

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials';

@Injectable()
export class LoginCommand implements UseCase<
  LoginCommandInput,
  LoginCommandOutput
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ body }: LoginCommandInput): Promise<LoginCommandOutput> {
    const userWithPassword = await this.userRepository.findByEmailWithPassword(
      body.email,
    );
    if (!userWithPassword) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }
    const isPasswordValid = await verify(
      userWithPassword.password,
      body.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS_MESSAGE);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructure to omit password from result
    const { password: _omit, ...user } = userWithPassword;
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d' },
    );
    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
