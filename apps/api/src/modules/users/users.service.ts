import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@padel/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@padel/database';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        avatar: dto.avatar,
        phone: dto.phone,
        role: dto.role || UserRole.PLAYER,
        locale: dto.locale || 'es',
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        role: true,
        locale: true,
        createdAt: true,
        _count: {
          select: {
            ownedClubs: true,
            organizedTournaments: true,
            teamPlayer1: true,
            teamPlayer2: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        role: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        ownedClubs: {
          select: {
            id: true,
            name: true,
            city: true,
            country: true,
          },
        },
        organizedTournaments: {
          select: {
            id: true,
            name: true,
            startAt: true,
            status: true,
          },
          orderBy: {
            startAt: 'desc',
          },
          take: 10,
        },
        _count: {
          select: {
            teamPlayer1: true,
            teamPlayer2: true,
            rankings: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, currentUserId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only the user themselves or an admin can update
    if (id !== currentUserId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to update this user');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.avatar !== undefined && { avatar: dto.avatar }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.locale && { locale: dto.locale }),
        // Role can only be changed by admins
        ...(dto.role && user.role === UserRole.ADMIN && { role: dto.role }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        role: true,
        locale: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  async remove(id: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            organizedTournaments: true,
            ownedClubs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only admins can delete users, or users can delete themselves
    if (id !== currentUserId && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Not authorized to delete this user');
    }

    // Cannot delete if user has active tournaments or clubs
    if (
      user._count.organizedTournaments > 0 ||
      user._count.ownedClubs > 0
    ) {
      throw new ForbiddenException(
        'Cannot delete user with active tournaments or clubs',
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  }
}
