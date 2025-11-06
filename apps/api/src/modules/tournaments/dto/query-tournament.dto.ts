import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TournamentStatus, TournamentVisibility } from '@padel/database';

export class QueryTournamentDto {
  @ApiPropertyOptional({
    description: 'Filter by tournament status',
    enum: TournamentStatus,
  })
  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;

  @ApiPropertyOptional({
    description: 'Filter by visibility',
    enum: TournamentVisibility,
  })
  @IsEnum(TournamentVisibility)
  @IsOptional()
  visibility?: TournamentVisibility;

  @ApiPropertyOptional({
    description: 'Filter by club ID',
    example: 'clxxx123',
  })
  @IsString()
  @IsOptional()
  clubId?: string;

  @ApiPropertyOptional({
    description: 'Filter by organizer ID',
    example: 'usr_xxx123',
  })
  @IsString()
  @IsOptional()
  organizerId?: string;

  @ApiPropertyOptional({
    description: 'Search by name',
    example: 'Summer',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}
