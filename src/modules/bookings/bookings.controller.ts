import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/role.entity';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or activity not available' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(createBookingDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bookings (filtered by user role)' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  findAll(@Request() req) {
    if (req.user.role.name === UserRole.CLIENT) {
      return this.bookingsService.findAll(req.user.id);
    } else if (req.user.role.name === UserRole.ADMIN) {
      return this.bookingsService.findAll(undefined, req.user.corporate.id);
    } else {
      return this.bookingsService.findAll();
    }
  }

  @Get('my-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'User bookings' })
  getMyBookings(@Request() req) {
    return this.bookingsService.findAll(req.user.id);
  }

  @Get('corporate-bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get bookings for current corporate' })
  @ApiResponse({ status: 200, description: 'Corporate bookings' })
  getCorporateBookings(@Request() req) {
    return this.bookingsService.findAll(undefined, req.user.corporate.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking statistics for current corporate' })
  @ApiResponse({ status: 200, description: 'Booking statistics' })
  getBookingStats(@Request() req) {
    return this.bookingsService.getBookingStats(req.user.corporate.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string, @Request() req) {
    if (req.user.role.name === UserRole.CLIENT) {
      return this.bookingsService.findOne(+id, req.user.id);
    } else if (req.user.role.name === UserRole.ADMIN) {
      return this.bookingsService.findOne(+id, undefined, req.user.corporate.id);
    } else {
      return this.bookingsService.findOne(+id);
    }
  }

  @Get('code/:bookingCode')
  @ApiOperation({ summary: 'Get booking by booking code' })
  @ApiResponse({ status: 200, description: 'Booking found' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findByCode(@Param('bookingCode') bookingCode: string) {
    return this.bookingsService.findByCode(bookingCode);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking status' })
  @ApiResponse({ status: 200, description: 'Booking status updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req,
  ) {
    if (req.user.role.name === UserRole.ADMIN) {
      return this.bookingsService.updateStatus(+id, body.status, undefined, req.user.corporate.id);
    } else {
      return this.bookingsService.updateStatus(+id, body.status);
    }
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update booking payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { paymentStatus: string },
  ) {
    return this.bookingsService.updatePaymentStatus(+id, body.paymentStatus);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel booking' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  cancel(@Param('id') id: string, @Request() req) {
    if (req.user.role.name === UserRole.CLIENT) {
      return this.bookingsService.cancel(+id, req.user.id);
    } else {
      return this.bookingsService.cancel(+id);
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete booking (Super Admin only)' })
  @ApiResponse({ status: 204, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
} 