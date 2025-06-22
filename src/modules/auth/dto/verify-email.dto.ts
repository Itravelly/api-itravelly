import { IsString, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Código de verificación de 6 dígitos' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;

  @ApiProperty({ description: 'Correo electrónico' })
  @IsString()
  @IsNotEmpty()
  email: string;
} 