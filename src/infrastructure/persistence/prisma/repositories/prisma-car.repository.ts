import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { Car } from '../../../../domain/car';
import type { CarRepository } from '../../../../application/ports/car.repository';

function toDomain(raw: {
  id: string;
  brand: string;
  model: string;
  year: number;
  lastInspectionAt: Date;
  rentalPricePerDay: { toNumber(): number };
  depositPricePerDay: { toNumber(): number };
  imageUrls: string[];
  status: string;
  plateNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Car {
  const status = raw.status as Car['status'];
  return {
    id: raw.id,
    brand: raw.brand,
    model: raw.model,
    year: raw.year,
    lastInspectionAt: raw.lastInspectionAt,
    rentalPricePerDay:
      typeof raw.rentalPricePerDay === 'object' &&
      'toNumber' in raw.rentalPricePerDay
        ? (raw.rentalPricePerDay as { toNumber(): number }).toNumber()
        : Number(raw.rentalPricePerDay),
    depositPricePerDay:
      typeof raw.depositPricePerDay === 'object' &&
      'toNumber' in raw.depositPricePerDay
        ? (raw.depositPricePerDay as { toNumber(): number }).toNumber()
        : Number(raw.depositPricePerDay),
    imageUrls: raw.imageUrls,
    status,
    plateNumber: raw.plateNumber ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

@Injectable()
export class PrismaCarRepository implements CarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Car> {
    const row = await this.prisma.car.create({
      data: {
        brand: data.brand,
        model: data.model,
        year: data.year,
        lastInspectionAt: data.lastInspectionAt,
        rentalPricePerDay: data.rentalPricePerDay,
        depositPricePerDay: data.depositPricePerDay,
        imageUrls: data.imageUrls ?? [],
        status: (data.status ?? 'AVAILABLE') as
          | 'AVAILABLE'
          | 'MAINTENANCE'
          | 'VOID',
        plateNumber: data.plateNumber,
      },
    });
    return toDomain(row as Parameters<typeof toDomain>[0]);
  }

  async update(
    id: string,
    data: Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Car> {
    const row = await this.prisma.car.update({
      where: { id },
      data: {
        ...(data.brand != null && { brand: data.brand }),
        ...(data.model != null && { model: data.model }),
        ...(data.year != null && { year: data.year }),
        ...(data.lastInspectionAt != null && {
          lastInspectionAt: data.lastInspectionAt,
        }),
        ...(data.rentalPricePerDay != null && {
          rentalPricePerDay: data.rentalPricePerDay,
        }),
        ...(data.depositPricePerDay != null && {
          depositPricePerDay: data.depositPricePerDay,
        }),
        ...(data.imageUrls != null && { imageUrls: data.imageUrls }),
        ...(data.status != null && { status: data.status }),
        ...(data.plateNumber !== undefined && {
          plateNumber: data.plateNumber ?? null,
        }),
      },
    });
    return toDomain(row as Parameters<typeof toDomain>[0]);
  }

  async findById(id: string): Promise<Car | null> {
    const row = await this.prisma.car.findUnique({ where: { id } });
    return row ? toDomain(row as Parameters<typeof toDomain>[0]) : null;
  }

  async findMany(params?: {
    brand?: string;
    model?: string;
    status?: Car['status'];
  }): Promise<Car[]> {
    const rows = await this.prisma.car.findMany({
      where: {
        ...(params?.brand != null &&
          params.brand !== '' && {
            brand: { contains: params.brand, mode: 'insensitive' },
          }),
        ...(params?.model != null &&
          params.model !== '' && {
            model: { contains: params.model, mode: 'insensitive' },
          }),
        ...(params?.status != null && {
          status: params.status as 'AVAILABLE' | 'MAINTENANCE' | 'VOID',
        }),
      },
    });
    return rows.map((r) => toDomain(r as Parameters<typeof toDomain>[0]));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.car.delete({ where: { id } });
  }
}
