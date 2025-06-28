import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatus } from '../entities/payment-status.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class PaymentStatusSeeder {
  constructor(
    @InjectRepository(PaymentStatus)
    private paymentStatusRepository: Repository<PaymentStatus>,
  ) {}

  async seed(): Promise<void> {
    const paymentStatuses = [
      {
        name: 'pending',
        nameEs: 'pendiente',
        nameEn: 'pending',
        description: 'Payment is waiting to be processed',
        descriptionEs: 'El pago está esperando ser procesado',
        descriptionEn: 'Payment is waiting to be processed',
        color: '#FFA500',
        isActive: true,
        order: 1
      },
      {
        name: 'processing',
        nameEs: 'procesando',
        nameEn: 'processing',
        description: 'Payment is being processed',
        descriptionEs: 'El pago está siendo procesado',
        descriptionEn: 'Payment is being processed',
        color: '#007BFF',
        isActive: true,
        order: 2
      },
      {
        name: 'completed',
        nameEs: 'completado',
        nameEn: 'completed',
        description: 'Payment has been completed successfully',
        descriptionEs: 'El pago ha sido completado exitosamente',
        descriptionEn: 'Payment has been completed successfully',
        color: '#28A745',
        isActive: true,
        order: 3
      },
      {
        name: 'failed',
        nameEs: 'fallido',
        nameEn: 'failed',
        description: 'Payment has failed',
        descriptionEs: 'El pago ha fallado',
        descriptionEn: 'Payment has failed',
        color: '#DC3545',
        isActive: true,
        order: 4
      },
      {
        name: 'cancelled',
        nameEs: 'cancelado',
        nameEn: 'cancelled',
        description: 'Payment has been cancelled',
        descriptionEs: 'El pago ha sido cancelado',
        descriptionEn: 'Payment has been cancelled',
        color: '#6C757D',
        isActive: true,
        order: 5
      },
      {
        name: 'refunded',
        nameEs: 'reembolsado',
        nameEn: 'refunded',
        description: 'Payment has been refunded',
        descriptionEs: 'El pago ha sido reembolsado',
        descriptionEn: 'Payment has been refunded',
        color: '#FFC107',
        isActive: true,
        order: 6
      },
      {
        name: 'partially_refunded',
        nameEs: 'parcialmente reembolsado',
        nameEn: 'partially refunded',
        description: 'Payment has been partially refunded',
        descriptionEs: 'El pago ha sido parcialmente reembolsado',
        descriptionEn: 'Payment has been partially refunded',
        color: '#FD7E14',
        isActive: true,
        order: 7
      }
    ];

    for (const status of paymentStatuses) {
      const existingStatus = await this.paymentStatusRepository.findOne({
        where: { name: status.name }
      });

      if (!existingStatus) {
        await this.paymentStatusRepository.save(status);
        console.log(`Created payment status: ${status.name}`);
      } else {
        console.log(`Payment status already exists: ${status.name}`);
      }
    }
  }

  async getStatusByName(name: string): Promise<PaymentStatus | null> {
    return await this.paymentStatusRepository.findOne({
      where: { name, isActive: true }
    });
  }
}

export const paymentStatusSeeder = async (dataSource: DataSource) => {
  const paymentStatusRepository = dataSource.getRepository(PaymentStatus);

  const paymentStatuses = [
    {
      name: 'pending',
      displayName: 'Pendiente',
      description: 'El pago está esperando ser procesado',
      color: '#FFA500',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'processing',
      displayName: 'Procesando',
      description: 'El pago está siendo procesado',
      color: '#007BFF',
      isActive: true,
      sortOrder: 2
    },
    {
      name: 'completed',
      displayName: 'Completado',
      description: 'El pago ha sido completado exitosamente',
      color: '#28A745',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'failed',
      displayName: 'Fallido',
      description: 'El pago ha fallado',
      color: '#DC3545',
      isActive: true,
      sortOrder: 4
    },
    {
      name: 'cancelled',
      displayName: 'Cancelado',
      description: 'El pago ha sido cancelado',
      color: '#6C757D',
      isActive: true,
      sortOrder: 5
    },
    {
      name: 'refunded',
      displayName: 'Reembolsado',
      description: 'El pago ha sido reembolsado',
      color: '#FFC107',
      isActive: true,
      sortOrder: 6
    },
    {
      name: 'partially_refunded',
      displayName: 'Parcialmente Reembolsado',
      description: 'El pago ha sido parcialmente reembolsado',
      color: '#FD7E14',
      isActive: true,
      sortOrder: 7
    }
  ];

  for (const status of paymentStatuses) {
    const existingStatus = await paymentStatusRepository.findOne({
      where: { name: status.name }
    });

    if (!existingStatus) {
      await paymentStatusRepository.save(status);
      console.log(`Created payment status: ${status.name}`);
    } else {
      console.log(`Payment status already exists: ${status.name}`);
    }
  }
}; 