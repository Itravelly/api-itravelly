import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityType } from './entities/activity-type.entity';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';

@Injectable()
export class ActivityTypesService {
  constructor(
    @InjectRepository(ActivityType)
    private activityTypeRepository: Repository<ActivityType>,
  ) {}

  async create(createActivityTypeDto: CreateActivityTypeDto): Promise<ActivityType> {
    const existingType = await this.activityTypeRepository.findOne({
      where: [
        { nameEn: createActivityTypeDto.nameEn },
        { nameEs: createActivityTypeDto.nameEs }
      ]
    });

    if (existingType) {
      throw new ConflictException('Activity type with this name already exists');
    }

    const activityType = this.activityTypeRepository.create(createActivityTypeDto);
    return await this.activityTypeRepository.save(activityType);
  }

  async findAll(): Promise<ActivityType[]> {
    return await this.activityTypeRepository.find({
      where: { isActive: true },
      order: { nameEn: 'ASC' }
    });
  }

  async findOne(id: number): Promise<ActivityType> {
    const activityType = await this.activityTypeRepository.findOne({
      where: { id, isActive: true }
    });

    if (!activityType) {
      throw new NotFoundException(`Activity type with ID ${id} not found`);
    }

    return activityType;
  }

  async update(id: number, updateActivityTypeDto: UpdateActivityTypeDto): Promise<ActivityType> {
    const activityType = await this.findOne(id);

    if (updateActivityTypeDto.nameEn || updateActivityTypeDto.nameEs) {
      const existingType = await this.activityTypeRepository.findOne({
        where: [
          { nameEn: updateActivityTypeDto.nameEn || activityType.nameEn },
          { nameEs: updateActivityTypeDto.nameEs || activityType.nameEs }
        ]
      });

      if (existingType && existingType.id !== id) {
        throw new ConflictException('Activity type with this name already exists');
      }
    }

    Object.assign(activityType, updateActivityTypeDto);
    return await this.activityTypeRepository.save(activityType);
  }

  async remove(id: number): Promise<void> {
    const activityType = await this.findOne(id);
    activityType.isActive = false;
    await this.activityTypeRepository.save(activityType);
  }

  async seedDefaultTypes(): Promise<void> {
    const defaultTypes = [
      {
        nameEn: 'Tours',
        nameEs: 'Tours',
        descriptionEn: 'Guided tours and excursions',
        descriptionEs: 'Tours guiados y excursiones'
      },
      {
        nameEn: 'Accommodation',
        nameEs: 'Hospedaje',
        descriptionEn: 'Hotels, hostels, and lodging',
        descriptionEs: 'Hoteles, hostales y alojamiento'
      },
      {
        nameEn: 'Transportation',
        nameEs: 'Transporte',
        descriptionEn: 'Transportation services',
        descriptionEs: 'Servicios de transporte'
      },
      {
        nameEn: 'Adventure',
        nameEs: 'Aventura',
        descriptionEn: 'Adventure and extreme sports',
        descriptionEs: 'Aventura y deportes extremos'
      },
      {
        nameEn: 'Cultural',
        nameEs: 'Cultural',
        descriptionEn: 'Cultural activities and experiences',
        descriptionEs: 'Actividades y experiencias culturales'
      },
      {
        nameEn: 'Food & Dining',
        nameEs: 'Gastronomía',
        descriptionEn: 'Food tours and dining experiences',
        descriptionEs: 'Tours gastronómicos y experiencias culinarias'
      }
    ];

    for (const type of defaultTypes) {
      const exists = await this.activityTypeRepository.findOne({
        where: { nameEn: type.nameEn }
      });

      if (!exists) {
        await this.create(type);
      }
    }
  }
} 