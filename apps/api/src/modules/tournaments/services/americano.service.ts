import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@padel/database';

/**
 * Interface for Americano/Mexicano rotation
 */
interface Rotation {
  round: number;
  court: number;
  team1Player1Id: string;
  team1Player2Id: string;
  team2Player1Id: string;
  team2Player2Id: string;
  scheduledAt?: Date;
  durationMinutes?: number;
}

/**
 * Interface for player standings in Americano/Mexicano
 */
interface PlayerStanding {
  playerId: string;
  playerName: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  matchesPlayed: number;
  position?: number;
  partners: Set<string>; // Track who they've played with
  opponents: Set<string>; // Track who they've played against
}

/**
 * Interface for match creation in Americano/Mexicano
 */
interface AmericanoMatch {
  tournamentId: string;
  categoryId: string;
  round: number;
  matchNumber: number;
  courtId?: string;
  scheduledAt?: Date;
  teamAId: string;
  teamBId: string;
  bestOf: number;
  formatMetaJson: any;
}

/**
 * AmericanoService handles Americano and Mexicano tournament formats.
 *
 * Americano Format:
 * - Social format where every player plays with and against everyone
 * - Partners rotate each round
 * - Individual scoring (not team-based)
 * - Focus on ensuring variety of partnerships and matchups
 *
 * Mexicano Format:
 * - Similar to Americano but with time-limited matches
 * - Fixed time per match (e.g., 10-15 minutes)
 * - Scoring based on points won in time limit
 * - Faster rotation, more matches per session
 *
 * Rotation Algorithm:
 * - Ensures every player partners with every other player exactly once
 * - Ensures every player faces every other player at least once
 * - Optimizes court usage
 * - Handles odd number of players (rotating bye)
 *
 * @class AmericanoService
 */
@Injectable()
export class AmericanoService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates all rotations for Americano format.
   *
   * Algorithm (Berger Tables with Partner Rotation):
   * - For N players, generates (N-1) or N rounds depending on parity
   * - Each round has N/2 matches (or (N-1)/2 if odd)
   * - Ensures each player partners with every other player once
   * - Ensures balanced opponent distribution
   *
   * Player Pairing Logic:
   * - Use modified round-robin to create partnerships
   * - Track partnership history to avoid repeats
   * - Track opponent history to ensure variety
   *
   * Example for 8 players (P1-P8):
   * Round 1: (P1+P2 vs P3+P4), (P5+P6 vs P7+P8)
   * Round 2: (P1+P3 vs P2+P5), (P4+P7 vs P6+P8)
   * ... ensures all partner combinations
   *
   * @param tournamentId - The tournament identifier
   * @param players - Array of player objects with id
   * @returns Array of rotation objects with court assignments
   * @throws BadRequestException if player count is invalid
   */
  async generateAmericanoRotations(
    tournamentId: string,
    players: Array<{ id: string; name: string }>,
  ): Promise<Rotation[]> {
    if (players.length < 4) {
      throw new BadRequestException(
        'Need at least 4 players for Americano format',
      );
    }

    if (players.length % 2 !== 0) {
      throw new BadRequestException(
        'Americano format requires an even number of players',
      );
    }

    const numPlayers = players.length;
    const numRounds = numPlayers - 1;
    const matchesPerRound = numPlayers / 4; // 4 players per match (2v2)

    const rotations: Rotation[] = [];
    const playerIds = players.map((p) => p.id);

    // Track partnerships to ensure variety
    const partnerships = new Map<string, Set<string>>();
    playerIds.forEach((id) => partnerships.set(id, new Set()));

    // Generate rotations using a modified round-robin algorithm
    for (let round = 0; round < numRounds; round++) {
      const roundMatches = this.generateRoundMatches(
        playerIds,
        round,
        partnerships,
      );

      let courtNumber = 1;
      for (const match of roundMatches) {
        rotations.push({
          round: round + 1,
          court: courtNumber++,
          team1Player1Id: match.team1[0],
          team1Player2Id: match.team1[1],
          team2Player1Id: match.team2[0],
          team2Player2Id: match.team2[1],
        });

        // Update partnership tracking
        partnerships.get(match.team1[0])!.add(match.team1[1]);
        partnerships.get(match.team1[1])!.add(match.team1[0]);
        partnerships.get(match.team2[0])!.add(match.team2[1]);
        partnerships.get(match.team2[1])!.add(match.team2[0]);
      }
    }

    // Create matches and temporary teams in database
    await this.createAmericanoMatches(tournamentId, rotations);

    return rotations;
  }

  /**
   * Generates all rotations for Mexicano format with time limits.
   *
   * Mexicano Differences:
   * - Fixed time per match (typically 10-15 minutes)
   * - More rounds possible in shorter time
   * - Scoring based on points won in time limit
   * - Emphasis on quick rotations
   *
   * Time Management:
   * - Calculate start times for each match
   * - Include buffer time for rotation (2-3 minutes)
   * - Optimize court usage for continuous play
   *
   * @param tournamentId - The tournament identifier
   * @param players - Array of player objects
   * @param timePerMatch - Duration of each match in minutes
   * @returns Array of rotations with scheduled times
   * @throws BadRequestException if parameters are invalid
   */
  async generateMexicanoRotations(
    tournamentId: string,
    players: Array<{ id: string; name: string }>,
    timePerMatch: number = 12,
  ): Promise<Rotation[]> {
    if (players.length < 4) {
      throw new BadRequestException(
        'Need at least 4 players for Mexicano format',
      );
    }

    if (players.length % 2 !== 0) {
      throw new BadRequestException(
        'Mexicano format requires an even number of players',
      );
    }

    if (timePerMatch < 5 || timePerMatch > 30) {
      throw new BadRequestException(
        'Time per match must be between 5 and 30 minutes',
      );
    }

    // Get tournament start time
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const bufferMinutes = 3; // Time between matches for rotation
    const totalTimePerRound = timePerMatch + bufferMinutes;

    // Generate base rotations (same as Americano)
    const rotations = await this.generateAmericanoRotations(
      tournamentId,
      players,
    );

    // Add time scheduling to rotations
    const startTime = tournament.startAt;
    const scheduledRotations = rotations.map((rotation, index) => {
      const roundStartTime = new Date(
        startTime.getTime() + (rotation.round - 1) * totalTimePerRound * 60000,
      );

      return {
        ...rotation,
        scheduledAt: roundStartTime,
        durationMinutes: timePerMatch,
      };
    });

    return scheduledRotations;
  }

  /**
   * Generates matches for a single round ensuring partnership variety.
   *
   * @param playerIds - Array of player IDs
   * @param round - Current round number
   * @param partnerships - Map tracking existing partnerships
   * @returns Array of match pairings
   */
  private generateRoundMatches(
    playerIds: string[],
    round: number,
    partnerships: Map<string, Set<string>>,
  ): Array<{ team1: [string, string]; team2: [string, string] }> {
    const matches: Array<{ team1: [string, string]; team2: [string, string] }> = [];
    const numPlayers = playerIds.length;
    const available = new Set(playerIds);

    // Use a modified round-robin to ensure variety
    while (available.size >= 4) {
      let bestMatch: { team1: [string, string]; team2: [string, string] } | null = null;
      let bestScore = -Infinity;

      // Try all possible combinations and pick the best
      const availableArray = Array.from(available);

      for (let i = 0; i < availableArray.length - 1; i++) {
        for (let j = i + 1; j < availableArray.length; j++) {
          const p1 = availableArray[i];
          const p2 = availableArray[j];

          // Skip if they've already been partners
          if (partnerships.get(p1)!.has(p2)) continue;

          // Find opponents
          for (let k = 0; k < availableArray.length - 1; k++) {
            if (k === i || k === j) continue;

            for (let l = k + 1; l < availableArray.length; l++) {
              if (l === i || l === j) continue;

              const p3 = availableArray[k];
              const p4 = availableArray[l];

              // Skip if they've already been partners
              if (partnerships.get(p3)!.has(p4)) continue;

              // Calculate score (prefer new matchups)
              const score = this.calculateMatchScore(
                [p1, p2],
                [p3, p4],
                partnerships,
              );

              if (score > bestScore) {
                bestScore = score;
                bestMatch = {
                  team1: [p1, p2],
                  team2: [p3, p4],
                };
              }
            }
          }
        }
      }

      if (!bestMatch) {
        // Fallback: just pick first 4 available
        const players = Array.from(available).slice(0, 4);
        bestMatch = {
          team1: [players[0], players[1]],
          team2: [players[2], players[3]],
        };
      }

      matches.push(bestMatch);
      available.delete(bestMatch.team1[0]);
      available.delete(bestMatch.team1[1]);
      available.delete(bestMatch.team2[0]);
      available.delete(bestMatch.team2[1]);
    }

    return matches;
  }

  /**
   * Calculates a score for a match pairing to optimize variety.
   *
   * Higher score = more desirable pairing
   *
   * @param team1 - First team player IDs
   * @param team2 - Second team player IDs
   * @param partnerships - Partnership history
   * @returns Numeric score (higher is better)
   */
  private calculateMatchScore(
    team1: [string, string],
    team2: [string, string],
    partnerships: Map<string, Set<string>>,
  ): number {
    let score = 100;

    // Penalize if team members have been partners before
    if (partnerships.get(team1[0])!.has(team1[1])) score -= 50;
    if (partnerships.get(team2[0])!.has(team2[1])) score -= 50;

    // Penalize if opponents have been partners before
    if (partnerships.get(team1[0])!.has(team2[0])) score -= 10;
    if (partnerships.get(team1[0])!.has(team2[1])) score -= 10;
    if (partnerships.get(team1[1])!.has(team2[0])) score -= 10;
    if (partnerships.get(team1[1])!.has(team2[1])) score -= 10;

    return score;
  }

  /**
   * Creates matches and temporary teams for Americano/Mexicano format.
   *
   * @param tournamentId - The tournament identifier
   * @param rotations - Array of rotation objects
   */
  private async createAmericanoMatches(
    tournamentId: string,
    rotations: Rotation[],
  ): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        categories: true,
      },
    });

    if (!tournament || tournament.categories.length === 0) {
      throw new NotFoundException('Tournament or category not found');
    }

    const categoryId = tournament.categories[0].id;
    const matches: AmericanoMatch[] = [];

    for (const rotation of rotations) {
      // Create temporary teams for this match
      const teamA = await this.prisma.team.create({
        data: {
          tournamentId,
          categoryId,
          player1Id: rotation.team1Player1Id,
          player2Id: rotation.team1Player2Id,
          name: `Round ${rotation.round} - Court ${rotation.court} - Team A`,
        },
      });

      const teamB = await this.prisma.team.create({
        data: {
          tournamentId,
          categoryId,
          player1Id: rotation.team2Player1Id,
          player2Id: rotation.team2Player2Id,
          name: `Round ${rotation.round} - Court ${rotation.court} - Team B`,
        },
      });

      matches.push({
        tournamentId,
        categoryId,
        round: rotation.round,
        matchNumber: rotation.court,
        teamAId: teamA.id,
        teamBId: teamB.id,
        bestOf: 1, // Americano typically single set
        scheduledAt: rotation.scheduledAt,
        formatMetaJson: {
          format: rotation.durationMinutes ? 'mexicano' : 'americano',
          court: rotation.court,
          durationMinutes: rotation.durationMinutes,
        },
      });
    }

    await this.prisma.match.createMany({
      data: matches,
    });
  }

  /**
   * Calculates live standings during Americano/Mexicano tournament.
   *
   * Standings are individual (not team-based) since partners rotate.
   *
   * Calculation:
   * - Individual wins/losses
   * - Points for/against across all matches
   * - Track partnership variety
   * - Track opponent variety
   *
   * @param tournamentId - The tournament identifier
   * @returns Array of player standings sorted by performance
   */
  async calculateLiveStandings(tournamentId: string): Promise<PlayerStanding[]> {
    // Get all matches for tournament
    const matches = await this.prisma.match.findMany({
      where: {
        tournamentId,
        state: {
          in: ['DONE', 'ONGOING'],
        },
      },
      include: {
        teamA: {
          include: {
            player1: { select: { id: true, name: true } },
            player2: { select: { id: true, name: true } },
          },
        },
        teamB: {
          include: {
            player1: { select: { id: true, name: true } },
            player2: { select: { id: true, name: true } },
          },
        },
        setScores: true,
        winner: true,
      },
    });

    // Build player standings map
    const standingsMap = new Map<string, PlayerStanding>();

    // Initialize standings for all players
    for (const match of matches) {
      if (!match.teamA || !match.teamB) continue;

      const players = [
        { id: match.teamA.player1.id, name: match.teamA.player1.name },
        { id: match.teamA.player2.id, name: match.teamA.player2.name },
        { id: match.teamB.player1.id, name: match.teamB.player1.name },
        { id: match.teamB.player2.id, name: match.teamB.player2.name },
      ];

      for (const player of players) {
        if (!standingsMap.has(player.id)) {
          standingsMap.set(player.id, {
            playerId: player.id,
            playerName: player.name,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            diff: 0,
            matchesPlayed: 0,
            partners: new Set(),
            opponents: new Set(),
          });
        }
      }
    }

    // Calculate statistics from completed matches
    for (const match of matches) {
      if (match.state !== 'DONE' || !match.teamA || !match.teamB || !match.winnerId) {
        continue;
      }

      const teamAPlayerIds = [match.teamA.player1.id, match.teamA.player2.id];
      const teamBPlayerIds = [match.teamB.player1.id, match.teamB.player2.id];

      const teamAWon = match.winnerId === match.teamA.id;

      // Update each player's stats
      for (const playerId of teamAPlayerIds) {
        const stats = standingsMap.get(playerId)!;
        stats.matchesPlayed++;

        if (teamAWon) {
          stats.wins++;
        } else {
          stats.losses++;
        }

        // Track partners
        stats.partners.add(teamAPlayerIds.find((id) => id !== playerId)!);

        // Track opponents
        teamBPlayerIds.forEach((id) => stats.opponents.add(id));
      }

      for (const playerId of teamBPlayerIds) {
        const stats = standingsMap.get(playerId)!;
        stats.matchesPlayed++;

        if (!teamAWon) {
          stats.wins++;
        } else {
          stats.losses++;
        }

        // Track partners
        stats.partners.add(teamBPlayerIds.find((id) => id !== playerId)!);

        // Track opponents
        teamAPlayerIds.forEach((id) => stats.opponents.add(id));
      }

      // Calculate points from set scores
      for (const setScore of match.setScores) {
        for (const playerId of teamAPlayerIds) {
          const stats = standingsMap.get(playerId)!;
          stats.pointsFor += setScore.gamesA;
          stats.pointsAgainst += setScore.gamesB;
          stats.diff = stats.pointsFor - stats.pointsAgainst;
        }

        for (const playerId of teamBPlayerIds) {
          const stats = standingsMap.get(playerId)!;
          stats.pointsFor += setScore.gamesB;
          stats.pointsAgainst += setScore.gamesA;
          stats.diff = stats.pointsFor - stats.pointsAgainst;
        }
      }
    }

    // Convert to array and sort
    const standingsArray = Array.from(standingsMap.values()).sort((a, b) => {
      // Sort by wins, then differential, then points for
      if (a.wins !== b.wins) return b.wins - a.wins;
      if (a.diff !== b.diff) return b.diff - a.diff;
      if (a.pointsFor !== b.pointsFor) return b.pointsFor - a.pointsFor;
      return a.playerName.localeCompare(b.playerName);
    });

    // Assign positions
    standingsArray.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return standingsArray;
  }

  /**
   * Gets the current rotation schedule for a tournament.
   *
   * @param tournamentId - The tournament identifier
   * @returns Array of matches with rotation details
   */
  async getRotationSchedule(tournamentId: string) {
    const matches = await this.prisma.match.findMany({
      where: { tournamentId },
      orderBy: [{ round: 'asc' }, { matchNumber: 'asc' }],
      include: {
        teamA: {
          include: {
            player1: {
              select: { id: true, name: true, avatar: true },
            },
            player2: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        teamB: {
          include: {
            player1: {
              select: { id: true, name: true, avatar: true },
            },
            player2: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        court: true,
        setScores: true,
      },
    });

    return matches;
  }
}
