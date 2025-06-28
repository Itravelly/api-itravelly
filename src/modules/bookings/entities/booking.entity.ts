import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';
import { BookingStatus } from './booking-status.entity';
import { PaymentStatus } from './payment-status.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  bookingCode: string;

  @ManyToOne(() => User, user => user.bookings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int' })
  userId: number;

  @ManyToOne(() => Activity, activity => activity.bookings)
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column({ type: 'int' })
  activityId: number;

  @ManyToOne(() => Promotion, promotion => promotion.bookings, { nullable: true })
  @JoinColumn({ name: 'promotionId' })
  promotion: Promotion;

  @Column({ type: 'int', nullable: true })
  promotionId: number;

  @Column({ type: 'date' })
  bookingDate: Date;

  @Column({ type: 'time' })
  bookingTime: string;

  @Column({ type: 'int' })
  numberOfPeople: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  finalPrice: number;

  @ManyToOne(() => BookingStatus, bookingStatus => bookingStatus.bookings)
  @JoinColumn({ name: 'bookingStatusId' })
  bookingStatus: BookingStatus;

  @Column({ type: 'int' })
  bookingStatusId: number;

  @ManyToOne(() => PaymentStatus, paymentStatus => paymentStatus.bookings)
  @JoinColumn({ name: 'paymentStatusId' })
  paymentStatus: PaymentStatus;

  @Column({ type: 'int' })
  paymentStatusId: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialRequests: string;

  @Column({ type: 'json', nullable: true })
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 