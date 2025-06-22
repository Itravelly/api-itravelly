import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
} 