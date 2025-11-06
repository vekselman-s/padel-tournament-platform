import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@padel/database';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTeamDto) {
    // Verify tournament exists
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: dto.tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Verify category exists and belongs to tournament
    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.categoryId,
        tournamentId: dto.tournamentId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found in this tournament');
    }

    // Verify both players exist
    const [player1, player2] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.player1Id } }),
      this.prisma.user.findUnique({ where: { id: dto.player2Id } }),
    ]);

    if (!player1 || !player2) {
      throw new NotFoundException('One or both players not found');
    }

    if (dto.player1Id === dto.player2Id) {
      throw new BadRequestException('Player 1 and Player 2 must be different');
    }

    // Check if team already exists
    const existingTeam = await this.prisma.team.findFirst({
      where: {
        tournamentId: dto.tournamentId,
        OR: [
          {
            AND: [
              { player1Id: dto.player1Id },
              { player2Id: dto.player2Id },
            ],
          },
          {
            AND: [
              { player1Id: dto.player2Id },
              { player2Id: dto.player1Id },
            ],
          },
        ],
      },
    });

    if (existingTeam) {
      throw new BadRequestException(
        'Team with these players already exists in this tournament',
      );
    }

    // Create team
    const team = await this.prisma.team.create({
      data: {
        tournamentId: dto.tournamentId,
        categoryId: dto.categoryId,
        player1Id: dto.player1Id,
        player2Id: dto.player2Id,
        name: dto.name,
        elo: 1500.0, // Default ELO
      },
      include: {
        player1: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        tournament: {
          select: {
            id: true,
            name: true,
            startAt: true,
          },
        },
      },
    });

    return team;
  }

  async findAll(tournamentId?: string, categoryId?: string) {
    const where: any = {};

    if (tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const teams = await this.prisma.team.findMany({
      where,
      include: {
        player1: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        tournament: {
          select: {
            id: true,
            name: true,
            startAt: true,
          },
        },
        _count: {
          select: {
            matchesAsTeamA: true,
            matchesAsTeamB: true,
            matchWinnerOf: true,
          },
        },
      },
      orderBy: {
        seed: 'asc',
      },
    });

    return teams;
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
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
        category: true,
        tournament: {
          include: {
            club: true,
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        registrations: true,
        matchesAsTeamA: {
          include: {
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
            setScores: true,
          },
        },
        matchesAsTeamB: {
          include: {
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
            setScores: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    return team;
  }

  async update(id: string, userId: string, dto: UpdateTeamDto) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        tournament: true,
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Only tournament organizer or team members can update
    if (
      team.tournament.organizerId !== userId &&
      team.player1Id !== userId &&
      team.player2Id !== userId
    ) {
      throw new ForbiddenException('Not authorized to update this team');
    }

    const updated = await this.prisma.team.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.seed !== undefined && { seed: dto.seed }),
        ...(dto.elo !== undefined && { elo: dto.elo }),
      },
      include: {
        player1: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        player2: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        category: true,
        tournament: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        tournament: true,
        _count: {
          select: {
            matchesAsTeamA: true,
            matchesAsTeamB: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Only tournament organizer can delete teams
    if (team.tournament.organizerId !== userId) {
      throw new ForbiddenException('Only tournament organizer can delete teams');
    }

    // Cannot delete if team has matches
    if (team._count.matchesAsTeamA > 0 || team._count.matchesAsTeamB > 0) {
      throw new BadRequestException(
        'Cannot delete team with existing matches',
      );
    }

    await this.prisma.team.delete({
      where: { id },
    });

    return { message: 'Team deleted successfully' };
  }
}
