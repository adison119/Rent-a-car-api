import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { Customer } from '../../../../domain/customer';
import type { CustomerRepository } from '../../../../application/ports/customer.repository';

function toDomain(raw: {
  id: string;
  name: string;
  phone: string;
  address: string | null;
  contactChannel: string;
  idDocumentUrls: string[];
  status: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Customer {
  return {
    id: raw.id,
    name: raw.name,
    phone: raw.phone,
    address: raw.address ?? undefined,
    contactChannel: raw.contactChannel as Customer['contactChannel'],
    idDocumentUrls: raw.idDocumentUrls,
    status: (raw.status as Customer['status']) ?? undefined,
    createdById: raw.createdById ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Customer> {
    const row = await this.prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone,
        address: data.address ?? null,
        contactChannel: data.contactChannel,
        idDocumentUrls: data.idDocumentUrls ?? [],
        status: data.status ?? undefined,
        createdById: data.createdById ?? undefined,
      },
    });
    return toDomain(row as Parameters<typeof toDomain>[0]);
  }

  async update(
    id: string,
    data: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Customer> {
    const row = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.phone != null && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address ?? null }),
        ...(data.contactChannel != null && {
          contactChannel: data.contactChannel,
        }),
        ...(data.idDocumentUrls != null && {
          idDocumentUrls: data.idDocumentUrls,
        }),
        ...(data.status !== undefined && { status: data.status ?? null }),
      },
    });
    return toDomain(row as Parameters<typeof toDomain>[0]);
  }

  async findById(id: string): Promise<Customer | null> {
    const row = await this.prisma.customer.findUnique({ where: { id } });
    return row ? toDomain(row as Parameters<typeof toDomain>[0]) : null;
  }

  async findMany(params?: {
    status?: Customer['status'];
  }): Promise<Customer[]> {
    const rows = await this.prisma.customer.findMany({
      where: params?.status != null ? { status: params.status } : undefined,
    });
    return rows.map((r) => toDomain(r as Parameters<typeof toDomain>[0]));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.customer.delete({ where: { id } });
  }
}
