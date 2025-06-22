import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthThrottleGuard } from './guards/auth-throttle.guard';
import { SecurityInterceptor } from '../../common/interceptors/security.interceptor';

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
} 