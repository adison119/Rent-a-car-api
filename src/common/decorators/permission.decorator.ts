import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from '../guards/permissions.guard';

/**
 * Require one of the given permissions (RBAC).
 * Used with PermissionsGuard.
 */
export const Permission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
