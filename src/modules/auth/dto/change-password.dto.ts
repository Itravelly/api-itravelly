import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Contraseña actual' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ 
    description: 'Nueva contraseña (mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial)',
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
  newPassword: string;

  @ApiProperty({ description: 'Confirmación de la nueva contraseña' })
  @IsString()
  confirmPassword: string;
} 