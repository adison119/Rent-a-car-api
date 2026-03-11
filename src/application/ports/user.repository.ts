/**
 * Application port: user persistence.
 * Implemented by Prisma in infrastructure/persistence/prisma.
 */
import type { User } from '../../domain/user';

/** User with password (for login verification only). */
export type UserWithPassword = User & { password: string };

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** For login: returns user with password so use-case can verify. */
  findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
}
