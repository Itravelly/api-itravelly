import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CorporatesService } from './corporates.service';
import { RegisterCorporateDto } from './dto/register-corporate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/role.entity';

@ApiTags('Corporates')
@Controller('corporates')
export class CorporatesController {
  constructor(private readonly corporatesService: CorporatesService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new corporate account' })
  @ApiResponse({ status: 201, description: 'Corporate registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() registerCorporateDto: RegisterCorporateDto) {
    return this.corporatesService.register(registerCorporateDto);
  }

  @Post(':id/verify-email')
  @ApiOperation({ summary: 'Verify corporate email with code' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired code' })
  verifyEmail(@Param('id') id: string, @Body() body: { code: string }) {
    return this.corporatesService.verifyEmail(+id, body.code);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all corporates (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'List of corporates' })
  findAll() {
    return this.corporatesService.findAll();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current corporate profile' })
  @ApiResponse({ status: 200, description: 'Corporate profile' })
  @ApiResponse({ status: 404, description: 'Corporate not found' })
  getProfile(@Request() req) {
    return this.corporatesService.findByUserId(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get corporate by ID' })
  @ApiResponse({ status: 200, description: 'Corporate found' })
  @ApiResponse({ status: 404, description: 'Corporate not found' })
  findOne(@Param('id') id: string, @Request() req) {
    // Super admin can access any corporate, admin can only access their own
    if (req.user.role.name === UserRole.SUPERADMIN) {
      return this.corporatesService.findOne(+id);
    } else {
      return this.corporatesService.findByUserId(req.user.id);
    }
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current corporate profile' })
  @ApiResponse({ status: 200, description: 'Corporate updated successfully' })
  @ApiResponse({ status: 404, description: 'Corporate not found' })
  async updateProfile(@Request() req, @Body() updateCorporateDto: Partial<RegisterCorporateDto>) {
    const corporate = await this.corporatesService.findByUserId(req.user.id);
    return this.corporatesService.update(corporate.id, updateCorporateDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update corporate (Super Admin only)' })
  @ApiResponse({ status: 200, description: 'Corporate updated successfully' })
  @ApiResponse({ status: 404, description: 'Corporate not found' })
  update(@Param('id') id: string, @Body() updateCorporateDto: Partial<RegisterCorporateDto>) {
    return this.corporatesService.update(+id, updateCorporateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete corporate (Super Admin only)' })
  @ApiResponse({ status: 204, description: 'Corporate deleted successfully' })
  @ApiResponse({ status: 404, description: 'Corporate not found' })
  remove(@Param('id') id: string) {
    return this.corporatesService.remove(+id);
  }

  @Post('branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new branch for current corporate' })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  @ApiResponse({ status: 404, description: 'Corporate not found' })
  async createBranch(@Request() req, @Body() branchData: any) {
    const corporate = await this.corporatesService.findByUserId(req.user.id);
    return this.corporatesService.createBranch(corporate.id, branchData);
  }

  @Get('branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all branches for current corporate' })
  @ApiResponse({ status: 200, description: 'List of branches' })
  async getBranches(@Request() req) {
    const corporate = await this.corporatesService.findByUserId(req.user.id);
    return this.corporatesService.getBranches(corporate.id);
  }
} 