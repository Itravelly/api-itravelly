import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ActivityTypesService } from './activity-types.service';
import { CreateActivityTypeDto } from './dto/create-activity-type.dto';
import { UpdateActivityTypeDto } from './dto/update-activity-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/role.entity';

@ApiTags('Activity Types')
@Controller('activity-types')
export class ActivityTypesController {
  constructor(private readonly activityTypesService: ActivityTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new activity type' })
  @ApiResponse({ status: 201, description: 'Activity type created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Activity type already exists' })
  create(@Body() createActivityTypeDto: CreateActivityTypeDto) {
    return this.activityTypesService.create(createActivityTypeDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active activity types' })
  @ApiResponse({ status: 200, description: 'List of activity types' })
  findAll() {
    return this.activityTypesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity type by ID' })
  @ApiResponse({ status: 200, description: 'Activity type found' })
  @ApiResponse({ status: 404, description: 'Activity type not found' })
  findOne(@Param('id') id: string) {
    return this.activityTypesService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update activity type' })
  @ApiResponse({ status: 200, description: 'Activity type updated successfully' })
  @ApiResponse({ status: 404, description: 'Activity type not found' })
  update(@Param('id') id: string, @Body() updateActivityTypeDto: UpdateActivityTypeDto) {
    return this.activityTypesService.update(+id, updateActivityTypeDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete activity type' })
  @ApiResponse({ status: 204, description: 'Activity type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Activity type not found' })
  remove(@Param('id') id: string) {
    return this.activityTypesService.remove(+id);
  }
} 