import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CourtSurface } from '@padel/database';

export class CreateCourtDto {
  @ApiProperty({
    description: 'Court name',
    example: 'Court 1',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Court surface type',
    enum: CourtSurface,
    example: CourtSurface.HARD,
  })
  @IsEnum(CourtSurface)
  @IsOptional()
  surface?: CourtSurface;

  @ApiPropertyOptional({
    description: 'Is indoor court',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  indoor?: boolean;

  @ApiPropertyOptional({
    description: 'Has lighting',
    example: true,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  hasLighting?: boolean;

  @ApiPropertyOptional({
    description: 'Available from time',
    example: '2024-01-01T08:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiPropertyOptional({
    description: 'Available to time',
    example: '2024-01-01T22:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  availableTo?: string;
}
