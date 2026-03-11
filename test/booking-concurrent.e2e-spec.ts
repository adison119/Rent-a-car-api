import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { VersioningType } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../src/common/validator/env.validator';
import { ApplicationModule } from '../src/application/application.module';
import { HttpModule } from '../src/infrastructure/http/http.module';
import { PersistenceModule } from '../src/infrastructure/persistence/persistence.module';
import { BOOKING_CONFLICT_MESSAGE } from '../src/application/use-cases/booking/command/create';

interface CarCreateResponse {
  id: string;
}
interface CustomerCreateResponse {
  id: string;
}
interface BookingResponse {
  id: string;
  carId: string;
  message?: string;
}

class AllowAllGuard {
  canActivate(): boolean {
    return true;
  }
}

/**
 * E2E: two concurrent booking requests for the same car/period — one must get 201, the other 409.
 * Requires: Postgres running (e.g. docker compose up -d) and DATABASE_URL set; run prisma migrate dev first.
 */
describe('Booking concurrent (e2e)', () => {
  let app: INestApplication<App>;
  let carId: string;
  let customerId1: string;
  let customerId2: string;
  const startAt = '2025-07-01T09:00:00.000Z';
  const endAt = '2025-07-03T18:00:00.000Z';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ envFilePath: '.env', validate, isGlobal: true }),
        PersistenceModule,
        ApplicationModule,
        HttpModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: AllowAllGuard }],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI });
    await app.init();

    const [carRes, cust1Res, cust2Res] = await Promise.all([
      request(app.getHttpServer()).post('/v1/car').send({
        brand: 'Toyota',
        model: 'Camry',
        year: 2022,
        lastInspectionAt: '2025-01-15',
        rentalPricePerDay: 1500,
        depositPricePerDay: 5000,
        status: 'available',
      }),
      request(app.getHttpServer())
        .post('/v1/customer')
        .send({
          name: 'Customer One',
          phone: '0811111111',
          contactChannel: 'LINE',
          status: 'CUSTOMER',
          idDocumentUrls: ['https://example.com/id1.jpg'],
        }),
      request(app.getHttpServer())
        .post('/v1/customer')
        .send({
          name: 'Customer Two',
          phone: '0822222222',
          contactChannel: 'FACEBOOK',
          status: 'CUSTOMER',
          idDocumentUrls: ['https://example.com/id2.jpg'],
        }),
    ]);

    if (
      carRes.status !== 201 ||
      cust1Res.status !== 201 ||
      cust2Res.status !== 201
    ) {
      const all500 =
        carRes.status === 500 &&
        cust1Res.status === 500 &&
        cust2Res.status === 500;
      if (all500) {
        throw new Error(
          'E2E setup failed (likely database not running). Start Postgres first: docker compose up -d',
        );
      }
      throw new Error(
        `Setup failed: car=${carRes.status} cust1=${cust1Res.status} cust2=${cust2Res.status}. ` +
          `Car: ${JSON.stringify(carRes.body)}. Cust1: ${JSON.stringify(cust1Res.body)}. Cust2: ${JSON.stringify(cust2Res.body)}`,
      );
    }
    carId = (carRes.body as CarCreateResponse).id;
    customerId1 = (cust1Res.body as CustomerCreateResponse).id;
    customerId2 = (cust2Res.body as CustomerCreateResponse).id;
  }, 30000);

  afterAll(async () => {
    await app?.close();
  });

  it('when two requests book same car and same period concurrently, only one succeeds (201), the other gets 409', async () => {
    const payload1 = {
      customerId: customerId1,
      carId,
      startAt,
      endAt,
      pickupType: 'AT_STORE',
    };
    const payload2 = {
      customerId: customerId2,
      carId,
      startAt,
      endAt,
      pickupType: 'AT_STORE',
    };

    const [res1, res2] = await Promise.all([
      request(app.getHttpServer()).post('/v1/booking').send(payload1),
      request(app.getHttpServer()).post('/v1/booking').send(payload2),
    ]);

    const statuses = [res1.status, res2.status].sort((a, b) => a - b);
    expect(statuses).toEqual([201, 409]);

    const success = res1.status === 201 ? res1 : res2;
    const conflict = res1.status === 409 ? res1 : res2;

    const successBody = success.body as BookingResponse;
    const conflictBody = conflict.body as { message?: string };
    expect(successBody).toHaveProperty('id');
    expect(successBody.carId).toBe(carId);
    expect(conflictBody.message).toContain(BOOKING_CONFLICT_MESSAGE);
  }, 15000);
});
