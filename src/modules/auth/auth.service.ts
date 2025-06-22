import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { Role, UserRole } from '../users/entities/role.entity';
import { VerificationCode } from './entities/verification-code.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
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
    // Verificar si el usuario ya existe
    const existingUser = await this.userRepository.findOne({
      where: [
        { email: registerDto.email },
        { phoneNumber: registerDto.phoneNumber },
      ],
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe con este email o teléfono');
    }

    // Obtener el rol por defecto (client)
    const role = await this.roleRepository.findOne({
      where: { name: UserRole.CLIENT },
    });

    if (!role) {
      throw new NotFoundException('Rol no encontrado');
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

    // Generar y enviar código de verificación
    await this.generateAndSendVerificationCode(savedUser.email, savedUser.id);

    return {
      message: 'Usuario registrado exitosamente. Se ha enviado un código de verificación a tu email.',
      userId: savedUser.id,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role'],
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await user.validatePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Debes verificar tu email antes de iniciar sesión');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        code: verifyEmailDto.code,
        email: verifyEmailDto.email,
        isUsed: false,
      },
    });

    if (!verificationCode) {
      throw new NotFoundException('Código de verificación inválido');
    }

    if (new Date() > verificationCode.expiresAt) {
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
    }

    return {
      message: 'Email verificado exitosamente',
    };
  }

  async generateAndSendVerificationCode(email: string, userId: number) {
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

    // Enviar email
    await this.emailService.sendVerificationEmail(email, code);

    return verificationCode;
  }

  async resendVerificationCode(email: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.isEmailVerified) {
      throw new ConflictException('El email ya está verificado');
    }

    await this.generateAndSendVerificationCode(email, user.id);

    return {
      message: 'Código de verificación reenviado exitosamente',
    };
  }
} 