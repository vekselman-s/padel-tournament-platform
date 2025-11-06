import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTeamDto {
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
    description: 'Player 1 ID',
    example: 'usr_xxx123',
  })
  @IsString()
  @IsNotEmpty()
  player1Id: string;

  @ApiProperty({
    description: 'Player 2 ID',
    example: 'usr_xxx456',
  })
  @IsString()
  @IsNotEmpty()
  player2Id: string;

  @ApiPropertyOptional({
    description: 'Team name (optional)',
    example: 'Thunder Duo',
  })
  @IsString()
  @IsOptional()
  name?: string;
}
