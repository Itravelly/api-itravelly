import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, ManyToOne, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/entities/user.entity';
import { Branch } from './branch.entity';
import { ActivityType } from '../../activities/entities/activity-type.entity';
import { Activity } from '../../activities/entities/activity.entity';

export enum PaymentMethod {
  CARD = 'card',
  TRANSFER = 'transfer',
  CASH = 'cash',
  CRYPTO = 'crypto',
}

export enum OperationMode {
  IN_PERSON = 'in_person',
  VIRTUAL = 'virtual',
  HYBRID = 'hybrid',
}

@Entity('corporates')
export class Corporate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  businessName: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'varchar', length: 100 })
  province: string;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  brandingUrl: string;

  @ManyToOne(() => ActivityType, activityType => activityType.activities)
  @JoinColumn({ name: 'activityTypeId' })
  activityType: ActivityType;

  @Column({ type: 'int' })
  activityTypeId: number;

  @Column({ type: 'varchar', length: 255 })
  legalRepresentative: string;

  @Column({ type: 'json', nullable: true })
  contactChannels: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
  };

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'text' })
  operationNotice: string; // Base64 encoded PDF/image

  @Column({ type: 'varchar', length: 255 })
  billingAccount: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    array: true,
    default: [PaymentMethod.CARD, PaymentMethod.TRANSFER]
  })
  paymentMethods: PaymentMethod[];

  @Column({ type: 'text' })
  businessDescription: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: OperationMode,
    default: OperationMode.IN_PERSON
  })
  operationMode: OperationMode;

  @Column({ type: 'json' })
  businessHours: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', unique: true })
  userId: number;

  @OneToMany(() => Branch, branch => branch.corporate)
  branches: Branch[];

  @OneToMany(() => Activity, activity => activity.corporate)
  activities: Activity[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
} 