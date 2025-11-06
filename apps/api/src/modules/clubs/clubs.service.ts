import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@padel/database';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
import { CreateCourtDto } from './dto/create-court.dto';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async create(ownerId: string, dto: CreateClubDto) {
    const club = await this.prisma.club.create({
      data: {
        name: dto.name,
        description: dto.description,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        latitude: dto.latitude,
        longitude: dto.longitude,
        logoUrl: dto.logoUrl,
        website: dto.website,
        phone: dto.phone,
        email: dto.email,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            courts: true,
            tournaments: true,
          },
        },
      },
    });

    return club;
  }

  async findAll() {
    const clubs = await this.prisma.club.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            courts: true,
            tournaments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return clubs;
  }

  async findOne(id: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            phone: true,
          },
        },
        courts: {
          orderBy: {
            name: 'asc',
          },
        },
        tournaments: {
          select: {
            id: true,
            name: true,
            startAt: true,
            status: true,
            visibility: true,
          },
          orderBy: {
            startAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    return club;
  }

  async update(id: string, userId: string, dto: UpdateClubDto) {
    const club = await this.prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    if (club.ownerId !== userId) {
      throw new ForbiddenException('Only club owner can update this club');
    }

    const updated = await this.prisma.club.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.address && { address: dto.address }),
        ...(dto.city && { city: dto.city }),
        ...(dto.country && { country: dto.country }),
        ...(dto.latitude !== undefined && { latitude: dto.latitude }),
        ...(dto.longitude !== undefined && { longitude: dto.longitude }),
        ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            courts: true,
            tournaments: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const club = await this.prisma.club.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tournaments: true,
          },
        },
      },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    if (club.ownerId !== userId) {
      throw new ForbiddenException('Only club owner can delete this club');
    }

    if (club._count.tournaments > 0) {
      throw new ForbiddenException(
        'Cannot delete club with existing tournaments',
      );
    }

    await this.prisma.club.delete({
      where: { id },
    });

    return { message: 'Club deleted successfully' };
  }

  // Court management
  async createCourt(clubId: string, userId: string, dto: CreateCourtDto) {
    const club = await this.prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!club) {
      throw new NotFoundException('Club not found');
    }

    if (club.ownerId !== userId) {
      throw new ForbiddenException('Only club owner can create courts');
    }

    const court = await this.prisma.court.create({
      data: {
        clubId,
        name: dto.name,
        surface: dto.surface,
        indoor: dto.indoor || false,
        hasLighting: dto.hasLighting || false,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
        availableTo: dto.availableTo ? new Date(dto.availableTo) : null,
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return court;
  }

  async findCourts(clubId: string) {
    const courts = await this.prisma.court.findMany({
      where: { clubId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return courts;
  }

  async removeCourt(courtId: string, userId: string) {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: {
        club: true,
        _count: {
          select: {
            matches: true,
          },
        },
      },
    });

    if (!court) {
      throw new NotFoundException('Court not found');
    }

    if (court.club.ownerId !== userId) {
      throw new ForbiddenException('Only club owner can delete courts');
    }

    if (court._count.matches > 0) {
      throw new ForbiddenException('Cannot delete court with existing matches');
    }

    await this.prisma.court.delete({
      where: { id: courtId },
    });

    return { message: 'Court deleted successfully' };
  }
}
