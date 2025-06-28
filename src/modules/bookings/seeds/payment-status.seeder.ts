import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../entities/payment-status.entity';

@Injectable()
export class PaymentStatusSeeder {
  constructor(
    @InjectRepository(PaymentStatus)
    private paymentStatusRepository: Repository<PaymentStatus>,
  ) {}

  async seed(): Promise<void> {
    const defaultStatuses = [
      {
        name: 'pending',
        displayName: 'Pendiente',
        description: 'Pago pendiente de procesar',
        color: '#FFA500',
        sortOrder: 1,
      },
      {
        name: 'paid',
        displayName: 'Pagado',
        description: 'Pago procesado exitosamente',
        color: '#00FF00',
        sortOrder: 2,
      },
      {
        name: 'failed',
        displayName: 'Fallido',
        description: 'Pago falló al procesar',
        color: '#FF0000',
        sortOrder: 3,
      },
      {
        name: 'refunded',
        displayName: 'Reembolsado',
        description: 'Pago reembolsado al cliente',
        color: '#8B4513',
        sortOrder: 4,
      },
      {
        name: 'partially_refunded',
        displayName: 'Parcialmente Reembolsado',
        description: 'Pago reembolsado parcialmente',
        color: '#FF8C00',
        sortOrder: 5,
      },
      {
        name: 'cancelled',
        displayName: 'Cancelado',
        description: 'Pago cancelado antes de procesar',
        color: '#808080',
        sortOrder: 6,
      },
      {
        name: 'expired',
        displayName: 'Expirado',
        description: 'Pago expiró sin procesar',
        color: '#FF6347',
        sortOrder: 7,
      },
    ];

    for (const status of defaultStatuses) {
      const exists = await this.paymentStatusRepository.findOne({
        where: { name: status.name }
      });

      if (!exists) {
        await this.paymentStatusRepository.save(status);
      }
    }
  }

  async getStatusByName(name: string): Promise<PaymentStatus | null> {
    return await this.paymentStatusRepository.findOne({
      where: { name, isActive: true }
    });
  }
} 