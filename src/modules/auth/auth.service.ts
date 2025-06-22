import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Role, UserRole } from '../users/entities/role.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { EmailService } from './email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(VerificationCode)
    private verificationCodeRepository: Repository<VerificationCode>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    console.log('🔄 [AUTH] Iniciando registro para:', registerDto.email);
    
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: [
          { email: registerDto.email },
          { phoneNumber: registerDto.phoneNumber },
        ],
      });

      if (existingUser) {
        console.log('❌ [AUTH] Registro fallido - Usuario ya existe:', registerDto.email);
        throw new ConflictException('El usuario ya existe con este email o teléfono');
      }

      // Obtener el rol (especificado o por defecto)
      const roleName = registerDto.role || UserRole.CLIENT;
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (!role) {
        console.log('❌ [AUTH] Registro fallido - Rol no encontrado:', roleName);
        throw new NotFoundException(`Rol '${roleName}' no encontrado`);
      }

      // Crear el usuario
      const user = this.userRepository.create({
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        phoneNumber: registerDto.phoneNumber,
        email: registerDto.email,
        country: registerDto.country,
        countryCode: registerDto.countryCode,
        dialCode: registerDto.dialCode,
        password: registerDto.password,
        roleId: role.id,
      });

      const savedUser = await this.userRepository.save(user);
      console.log('✅ [AUTH] Usuario registrado exitosamente:', savedUser.email, 'ID:', savedUser.id);

      // Generar y enviar código de verificación
      await this.generateAndSendVerificationCode(savedUser.email, savedUser.id);

      return {
        message: 'Usuario registrado exitosamente. Se ha enviado un código de verificación a tu email.',
        userId: savedUser.id,
        role: role.name,
      };
    } catch (error) {
      console.log('❌ [AUTH] Error en registro:', error.message);
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    console.log('🔄 [AUTH] Iniciando login para:', loginDto.email);
    
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
        relations: ['role'],
      });

      if (!user) {
        console.log('❌ [AUTH] Login fallido - Usuario no encontrado:', loginDto.email);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      const isPasswordValid = await user.validatePassword(loginDto.password);
      if (!isPasswordValid) {
        console.log('❌ [AUTH] Login fallido - Contraseña incorrecta para:', loginDto.email);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      if (!user.isEmailVerified) {
        console.log('❌ [AUTH] Login fallido - Email no verificado:', loginDto.email);
        throw new UnauthorizedException('Debes verificar tu email antes de iniciar sesión');
      }

      const payload = {
        sub: user.id,
        email: user.email,
        role: user.role.name,
      };

      const token = this.jwtService.sign(payload);
      console.log('✅ [AUTH] Login exitoso para:', user.email, 'Rol:', user.role.name, 'ID:', user.id);

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name,
        },
      };
    } catch (error) {
      console.log('❌ [AUTH] Error en login:', error.message);
      throw error;
    }
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    console.log('🔄 [AUTH] Verificando email para:', verifyEmailDto.email, 'Código:', verifyEmailDto.code);
    
    try {
      const verificationCode = await this.verificationCodeRepository.findOne({
        where: {
          code: verifyEmailDto.code,
          email: verifyEmailDto.email,
          isUsed: false,
        },
      });

      if (!verificationCode) {
        console.log('❌ [AUTH] Verificación fallida - Código inválido para:', verifyEmailDto.email);
        throw new NotFoundException('Código de verificación inválido');
      }

      if (new Date() > verificationCode.expiresAt) {
        console.log('❌ [AUTH] Verificación fallida - Código expirado para:', verifyEmailDto.email);
        throw new UnauthorizedException('Código de verificación expirado');
      }

      // Marcar código como usado
      verificationCode.isUsed = true;
      await this.verificationCodeRepository.save(verificationCode);

      // Marcar usuario como verificado
      const user = await this.userRepository.findOne({
        where: { email: verifyEmailDto.email },
      });

      if (user) {
        user.isEmailVerified = true;
        await this.userRepository.save(user);
        console.log('✅ [AUTH] Email verificado exitosamente para:', verifyEmailDto.email);
      }

      return {
        message: 'Email verificado exitosamente',
      };
    } catch (error) {
      console.log('❌ [AUTH] Error en verificación de email:', error.message);
      throw error;
    }
  }

  async generateAndSendVerificationCode(email: string, userId: number) {
    console.log('🔄 [AUTH] Generando código de verificación para:', email);
    
    try {
      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Crear registro de verificación
      const verificationCode = this.verificationCodeRepository.create({
        code,
        email,
        userId,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos
      });

      await this.verificationCodeRepository.save(verificationCode);
      console.log('✅ [AUTH] Código de verificación generado para:', email, 'Código:', code);

      // Enviar email
      await this.emailService.sendVerificationEmail(email, code);

      return verificationCode;
    } catch (error) {
      console.log('❌ [AUTH] Error generando código de verificación:', error.message);
      throw error;
    }
  }

  async resendVerificationCode(email: string) {
    console.log('🔄 [AUTH] Reenviando código de verificación para:', email);
    
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });

      if (!user) {
        console.log('❌ [AUTH] Reenvío fallido - Usuario no encontrado:', email);
        throw new NotFoundException('Usuario no encontrado');
      }

      if (user.isEmailVerified) {
        console.log('❌ [AUTH] Reenvío fallido - Email ya verificado:', email);
        throw new ConflictException('El email ya está verificado');
      }

      await this.generateAndSendVerificationCode(email, user.id);
      console.log('✅ [AUTH] Código de verificación reenviado exitosamente para:', email);

      return {
        message: 'Código de verificación reenviado exitosamente',
      };
    } catch (error) {
      console.log('❌ [AUTH] Error reenviando código de verificación:', error.message);
      throw error;
    }
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    console.log('🔄 [AUTH] Cambiando contraseña para usuario ID:', userId);
    
    try {
      // Validar que las contraseñas coincidan
      if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
        console.log('❌ [AUTH] Cambio de contraseña fallido - Las contraseñas no coinciden');
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        console.log('❌ [AUTH] Cambio de contraseña fallido - Usuario no encontrado ID:', userId);
        throw new NotFoundException('Usuario no encontrado');
      }

      const isPasswordValid = await user.validatePassword(changePasswordDto.currentPassword);
      if (!isPasswordValid) {
        console.log('❌ [AUTH] Cambio de contraseña fallido - Contraseña actual incorrecta para:', user.email);
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }

      // Validar que la nueva contraseña sea diferente a la actual
      const isNewPasswordSame = await user.validatePassword(changePasswordDto.newPassword);
      if (isNewPasswordSame) {
        console.log('❌ [AUTH] Cambio de contraseña fallido - Nueva contraseña igual a la actual para:', user.email);
        throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
      }

      user.password = changePasswordDto.newPassword;
      await this.userRepository.save(user);
      console.log('✅ [AUTH] Contraseña cambiada exitosamente para:', user.email);

      return {
        message: 'Contraseña cambiada exitosamente',
      };
    } catch (error) {
      console.log('❌ [AUTH] Error cambiando contraseña:', error.message);
      throw error;
    }
  }

  async adminChangePassword(adminChangePasswordDto: AdminChangePasswordDto, currentUser: any) {
    console.log('🔄 [AUTH] Admin cambiando contraseña para usuario ID:', adminChangePasswordDto.userId, '- Admin:', currentUser.email);
    
    try {
      // Verificar permisos de admin
      if (!['admin', 'superadmin'].includes(currentUser.role)) {
        console.log('❌ [AUTH] Acceso denegado - Usuario no tiene permisos:', currentUser.email);
        throw new ForbiddenException('No tienes permisos para cambiar contraseñas de otros usuarios');
      }

      // Validar que las contraseñas coincidan
      if (adminChangePasswordDto.newPassword !== adminChangePasswordDto.confirmPassword) {
        console.log('❌ [AUTH] Cambio de contraseña fallido - Las contraseñas no coinciden');
        throw new BadRequestException('Las contraseñas no coinciden');
      }

      const user = await this.userRepository.findOne({
        where: { id: adminChangePasswordDto.userId },
        relations: ['role']
      });

      if (!user) {
        console.log('❌ [AUTH] Cambio de contraseña fallido - Usuario no encontrado ID:', adminChangePasswordDto.userId);
        throw new NotFoundException('Usuario no encontrado');
      }

      // No permitir que un admin cambie la contraseña de un superadmin (solo superadmins pueden)
      if (user.role?.name === 'superadmin' && currentUser.role !== 'superadmin') {
        console.log('❌ [AUTH] Acceso denegado - Admin intentando cambiar contraseña de superadmin:', currentUser.email);
        throw new ForbiddenException('Solo superadmins pueden cambiar contraseñas de superadmins');
      }

      user.password = adminChangePasswordDto.newPassword;
      await this.userRepository.save(user);
      console.log('✅ [AUTH] Contraseña cambiada exitosamente por admin para:', user.email);

      return {
        message: 'Contraseña cambiada exitosamente',
      };
    } catch (error) {
      console.log('❌ [AUTH] Error cambiando contraseña por admin:', error.message);
      throw error;
    }
  }

  // Método para verificar si un usuario existe (solo para debugging)
  async checkUser(email: string) {
    console.log('🔍 [AUTH] Verificando usuario:', email);
    
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['role'],
        select: ['id', 'email', 'firstName', 'lastName', 'isEmailVerified', 'isActive', 'createdAt']
      });

      if (!user) {
        console.log('❌ [AUTH] Usuario no encontrado:', email);
        return { exists: false };
      }

      console.log('✅ [AUTH] Usuario encontrado:', {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        role: user.role?.name,
        createdAt: user.createdAt
      });

      return { 
        exists: true, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          role: user.role?.name,
          createdAt: user.createdAt
        }
      };
    } catch (error) {
      console.log('❌ [AUTH] Error verificando usuario:', error.message);
      throw error;
    }
  }

  // Método para probar contraseñas (solo para debugging)
  async testPassword(email: string, password: string) {
    console.log('🔍 [AUTH] Probando contraseña para:', email);
    
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'isEmailVerified', 'isActive']
      });

      if (!user) {
        console.log('❌ [AUTH] Usuario no encontrado:', email);
        return { 
          exists: false, 
          message: 'Usuario no encontrado' 
        };
      }

      console.log('✅ [AUTH] Usuario encontrado:', {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive
      });

      // Probar la contraseña
      const isPasswordValid = await user.validatePassword(password);
      console.log('🔐 [AUTH] Resultado de validación de contraseña:', isPasswordValid);

      return { 
        exists: true, 
        isPasswordValid,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        message: isPasswordValid ? 'Contraseña correcta' : 'Contraseña incorrecta'
      };
    } catch (error) {
      console.log('❌ [AUTH] Error probando contraseña:', error.message);
      throw error;
    }
  }
} 