import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { ReportResultDto } from './dto/report-result.dto';
import { ConfirmResultDto } from './dto/confirm-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Matches')
@Controller('matches')
export class MatchesController {
  constructor(private matchesService: MatchesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new match' })
  @ApiResponse({ status: 201, description: 'Match created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Tournament or category not found' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateMatchDto,
  ) {
    return this.matchesService.create(userId, dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all matches' })
  @ApiQuery({ name: 'tournamentId', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  async findAll(
    @Query('tournamentId') tournamentId?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.matchesService.findAll(tournamentId, categoryId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get match by ID' })
  @ApiResponse({ status: 200, description: 'Match found' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async findOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('report-result')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report match result' })
  @ApiResponse({ status: 201, description: 'Result reported successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async reportResult(
    @CurrentUser('id') userId: string,
    @Body() dto: ReportResultDto,
  ) {
    return this.matchesService.reportResult(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-result/:resultReportId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm or reject match result' })
  @ApiResponse({ status: 200, description: 'Result confirmed/rejected' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Result report not found' })
  async confirmResult(
    @CurrentUser('id') userId: string,
    @Param('resultReportId') resultReportId: string,
    @Body() dto: ConfirmResultDto,
  ) {
    return this.matchesService.confirmResult(userId, resultReportId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete match' })
  @ApiResponse({ status: 200, description: 'Match deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete completed match' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.matchesService.remove(id, userId);
  }
}
