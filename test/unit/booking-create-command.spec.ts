import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BookingCreateCommand,
  BOOKING_CONFLICT_MESSAGE,
} from '../../src/application/use-cases/booking/command/create';
import {
  BOOKING_REPOSITORY,
  CAR_REPOSITORY,
  CUSTOMER_REPOSITORY,
} from '../../src/application/ports/tokens';
import type { Booking } from '../../src/domain/booking';
import type { Car } from '../../src/domain/car';
import type { Customer } from '../../src/domain/customer';
import { PrismaService } from '../../src/infrastructure/persistence/prisma/prisma.service';

const validCustomer: Customer = {
  id: 'cust-1',
  name: 'Test Customer',
  phone: '0812345678',
  contactChannel: 'LINE',
  idDocumentUrls: ['https://example.com/id.jpg'],
  status: 'CUSTOMER',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const validCar: Car = {
  id: 'car-1',
  brand: 'Toyota',
  model: 'Camry',
  year: 2020,
  lastInspectionAt: new Date(),
  rentalPricePerDay: 1500,
  depositPricePerDay: 5000,
  imageUrls: [],
  status: 'available',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const newBooking: Booking = {
  id: 'book-1',
  customerId: 'cust-1',
  carId: 'car-1',
  startAt: new Date('2025-06-01T09:00:00Z'),
  endAt: new Date('2025-06-03T18:00:00Z'),
  pickupType: 'AT_STORE',
  status: 'PENDING',
  rentalPricePerDay: 1500,
  depositPricePerDay: 5000,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const overlappingBooking: Booking = {
  ...newBooking,
  id: 'book-existing',
};

const baseBody = {
  customerId: 'cust-1',
  carId: 'car-1',
  startAt: '2025-06-01T09:00:00.000Z',
  endAt: '2025-06-03T18:00:00.000Z',
  pickupType: 'AT_STORE' as const,
};

describe('BookingCreateCommand', () => {
  let command: BookingCreateCommand;
  let bookingRepo: {
    findOverlappingBookings: jest.Mock;
    create: jest.Mock;
  };
  let customerRepo: { findById: jest.Mock };
  let carRepo: { findById: jest.Mock };
  let prisma: { $transaction: jest.Mock };

  beforeEach(async () => {
    bookingRepo = {
      findOverlappingBookings: jest.fn(),
      create: jest.fn(),
    };
    customerRepo = { findById: jest.fn().mockResolvedValue(validCustomer) };
    carRepo = { findById: jest.fn().mockResolvedValue(validCar) };
    prisma = {
      $transaction: jest.fn((cb: (tx: unknown) => Promise<Booking>) => cb({})),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingCreateCommand,
        { provide: BOOKING_REPOSITORY, useValue: bookingRepo },
        { provide: CUSTOMER_REPOSITORY, useValue: customerRepo },
        { provide: CAR_REPOSITORY, useValue: carRepo },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    command = module.get(BookingCreateCommand);
  });

  it('should create booking when car is available (no overlap)', async () => {
    bookingRepo.findOverlappingBookings.mockResolvedValue([]);
    bookingRepo.create.mockResolvedValue(newBooking);

    const result = await command.execute({ body: baseBody });

    expect(result).toEqual(newBooking);
    expect(bookingRepo.findOverlappingBookings).toHaveBeenCalledWith(
      baseBody.carId,
      new Date(baseBody.startAt),
      new Date(baseBody.endAt),
      expect.anything(),
    );
    expect(bookingRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: baseBody.customerId,
        carId: baseBody.carId,
        pickupType: baseBody.pickupType,
        status: 'PENDING',
        rentalPricePerDay: validCar.rentalPricePerDay,
        depositPricePerDay: validCar.depositPricePerDay,
      }),
      expect.anything(),
    );
  });

  it('should throw ConflictException with message when overlap exists', async () => {
    bookingRepo.findOverlappingBookings.mockResolvedValue([overlappingBooking]);

    await expect(command.execute({ body: baseBody })).rejects.toThrow(
      ConflictException,
    );
    await expect(command.execute({ body: baseBody })).rejects.toThrow(
      BOOKING_CONFLICT_MESSAGE,
    );

    expect(bookingRepo.create).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when customer not found', async () => {
    customerRepo.findById.mockResolvedValue(null);

    await expect(command.execute({ body: baseBody })).rejects.toThrow(
      NotFoundException,
    );
    await expect(command.execute({ body: baseBody })).rejects.toThrow(
      'Customer not found',
    );
  });

  it('should throw NotFoundException when car not found', async () => {
    carRepo.findById.mockResolvedValue(null);

    await expect(command.execute({ body: baseBody })).rejects.toThrow(
      NotFoundException,
    );
    await expect(command.execute({ body: baseBody })).rejects.toThrow(
      'Car not found',
    );
  });

  it('should throw ConflictException when customer is not verified (no docs)', async () => {
    customerRepo.findById.mockResolvedValue({
      ...validCustomer,
      idDocumentUrls: [],
      status: 'VISITOR',
    });

    await expect(command.execute({ body: baseBody })).rejects.toThrow(
      ConflictException,
    );
    await expect(command.execute({ body: baseBody })).rejects.toThrow(
      /ลูกค้าที่จองได้ต้องมีเอกสารยืนยันตัวตน/,
    );
  });
});
