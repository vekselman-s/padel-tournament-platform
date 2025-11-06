import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMatchDto {
  @ApiProperty({
    description: 'Tournament ID',
    example: 'trn_xxx123',
  })
  @IsString()
  @IsNotEmpty()
  tournamentId: string;

  @ApiProperty({
    description: 'Category ID',
    example: 'cat_xxx123',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Round number',
    example: 1,
  })
  @IsInt()
  @Min(1)
  round: number;

  @ApiPropertyOptional({
    description: 'Match number in bracket',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  matchNumber?: number;

  @ApiPropertyOptional({
    description: 'Group ID (for round robin)',
    example: 'grp_xxx123',
  })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({
    description: 'Court ID',
    example: 'crt_xxx123',
  })
  @IsString()
  @IsOptional()
  courtId?: string;

  @ApiPropertyOptional({
    description: 'Scheduled date and time',
    example: '2024-07-15T10:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Team A ID',
    example: 'tm_xxx123',
  })
  @IsString()
  @IsOptional()
  teamAId?: string;

  @ApiPropertyOptional({
    description: 'Team B ID',
    example: 'tm_xxx456',
  })
  @IsString()
  @IsOptional()
  teamBId?: string;

  @ApiPropertyOptional({
    description: 'Best of X sets',
    example: 3,
    default: 3,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  bestOf?: number;
}
