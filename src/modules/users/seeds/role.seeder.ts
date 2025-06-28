import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
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
        nameEs: 'cliente',
        nameEn: 'client',
        description: 'Usuario cliente con acceso básico',
        descriptionEs: 'Usuario cliente con acceso básico',
        descriptionEn: 'Client user with basic access',
      },
      {
        name: UserRole.ADMIN,
        nameEs: 'administrador',
        nameEn: 'admin',
        description: 'Administrador con acceso moderado',
        descriptionEs: 'Administrador con acceso moderado',
        descriptionEn: 'Administrator with moderate access',
      },
      {
        name: UserRole.SUPERADMIN,
        nameEs: 'super administrador',
        nameEn: 'super admin',
        description: 'Super administrador con acceso completo',
        descriptionEs: 'Super administrador con acceso completo',
        descriptionEn: 'Super administrator with full access',
      },
      {
        name: UserRole.EDITOR,
        nameEs: 'editor',
        nameEn: 'editor',
        description: 'Editor con permisos de contenido',
        descriptionEs: 'Editor con permisos de contenido',
        descriptionEn: 'Editor with content permissions',
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

export const roleSeeder = async (dataSource: DataSource) => {
  const roleRepository = dataSource.getRepository(Role);

  const roles = [
    {
      name: UserRole.CLIENT,
      nameEs: 'cliente',
      nameEn: 'client',
      description: 'Usuario cliente con acceso básico',
      descriptionEs: 'Usuario cliente con acceso básico',
      descriptionEn: 'Client user with basic access',
    },
    {
      name: UserRole.ADMIN,
      nameEs: 'administrador',
      nameEn: 'admin',
      description: 'Administrador con acceso moderado',
      descriptionEs: 'Administrador con acceso moderado',
      descriptionEn: 'Administrator with moderate access',
    },
    {
      name: UserRole.SUPERADMIN,
      nameEs: 'super administrador',
      nameEn: 'super admin',
      description: 'Super administrador con acceso completo',
      descriptionEs: 'Super administrador con acceso completo',
      descriptionEn: 'Super administrator with full access',
    },
    {
      name: UserRole.EDITOR,
      nameEs: 'editor',
      nameEn: 'editor',
      description: 'Editor con permisos de contenido',
      descriptionEs: 'Editor con permisos de contenido',
      descriptionEn: 'Editor with content permissions',
    },
  ];

  for (const roleData of roles) {
    const existingRole = await roleRepository.findOne({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      await roleRepository.save(roleData);
      console.log(`Created role: ${roleData.name}`);
    } else {
      console.log(`Role already exists: ${roleData.name}`);
    }
  }
}; 