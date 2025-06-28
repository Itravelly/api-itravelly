import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/role.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles); 