import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CreateCourtDto } from './dto/create-court.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@padel/database';

@ApiTags('Clubs')
@Controller('clubs')
export class ClubsController {
  constructor(private clubsService: ClubsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new club' })
  @ApiResponse({ status: 201, description: 'Club created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateClubDto,
  ) {
    return this.clubsService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all clubs' })
  @ApiResponse({ status: 200, description: 'Clubs retrieved successfully' })
  async findAll() {
    return this.clubsService.findAll();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get club by ID' })
  @ApiResponse({ status: 200, description: 'Club found' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async findOne(@Param('id') id: string) {
    return this.clubsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update club' })
  @ApiResponse({ status: 200, description: 'Club updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateClubDto,
  ) {
    return this.clubsService.update(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete club' })
  @ApiResponse({ status: 200, description: 'Club deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.clubsService.remove(id, userId);
  }

  // Court management endpoints
  @UseGuards(JwtAuthGuard)
  @Post(':id/courts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a court for a club' })
  @ApiResponse({ status: 201, description: 'Court created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Club not found' })
  async createCourt(
    @Param('id') clubId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCourtDto,
  ) {
    return this.clubsService.createCourt(clubId, userId, dto);
  }

  @Public()
  @Get(':id/courts')
  @ApiOperation({ summary: 'Get all courts for a club' })
  @ApiResponse({ status: 200, description: 'Courts retrieved successfully' })
  async findCourts(@Param('id') clubId: string) {
    return this.clubsService.findCourts(clubId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('courts/:courtId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a court' })
  @ApiResponse({ status: 200, description: 'Court deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async removeCourt(
    @Param('courtId') courtId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.clubsService.removeCourt(courtId, userId);
  }
}
