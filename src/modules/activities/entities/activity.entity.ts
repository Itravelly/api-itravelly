import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ActivityType } from './activity-type.entity';
import { Branch } from '../../corporates/entities/branch.entity';
import { Corporate } from '../../corporates/entities/corporate.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Promotion } from '../../promotions/entities/promotion.entity';

export enum ActivityStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  HIDDEN = 'hidden',
}

export enum PricingType {
  PER_PERSON = 'per_person',
  PER_GROUP = 'per_group',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  departureLocation: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100 })
  province: string;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'json' })
  images: string[];

  @ManyToOne(() => ActivityType, activityType => activityType.activities)
  @JoinColumn({ name: 'activityTypeId' })
  activityType: ActivityType;

  @Column({ type: 'int' })
  activityTypeId: number;

  @ManyToOne(() => Branch, branch => branch.activities)
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @Column({ type: 'int' })
  branchId: number;

  @ManyToOne(() => Corporate, corporate => corporate.activities)
  @JoinColumn({ name: 'corporateId' })
  corporate: Corporate;

  @Column({ type: 'int' })
  corporateId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  previousPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentPrice: number;

  @Column({
    type: 'enum',
    enum: PricingType,
    default: PricingType.PER_PERSON
  })
  pricingType: PricingType;

  @Column({ type: 'int', default: 1 })
  groupSize: number;

  @Column({ type: 'boolean', default: false })
  appliesPromo: boolean;

  @Column({ type: 'json', nullable: true })
  paymentMethods: string[];

  @Column({ type: 'int' })
  maxCapacityPerTimeSlot: number;

  @Column({ type: 'text' })
  instructions: string;

  @Column({ type: 'json', nullable: true })
  amenities: string[];

  @Column({ type: 'json', nullable: true })
  faqs: Array<{
    question: string;
    answer: string;
  }>;

  @Column({
    type: 'enum',
    enum: ActivityStatus,
    default: ActivityStatus.ACTIVE
  })
  status: ActivityStatus;

  @Column({ type: 'int', default: 10 })
  dailyBookingLimit: number;

  @Column({ type: 'varchar', length: 10 }) // Format: "HH:MM"
  duration: string;

  @Column({ type: 'json' })
  availabilityHours: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Booking, booking => booking.activity)
  bookings: Booking[];

  @OneToMany(() => Promotion, promotion => promotion.activity)
  promotions: Promotion[];
} 