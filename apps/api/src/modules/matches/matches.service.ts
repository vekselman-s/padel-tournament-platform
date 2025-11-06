import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@padel/database';
import {
  MatchState,
  ResultReportStatus,
} from '@padel/database';
import { CreateMatchDto } from './dto/create-match.dto';
import { ReportResultDto } from './dto/report-result.dto';
import { ConfirmResultDto } from './dto/confirm-result.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMatchDto) {
    // Verify tournament exists and user is organizer
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: dto.tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.organizerId !== userId) {
      throw new ForbiddenException(
        'Only tournament organizer can create matches',
      );
    }

    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Verify teams if provided
    if (dto.teamAId) {
      const teamA = await this.prisma.team.findUnique({
        where: { id: dto.teamAId },
      });
      if (!teamA) {
        throw new NotFoundException('Team A not found');
      }
    }

    if (dto.teamBId) {
      const teamB = await this.prisma.team.findUnique({
        where: { id: dto.teamBId },
      });
      if (!teamB) {
        throw new NotFoundException('Team B not found');
      }
    }

    const match = await this.prisma.match.create({
      data: {
        tournamentId: dto.tournamentId,
        categoryId: dto.categoryId,
        round: dto.round,
        matchNumber: dto.matchNumber,
        groupId: dto.groupId,
        courtId: dto.courtId,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        teamAId: dto.teamAId,
        teamBId: dto.teamBId,
        bestOf: dto.bestOf || 3,
        state: MatchState.PENDING,
      },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        court: true,
        teamA: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            player2: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        teamB: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            player2: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return match;
  }

  async findAll(tournamentId?: string, categoryId?: string) {
    const where: any = {};

    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const matches = await this.prisma.match.findMany({
      where,
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        court: true,
        teamA: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            player2: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        teamB: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            player2: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        setScores: {
          orderBy: {
            setNumber: 'asc',
          },
        },
        winner: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            player2: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: [
        { scheduledAt: 'asc' },
        { round: 'desc' },
        { matchNumber: 'asc' },
      ],
    });

    return matches;
  }

  async findOne(id: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        tournament: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        category: true,
        court: true,
        group: true,
        teamA: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
              },
            },
            player2: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
        teamB: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
              },
            },
            player2: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                phone: true,
              },
            },
          },
        },
        setScores: {
          orderBy: {
            setNumber: 'asc',
          },
        },
        winner: {
          include: {
            player1: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            player2: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        resultReports: {
          include: {
            reportedBy: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }

  async reportResult(userId: string, dto: ReportResultDto) {
    const match = await this.prisma.match.findUnique({
      where: { id: dto.matchId },
      include: {
        teamA: true,
        teamB: true,
        tournament: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.state === MatchState.DONE) {
      throw new BadRequestException('Match result already confirmed');
    }

    if (!match.teamA || !match.teamB) {
      throw new BadRequestException('Match teams not set');
    }

    // Verify user is part of one of the teams
    const isTeamAMember =
      match.teamA.player1Id === userId || match.teamA.player2Id === userId;
    const isTeamBMember =
      match.teamB.player1Id === userId || match.teamB.player2Id === userId;

    if (!isTeamAMember && !isTeamBMember) {
      throw new ForbiddenException(
        'Only match participants can report results',
      );
    }

    // Verify winner is one of the teams
    if (dto.winnerId !== match.teamAId && dto.winnerId !== match.teamBId) {
      throw new BadRequestException('Winner must be one of the match teams');
    }

    // Create result report
    const resultReport = await this.prisma.resultReport.create({
      data: {
        matchId: dto.matchId,
        reportedById: userId,
        payloadJson: dto.setScores,
        photoProof: dto.photoProof,
        notes: dto.notes,
        status: ResultReportStatus.REPORTED,
      },
    });

    // Create set scores
    await this.prisma.setScore.createMany({
      data: dto.setScores.map((set) => ({
        matchId: dto.matchId,
        setNumber: set.setNumber,
        gamesA: set.gamesA,
        gamesB: set.gamesB,
        tiebreakA: set.tiebreakA,
        tiebreakB: set.tiebreakB,
      })),
      skipDuplicates: true,
    });

    // Update match state
    await this.prisma.match.update({
      where: { id: dto.matchId },
      data: {
        state: MatchState.ONGOING,
        winnerId: dto.winnerId,
      },
    });

    return {
      message: 'Result reported successfully',
      resultReport,
    };
  }

  async confirmResult(
    userId: string,
    resultReportId: string,
    dto: ConfirmResultDto,
  ) {
    const resultReport = await this.prisma.resultReport.findUnique({
      where: { id: resultReportId },
      include: {
        match: {
          include: {
            teamA: true,
            teamB: true,
          },
        },
      },
    });

    if (!resultReport) {
      throw new NotFoundException('Result report not found');
    }

    const match = resultReport.match;

    // Verify user is from the opposing team
    const reportedByTeamA =
      match.teamA?.player1Id === resultReport.reportedById ||
      match.teamA?.player2Id === resultReport.reportedById;

    const isOpposingTeamMember = reportedByTeamA
      ? match.teamB?.player1Id === userId ||
        match.teamB?.player2Id === userId
      : match.teamA?.player1Id === userId ||
        match.teamA?.player2Id === userId;

    if (!isOpposingTeamMember) {
      throw new ForbiddenException(
        'Only the opposing team can confirm results',
      );
    }

    // Update result report status
    const status = dto.accept
      ? ResultReportStatus.CONFIRMED
      : ResultReportStatus.REJECTED;

    await this.prisma.resultReport.update({
      where: { id: resultReportId },
      data: {
        status,
        notes: dto.reason
          ? `${resultReport.notes || ''}\nRejection reason: ${dto.reason}`
          : resultReport.notes,
      },
    });

    // If confirmed, mark match as done
    if (dto.accept) {
      await this.prisma.match.update({
        where: { id: match.id },
        data: {
          state: MatchState.DONE,
        },
      });

      return {
        message: 'Result confirmed successfully',
        match: await this.findOne(match.id),
      };
    }

    // If rejected, reset match state
    await this.prisma.match.update({
      where: { id: match.id },
      data: {
        state: MatchState.PENDING,
        winnerId: null,
      },
    });

    // Delete set scores
    await this.prisma.setScore.deleteMany({
      where: { matchId: match.id },
    });

    return {
      message: 'Result rejected. Please report the correct result.',
    };
  }

  async remove(id: string, userId: string) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        tournament: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.tournament.organizerId !== userId) {
      throw new ForbiddenException(
        'Only tournament organizer can delete matches',
      );
    }

    if (match.state === MatchState.DONE) {
      throw new BadRequestException('Cannot delete completed matches');
    }

    await this.prisma.match.delete({
      where: { id },
    });

    return { message: 'Match deleted successfully' };
  }
}
