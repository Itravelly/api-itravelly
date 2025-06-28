import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionType } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { Activity } from '../activities/entities/activity.entity';
import { ActivityStatus } from '../activities/entities/activity.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto, corporateId: number): Promise<Promotion> {
    const activity = await this.activityRepository.findOne({
      where: { id: createPromotionDto.activityId, status: ActivityStatus.ACTIVE }
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.corporateId !== corporateId) {
      throw new ForbiddenException('You can only create promotions for your own activities');
    }

    // Check if code already exists
    if (createPromotionDto.code) {
      const existingPromotion = await this.promotionRepository.findOne({
        where: { code: createPromotionDto.code }
      });

      if (existingPromotion) {
        throw new BadRequestException('Promotion code already exists');
      }
    }

    const promotion = this.promotionRepository.create(createPromotionDto);
    return await this.promotionRepository.save(promotion);
  }

  async findAll(activityId?: number, corporateId?: number): Promise<Promotion[]> {
    const query = this.promotionRepository.createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.activity', 'activity')
      .where('promotion.isActive = :isActive', { isActive: true });

    if (activityId) {
      query.andWhere('promotion.activityId = :activityId', { activityId });
    }

    if (corporateId) {
      query.andWhere('activity.corporateId = :corporateId', { corporateId });
    }

    return await query.getMany();
  }

  async findOne(id: number, corporateId?: number): Promise<Promotion> {
    const query = this.promotionRepository.createQueryBuilder('promotion')
      .leftJoinAndSelect('promotion.activity', 'activity')
      .where('promotion.id = :id', { id });

    if (corporateId) {
      query.andWhere('activity.corporateId = :corporateId', { corporateId });
    }

    const promotion = await query.getOne();

    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }

    return promotion;
  }

  async findByCode(code: string): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { code, isActive: true },
      relations: ['activity']
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion with code ${code} not found`);
    }

    // Check if promotion is still valid
    if (promotion.validUntil && new Date() > promotion.validUntil) {
      throw new BadRequestException('Promotion has expired');
    }

    if (promotion.validFrom && new Date() < promotion.validFrom) {
      throw new BadRequestException('Promotion is not yet valid');
    }

    if (promotion.maxUses !== -1 && promotion.currentUses >= promotion.maxUses) {
      throw new BadRequestException('Promotion usage limit reached');
    }

    return promotion;
  }

  async update(id: number, updatePromotionDto: Partial<CreatePromotionDto>, corporateId: number): Promise<Promotion> {
    const promotion = await this.findOne(id, corporateId);
    Object.assign(promotion, updatePromotionDto);
    return await this.promotionRepository.save(promotion);
  }

  async remove(id: number, corporateId: number): Promise<void> {
    const promotion = await this.findOne(id, corporateId);
    promotion.isActive = false;
    await this.promotionRepository.save(promotion);
  }

  async validatePromotion(code: string, activityId: number): Promise<{
    valid: boolean;
    promotion?: Promotion;
    message?: string;
  }> {
    try {
      const promotion = await this.findByCode(code);

      if (promotion.activityId !== activityId) {
        return {
          valid: false,
          message: 'Promotion is not valid for this activity'
        };
      }

      return {
        valid: true,
        promotion
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message
      };
    }
  }

  async getPromotionStats(corporateId: number): Promise<{
    total: number;
    active: number;
    expired: number;
    totalUses: number;
  }> {
    const promotions = await this.promotionRepository
      .createQueryBuilder('promotion')
      .leftJoin('promotion.activity', 'activity')
      .where('activity.corporateId = :corporateId', { corporateId })
      .getMany();

    const now = new Date();
    const stats = {
      total: promotions.length,
      active: promotions.filter(p => p.isActive && (!p.validUntil || p.validUntil > now)).length,
      expired: promotions.filter(p => p.validUntil && p.validUntil <= now).length,
      totalUses: promotions.reduce((sum, p) => sum + p.currentUses, 0)
    };

    return stats;
  }
} 