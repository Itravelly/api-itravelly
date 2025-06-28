import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Activity, ActivityStatus } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Corporate } from '../corporates/entities/corporate.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingStatus } from '../bookings/entities/booking-status.entity';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Corporate)
    private corporateRepository: Repository<Corporate>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(createActivityDto: CreateActivityDto, corporateId: number): Promise<Activity> {
    const corporate = await this.corporateRepository.findOne({
      where: { id: corporateId, isActive: true }
    });

    if (!corporate) {
      throw new NotFoundException('Corporate not found');
    }

    const activity = this.activityRepository.create({
      ...createActivityDto,
      corporateId: corporate.id,
    });

    return await this.activityRepository.save(activity);
  }

  async findAll(filters?: {
    status?: ActivityStatus;
    activityTypeId?: number;
    country?: string;
    province?: string;
    corporateId?: number;
  }): Promise<Activity[]> {
    const query = this.activityRepository.createQueryBuilder('activity')
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .leftJoinAndSelect('activity.branch', 'branch')
      .leftJoinAndSelect('activity.corporate', 'corporate')
      .leftJoinAndSelect('activity.promotions', 'promotions')
      .where('activity.status = :status', { status: ActivityStatus.ACTIVE });

    if (filters?.activityTypeId) {
      query.andWhere('activity.activityTypeId = :activityTypeId', { activityTypeId: filters.activityTypeId });
    }

    if (filters?.country) {
      query.andWhere('activity.country = :country', { country: filters.country });
    }

    if (filters?.province) {
      query.andWhere('activity.province = :province', { province: filters.province });
    }

    if (filters?.corporateId) {
      query.andWhere('activity.corporateId = :corporateId', { corporateId: filters.corporateId });
    }

    return await query.getMany();
  }

  async findOne(id: number): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id, status: ActivityStatus.ACTIVE },
      relations: ['activityType', 'branch', 'corporate', 'promotions']
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async findByCorporate(corporateId: number): Promise<Activity[]> {
    return await this.activityRepository.find({
      where: { corporateId, status: ActivityStatus.ACTIVE },
      relations: ['activityType', 'branch', 'promotions'],
      order: { createdAt: 'DESC' }
    });
  }

  async update(id: number, updateActivityDto: Partial<CreateActivityDto>, corporateId: number): Promise<Activity> {
    const activity = await this.findOne(id);

    if (activity.corporateId !== corporateId) {
      throw new ForbiddenException('You can only update your own activities');
    }

    Object.assign(activity, updateActivityDto);
    return await this.activityRepository.save(activity);
  }

  async remove(id: number, corporateId: number): Promise<void> {
    const activity = await this.findOne(id);

    if (activity.corporateId !== corporateId) {
      throw new ForbiddenException('You can only delete your own activities');
    }

    activity.status = ActivityStatus.HIDDEN;
    await this.activityRepository.save(activity);
  }

  async checkAvailability(activityId: number, date: string, time: string, numberOfPeople: number): Promise<{
    available: boolean;
    remainingCapacity: number;
    message?: string;
  }> {
    const activity = await this.findOne(activityId);
    const bookingDate = new Date(date);

    // Obtener el día de la semana en minúsculas
    const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const availability = activity.availabilityHours[dayOfWeek];

    if (!availability) {
      return {
        available: false,
        remainingCapacity: 0,
        message: 'Activity not available on this day'
      };
    }

    // Check if time is within availability hours
    if (time < availability.start || time > availability.end) {
      return {
        available: false,
        remainingCapacity: 0,
        message: 'Time not within availability hours'
      };
    }

    // Check daily booking limit
    const existingBookings = await this.bookingRepository.find({
      where: {
        activityId,
        bookingDate: bookingDate,
        bookingStatus: { name: 'confirmed' }
      }
    });

    const totalBookedPeople = existingBookings.reduce((sum, booking) => sum + booking.numberOfPeople, 0);
    const remainingCapacity = activity.maxCapacityPerTimeSlot - totalBookedPeople;

    if (remainingCapacity < numberOfPeople) {
      return {
        available: false,
        remainingCapacity,
        message: `Only ${remainingCapacity} spots available`
      };
    }

    return {
      available: true,
      remainingCapacity: remainingCapacity - numberOfPeople
    };
  }

  async getPopularActivities(limit: number = 10): Promise<Activity[]> {
    return await this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .leftJoinAndSelect('activity.corporate', 'corporate')
      .leftJoin('activity.bookings', 'booking')
      .where('activity.status = :status', { status: ActivityStatus.ACTIVE })
      .andWhere('booking.bookingStatus.name = :bookingStatus', { bookingStatus: 'confirmed' })
      .groupBy('activity.id')
      .orderBy('COUNT(booking.id)', 'DESC')
      .limit(limit)
      .getMany();
  }

  async searchActivities(query: string): Promise<Activity[]> {
    return await this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.activityType', 'activityType')
      .leftJoinAndSelect('activity.corporate', 'corporate')
      .where('activity.status = :status', { status: ActivityStatus.ACTIVE })
      .andWhere(
        '(activity.name ILIKE :query OR activity.description ILIKE :query OR activity.departureLocation ILIKE :query)',
        { query: `%${query}%` }
      )
      .getMany();
  }
} 