import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, UseInterceptors, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminChangePasswordDto } from './dto/admin-change-password.dto';
import { AuthThrottleGuard } from './guards/auth-throttle.guard';
import { SecurityInterceptor } from '../../common/interceptors/security.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
@UseGuards(ThrottlerGuard)
@UseInterceptors(SecurityInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { ttl: 300, limit: 5 } }) // 5 requests por 5 minutos
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Usuario registrado exitosamente' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El usuario ya existe' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' 
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300, limit: 10 } }) // 10 requests por 5 minutos
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Login exitoso' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiados intentos de login. Intenta de nuevo más tarde.' 
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300, limit: 10 } }) // 10 requests por 5 minutos
  @ApiOperation({ summary: 'Verificar email con código' })
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verificado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Código de verificación inválido' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' 
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300, limit: 3 } }) // 3 requests por 5 minutos
  @ApiOperation({ summary: 'Reenviar código de verificación' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email del usuario'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Código reenviado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' 
  })
  async resendVerificationCode(@Body('email') email: string) {
    return this.authService.resendVerificationCode(email);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña del usuario logueado' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña cambiada exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' 
  })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto, @Request() req) {
    return this.authService.changePassword(req.user.sub, changePasswordDto);
  }

  @Post('admin-change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cambiar contraseña de otro usuario (solo admin/superadmin)' })
  @ApiBody({ type: AdminChangePasswordDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Contraseña cambiada exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para cambiar contraseñas de otros usuarios' 
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' 
  })
  async adminChangePassword(@Body() adminChangePasswordDto: AdminChangePasswordDto, @Request() req) {
    return this.authService.adminChangePassword(adminChangePasswordDto, req.user);
  }

  @Post('check-user')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar si un usuario existe (solo para debugging)' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email del usuario a verificar'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Información del usuario' 
  })
  async checkUser(@Body('email') email: string) {
    return this.authService.checkUser(email);
  }

  @Post('test-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Probar contraseña de un usuario (solo para debugging)' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email del usuario'
        },
        password: {
          type: 'string',
          description: 'Contraseña a probar'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Resultado de la prueba de contraseña' 
  })
  async testPassword(@Body('email') email: string, @Body('password') password: string) {
    return this.authService.testPassword(email, password);
  }
} 