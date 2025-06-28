import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/role.entity';

@ApiTags('Activities')
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new activity' })
  @ApiResponse({ status: 201, description: 'Activity created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Corporate not found' })
  create(@Body() createActivityDto: CreateActivityDto, @Request() req) {
    return this.activitiesService.create(createActivityDto, req.user.corporate.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active activities with optional filters' })
  @ApiResponse({ status: 200, description: 'List of activities' })
  @ApiQuery({ name: 'activityTypeId', required: false, description: 'Filter by activity type ID' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
  @ApiQuery({ name: 'province', required: false, description: 'Filter by province' })
  @ApiQuery({ name: 'corporateId', required: false, description: 'Filter by corporate ID' })
  findAll(
    @Query('activityTypeId') activityTypeId?: string,
    @Query('country') country?: string,
    @Query('province') province?: string,
    @Query('corporateId') corporateId?: string,
  ) {
    const filters: any = {};
    if (activityTypeId) filters.activityTypeId = +activityTypeId;
    if (country) filters.country = country;
    if (province) filters.province = province;
    if (corporateId) filters.corporateId = +corporateId;

    return this.activitiesService.findAll(filters);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search activities by name, description, or location' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiQuery({ name: 'q', required: true, description: 'Search query' })
  search(@Query('q') query: string) {
    return this.activitiesService.searchActivities(query);
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular activities' })
  @ApiResponse({ status: 200, description: 'Popular activities' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of activities to return', type: Number })
  getPopular(@Query('limit') limit?: string) {
    return this.activitiesService.getPopularActivities(limit ? +limit : 10);
  }

  @Get('my-activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get activities for current corporate' })
  @ApiResponse({ status: 200, description: 'Corporate activities' })
  getMyActivities(@Request() req) {
    return this.activitiesService.findByCorporate(req.user.corporate.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiResponse({ status: 200, description: 'Activity found' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findOne(+id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check activity availability' })
  @ApiResponse({ status: 200, description: 'Availability status' })
  @ApiQuery({ name: 'date', required: true, description: 'Booking date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'time', required: true, description: 'Booking time (HH:MM)' })
  @ApiQuery({ name: 'people', required: true, description: 'Number of people', type: Number })
  checkAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('time') time: string,
    @Query('people') people: string,
  ) {
    return this.activitiesService.checkAvailability(+id, date, time, +people);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update activity' })
  @ApiResponse({ status: 200, description: 'Activity updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your activity' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  update(@Param('id') id: string, @Body() updateActivityDto: Partial<CreateActivityDto>, @Request() req) {
    return this.activitiesService.update(+id, updateActivityDto, req.user.corporate.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete activity' })
  @ApiResponse({ status: 204, description: 'Activity deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your activity' })
  @ApiResponse({ status: 404, description: 'Activity not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.activitiesService.remove(+id, req.user.corporate.id);
  }
} 