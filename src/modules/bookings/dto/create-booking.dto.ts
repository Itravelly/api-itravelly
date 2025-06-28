import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomerInfoDto {
  @ApiProperty({ description: 'Customer first name' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Customer last name' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Customer email' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Customer phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class CreateBookingDto {
  @ApiProperty({ description: 'Activity ID' })
  @IsNumber()
  activityId: number;

  @ApiPropertyOptional({ description: 'Promotion code' })
  @IsString()
  @IsOptional()
  promotionCode?: string;

  @ApiProperty({ description: 'Booking date (YYYY-MM-DD)' })
  @IsDateString()
  bookingDate: string;

  @ApiProperty({ description: 'Booking time (HH:MM)' })
  @IsString()
  bookingTime: string;

  @ApiProperty({ description: 'Number of people', minimum: 1 })
  @IsNumber()
  @Min(1)
  numberOfPeople: number;

  @ApiPropertyOptional({ description: 'Special requests' })
  @IsString()
  @IsOptional()
  specialRequests?: string;

  @ApiProperty({ description: 'Customer information' })
  @IsObject()
  customerInfo: CustomerInfoDto;
} 