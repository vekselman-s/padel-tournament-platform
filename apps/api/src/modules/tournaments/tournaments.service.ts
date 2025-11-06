import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@padel/database';
import { TournamentStatus } from '@padel/database';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { QueryTournamentDto } from './dto/query-tournament.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class TournamentsService {
  constructor(private prisma: PrismaService) {}

  async create(organizerId: string, dto: CreateTournamentDto) {
    // Verify club exists
    const club = await this.prisma.club.findUnique({
      where: { id: dto.clubId },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    // Generate unique share slug
    const shareSlug = nanoid(10);

    const tournament = await this.prisma.tournament.create({
      data: {
        name: dto.name,
        description: dto.description,
        clubId: dto.clubId,
        organizerId,
        startAt: new Date(dto.startAt),
        endAt: new Date(dto.endAt),
        location: dto.location,
        coverUrl: dto.coverUrl,
        visibility: dto.visibility,
        format: dto.format,
        maxTeams: dto.maxTeams,
        minTeams: dto.minTeams,
        entryFeeCents: dto.entryFeeCents || 0,
        currency: dto.currency || 'USD',
        languages: dto.languages || ['es'],
        shareSlug,
        status: TournamentStatus.DRAFT,
      },
      include: {
        club: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            teams: true,
            registrations: true,
            matches: true,
          },
        },
      },
    });

    return tournament;
  }

  async findAll(query: QueryTournamentDto) {
    const { page = 1, limit = 20, search, ...filters } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.visibility) {
      where.visibility = filters.visibility;
    }

    if (filters.clubId) {
      where.clubId = filters.clubId;
    }

    if (filters.organizerId) {
      where.organizerId = filters.organizerId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tournaments, total] = await Promise.all([
      this.prisma.tournament.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startAt: 'desc' },
        include: {
          club: true,
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              teams: true,
              registrations: true,
              matches: true,
            },
          },
        },
      }),
      this.prisma.tournament.count({ where }),
    ]);

    return {
      data: tournaments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        club: {
          include: {
            courts: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        categories: {
          include: {
            _count: {
              select: {
                teams: true,
                matches: true,
              },
            },
          },
        },
        _count: {
          select: {
            teams: true,
            registrations: true,
            matches: true,
            groups: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  async findByShareSlug(shareSlug: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { shareSlug },
      include: {
        club: {
          include: {
            courts: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: {
          include: {
            teams: {
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
        },
        matches: {
          where: {
            state: {
              in: ['ONGOING', 'DONE'],
            },
          },
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
          orderBy: {
            scheduledAt: 'asc',
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  async update(id: string, userId: string, dto: UpdateTournamentDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the tournament organizer can update this tournament',
      );
    }

    const updated = await this.prisma.tournament.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.startAt && { startAt: new Date(dto.startAt) }),
        ...(dto.endAt && { endAt: new Date(dto.endAt) }),
        ...(dto.location && { location: dto.location }),
        ...(dto.coverUrl !== undefined && { coverUrl: dto.coverUrl }),
        ...(dto.visibility && { visibility: dto.visibility }),
        ...(dto.format && { format: dto.format }),
        ...(dto.maxTeams !== undefined && { maxTeams: dto.maxTeams }),
        ...(dto.minTeams !== undefined && { minTeams: dto.minTeams }),
        ...(dto.entryFeeCents !== undefined && {
          entryFeeCents: dto.entryFeeCents,
        }),
        ...(dto.currency && { currency: dto.currency }),
        ...(dto.status && { status: dto.status }),
        ...(dto.languages && { languages: dto.languages }),
      },
      include: {
        club: true,
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            registrations: true,
            matches: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the tournament organizer can delete this tournament',
      );
    }

    if (
      tournament.status === TournamentStatus.LIVE ||
      tournament.status === TournamentStatus.FINISHED
    ) {
      throw new BadRequestException(
        'Cannot delete a tournament that is live or finished',
      );
    }

    if (tournament._count.registrations > 0) {
      throw new BadRequestException(
        'Cannot delete a tournament with existing registrations',
      );
    }

    await this.prisma.tournament.delete({
      where: { id },
    });

    return { message: 'Tournament deleted successfully' };
  }

  async generateBracket(id: string, userId: string) {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        teams: true,
        categories: {
          include: {
            teams: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.organizerId !== userId) {
      throw new ForbiddenException(
        'Only the tournament organizer can generate brackets',
      );
    }

    if (tournament.status !== TournamentStatus.REGISTRATION) {
      throw new BadRequestException(
        'Bracket can only be generated during registration phase',
      );
    }

    if (tournament.teams.length < (tournament.minTeams || 2)) {
      throw new BadRequestException(
        `Not enough teams registered. Minimum: ${tournament.minTeams || 2}`,
      );
    }

    // Generate bracket based on format
    // This is a simplified implementation
    const matches = [];

    for (const category of tournament.categories) {
      const teams = category.teams;

      if (tournament.format === 'SINGLE_ELIM') {
        // Simple single elimination bracket generation
        const numRounds = Math.ceil(Math.log2(teams.length));

        for (let round = numRounds; round >= 1; round--) {
          const matchesInRound = Math.pow(2, round - 1);

          for (let i = 0; i < matchesInRound; i++) {
            matches.push({
              tournamentId: id,
              categoryId: category.id,
              round,
              matchNumber: i + 1,
              teamAId: round === numRounds && i * 2 < teams.length ? teams[i * 2].id : null,
              teamBId: round === numRounds && i * 2 + 1 < teams.length ? teams[i * 2 + 1].id : null,
            });
          }
        }
      }
    }

    // Create all matches
    await this.prisma.match.createMany({
      data: matches,
    });

    // Update tournament status
    await this.prisma.tournament.update({
      where: { id },
      data: {
        status: TournamentStatus.LIVE,
      },
    });

    return {
      message: 'Bracket generated successfully',
      matchesCreated: matches.length,
    };
  }
}
