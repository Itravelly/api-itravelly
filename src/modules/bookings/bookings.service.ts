import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus, PaymentStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Activity, ActivityStatus } from '../activities/entities/activity.entity';
import { Promotion } from '../promotions/entities/promotion.entity';
import { User } from '../users/entities/user.entity';
import { ActivitiesService } from '../activities/activities.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private activitiesService: ActivitiesService,
  ) {}

  async create(createBookingDto: CreateBookingDto, userId: number): Promise<Booking> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const activity = await this.activityRepository.findOne({
      where: { id: createBookingDto.activityId, status: ActivityStatus.ACTIVE }
    });
    if (!activity) {
      throw new NotFoundException('Activity not found or not available');
    }

    // Check availability
    const availability = await this.activitiesService.checkAvailability(
      createBookingDto.activityId,
      createBookingDto.bookingDate,
      createBookingDto.bookingTime,
      createBookingDto.numberOfPeople
    );

    if (!availability.available) {
      throw new BadRequestException(availability.message || 'Activity not available');
    }

    // Calculate pricing
    let originalPrice = activity.currentPrice;
    let discountAmount = 0;
    let promotion: Promotion | null = null;

    if (activity.pricingType === 'per_person') {
      originalPrice = activity.currentPrice * createBookingDto.numberOfPeople;
    } else {
      originalPrice = activity.currentPrice;
    }

    // Apply promotion if provided
    if (createBookingDto.promotionCode) {
      promotion = await this.promotionRepository.findOne({
        where: {
          code: createBookingDto.promotionCode,
          activityId: createBookingDto.activityId,
          isActive: true
        }
      });

      if (promotion) {
        if (promotion.type === 'percentage') {
          discountAmount = (originalPrice * promotion.discountValue) / 100;
        } else {
          discountAmount = promotion.discountValue;
        }

        // Update promotion usage
        promotion.currentUses += 1;
        await this.promotionRepository.save(promotion);
      }
    }

    const finalPrice = originalPrice - discountAmount;

    // Generate unique booking code
    const bookingCode = this.generateBookingCode();

    const booking = this.bookingRepository.create({
      ...createBookingDto,
      userId,
      originalPrice,
      discountAmount,
      finalPrice,
      bookingCode,
      promotionId: promotion?.id,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll(userId?: number, corporateId?: number): Promise<Booking[]> {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.activity', 'activity')
      .leftJoinAndSelect('booking.promotion', 'promotion')
      .leftJoinAndSelect('activity.corporate', 'corporate');

    if (userId) {
      query.andWhere('booking.userId = :userId', { userId });
    }

    if (corporateId) {
      query.andWhere('activity.corporateId = :corporateId', { corporateId });
    }

    return await query.orderBy('booking.createdAt', 'DESC').getMany();
  }

  async findOne(id: number, userId?: number, corporateId?: number): Promise<Booking> {
    const query = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.activity', 'activity')
      .leftJoinAndSelect('booking.promotion', 'promotion')
      .leftJoinAndSelect('activity.corporate', 'corporate')
      .where('booking.id = :id', { id });

    if (userId) {
      query.andWhere('booking.userId = :userId', { userId });
    }

    if (corporateId) {
      query.andWhere('activity.corporateId = :corporateId', { corporateId });
    }

    const booking = await query.getOne();

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByCode(bookingCode: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { bookingCode },
      relations: ['user', 'activity', 'promotion', 'activity.corporate']
    });

    if (!booking) {
      throw new NotFoundException(`Booking with code ${bookingCode} not found`);
    }

    return booking;
  }

  async updateStatus(id: number, status: BookingStatus, userId?: number, corporateId?: number): Promise<Booking> {
    const booking = await this.findOne(id, userId, corporateId);
    booking.status = status;
    return await this.bookingRepository.save(booking);
  }

  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.paymentStatus = paymentStatus;
    
    if (paymentStatus === PaymentStatus.PAID) {
      booking.status = BookingStatus.CONFIRMED;
    }
    
    return await this.bookingRepository.save(booking);
  }

  async cancel(id: number, userId?: number): Promise<Booking> {
    const booking = await this.findOne(id, userId);
    
    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    booking.status = BookingStatus.CANCELLED;
    return await this.bookingRepository.save(booking);
  }

  async getBookingStats(corporateId: number): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
    revenue: number;
  }> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.activity', 'activity')
      .where('activity.corporateId = :corporateId', { corporateId })
      .getMany();

    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
      confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
      completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
      revenue: bookings
        .filter(b => b.paymentStatus === PaymentStatus.PAID)
        .reduce((sum, b) => sum + Number(b.finalPrice), 0)
    };

    return stats;
  }

  private generateBookingCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async remove(id: number): Promise<void> {
    await this.bookingRepository.delete(id);
  }
} 