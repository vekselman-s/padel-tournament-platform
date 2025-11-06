import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { QueryTournamentDto } from './dto/query-tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { UserRole } from '@padel/database';

@ApiTags('Tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private tournamentsService: TournamentsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ORGANIZER, UserRole.ADMIN)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiResponse({ status: 201, description: 'Tournament created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTournamentDto,
  ) {
    return this.tournamentsService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tournaments with filters' })
  @ApiResponse({ status: 200, description: 'Tournaments retrieved successfully' })
  async findAll(@Query() query: QueryTournamentDto) {
    return this.tournamentsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiResponse({ status: 200, description: 'Tournament found' })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  async findOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Public()
  @Get(':shareSlug/public')
  @ApiOperation({ summary: 'Get tournament by share slug (public view)' })
  @ApiResponse({ status: 200, description: 'Tournament found' })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  async findByShareSlug(@Param('shareSlug') shareSlug: string) {
    return this.tournamentsService.findByShareSlug(shareSlug);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament' })
  @ApiResponse({ status: 200, description: 'Tournament updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTournamentDto,
  ) {
    return this.tournamentsService.update(id, userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete tournament' })
  @ApiResponse({ status: 200, description: 'Tournament deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tournamentsService.remove(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/generate-bracket')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate tournament bracket' })
  @ApiResponse({ status: 200, description: 'Bracket generated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tournament not found' })
  async generateBracket(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tournamentsService.generateBracket(id, userId);
  }
}
