import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/role.entity';

@ApiTags('Promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, description: 'Promotion created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your activity' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  create(@Body() createPromotionDto: CreatePromotionDto, @Request() req) {
    return this.promotionsService.create(createPromotionDto, req.user.corporate.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active promotions' })
  @ApiResponse({ status: 200, description: 'List of promotions' })
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get('my-promotions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promotions for current corporate' })
  @ApiResponse({ status: 200, description: 'Corporate promotions' })
  getMyPromotions(@Request() req) {
    return this.promotionsService.findAll(undefined, req.user.corporate.id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get promotion statistics for current corporate' })
  @ApiResponse({ status: 200, description: 'Promotion statistics' })
  getPromotionStats(@Request() req) {
    return this.promotionsService.getPromotionStats(req.user.corporate.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get promotion by ID' })
  @ApiResponse({ status: 200, description: 'Promotion found' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(+id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get promotion by code' })
  @ApiResponse({ status: 200, description: 'Promotion found' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  findByCode(@Param('code') code: string) {
    return this.promotionsService.findByCode(code);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promotion' })
  @ApiResponse({ status: 200, description: 'Promotion updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your promotion' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  update(@Param('id') id: string, @Body() updatePromotionDto: Partial<CreatePromotionDto>, @Request() req) {
    return this.promotionsService.update(+id, updatePromotionDto, req.user.corporate.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete promotion' })
  @ApiResponse({ status: 204, description: 'Promotion deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your promotion' })
  @ApiResponse({ status: 404, description: 'Promotion not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.promotionsService.remove(+id, req.user.corporate.id);
  }
} 