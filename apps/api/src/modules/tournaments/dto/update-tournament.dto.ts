import { PartialType } from '@nestjs/swagger';
import { CreateTournamentDto } from './create-tournament.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { TournamentStatus } from '@padel/database';

export class UpdateTournamentDto extends PartialType(CreateTournamentDto) {
  @ApiPropertyOptional({
    description: 'Tournament status',
    enum: TournamentStatus,
    example: TournamentStatus.LIVE,
  })
  @IsEnum(TournamentStatus)
  @IsOptional()
  status?: TournamentStatus;
}
