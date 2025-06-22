import { 
  Controller, 
  Get, 
  Put, 
  Delete, 
  Param, 
  Body, 
  UseGuards, 
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obtener perfil del usuario logueado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil del usuario obtenido exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios (solo admin/superadmin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de usuarios obtenida exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para ver todos los usuarios' 
  })
  async findAll(@Request() req) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID (solo admin/superadmin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario obtenido exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para ver otros usuarios' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.usersService.findOne(id, req.user);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar perfil del usuario logueado' })
  @ApiResponse({ 
    status: 200, 
    description: 'Perfil actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email o teléfono ya está en uso' 
  })
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Request() req) {
    return this.usersService.updateProfile(req.user.sub, updateProfileDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar usuario por ID (solo admin/superadmin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para editar otros usuarios' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email o teléfono ya está en uso' 
  })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUserDto: UpdateUserDto, 
    @Request() req
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar usuario por ID (solo admin/superadmin)' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ 
    status: 200, 
    description: 'Usuario eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'No tienes permisos para eliminar usuarios' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuario no encontrado' 
  })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.usersService.remove(id, req.user);
  }

  @Delete('all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar todos los usuarios (solo superadmin)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Todos los usuarios eliminados exitosamente' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Solo superadmins pueden eliminar todos los usuarios' 
  })
  async removeAll(@Request() req) {
    return this.usersService.removeAll(req.user);
  }
} 