import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityType } from './entities/activity-type.entity';
import { Activity } from './entities/activity.entity';
import { ActivityTypesService } from './activity-types.service';
import { ActivitiesService } from './activities.service';
import { ActivityTypesController } from './activity-types.controller';
import { ActivitiesController } from './activities.controller';
import { Corporate } from '../corporates/entities/corporate.entity';
import { Branch } from '../corporates/entities/branch.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityType,
      Activity,
      Corporate,
      Branch,
      Booking,
    ]),
  ],
  controllers: [ActivityTypesController, ActivitiesController],
  providers: [ActivityTypesService, ActivitiesService],
  exports: [ActivityTypesService, ActivitiesService],
})
export class ActivitiesModule {} 