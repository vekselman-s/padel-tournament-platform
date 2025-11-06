import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@padel/database';
import { SendNotificationDto } from './dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async send(dto: SendNotificationDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create notification
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        payloadJson: dto.payload || null,
        read: false,
        deliveredAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // TODO: Implement actual push notification delivery
    // - Firebase Cloud Messaging
    // - Apple Push Notification Service
    // - Email notifications
    // - SMS notifications

    return notification;
  }

  async sendBulk(userIds: string[], dto: Omit<SendNotificationDto, 'userId'>) {
    const notifications = await this.prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        payloadJson: dto.payload || null,
        read: false,
        deliveredAt: new Date(),
      })),
    });

    return {
      message: 'Notifications sent successfully',
      count: notifications.count,
    };
  }

  async findAll(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return notifications;
  }

  async findUnread(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return {
      message: 'All notifications marked as read',
      count: result.count,
    };
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: { id },
    });

    return { message: 'Notification deleted successfully' };
  }

  async deleteAll(userId: string) {
    const result = await this.prisma.notification.deleteMany({
      where: { userId },
    });

    return {
      message: 'All notifications deleted',
      count: result.count,
    };
  }

  // Helper methods for common notification scenarios
  async notifyMatchScheduled(matchId: string, teamAId: string, teamBId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teamA: true,
        teamB: true,
        court: true,
        tournament: true,
      },
    });

    if (!match || !match.teamA || !match.teamB) {
      return;
    }

    const userIds = [
      match.teamA.player1Id,
      match.teamA.player2Id,
      match.teamB.player1Id,
      match.teamB.player2Id,
    ];

    await this.sendBulk(userIds, {
      type: 'MATCH_SCHEDULED' as any,
      title: 'Match Scheduled',
      message: `Your match in ${match.tournament.name} is scheduled for ${match.scheduledAt?.toLocaleString()}`,
      payload: {
        matchId,
        courtId: match.courtId,
        tournamentId: match.tournamentId,
      },
    });
  }

  async notifyRegistrationConfirmed(registrationId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        team: true,
        tournament: true,
      },
    });

    if (!registration) {
      return;
    }

    const userIds = [
      registration.team.player1Id,
      registration.team.player2Id,
    ];

    await this.sendBulk(userIds, {
      type: 'REGISTRATION_CONFIRMED' as any,
      title: 'Registration Confirmed',
      message: `Your registration for ${registration.tournament.name} has been confirmed!`,
      payload: {
        registrationId,
        tournamentId: registration.tournamentId,
        teamId: registration.teamId,
      },
    });
  }
}
