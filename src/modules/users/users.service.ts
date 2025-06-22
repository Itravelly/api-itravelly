import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  // Obtener perfil del usuario logueado
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'country', 'countryCode', 'dialCode', 'isEmailVerified', 'isActive', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      ...user,
      role: user.role.name,
    };
  }

  // Obtener todos los usuarios (solo admin/superadmin)
  async findAll(currentUser: any) {
    if (!['admin', 'superadmin'].includes(currentUser.role)) {
      throw new ForbiddenException('No tienes permisos para ver todos los usuarios');
    }

    const users = await this.userRepository.find({
      relations: ['role'],
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'country', 'countryCode', 'dialCode', 'isEmailVerified', 'isActive', 'createdAt', 'updatedAt']
    });

    return users.map(user => ({
      ...user,
      role: user.role.name,
    }));
  }

  // Obtener usuario por ID (solo admin/superadmin)
  async findOne(id: number, currentUser: any) {
    if (!['admin', 'superadmin'].includes(currentUser.role)) {
      throw new ForbiddenException('No tienes permisos para ver otros usuarios');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'country', 'countryCode', 'dialCode', 'isEmailVerified', 'isActive', 'createdAt', 'updatedAt']
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      ...user,
      role: user.role.name,
    };
  }

  // Editar perfil del usuario logueado
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el email ya existe (si se está cambiando)
    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email }
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Verificar si el teléfono ya existe (si se está cambiando)
    if (updateProfileDto.phoneNumber && updateProfileDto.phoneNumber !== user.phoneNumber) {
      const existingUser = await this.userRepository.findOne({
        where: { phoneNumber: updateProfileDto.phoneNumber }
      });

      if (existingUser) {
        throw new ConflictException('El número de teléfono ya está en uso');
      }
    }

    // Actualizar usuario
    Object.assign(user, updateProfileDto);
    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'Perfil actualizado exitosamente',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        country: updatedUser.country,
        countryCode: updatedUser.countryCode,
        dialCode: updatedUser.dialCode,
        isEmailVerified: updatedUser.isEmailVerified,
        isActive: updatedUser.isActive,
      }
    };
  }

  // Editar usuario por ID (solo admin/superadmin)
  async update(id: number, updateUserDto: UpdateUserDto, currentUser: any) {
    if (!['admin', 'superadmin'].includes(currentUser.role)) {
      throw new ForbiddenException('No tienes permisos para editar otros usuarios');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role']
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el email ya existe (si se está cambiando)
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email }
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    // Verificar si el teléfono ya existe (si se está cambiando)
    if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== user.phoneNumber) {
      const existingUser = await this.userRepository.findOne({
        where: { phoneNumber: updateUserDto.phoneNumber }
      });

      if (existingUser) {
        throw new ConflictException('El número de teléfono ya está en uso');
      }
    }

    // Si se está cambiando el rol, verificar que existe
    if (updateUserDto.role) {
      const role = await this.roleRepository.findOne({
        where: { name: updateUserDto.role }
      });

      if (!role) {
        throw new NotFoundException(`Rol '${updateUserDto.role}' no encontrado`);
      }

      user.roleId = role.id;
    }

    // Actualizar usuario
    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);

    // Recargar el usuario con la relación del rol para obtener el nombre actualizado
    const userWithRole = await this.userRepository.findOne({
      where: { id: updatedUser.id },
      relations: ['role']
    });

    return {
      message: 'Usuario actualizado exitosamente',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        country: updatedUser.country,
        countryCode: updatedUser.countryCode,
        dialCode: updatedUser.dialCode,
        isEmailVerified: updatedUser.isEmailVerified,
        isActive: updatedUser.isActive,
        role: userWithRole?.role?.name || user.role?.name,
      }
    };
  }

  // Eliminar usuario (solo admin/superadmin)
  async remove(id: number, currentUser: any) {
    if (!['admin', 'superadmin'].includes(currentUser.role)) {
      throw new ForbiddenException('No tienes permisos para eliminar usuarios');
    }

    // No permitir que un admin se elimine a sí mismo
    if (currentUser.sub === id) {
      throw new ForbiddenException('No puedes eliminar tu propia cuenta');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role']
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // No permitir eliminar superadmins (solo superadmins pueden eliminar superadmins)
    if (user.role?.name === 'superadmin' && currentUser.role !== 'superadmin') {
      throw new ForbiddenException('Solo superadmins pueden eliminar superadmins');
    }

    await this.userRepository.remove(user);

    return {
      message: 'Usuario eliminado exitosamente'
    };
  }
} 