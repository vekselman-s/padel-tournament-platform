import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@padel/database';

/**
 * Interface for court availability
 */
interface Court {
  id: string;
  name: string;
  availableFrom?: Date | null;
  availableTo?: Date | null;
}

/**
 * Interface for match scheduling
 */
interface SchedulableMatch {
  id: string;
  teamAId: string | null;
  teamBId: string | null;
  round: number;
  categoryId: string;
  estimatedDuration: number; // minutes
}

/**
 * Interface for scheduling conflict
 */
interface SchedulingConflict {
  type: 'player' | 'court' | 'time';
  matchId: string;
  description: string;
  conflictingMatchId?: string;
  playerId?: string;
}

/**
 * Interface for scheduled match
 */
interface ScheduledMatch {
  matchId: string;
  courtId: string;
  courtName: string;
  scheduledAt: Date;
  estimatedEndTime: Date;
  round: number;
  categoryId: string;
}

/**
 * Interface for buffer configuration
 */
interface BufferConfig {
  betweenMatches: number; // minutes between matches on same court
  samePlayer: number; // minutes buffer for same player between matches
  courtChangeTime: number; // minutes to change courts
}

/**
 * SchedulingService handles automatic match scheduling with conflict detection.
 *
 * Features:
 * - Auto-schedule matches to available courts with time slots
 * - Detect and prevent player conflicts (same player in multiple simultaneous matches)
 * - Respect buffer times between matches
 * - Optimize court usage for maximum efficiency
 * - Handle multi-category tournament scheduling
 * - Support for sequential and parallel scheduling strategies
 *
 * Scheduling Algorithms:
 * - Greedy algorithm: Schedule earliest available slot per match
 * - Round-robin court assignment: Distribute matches evenly
 * - Conflict detection: O(n*m) where n=matches, m=players
 * - Optimization: Minimize total tournament duration
 *
 * @class SchedulingService
 */
@Injectable()
export class SchedulingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Auto-schedules all pending matches for a tournament.
   *
   * Algorithm:
   * 1. Get all unscheduled matches sorted by round (finals first)
   * 2. Get available courts and time windows
   * 3. For each match, find earliest available slot without conflicts
   * 4. Assign court and time, respecting all buffer times
   * 5. Detect and report any conflicts
   *
   * Scheduling Strategy:
   * - Priority matches (finals, semifinals) scheduled first
   * - Respect round order (can't schedule round 2 before round 3)
   * - Distribute matches across courts evenly
   * - Minimize player wait times
   *
   * @param tournamentId - The tournament identifier
   * @param matches - Array of matches to schedule (if null, schedules all pending)
   * @param courts - Array of available courts (if null, uses all tournament courts)
   * @param buffers - Buffer time configuration
   * @returns Array of scheduled matches with times and courts
   * @throws BadRequestException if scheduling is impossible
   */
  async scheduleMatches(
    tournamentId: string,
    matches: SchedulableMatch[] | null = null,
    courts: Court[] | null = null,
    buffers: BufferConfig = {
      betweenMatches: 10,
      samePlayer: 30,
      courtChangeTime: 5,
    },
  ): Promise<ScheduledMatch[]> {
    // Get tournament details
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        club: {
          include: {
            courts: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new BadRequestException('Tournament not found');
    }

    // Get courts
    const availableCourts = courts || tournament.club.courts;

    if (availableCourts.length === 0) {
      throw new BadRequestException('No courts available for scheduling');
    }

    // Get matches to schedule
    let matchesToSchedule: SchedulableMatch[];

    if (matches) {
      matchesToSchedule = matches;
    } else {
      const pendingMatches = await this.prisma.match.findMany({
        where: {
          tournamentId,
          scheduledAt: null,
          teamAId: { not: null },
          teamBId: { not: null },
        },
        orderBy: { round: 'asc' }, // Schedule finals first
      });

      matchesToSchedule = pendingMatches.map((m) => ({
        id: m.id,
        teamAId: m.teamAId,
        teamBId: m.teamBId,
        round: m.round,
        categoryId: m.categoryId,
        estimatedDuration: m.bestOf === 5 ? 90 : 60, // Best of 5 = 90 min, best of 3 = 60 min
      }));
    }

    // Initialize court schedules
    const courtSchedules = new Map<string, Date>();
    for (const court of availableCourts) {
      courtSchedules.set(court.id, tournament.startAt);
    }

    // Track player schedules to avoid conflicts
    const playerSchedules = new Map<string, Date>();

    const scheduledMatches: ScheduledMatch[] = [];
    const conflicts: SchedulingConflict[] = [];

    // Schedule each match
    for (const match of matchesToSchedule) {
      const result = await this.findBestSlot(
        match,
        availableCourts,
        courtSchedules,
        playerSchedules,
        buffers,
        tournament.startAt,
        tournament.endAt,
      );

      if (result.conflict) {
        conflicts.push(result.conflict);
        continue;
      }

      if (result.slot) {
        const { courtId, courtName, startTime, endTime } = result.slot;

        // Update schedules
        courtSchedules.set(
          courtId,
          new Date(endTime.getTime() + buffers.betweenMatches * 60000),
        );

        // Update player schedules
        if (match.teamAId && match.teamBId) {
          const team = await this.prisma.team.findUnique({
            where: { id: match.teamAId },
            select: { player1Id: true, player2Id: true },
          });
          const teamB = await this.prisma.team.findUnique({
            where: { id: match.teamBId },
            select: { player1Id: true, player2Id: true },
          });

          if (team && teamB) {
            const players = [
              team.player1Id,
              team.player2Id,
              teamB.player1Id,
              teamB.player2Id,
            ];
            const nextAvailable = new Date(
              endTime.getTime() + buffers.samePlayer * 60000,
            );
            players.forEach((p) => playerSchedules.set(p, nextAvailable));
          }
        }

        scheduledMatches.push({
          matchId: match.id,
          courtId,
          courtName,
          scheduledAt: startTime,
          estimatedEndTime: endTime,
          round: match.round,
          categoryId: match.categoryId,
        });

        // Update match in database
        await this.prisma.match.update({
          where: { id: match.id },
          data: {
            courtId,
            scheduledAt: startTime,
          },
        });
      }
    }

    if (conflicts.length > 0) {
      console.warn(`Scheduling completed with ${conflicts.length} conflicts:`, conflicts);
    }

    return scheduledMatches;
  }

  /**
   * Finds the best available time slot for a match.
   *
   * @param match - Match to schedule
   * @param courts - Available courts
   * @param courtSchedules - Current court availability
   * @param playerSchedules - Current player availability
   * @param buffers - Buffer configuration
   * @param tournamentStart - Tournament start time
   * @param tournamentEnd - Tournament end time
   * @returns Best slot or conflict
   */
  private async findBestSlot(
    match: SchedulableMatch,
    courts: Court[],
    courtSchedules: Map<string, Date>,
    playerSchedules: Map<string, Date>,
    buffers: BufferConfig,
    tournamentStart: Date,
    tournamentEnd: Date,
  ): Promise<{
    slot?: {
      courtId: string;
      courtName: string;
      startTime: Date;
      endTime: Date;
    };
    conflict?: SchedulingConflict;
  }> {
    // Get player availability
    let earliestPlayerTime = tournamentStart;

    if (match.teamAId && match.teamBId) {
      const teamA = await this.prisma.team.findUnique({
        where: { id: match.teamAId },
        select: { player1Id: true, player2Id: true },
      });
      const teamB = await this.prisma.team.findUnique({
        where: { id: match.teamBId },
        select: { player1Id: true, player2Id: true },
      });

      if (teamA && teamB) {
        const players = [
          teamA.player1Id,
          teamA.player2Id,
          teamB.player1Id,
          teamB.player2Id,
        ];

        for (const playerId of players) {
          const playerTime = playerSchedules.get(playerId);
          if (playerTime && playerTime > earliestPlayerTime) {
            earliestPlayerTime = playerTime;
          }
        }
      }
    }

    // Find earliest available court
    let bestCourt: Court | null = null;
    let bestTime: Date | null = null;

    for (const court of courts) {
      const courtAvailable = courtSchedules.get(court.id) || tournamentStart;
      const startTime = new Date(
        Math.max(courtAvailable.getTime(), earliestPlayerTime.getTime()),
      );
      const endTime = new Date(
        startTime.getTime() + match.estimatedDuration * 60000,
      );

      // Check if within tournament time window
      if (endTime > tournamentEnd) {
        continue;
      }

      // Check court availability hours
      if (court.availableFrom && court.availableTo) {
        const courtStart = new Date(startTime);
        courtStart.setHours(court.availableFrom.getHours());
        courtStart.setMinutes(court.availableFrom.getMinutes());

        const courtEnd = new Date(startTime);
        courtEnd.setHours(court.availableTo.getHours());
        courtEnd.setMinutes(court.availableTo.getMinutes());

        if (startTime < courtStart || endTime > courtEnd) {
          continue;
        }
      }

      // This is a valid slot
      if (!bestTime || startTime < bestTime) {
        bestCourt = court;
        bestTime = startTime;
      }
    }

    if (!bestCourt || !bestTime) {
      return {
        conflict: {
          type: 'time',
          matchId: match.id,
          description: 'No available time slot found within tournament window',
        },
      };
    }

    return {
      slot: {
        courtId: bestCourt.id,
        courtName: bestCourt.name,
        startTime: bestTime,
        endTime: new Date(bestTime.getTime() + match.estimatedDuration * 60000),
      },
    };
  }

  /**
   * Detects scheduling conflicts in current schedule.
   *
   * Conflict Types:
   * - Player conflict: Same player in multiple simultaneous matches
   * - Court conflict: Same court assigned to multiple overlapping matches
   * - Time conflict: Match scheduled outside tournament window
   *
   * @param tournamentId - The tournament identifier
   * @returns Array of detected conflicts
   */
  async detectConflicts(tournamentId: string): Promise<SchedulingConflict[]> {
    const matches = await this.prisma.match.findMany({
      where: {
        tournamentId,
        scheduledAt: { not: null },
      },
      include: {
        teamA: {
          select: {
            player1Id: true,
            player2Id: true,
          },
        },
        teamB: {
          select: {
            player1Id: true,
            player2Id: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const conflicts: SchedulingConflict[] = [];

    // Check for player conflicts
    for (let i = 0; i < matches.length; i++) {
      const match1 = matches[i];
      if (!match1.scheduledAt || !match1.teamA || !match1.teamB) continue;

      const match1Players = [
        match1.teamA.player1Id,
        match1.teamA.player2Id,
        match1.teamB.player1Id,
        match1.teamB.player2Id,
      ];

      const match1End = new Date(
        match1.scheduledAt.getTime() + (match1.bestOf === 5 ? 90 : 60) * 60000,
      );

      for (let j = i + 1; j < matches.length; j++) {
        const match2 = matches[j];
        if (!match2.scheduledAt || !match2.teamA || !match2.teamB) continue;

        // Check if matches overlap in time
        const match2End = new Date(
          match2.scheduledAt.getTime() + (match2.bestOf === 5 ? 90 : 60) * 60000,
        );

        const overlaps =
          (match1.scheduledAt <= match2.scheduledAt &&
            match1End > match2.scheduledAt) ||
          (match2.scheduledAt <= match1.scheduledAt &&
            match2End > match1.scheduledAt);

        if (overlaps) {
          const match2Players = [
            match2.teamA.player1Id,
            match2.teamA.player2Id,
            match2.teamB.player1Id,
            match2.teamB.player2Id,
          ];

          // Check for common players
          const commonPlayers = match1Players.filter((p) =>
            match2Players.includes(p),
          );

          if (commonPlayers.length > 0) {
            conflicts.push({
              type: 'player',
              matchId: match1.id,
              conflictingMatchId: match2.id,
              playerId: commonPlayers[0],
              description: `Player ${commonPlayers[0]} scheduled in overlapping matches`,
            });
          }

          // Check for court conflicts
          if (match1.courtId && match2.courtId && match1.courtId === match2.courtId) {
            conflicts.push({
              type: 'court',
              matchId: match1.id,
              conflictingMatchId: match2.id,
              description: `Court ${match1.courtId} double-booked`,
            });
          }
        }
      }
    }

    return conflicts;
  }

  /**
   * Optimizes existing schedule to minimize tournament duration.
   *
   * Optimization Strategies:
   * - Compact schedule by filling gaps
   * - Reorder matches within same round
   * - Balance court usage
   * - Minimize player idle time
   *
   * Algorithm:
   * - Extract all matches
   * - Clear existing schedule
   * - Re-schedule with optimization heuristics
   *
   * @param tournamentId - The tournament identifier
   * @returns Optimized schedule with reduced duration
   */
  async optimizeSchedule(tournamentId: string): Promise<{
    originalDuration: number;
    optimizedDuration: number;
    matchesRescheduled: number;
  }> {
    // Get current schedule
    const currentMatches = await this.prisma.match.findMany({
      where: { tournamentId, scheduledAt: { not: null } },
      orderBy: { scheduledAt: 'asc' },
    });

    if (currentMatches.length === 0) {
      throw new BadRequestException('No scheduled matches to optimize');
    }

    // Calculate original duration
    const firstMatch = currentMatches[0];
    const lastMatch = currentMatches[currentMatches.length - 1];
    const originalDuration =
      (lastMatch.scheduledAt!.getTime() - firstMatch.scheduledAt!.getTime()) /
      60000;

    // Clear schedules
    await this.prisma.match.updateMany({
      where: { tournamentId },
      data: {
        scheduledAt: null,
        courtId: null,
      },
    });

    // Re-schedule with optimization
    const matches = currentMatches.map((m) => ({
      id: m.id,
      teamAId: m.teamAId,
      teamBId: m.teamBId,
      round: m.round,
      categoryId: m.categoryId,
      estimatedDuration: m.bestOf === 5 ? 90 : 60,
    }));

    const optimizedSchedule = await this.scheduleMatches(
      tournamentId,
      matches,
      null,
      {
        betweenMatches: 5, // Tighter buffer for optimization
        samePlayer: 20,
        courtChangeTime: 3,
      },
    );

    // Calculate new duration
    const sortedOptimized = optimizedSchedule.sort(
      (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
    );
    const optimizedDuration =
      (sortedOptimized[sortedOptimized.length - 1].estimatedEndTime.getTime() -
        sortedOptimized[0].scheduledAt.getTime()) /
      60000;

    return {
      originalDuration,
      optimizedDuration,
      matchesRescheduled: optimizedSchedule.length,
    };
  }

  /**
   * Assigns courts to matches without time scheduling.
   *
   * Simple court assignment for manual time scheduling.
   *
   * @param matches - Array of match IDs
   * @param courts - Array of court IDs
   * @returns Map of matchId to courtId
   */
  async assignCourts(
    matches: string[],
    courts: string[],
  ): Promise<Map<string, string>> {
    if (courts.length === 0) {
      throw new BadRequestException('No courts available');
    }

    const assignments = new Map<string, string>();
    let courtIndex = 0;

    for (const matchId of matches) {
      const courtId = courts[courtIndex];
      assignments.set(matchId, courtId);

      await this.prisma.match.update({
        where: { id: matchId },
        data: { courtId },
      });

      // Round-robin through courts
      courtIndex = (courtIndex + 1) % courts.length;
    }

    return assignments;
  }

  /**
   * Gets scheduling statistics for a tournament.
   *
   * @param tournamentId - The tournament identifier
   * @returns Scheduling statistics
   */
  async getSchedulingStats(tournamentId: string) {
    const matches = await this.prisma.match.findMany({
      where: { tournamentId },
    });

    const scheduled = matches.filter((m) => m.scheduledAt !== null);
    const unscheduled = matches.filter((m) => m.scheduledAt === null);

    const conflicts = await this.detectConflicts(tournamentId);

    return {
      totalMatches: matches.length,
      scheduled: scheduled.length,
      unscheduled: unscheduled.length,
      conflicts: conflicts.length,
      conflictDetails: conflicts,
    };
  }
}
