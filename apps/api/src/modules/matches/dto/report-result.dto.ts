import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SetScoreDto {
  @ApiProperty({
    description: 'Set number',
    example: 1,
  })
  @IsInt()
  @Min(1)
  setNumber: number;

  @ApiProperty({
    description: 'Games won by Team A',
    example: 6,
  })
  @IsInt()
  @Min(0)
  @Max(7)
  gamesA: number;

  @ApiProperty({
    description: 'Games won by Team B',
    example: 4,
  })
  @IsInt()
  @Min(0)
  @Max(7)
  gamesB: number;

  @ApiPropertyOptional({
    description: 'Tiebreak score for Team A',
    example: 7,
  })
  @IsInt()
  @IsOptional()
  tiebreakA?: number;

  @ApiPropertyOptional({
    description: 'Tiebreak score for Team B',
    example: 5,
  })
  @IsInt()
  @IsOptional()
  tiebreakB?: number;
}

export class ReportResultDto {
  @ApiProperty({
    description: 'Match ID',
    example: 'mtch_xxx123',
  })
  @IsString()
  @IsNotEmpty()
  matchId: string;

  @ApiProperty({
    description: 'Set scores',
    type: [SetScoreDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetScoreDto)
  setScores: SetScoreDto[];

  @ApiProperty({
    description: 'Winner team ID',
    example: 'tm_xxx123',
  })
  @IsString()
  @IsNotEmpty()
  winnerId: string;

  @ApiPropertyOptional({
    description: 'Photo proof URL',
    example: 'https://example.com/match-result.jpg',
  })
  @IsUrl()
  @IsOptional()
  photoProof?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Great match, very competitive',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
