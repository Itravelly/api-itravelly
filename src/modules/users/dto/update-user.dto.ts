import { IsString, IsEmail, IsOptional, MaxLength, Matches, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/role.entity';

export class UpdateUserDto {
  @ApiProperty({ description: 'Nombre del usuario', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({ description: 'Apellido del usuario', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ description: 'Número de celular', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ description: 'Correo electrónico', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'País de residencia', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ description: 'Código del país (ej: PA)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  countryCode?: string;

  @ApiProperty({ description: 'Código de marcación del país (ej: +507, +1)', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Matches(/^\+\d{1,4}$/, { message: 'El código de marcación debe tener el formato +XXX (ej: +507, +1)' })
  dialCode?: string;

  @ApiProperty({ description: 'Rol del usuario', enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({ description: 'Si el email está verificado', required: false })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiProperty({ description: 'Si el usuario está activo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 