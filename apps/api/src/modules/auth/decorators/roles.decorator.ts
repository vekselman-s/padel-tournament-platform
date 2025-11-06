import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@padel/database';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
