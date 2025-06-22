import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, UserRole } from '../entities/role.entity';

@Injectable()
export class RoleSeeder {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async seed() {
    const roles = [
      {
        name: UserRole.CLIENT,
        description: 'Usuario cliente con acceso básico',
      },
      {
        name: UserRole.ADMIN,
        description: 'Administrador con acceso moderado',
      },
      {
        name: UserRole.SUPERADMIN,
        description: 'Super administrador con acceso completo',
      },
      {
        name: UserRole.EDITOR,
        description: 'Editor con permisos de contenido',
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        await this.roleRepository.save(roleData);
        console.log(`Rol ${roleData.name} creado`);
      } else {
        console.log(`Rol ${roleData.name} ya existe`);
      }
    }
  }
} 