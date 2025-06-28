import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingStatus } from '../entities/booking-status.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class BookingStatusSeeder {
  constructor(
    @InjectRepository(BookingStatus)
    private bookingStatusRepository: Repository<BookingStatus>,
  ) {}

  async seed(): Promise<void> {
    const bookingStatuses = [
      {
        name: 'pending',
        nameEs: 'pendiente',
        nameEn: 'pending',
        description: 'Reservation is waiting for confirmation',
        descriptionEs: 'La reserva está esperando confirmación',
        descriptionEn: 'Reservation is waiting for confirmation',
        color: '#FFA500',
        isActive: true,
        order: 1
      },
      {
        name: 'confirmed',
        nameEs: 'confirmada',
        nameEn: 'confirmed',
        description: 'Reservation has been confirmed',
        descriptionEs: 'La reserva ha sido confirmada',
        descriptionEn: 'Reservation has been confirmed',
        color: '#28A745',
        isActive: true,
        order: 2
      },
      {
        name: 'cancelled',
        nameEs: 'cancelada',
        nameEn: 'cancelled',
        description: 'Reservation has been cancelled',
        descriptionEs: 'La reserva ha sido cancelada',
        descriptionEn: 'Reservation has been cancelled',
        color: '#DC3545',
        isActive: true,
        order: 3
      },
      {
        name: 'completed',
        nameEs: 'completada',
        nameEn: 'completed',
        description: 'Activity has been completed',
        descriptionEs: 'La actividad ha sido completada',
        descriptionEn: 'Activity has been completed',
        color: '#17A2B8',
        isActive: true,
        order: 4
      },
      {
        name: 'no_show',
        nameEs: 'no presentó',
        nameEn: 'no show',
        description: 'Customer did not show up',
        descriptionEs: 'El cliente no se presentó',
        descriptionEn: 'Customer did not show up',
        color: '#6C757D',
        isActive: true,
        order: 5
      },
      {
        name: 'refunded',
        nameEs: 'reembolsada',
        nameEn: 'refunded',
        description: 'Reservation has been refunded',
        descriptionEs: 'La reserva ha sido reembolsada',
        descriptionEn: 'Reservation has been refunded',
        color: '#FFC107',
        isActive: true,
        order: 6
      }
    ];

    for (const status of bookingStatuses) {
      const existingStatus = await this.bookingStatusRepository.findOne({
        where: { name: status.name }
      });

      if (!existingStatus) {
        await this.bookingStatusRepository.save(status);
        console.log(`Created booking status: ${status.name}`);
      } else {
        console.log(`Booking status already exists: ${status.name}`);
      }
    }
  }

  async getStatusByName(name: string): Promise<BookingStatus | null> {
    return await this.bookingStatusRepository.findOne({
      where: { name, isActive: true }
    });
  }
}

export const bookingStatusSeeder = async (dataSource: DataSource) => {
  const bookingStatusRepository = dataSource.getRepository(BookingStatus);

  const bookingStatuses = [
    {
      name: 'pending',
      displayName: 'Pendiente',
      description: 'La reserva está esperando confirmación',
      color: '#FFA500',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'confirmed',
      displayName: 'Confirmada',
      description: 'La reserva ha sido confirmada',
      color: '#28A745',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'cancelled',
      displayName: 'Cancelada',
      description: 'La reserva ha sido cancelada',
      color: '#DC3545',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'completed',
      displayName: 'Completada',
      description: 'La actividad ha sido completada',
      color: '#17A2B8',
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'no_show',
      displayName: 'No Presentó',
      description: 'El cliente no se presentó',
      color: '#6C757D',
      isActive: true,
      sortOrder: 5
    },
    {
      name: 'refunded',
      displayName: 'Reembolsada',
      description: 'La reserva ha sido reembolsada',
      color: '#FFC107',
      isActive: true,
      sortOrder: 6
    }
  ];

  for (const status of bookingStatuses) {
    const existingStatus = await bookingStatusRepository.findOne({
      where: { name: status.name }
    });

    if (!existingStatus) {
      await bookingStatusRepository.save(status);
      console.log(`Created booking status: ${status.name}`);
    } else {
      console.log(`Booking status already exists: ${status.name}`);
    }
  }
}; 