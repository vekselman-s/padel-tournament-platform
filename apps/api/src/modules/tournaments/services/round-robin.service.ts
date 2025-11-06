import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@padel/database';

/**
 * Interface representing team standings in round-robin format
 */
interface TeamStanding {
  teamId: string;
  teamName?: string;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  matchesPlayed: number;
  position?: number;
  headToHead?: Record<string, number>; // teamId -> result (+1 win, -1 loss)
}

/**
 * Interface for round-robin match pairing
 */
interface RoundRobinMatch {
  tournamentId: string;
  categoryId: string;
  groupId: string;
  round: number;
  matchNumber: number;
  teamAId: string;
  teamBId: string;
  bestOf: number;
}

/**
 * RoundRobinService handles round-robin tournament format logic.
 *
 * Features:
 * - Generate all matches for round-robin groups
 * - Calculate standings with wins, losses, points for/against, differential
 * - Apply tiebreakers: head-to-head, games differential, games for
 * - Support for multiple groups in same tournament
 * - Berger tables algorithm for optimal scheduling
 *
 * Round Robin Format:
 * - Every team plays every other team once
 * - N teams = N-1 rounds with N/2 matches per round (if even)
 * - N teams = N rounds with (N-1)/2 matches per round (if odd)
 *
 * @class RoundRobinService
 */
@Injectable()
export class RoundRobinService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates all matches for a round-robin group using circle method algorithm.
   *
   * Algorithm (Circle Method):
   * - For N teams, create N-1 rounds
   * - Fix one team (usually team 1) and rotate others clockwise
   * - Ensures each team plays each opponent exactly once
   *
   * Example for 4 teams (A, B, C, D):
   * Round 1: A-B, C-D
   * Round 2: A-C, B-D
   * Round 3: A-D, B-C
   *
   * Example for 5 teams (A, B, C, D, E):
   * Round 1: A-B, C-D, E-bye
   * Round 2: A-C, D-E, B-bye
   * Round 3: A-D, E-B, C-bye
   * Round 4: A-E, B-C, D-bye
   * Round 5: B-D, C-E, A-bye
   *
   * @param groupId - The group identifier
   * @param teams - Array of team objects with id
   * @returns Array of created match records
   * @throws BadRequestException if team count is invalid
   */
  async generateRoundRobin(
    groupId: string,
    teams: Array<{ id: string; name?: string }>,
  ): Promise<RoundRobinMatch[]> {
    if (teams.length < 2) {
      throw new BadRequestException('Need at least 2 teams for round-robin');
    }

    // Get group details
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        tournament: true,
        category: true,
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const teamList = teams.map((t) => t.id);
    const numTeams = teamList.length;
    const isOdd = numTeams % 2 !== 0;

    // Add dummy team for odd number (represents bye)
    if (isOdd) {
      teamList.push('BYE');
    }

    const totalTeams = teamList.length;
    const numRounds = totalTeams - 1;
    const matchesPerRound = totalTeams / 2;

    const matches: RoundRobinMatch[] = [];

    // Generate matches using circle method
    for (let round = 0; round < numRounds; round++) {
      for (let match = 0; match < matchesPerRound; match++) {
        let home: number;
        let away: number;

        if (match === 0) {
          // First match: fixed team vs rotating team
          home = 0;
          away = round + 1;
        } else {
          // Other matches: calculated positions
          home = ((round + match) % (totalTeams - 1)) + 1;
          away = ((round + totalTeams - match - 1) % (totalTeams - 1)) + 1;
        }

        const teamAId = teamList[home];
        const teamBId = teamList[away];

        // Skip matches with BYE team
        if (teamAId !== 'BYE' && teamBId !== 'BYE') {
          matches.push({
            tournamentId: group.tournamentId,
            categoryId: group.categoryId,
            groupId,
            round: round + 1,
            matchNumber: match + 1,
            teamAId,
            teamBId,
            bestOf: 3,
          });
        }
      }
    }

    // Create matches in database
    await this.prisma.match.createMany({
      data: matches.map((m) => ({
        ...m,
        formatMetaJson: {
          format: 'round_robin',
          groupName: group.name,
        },
      })),
    });

    // Initialize standings for all teams
    await this.initializeStandings(groupId, teams.map((t) => t.id));

    return matches;
  }

  /**
   * Initialize standings records for all teams in a group.
   *
   * @param groupId - The group identifier
   * @param teamIds - Array of team IDs
   */
  private async initializeStandings(
    groupId: string,
    teamIds: string[],
  ): Promise<void> {
    await this.prisma.standing.createMany({
      data: teamIds.map((teamId) => ({
        groupId,
        teamId,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        diff: 0,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Calculates current standings for a round-robin group.
   *
   * Calculation includes:
   * - Wins and losses count
   * - Points for (total games won across all matches)
   * - Points against (total games lost across all matches)
   * - Differential (points for - points against)
   * - Head-to-head records between teams
   *
   * Padel scoring:
   * - Each set won counts as games won (6-4 = 6 points for, 4 points against)
   * - Total games across all sets are summed
   *
   * @param groupId - The group identifier
   * @returns Array of team standings sorted by position
   */
  async calculateStandings(groupId: string): Promise<TeamStanding[]> {
    // Get all matches for this group
    const matches = await this.prisma.match.findMany({
      where: {
        groupId,
        state: 'DONE',
      },
      include: {
        teamA: {
          include: {
            player1: { select: { name: true } },
            player2: { select: { name: true } },
          },
        },
        teamB: {
          include: {
            player1: { select: { name: true } },
            player2: { select: { name: true } },
          },
        },
        setScores: true,
        winner: true,
      },
    });

    // Get all teams in group
    const standings = await this.prisma.standing.findMany({
      where: { groupId },
      include: {
        team: {
          include: {
            player1: { select: { name: true } },
            player2: { select: { name: true } },
          },
        },
      },
    });

    // Initialize standings map
    const standingsMap = new Map<string, TeamStanding>();

    for (const standing of standings) {
      const teamName = standing.team.name
        || `${standing.team.player1.name} / ${standing.team.player2.name}`;

      standingsMap.set(standing.teamId, {
        teamId: standing.teamId,
        teamName,
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        diff: 0,
        matchesPlayed: 0,
        headToHead: {},
      });
    }

    // Calculate statistics from matches
    for (const match of matches) {
      if (!match.teamAId || !match.teamBId || !match.winnerId) continue;

      const teamAStats = standingsMap.get(match.teamAId);
      const teamBStats = standingsMap.get(match.teamBId);

      if (!teamAStats || !teamBStats) continue;

      // Count match result
      if (match.winnerId === match.teamAId) {
        teamAStats.wins++;
        teamBStats.losses++;
        teamAStats.headToHead![match.teamBId] = 1; // Win
        teamBStats.headToHead![match.teamAId] = -1; // Loss
      } else {
        teamBStats.wins++;
        teamAStats.losses++;
        teamBStats.headToHead![match.teamAId] = 1; // Win
        teamAStats.headToHead![match.teamAId] = -1; // Loss
      }

      teamAStats.matchesPlayed++;
      teamBStats.matchesPlayed++;

      // Calculate games won/lost from set scores
      for (const setScore of match.setScores) {
        teamAStats.pointsFor += setScore.gamesA;
        teamAStats.pointsAgainst += setScore.gamesB;
        teamBStats.pointsFor += setScore.gamesB;
        teamBStats.pointsAgainst += setScore.gamesA;
      }

      // Calculate differentials
      teamAStats.diff = teamAStats.pointsFor - teamAStats.pointsAgainst;
      teamBStats.diff = teamBStats.pointsFor - teamBStats.pointsAgainst;
    }

    // Convert to array and apply tiebreakers
    const standingsArray = Array.from(standingsMap.values());
    const sortedStandings = this.applyTiebreakers(standingsArray);

    // Update standings in database
    for (let i = 0; i < sortedStandings.length; i++) {
      const standing = sortedStandings[i];
      await this.prisma.standing.update({
        where: {
          groupId_teamId: {
            groupId,
            teamId: standing.teamId,
          },
        },
        data: {
          wins: standing.wins,
          losses: standing.losses,
          pointsFor: standing.pointsFor,
          pointsAgainst: standing.pointsAgainst,
          diff: standing.diff,
          position: i + 1,
        },
      });
    }

    return sortedStandings;
  }

  /**
   * Applies tiebreaker rules to sort standings.
   *
   * Tiebreaker priority:
   * 1. Most wins
   * 2. Head-to-head record (if tied teams played each other)
   * 3. Best games differential (pointsFor - pointsAgainst)
   * 4. Most games for (total games won)
   * 5. Alphabetical by team name (if all else equal)
   *
   * Head-to-head tiebreaker:
   * - Only applied when exactly 2 teams are tied
   * - Team that won direct match ranks higher
   * - If 3+ teams tied, skip to differential
   *
   * @param standings - Array of team standings
   * @returns Sorted array with positions assigned
   */
  applyTiebreakers(standings: TeamStanding[]): TeamStanding[] {
    const sorted = [...standings].sort((a, b) => {
      // 1. Most wins
      if (a.wins !== b.wins) {
        return b.wins - a.wins;
      }

      // 2. Head-to-head (only if exactly 2 teams tied)
      if (a.headToHead && b.headToHead) {
        const h2hA = a.headToHead[b.teamId];
        const h2hB = b.headToHead[a.teamId];

        if (h2hA !== undefined && h2hB !== undefined) {
          if (h2hA !== h2hB) {
            return h2hB - h2hA; // Winner ranks higher
          }
        }
      }

      // 3. Best games differential
      if (a.diff !== b.diff) {
        return b.diff - a.diff;
      }

      // 4. Most games for
      if (a.pointsFor !== b.pointsFor) {
        return b.pointsFor - a.pointsFor;
      }

      // 5. Alphabetical by team name
      return (a.teamName || '').localeCompare(b.teamName || '');
    });

    // Assign positions
    sorted.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return sorted;
  }

  /**
   * Gets current standings for a group.
   *
   * @param groupId - The group identifier
   * @returns Array of standings with team information
   */
  async getStandings(groupId: string) {
    const standings = await this.prisma.standing.findMany({
      where: { groupId },
      orderBy: { position: 'asc' },
      include: {
        team: {
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

    return standings;
  }

  /**
   * Updates standings after a match is completed.
   *
   * This is called automatically by the match progression service.
   *
   * @param matchId - The completed match identifier
   */
  async updateStandingsAfterMatch(matchId: string): Promise<void> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: { group: true },
    });

    if (!match || !match.groupId) {
      return;
    }

    // Recalculate standings for the group
    await this.calculateStandings(match.groupId);
  }

  /**
   * Checks if all matches in a group are completed.
   *
   * @param groupId - The group identifier
   * @returns True if all matches are done
   */
  async isGroupComplete(groupId: string): Promise<boolean> {
    const pendingMatches = await this.prisma.match.count({
      where: {
        groupId,
        state: {
          in: ['PENDING', 'ONGOING'],
        },
      },
    });

    return pendingMatches === 0;
  }

  /**
   * Gets top N teams from group for playoff qualification.
   *
   * Used when tournament format is GROUPS_PLAYOFFS.
   *
   * @param groupId - The group identifier
   * @param topN - Number of teams to qualify (default: 2)
   * @returns Array of qualified team IDs in rank order
   */
  async getQualifiedTeams(groupId: string, topN: number = 2): Promise<string[]> {
    const standings = await this.prisma.standing.findMany({
      where: { groupId },
      orderBy: { position: 'asc' },
      take: topN,
    });

    return standings.map((s) => s.teamId);
  }
}
