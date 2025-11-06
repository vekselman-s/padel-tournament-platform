import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import {
  TournamentFormat,
  TournamentVisibility,
} from '@padel/database';

export class CreateTournamentDto {
  @ApiProperty({
    description: 'Tournament name',
    example: 'Summer Padel Championship 2024',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Tournament description',
    example: 'Annual summer tournament for all skill levels',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Club ID where tournament takes place',
    example: 'clxxx123',
  })
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @ApiProperty({
    description: 'Tournament start date and time',
    example: '2024-07-15T09:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @ApiProperty({
    description: 'Tournament end date and time',
    example: '2024-07-15T18:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endAt: string;

  @ApiProperty({
    description: 'Tournament location/address',
    example: 'Club Padel Barcelona, Av. Diagonal 123',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://example.com/tournament-cover.jpg',
  })
  @IsString()
  @IsOptional()
  coverUrl?: string;

  @ApiProperty({
    description: 'Tournament visibility',
    enum: TournamentVisibility,
    example: TournamentVisibility.PUBLIC,
  })
  @IsEnum(TournamentVisibility)
  visibility: TournamentVisibility;

  @ApiProperty({
    description: 'Tournament format',
    enum: TournamentFormat,
    example: TournamentFormat.SINGLE_ELIM,
  })
  @IsEnum(TournamentFormat)
  format: TournamentFormat;

  @ApiPropertyOptional({
    description: 'Maximum number of teams',
    example: 16,
  })
  @IsInt()
  @Min(2)
  @IsOptional()
  maxTeams?: number;

  @ApiPropertyOptional({
    description: 'Minimum number of teams',
    example: 4,
  })
  @IsInt()
  @Min(2)
  @IsOptional()
  minTeams?: number;

  @ApiPropertyOptional({
    description: 'Entry fee in cents',
    example: 2500,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  entryFeeCents?: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Supported languages',
    example: ['es', 'en'],
    default: ['es'],
  })
  @IsArray()
  @IsOptional()
  languages?: string[];
}
