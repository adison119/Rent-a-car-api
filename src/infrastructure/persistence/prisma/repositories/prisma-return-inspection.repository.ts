import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { ReturnInspection } from '../../../../domain/return-inspection';
import type { ReturnInspectionRepository } from '../../../../application/ports/return-inspection.repository';

function toDomain(raw: {
  id: string;
  bookingId: string;
  insuranceExpiryAt: Date;
  imagesBeforeUrls: string[];
  imagesAfterUrls: string[];
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ReturnInspection {
  return {
    id: raw.id,
    bookingId: raw.bookingId,
    insuranceExpiryAt: raw.insuranceExpiryAt,
    imagesBeforeUrls: raw.imagesBeforeUrls,
    imagesAfterUrls: raw.imagesAfterUrls,
    note: raw.note ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

@Injectable()
export class PrismaReturnInspectionRepository implements ReturnInspectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<ReturnInspection, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ReturnInspection> {
    const row = await this.prisma.returnInspection.create({
      data: {
        bookingId: data.bookingId,
        insuranceExpiryAt: data.insuranceExpiryAt,
        imagesBeforeUrls: data.imagesBeforeUrls ?? [],
        imagesAfterUrls: data.imagesAfterUrls ?? [],
        note: data.note ?? null,
      },
    });
    return toDomain(row as Parameters<typeof toDomain>[0]);
  }

  async update(
    id: string,
    data: Partial<
      Omit<ReturnInspection, 'id' | 'bookingId' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<ReturnInspection> {
    const row = await this.prisma.returnInspection.update({
      where: { id },
      data: {
        ...(data.insuranceExpiryAt != null && {
          insuranceExpiryAt: data.insuranceExpiryAt,
        }),
        ...(data.imagesBeforeUrls != null && {
          imagesBeforeUrls: data.imagesBeforeUrls,
        }),
        ...(data.imagesAfterUrls != null && {
          imagesAfterUrls: data.imagesAfterUrls,
        }),
        ...(data.note !== undefined && { note: data.note ?? null }),
      },
    });
    return toDomain(row as Parameters<typeof toDomain>[0]);
  }

  async findById(id: string): Promise<ReturnInspection | null> {
    const row = await this.prisma.returnInspection.findUnique({
      where: { id },
    });
    return row ? toDomain(row as Parameters<typeof toDomain>[0]) : null;
  }

  async findByBookingId(bookingId: string): Promise<ReturnInspection | null> {
    const row = await this.prisma.returnInspection.findUnique({
      where: { bookingId },
    });
    return row ? toDomain(row as Parameters<typeof toDomain>[0]) : null;
  }

  async findMany(params?: { bookingId?: string }): Promise<ReturnInspection[]> {
    const rows = await this.prisma.returnInspection.findMany({
      where:
        params?.bookingId != null ? { bookingId: params.bookingId } : undefined,
    });
    return rows.map((r) => toDomain(r as Parameters<typeof toDomain>[0]));
  }
}
