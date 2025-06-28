import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateActivityTypeDto {
  @ApiProperty({ description: 'Activity type name in English' })
  @IsString()
  @IsNotEmpty()
  nameEn: string;

  @ApiProperty({ description: 'Activity type name in Spanish' })
  @IsString()
  @IsNotEmpty()
  nameEs: string;

  @ApiPropertyOptional({ description: 'Activity type description in English' })
  @IsString()
  @IsOptional()
  descriptionEn?: string;

  @ApiPropertyOptional({ description: 'Activity type description in Spanish' })
  @IsString()
  @IsOptional()
  descriptionEs?: string;

  @ApiPropertyOptional({ description: 'Whether the activity type is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 