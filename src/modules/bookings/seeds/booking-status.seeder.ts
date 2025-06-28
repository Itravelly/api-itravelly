import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingStatus } from '../entities/booking-status.entity';

@Injectable()
export class BookingStatusSeeder {
  constructor(
    @InjectRepository(BookingStatus)
    private bookingStatusRepository: Repository<BookingStatus>,
  ) {}

  async seed(): Promise<void> {
    const defaultStatuses = [
      {
        name: 'pending',
        displayName: 'Pendiente',
        description: 'Reserva creada pero no confirmada',
        color: '#FFA500',
        sortOrder: 1,
      },
      {
        name: 'confirmed',
        displayName: 'Confirmada',
        description: 'Reserva confirmada y lista para la actividad',
        color: '#00FF00',
        sortOrder: 2,
      },
      {
        name: 'cancelled',
        displayName: 'Cancelada',
        description: 'Reserva cancelada por el cliente o administrador',
        color: '#FF0000',
        sortOrder: 3,
      },
      {
        name: 'completed',
        displayName: 'Completada',
        description: 'Actividad realizada exitosamente',
        color: '#008000',
        sortOrder: 4,
      },
      {
        name: 'no_show',
        displayName: 'No Presentó',
        description: 'Cliente no se presentó a la actividad',
        color: '#FF4500',
        sortOrder: 5,
      },
      {
        name: 'rescheduled',
        displayName: 'Reprogramada',
        description: 'Reserva reprogramada para otra fecha/hora',
        color: '#4169E1',
        sortOrder: 6,
      },
      {
        name: 'refunded',
        displayName: 'Reembolsada',
        description: 'Reserva cancelada y reembolsada',
        color: '#8B4513',
        sortOrder: 7,
      },
    ];

    for (const status of defaultStatuses) {
      const exists = await this.bookingStatusRepository.findOne({
        where: { name: status.name }
      });

      if (!exists) {
        await this.bookingStatusRepository.save(status);
      }
    }
  }

  async getStatusByName(name: string): Promise<BookingStatus | null> {
    return await this.bookingStatusRepository.findOne({
      where: { name, isActive: true }
    });
  }
} 