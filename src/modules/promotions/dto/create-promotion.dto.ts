import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum, IsBoolean, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionType } from '../entities/promotion.entity';

export class CreatePromotionDto {
  @ApiProperty({ description: 'Promotion name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Promotion code (optional)' })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ description: 'Promotion type', enum: PromotionType })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)', minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  discountValue: number;

  @ApiPropertyOptional({ description: 'Promotion description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Maximum uses (-1 for unlimited)', default: -1 })
  @IsNumber()
  @IsOptional()
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Whether promotion is active', default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ description: 'Activity ID' })
  @IsNumber()
  activityId: number;
} 