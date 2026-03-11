import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { User } from '../../../../domain/user';
import type { UserRepository as IUserRepository } from '../../../../application/ports/user.repository';

function toDomain(raw: {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name ?? undefined,
    role: raw.role ?? undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row ? toDomain(row as Parameters<typeof toDomain>[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return row ? toDomain(row as Parameters<typeof toDomain>[0]) : null;
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<
    | import('../../../../application/ports/user.repository').UserWithPassword
    | null
  > {
    const row = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!row) return null;
    const user = toDomain(row as Parameters<typeof toDomain>[0]);
    const withPassword = row as { password: string };
    return { ...user, password: withPassword.password };
  }
}
