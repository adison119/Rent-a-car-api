import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { validate } from './common/validator/env.validator';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionsGuard } from './common/guards/permissions.guard';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { ApplicationModule } from './application/application.module';
import { HttpModule } from './infrastructure/http/http.module';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validate,
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 20 }],
      getTracker: (req: Record<string, unknown>) =>
        (req.user as { id?: string } | undefined)?.id ??
        (req as { ip?: string }).ip ??
        'unknown',
    }),
    PersistenceModule,
    ApplicationModule,
    HttpModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
