import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  development = 'development',
  production = 'production',
  test = 'test',
}

class EnvValidator {
  @IsString()
  @MinLength(1, { message: 'DATABASE_URL is required' })
  DATABASE_URL!: string;

  @IsString()
  @MinLength(1, { message: 'JWT_SECRET is required' })
  JWT_SECRET!: string;

  @IsEnum(NodeEnv, {
    message: 'NODE_ENV must be development, production, or test',
  })
  NODE_ENV!: NodeEnv;

  @IsOptional()
  @IsNumberString()
  PORT?: string;

  @IsOptional()
  @IsString()
  S3_ENDPOINT?: string;

  @IsOptional()
  @IsNumberString()
  S3_PORT?: string;

  @IsOptional()
  @IsString()
  S3_ACCESS_KEY?: string;

  @IsOptional()
  @IsString()
  S3_SECRET_KEY?: string;

  @IsOptional()
  @IsString()
  S3_USE_SSL?: string;

  @IsOptional()
  @IsString()
  S3_BUCKET?: string;

  @IsOptional()
  @IsString()
  APP_TIMEZONE?: string;

  @IsOptional()
  @IsString()
  GEMINI_API_KEY?: string;

  @IsOptional()
  @IsString()
  GEMINI_CHAT_MODEL?: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvValidator, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { whitelist: true });
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}))
      .flat();
    throw new Error(`Env validation failed:\n${messages.join('\n')}`);
  }

  return validated;
}
