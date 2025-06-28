import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
  EDITOR = 'editor',
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: UserRole,
    unique: true,
  })
  name: UserRole;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nameEs: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nameEn: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  descriptionEs: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => User, user => user.role)
  users: User[];
} 