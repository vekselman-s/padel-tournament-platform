import { PartialType } from '@nestjs/swagger';
import { CreateTeamDto } from './create-team.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional } from 'class-validator';

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiPropertyOptional({
    description: 'Team seeding position',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  seed?: number;

  @ApiPropertyOptional({
    description: 'Team ELO rating',
    example: 1500.5,
  })
  @IsNumber()
  @IsOptional()
  elo?: number;
}
