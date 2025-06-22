import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { VerificationCode } from './entities/verification-code.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, VerificationCode]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '24h' 
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
  exports: [AuthService],
})
export class AuthModule {} 