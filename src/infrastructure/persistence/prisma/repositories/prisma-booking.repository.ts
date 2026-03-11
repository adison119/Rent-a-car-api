import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { Booking } from '../../../../domain/booking';
import type { BookingRepository } from '../../../../application/ports/booking.repository';
import type { TransactionClient } from '../../../../application/ports/booking.repository';

function decimalToNumber(v: unknown): number {
  if (typeof v === 'number') return v;
  if (v != null && typeof v === 'object' && 'toNumber' in v)
    return (v as { toNumber(): number }).toNumber();
  return Number(v);
}

function toDomain(raw: {
  id: string;
  customerId: string;
  carId: string;
  startAt: Date;
  endAt: Date;
  pickupType: string;
  deliveryAddress: string | null;
  deliveryNote: string | null;
  status: string;
  rentalPricePerDay: unknown;
  depositPricePerDay: unknown;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Booking {
  return {
    id: raw.id,
    customerId: raw.customerId,
    carId: raw.carId,
    startAt: raw.startAt,
    endAt: raw.endAt,
    pickupType: raw.pickupType as Booking['pickupType'],
    deliveryAddress: raw.deliveryAddress ?? undefined,
    deliveryNote: raw.deliveryNote ?? undefined,
    status: raw.status as Booking['status'],
    rentalPricePerDay: decimalToNumber(raw.rentalPricePerDay),
    depositPricePerDay: decimalToNumber(raw.depositPricePerDay),
    createdById: raw.createdById ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

const ACTIVE_STATUSES: Booking['status'][] = ['PENDING', 'CONFIRMED', 'ACTIVE'];

@Injectable()
export class PrismaBookingRepository implements BookingRepository {
  constructor(private readonly prisma: PrismaService) {}

  private client(tx?: TransactionClient): PrismaService {
    return (tx as PrismaService) ?? this.prisma;
  }

  async create(
    data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>,
    tx?: TransactionClient,
  ): Promise<Booking> {
    const client = this.client(tx);
    const row = await client.booking.create({
      data: {
        customerId: data.customerId,
        carId: data.carId,
        startAt: data.startAt,
        endAt: data.endAt,
        pickupType: data.pickupType,
        deliveryAddress: data.deliveryAddress ?? null,
        deliveryNote: data.deliveryNote ?? null,
        status: data.status,
        rentalPricePerDay: data.rentalPricePerDay,
        depositPricePerDay: data.depositPricePerDay,
        createdById: data.createdById ?? null,
      },
    });
    return toDomain(row as Parameters<typeof toDomain>[0]);
  }

  async update(
    id: string,
    data: Partial<
      Omit<
        Booking,
        | 'id'
        | 'customerId'
        | 'carId'
        | 'startAt'
        | 'endAt'
        | 'rentalPricePerDay'
        | 'depositPricePerDay'
        | 'createdAt'
        | 'updatedAt'
      >
    >,
  ): Promise<Booking> {
    const row = await this.prisma.booking.update({
      where: { id },
      data: {
        ...(data.status != null && { status: data.status }),
        ...(data.pickupType != null && { pickupType: data.pickupType }),
        ...(data.deliveryAddress !== undefined && {
          deliveryAddress: data.deliveryAddress ?? null,
        }),
        ...(data.deliveryNote !== undefined && {
          deliveryNote: data.deliveryNote ?? null,
        }),
        ...(data.createdById !== undefined && {
          createdById: data.createdById ?? null,
        }),
      },
    });
    return toDomain(row as Parameters<typeof toDomain>[0]);
  }

  async findById(id: string): Promise<Booking | null> {
    const row = await this.prisma.booking.findUnique({ where: { id } });
    return row ? toDomain(row as Parameters<typeof toDomain>[0]) : null;
  }

  async findMany(params?: {
    customerId?: string;
    carId?: string;
    status?: Booking['status'];
  }): Promise<Booking[]> {
    const rows = await this.prisma.booking.findMany({
      where: {
        ...(params?.customerId != null && { customerId: params.customerId }),
        ...(params?.carId != null && { carId: params.carId }),
        ...(params?.status != null && { status: params.status }),
      },
    });
    return rows.map((r) => toDomain(r as Parameters<typeof toDomain>[0]));
  }

  async findOverlappingBookings(
    carId: string,
    startAt: Date,
    endAt: Date,
    tx?: TransactionClient,
  ): Promise<Booking[]> {
    const client = this.client(tx);
    const rows = await client.booking.findMany({
      where: {
        carId,
        status: { in: ACTIVE_STATUSES },
        OR: [
          { startAt: { lte: startAt }, endAt: { gt: startAt } },
          { startAt: { lt: endAt }, endAt: { gte: endAt } },
          { startAt: { gte: startAt }, endAt: { lte: endAt } },
        ],
      },
    });
    return rows.map((r) => toDomain(r as Parameters<typeof toDomain>[0]));
  }
}
