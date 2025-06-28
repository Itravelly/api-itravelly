import { IsString, IsNotEmpty, IsOptional, IsArray, IsNumber, IsBoolean, IsEnum, IsObject, Min, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityStatus, PricingType } from '../entities/activity.entity';

export class AvailabilityHoursDto {
  @ApiPropertyOptional({ description: 'Monday availability hours' })
  @IsOptional()
  monday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Tuesday availability hours' })
  @IsOptional()
  tuesday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Wednesday availability hours' })
  @IsOptional()
  wednesday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Thursday availability hours' })
  @IsOptional()
  thursday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Friday availability hours' })
  @IsOptional()
  friday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Saturday availability hours' })
  @IsOptional()
  saturday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Sunday availability hours' })
  @IsOptional()
  sunday?: { start: string; end: string };
}

export class FaqDto {
  @ApiProperty({ description: 'FAQ question' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'FAQ answer' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class CreateActivityDto {
  @ApiProperty({ description: 'Activity name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Departure location' })
  @IsString()
  @IsNotEmpty()
  departureLocation: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ description: 'Province/State' })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty({ description: 'Department/City' })
  @IsString()
  @IsNotEmpty()
  department: string;

  @ApiProperty({ description: 'Full address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Activity images URLs', isArray: true })
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @ApiProperty({ description: 'Activity type ID' })
  @IsNumber()
  activityTypeId: number;

  @ApiProperty({ description: 'Branch ID' })
  @IsNumber()
  branchId: number;

  @ApiPropertyOptional({ description: 'Previous price' })
  @IsNumber()
  @IsOptional()
  previousPrice?: number;

  @ApiProperty({ description: 'Current price' })
  @IsNumber()
  @Min(0)
  currentPrice: number;

  @ApiProperty({ description: 'Pricing type', enum: PricingType })
  @IsEnum(PricingType)
  pricingType: PricingType;

  @ApiProperty({ description: 'Group size', minimum: 1 })
  @IsNumber()
  @Min(1)
  groupSize: number;

  @ApiProperty({ description: 'Whether activity applies promotions' })
  @IsBoolean()
  appliesPromo: boolean;

  @ApiPropertyOptional({ description: 'Payment methods', isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  paymentMethods?: string[];

  @ApiProperty({ description: 'Maximum capacity per time slot' })
  @IsNumber()
  @Min(1)
  maxCapacityPerTimeSlot: number;

  @ApiProperty({ description: 'Activity instructions' })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiPropertyOptional({ description: 'Activity amenities', isArray: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  amenities?: string[];

  @ApiPropertyOptional({ description: 'Frequently asked questions', isArray: true, type: FaqDto })
  @IsArray()
  @IsObject({ each: true })
  @IsOptional()
  faqs?: FaqDto[];

  @ApiProperty({ description: 'Activity status', enum: ActivityStatus })
  @IsEnum(ActivityStatus)
  status: ActivityStatus;

  @ApiProperty({ description: 'Daily booking limit', minimum: 1 })
  @IsNumber()
  @Min(1)
  dailyBookingLimit: number;

  @ApiProperty({ description: 'Activity duration (HH:MM format)' })
  @IsString()
  @IsNotEmpty()
  duration: string;

  @ApiProperty({ description: 'Availability hours' })
  @IsObject()
  availabilityHours: AvailabilityHoursDto;

  @ApiPropertyOptional({ description: 'Activity description' })
  @IsString()
  @IsOptional()
  description?: string;
} 