import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ConfirmResultDto {
  @ApiProperty({
    description: 'Accept or reject the result',
    example: true,
  })
  @IsBoolean()
  accept: boolean;

  @ApiPropertyOptional({
    description: 'Reason for rejection',
    example: 'Score does not match actual result',
  })
  @IsString()
  @IsOptional()
  reason?: string;
}
