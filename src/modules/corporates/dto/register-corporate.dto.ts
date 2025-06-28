import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray, IsEnum, IsObject, IsBoolean, IsNumber, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, OperationMode } from '../entities/corporate.entity';

export class BusinessHoursDto {
  @ApiPropertyOptional({ description: 'Monday business hours' })
  @IsOptional()
  monday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Tuesday business hours' })
  @IsOptional()
  tuesday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Wednesday business hours' })
  @IsOptional()
  wednesday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Thursday business hours' })
  @IsOptional()
  thursday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Friday business hours' })
  @IsOptional()
  friday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Saturday business hours' })
  @IsOptional()
  saturday?: { start: string; end: string };

  @ApiPropertyOptional({ description: 'Sunday business hours' })
  @IsOptional()
  sunday?: { start: string; end: string };
}

export class ContactChannelsDto {
  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ description: 'Facebook URL' })
  @IsOptional()
  facebook?: string;

  @ApiPropertyOptional({ description: 'Instagram URL' })
  @IsOptional()
  instagram?: string;

  @ApiPropertyOptional({ description: 'Twitter URL' })
  @IsOptional()
  twitter?: string;

  @ApiPropertyOptional({ description: 'LinkedIn URL' })
  @IsOptional()
  linkedin?: string;

  @ApiPropertyOptional({ description: 'YouTube URL' })
  @IsOptional()
  youtube?: string;
}

export class RegisterCorporateDto {
  @ApiProperty({ description: 'Business name' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

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

  @ApiPropertyOptional({ description: 'Branding/logo URL' })
  @IsString()
  @IsOptional()
  brandingUrl?: string;

  @ApiProperty({ description: 'Activity type ID' })
  @IsNumber()
  activityTypeId: number;

  @ApiProperty({ description: 'Legal representative name' })
  @IsString()
  @IsNotEmpty()
  legalRepresentative: string;

  @ApiPropertyOptional({ description: 'Contact channels' })
  @IsObject()
  @IsOptional()
  contactChannels?: ContactChannelsDto;

  @ApiProperty({ description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Operation notice (base64 encoded PDF/image)' })
  @IsString()
  @IsNotEmpty()
  operationNotice: string;

  @ApiProperty({ description: 'Billing account (e.g., ITV or similar)' })
  @IsString()
  @IsNotEmpty()
  billingAccount: string;

  @ApiProperty({ description: 'Payment methods', enum: PaymentMethod, isArray: true })
  @IsArray()
  @IsEnum(PaymentMethod, { each: true })
  paymentMethods: PaymentMethod[];

  @ApiProperty({ description: 'Business description' })
  @IsString()
  @IsNotEmpty()
  businessDescription: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'Operation mode', enum: OperationMode })
  @IsEnum(OperationMode)
  operationMode: OperationMode;

  @ApiProperty({ description: 'Business hours' })
  @IsObject()
  businessHours: BusinessHoursDto;
} 