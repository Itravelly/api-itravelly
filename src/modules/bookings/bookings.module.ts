import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingStatus } from './entities/booking-status.entity';
import { PaymentStatus } from './entities/payment-status.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingStatusSeeder } from './seeds/booking-status.seeder';
import { PaymentStatusSeeder } from './seeds/payment-status.seeder';
import { Activity } from '../activities/entities/activity.entity';
import { Promotion } from '../promotions/entities/promotion.entity';
import { User } from '../users/entities/user.entity';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      BookingStatus,
      PaymentStatus,
      Activity,
      Promotion,
      User,
    ]),
    ActivitiesModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, BookingStatusSeeder, PaymentStatusSeeder],
  exports: [BookingsService, BookingStatusSeeder, PaymentStatusSeeder],
})
export class BookingsModule {} 