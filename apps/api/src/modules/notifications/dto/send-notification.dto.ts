import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '@padel/database';

export class SendNotificationDto {
  @ApiProperty({
    description: 'User ID to send notification to',
    example: 'usr_xxx123',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.MATCH_SCHEDULED,
  })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Match Scheduled',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your match is scheduled for tomorrow at 10:00 AM',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'Additional payload data',
    example: { matchId: 'mtch_xxx123', courtId: 'crt_xxx123' },
  })
  @IsOptional()
  payload?: any;
}
