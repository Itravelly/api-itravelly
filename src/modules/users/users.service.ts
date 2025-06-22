import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { VerificationCode } from '../auth/entities/verification-code.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
  ) {}

  // Obtener perfil del usuario logueado
  async getProfile(userId: number) {
    console.log('🔄 [USERS] Obteniendo perfil para usuario ID:', userId);
    
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['role'],
        select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'country', 'countryCode', 'dialCode', 'isEmailVerified', 'isActive', 'createdAt', 'updatedAt']
      });

      if (!user) {
        console.log('❌ [USERS] Perfil no encontrado para usuario ID:', userId);
        throw new NotFoundException('Usuario no encontrado');
      }

      console.log('✅ [USERS] Perfil obtenido exitosamente para:', user.email);
      return {
        ...user,
        role: user.role.name,
      };
    } catch (error) {
      console.log('❌ [USERS] Error obteniendo perfil:', error.message);
      throw error;
    }
  }

  // Obtener todos los usuarios (solo admin/superadmin)
  async findAll(currentUser: any) {
    console.log('🔄 [USERS] Obteniendo todos los usuarios - Usuario actual:', currentUser.email, 'Rol:', currentUser.role);
    
    try {
      if (!['admin', 'superadmin'].includes(currentUser.role)) {
        console.log('❌ [USERS] Acceso denegado - Usuario no tiene permisos:', currentUser.email);
        throw new ForbiddenException('No tienes permisos para ver todos los usuarios');
      }

      const users = await this.userRepository.find({
        relations: ['role'],
        select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'country', 'countryCode', 'dialCode', 'isEmailVerified', 'isActive', 'createdAt', 'updatedAt']
      });

      console.log('✅ [USERS] Lista de usuarios obtenida exitosamente. Total:', users.length);
      return users.map(user => ({
        ...user,
        role: user.role.name,
      }));
    } catch (error) {
      console.log('❌ [USERS] Error obteniendo lista de usuarios:', error.message);
      throw error;
    }
  }

  // Obtener usuario por ID (solo admin/superadmin)
  async findOne(id: number, currentUser: any) {
    console.log('🔄 [USERS] Obteniendo usuario ID:', id, '- Usuario actual:', currentUser.email);
    
    try {
      if (!['admin', 'superadmin'].includes(currentUser.role)) {
        console.log('❌ [USERS] Acceso denegado - Usuario no tiene permisos:', currentUser.email);
        throw new ForbiddenException('No tienes permisos para ver otros usuarios');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role'],
        select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'country', 'countryCode', 'dialCode', 'isEmailVerified', 'isActive', 'createdAt', 'updatedAt']
      });

      if (!user) {
        console.log('❌ [USERS] Usuario no encontrado ID:', id);
        throw new NotFoundException('Usuario no encontrado');
      }

      console.log('✅ [USERS] Usuario obtenido exitosamente:', user.email);
      return {
        ...user,
        role: user.role.name,
      };
    } catch (error) {
      console.log('❌ [USERS] Error obteniendo usuario:', error.message);
      throw error;
    }
  }

  // Editar perfil del usuario logueado
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    console.log('🔄 [USERS] Actualizando perfil para usuario ID:', userId);
    
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId }
      });

      if (!user) {
        console.log('❌ [USERS] Usuario no encontrado para actualizar perfil ID:', userId);
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar si el email ya existe (si se está cambiando)
      if (updateProfileDto.email && updateProfileDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateProfileDto.email }
        });

        if (existingUser) {
          console.log('❌ [USERS] Email ya en uso:', updateProfileDto.email);
          throw new ConflictException('El email ya está en uso');
        }
      }

      // Verificar si el teléfono ya existe (si se está cambiando)
      if (updateProfileDto.phoneNumber && updateProfileDto.phoneNumber !== user.phoneNumber) {
        const existingUser = await this.userRepository.findOne({
          where: { phoneNumber: updateProfileDto.phoneNumber }
        });

        if (existingUser) {
          console.log('❌ [USERS] Teléfono ya en uso:', updateProfileDto.phoneNumber);
          throw new ConflictException('El número de teléfono ya está en uso');
        }
      }

      // Actualizar usuario
      Object.assign(user, updateProfileDto);
      const updatedUser = await this.userRepository.save(user);

      console.log('✅ [USERS] Perfil actualizado exitosamente para:', updatedUser.email);
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
    } catch (error) {
      console.log('❌ [USERS] Error actualizando perfil:', error.message);
      throw error;
    }
  }

  // Editar usuario por ID (solo admin/superadmin)
  async update(id: number, updateUserDto: UpdateUserDto, currentUser: any) {
    console.log('🔄 [USERS] Actualizando usuario ID:', id, '- Usuario actual:', currentUser.email);
    
    try {
      if (!['admin', 'superadmin'].includes(currentUser.role)) {
        console.log('❌ [USERS] Acceso denegado - Usuario no tiene permisos:', currentUser.email);
        throw new ForbiddenException('No tienes permisos para editar otros usuarios');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role']
      });

      if (!user) {
        console.log('❌ [USERS] Usuario no encontrado para actualizar ID:', id);
        throw new NotFoundException('Usuario no encontrado');
      }

      // Verificar si el email ya existe (si se está cambiando)
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email }
        });

        if (existingUser) {
          console.log('❌ [USERS] Email ya en uso:', updateUserDto.email);
          throw new ConflictException('El email ya está en uso');
        }
      }

      // Verificar si el teléfono ya existe (si se está cambiando)
      if (updateUserDto.phoneNumber && updateUserDto.phoneNumber !== user.phoneNumber) {
        const existingUser = await this.userRepository.findOne({
          where: { phoneNumber: updateUserDto.phoneNumber }
        });

        if (existingUser) {
          console.log('❌ [USERS] Teléfono ya en uso:', updateUserDto.phoneNumber);
          throw new ConflictException('El número de teléfono ya está en uso');
        }
      }

      // Si se está cambiando el rol, verificar que existe
      if (updateUserDto.role) {
        const role = await this.roleRepository.findOne({
          where: { name: updateUserDto.role }
        });

        if (!role) {
          console.log('❌ [USERS] Rol no encontrado:', updateUserDto.role);
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

      console.log('✅ [USERS] Usuario actualizado exitosamente:', updatedUser.email);
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
    } catch (error) {
      console.log('❌ [USERS] Error actualizando usuario:', error.message);
      throw error;
    }
  }

  // Eliminar usuario (solo admin/superadmin)
  async remove(id: number, currentUser: any) {
    console.log('🔄 [USERS] Eliminando usuario ID:', id, '- Usuario actual:', currentUser.email);
    
    try {
      if (!['admin', 'superadmin'].includes(currentUser.role)) {
        console.log('❌ [USERS] Acceso denegado - Usuario no tiene permisos:', currentUser.email);
        throw new ForbiddenException('No tienes permisos para eliminar usuarios');
      }

      // No permitir que un admin se elimine a sí mismo
      if (currentUser.sub === id) {
        console.log('❌ [USERS] Intento de auto-eliminación bloqueado:', currentUser.email);
        throw new ForbiddenException('No puedes eliminar tu propia cuenta');
      }

      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['role']
      });

      if (!user) {
        console.log('❌ [USERS] Usuario no encontrado para eliminar ID:', id);
        throw new NotFoundException('Usuario no encontrado');
      }

      // No permitir eliminar superadmins (solo superadmins pueden eliminar superadmins)
      if (user.role?.name === 'superadmin' && currentUser.role !== 'superadmin') {
        console.log('❌ [USERS] Intento de eliminar superadmin sin permisos:', currentUser.email);
        throw new ForbiddenException('Solo superadmins pueden eliminar superadmins');
      }

      // Eliminar primero los códigos de verificación asociados al usuario
      console.log('🗑️ [USERS] Eliminando códigos de verificación para usuario ID:', id);
      await this.verificationCodeRepository.delete({ userId: id });

      // Eliminar el usuario
      await this.userRepository.remove(user);
      console.log('✅ [USERS] Usuario eliminado exitosamente:', user.email);

      return {
        message: 'Usuario eliminado exitosamente'
      };
    } catch (error) {
      console.log('❌ [USERS] Error eliminando usuario:', error.message);
      throw error;
    }
  }

  // Eliminar todos los usuarios (solo superadmin)
  async removeAll(currentUser: any) {
    console.log('🔄 [USERS] Eliminando todos los usuarios - Usuario actual:', currentUser.email);
    
    try {
      if (currentUser.role !== 'superadmin') {
        console.log('❌ [USERS] Acceso denegado - Solo superadmins pueden eliminar todos los usuarios:', currentUser.email);
        throw new ForbiddenException('Solo superadmins pueden eliminar todos los usuarios');
      }

      // Obtener todos los usuarios excepto el superadmin actual
      const users = await this.userRepository.find({
        where: { id: Not(currentUser.sub) }
      });

      if (users.length === 0) {
        console.log('ℹ️ [USERS] No hay usuarios para eliminar');
        return {
          message: 'No hay usuarios para eliminar',
          deletedCount: 0
        };
      }

      // Eliminar primero todos los códigos de verificación
      console.log('🗑️ [USERS] Eliminando todos los códigos de verificación');
      await this.verificationCodeRepository.delete({});

      // Eliminar todos los usuarios
      await this.userRepository.remove(users);
      console.log('✅ [USERS] Todos los usuarios eliminados exitosamente. Total eliminados:', users.length);

      return {
        message: 'Todos los usuarios eliminados exitosamente',
        deletedCount: users.length
      };
    } catch (error) {
      console.log('❌ [USERS] Error eliminando todos los usuarios:', error.message);
      throw error;
    }
  }
} 