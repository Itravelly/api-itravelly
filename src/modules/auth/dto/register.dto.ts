import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../users/entities/role.entity';

export class RegisterDto {
  @ApiProperty({ description: 'Nombre del usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ description: 'Apellido del usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ description: 'Número de celular' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ description: 'Correo electrónico' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'País de residencia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  country: string;

  @ApiProperty({ description: 'Código del país (ej: PA)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  countryCode: string;

  @ApiProperty({ description: 'Código de marcación del país (ej: +507, +1)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  @Matches(/^\+\d{1,4}$/, { message: 'El código de marcación debe tener el formato +XXX (ej: +507, +1)' })
  dialCode: string;

  @ApiProperty({ 
    description: 'Contraseña (mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial)',
    minLength: 8,
    maxLength: 100
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/,
    { 
      message: 'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&#)' 
    }
  )
  password: string;

  @ApiProperty({ 
    description: 'Rol del usuario (opcional, por defecto: client)', 
    enum: UserRole, 
    required: false,
    default: UserRole.CLIENT 
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
} 