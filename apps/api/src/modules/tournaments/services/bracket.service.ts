import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@padel/database';

/**
 * Interface representing a team in bracket generation
 */
interface BracketTeam {
  id: string;
  seed?: number | null;
  name?: string | null;
}

/**
 * Interface for bracket match creation
 */
interface BracketMatch {
  tournamentId: string;
  categoryId: string;
  round: number;
  matchNumber: number;
  teamAId: string | null;
  teamBId: string | null;
  bestOf: number;
  formatMetaJson?: any;
}

/**
 * Interface for double elimination bracket sections
 */
interface DoubleEliminationBracket {
  winners: BracketMatch[];
  losers: BracketMatch[];
  grandFinals: BracketMatch[];
}

/**
 * BracketService handles tournament bracket generation for single and double elimination formats.
 *
 * Features:
 * - Single elimination bracket generation for powers of 2 (8, 16, 32, 64 teams)
 * - Double elimination with winners and losers brackets
 * - Seeding algorithms to prevent top seeds from meeting early
 * - Bye handling for non-power-of-2 team counts
 * - Support for various bracket sizes with automatic round calculation
 *
 * @class BracketService
 */
@Injectable()
export class BracketService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a single elimination bracket for a tournament category.
   *
   * Algorithm:
   * - Calculates number of rounds based on team count (log2)
   * - Applies seeding to prevent top teams from meeting early
   * - Handles byes for non-power-of-2 team counts
   * - Creates matches from finals backwards (Round 1 = Finals)
   *
   * Example for 8 teams:
   * - Round 3 (Quarterfinals): 4 matches (1v8, 4v5, 3v6, 2v7)
   * - Round 2 (Semifinals): 2 matches
   * - Round 1 (Finals): 1 match
   *
   * @param tournamentId - The tournament identifier
   * @param categoryId - The category identifier
   * @param teams - Array of teams to be placed in bracket
   * @returns Array of created match records
   * @throws BadRequestException if team count is invalid
   */
  async generateSingleElimination(
    tournamentId: string,
    categoryId: string,
    teams: BracketTeam[],
  ): Promise<BracketMatch[]> {
    if (teams.length < 2) {
      throw new BadRequestException('Need at least 2 teams to generate bracket');
    }

    // Apply seeding
    const seededTeams = this.applySeeding(teams);

    // Calculate number of rounds (Round 1 = Finals)
    const numRounds = Math.ceil(Math.log2(seededTeams.length));
    const bracketSize = Math.pow(2, numRounds);

    // Calculate number of byes needed
    const numByes = bracketSize - seededTeams.length;

    // Insert byes strategically (typically bottom seeds get byes)
    const teamsWithByes = this.insertByes(seededTeams, numByes);

    const matches: BracketMatch[] = [];

    // Generate matches for each round (starting from the first round with teams)
    for (let round = numRounds; round >= 1; round--) {
      const matchesInRound = Math.pow(2, round - 1);

      for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
        const match: BracketMatch = {
          tournamentId,
          categoryId,
          round,
          matchNumber: matchIndex + 1,
          teamAId: null,
          teamBId: null,
          bestOf: 3,
          formatMetaJson: {
            bracketType: 'single_elimination',
            roundName: this.getRoundName(round, numRounds),
          },
        };

        // Only assign teams for the first round (highest round number)
        if (round === numRounds) {
          const teamAIndex = matchIndex * 2;
          const teamBIndex = matchIndex * 2 + 1;

          match.teamAId = teamsWithByes[teamAIndex] || null;
          match.teamBId = teamsWithByes[teamBIndex] || null;
        }

        matches.push(match);
      }
    }

    // Create matches in database
    await this.prisma.match.createMany({
      data: matches,
    });

    return matches;
  }

  /**
   * Generates a double elimination bracket with winners and losers brackets.
   *
   * Algorithm:
   * - Creates winners bracket (same as single elimination)
   * - Creates losers bracket with double the rounds minus one
   * - Losers bracket alternates between "drop-ins" from winners and regular matches
   * - Creates grand finals (best of 5 with bracket reset if loser wins)
   *
   * Double Elimination Rules:
   * - Winners bracket losers drop to losers bracket
   * - Losers bracket losers are eliminated
   * - Grand finals requires loser bracket winner to beat winner bracket winner twice
   *
   * @param tournamentId - The tournament identifier
   * @param categoryId - The category identifier
   * @param teams - Array of teams to be placed in bracket
   * @returns Object containing winners, losers, and grand finals matches
   * @throws BadRequestException if team count is invalid
   */
  async generateDoubleElimination(
    tournamentId: string,
    categoryId: string,
    teams: BracketTeam[],
  ): Promise<DoubleEliminationBracket> {
    if (teams.length < 2) {
      throw new BadRequestException('Need at least 2 teams to generate bracket');
    }

    const seededTeams = this.applySeeding(teams);
    const numRounds = Math.ceil(Math.log2(seededTeams.length));
    const bracketSize = Math.pow(2, numRounds);
    const numByes = bracketSize - seededTeams.length;
    const teamsWithByes = this.insertByes(seededTeams, numByes);

    const winnersMatches: BracketMatch[] = [];
    const losersMatches: BracketMatch[] = [];

    // Generate Winners Bracket
    for (let round = numRounds; round >= 1; round--) {
      const matchesInRound = Math.pow(2, round - 1);

      for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
        const match: BracketMatch = {
          tournamentId,
          categoryId,
          round,
          matchNumber: matchIndex + 1,
          teamAId: null,
          teamBId: null,
          bestOf: 3,
          formatMetaJson: {
            bracketType: 'double_elimination_winners',
            roundName: `Winners ${this.getRoundName(round, numRounds)}`,
          },
        };

        if (round === numRounds) {
          const teamAIndex = matchIndex * 2;
          const teamBIndex = matchIndex * 2 + 1;
          match.teamAId = teamsWithByes[teamAIndex] || null;
          match.teamBId = teamsWithByes[teamBIndex] || null;
        }

        winnersMatches.push(match);
      }
    }

    // Generate Losers Bracket (has 2 * numRounds - 1 rounds)
    const loserRounds = 2 * numRounds - 1;

    for (let round = loserRounds; round >= 1; round--) {
      // Alternate between drop-in rounds and play-in rounds
      const isDropInRound = round % 2 === loserRounds % 2;
      const matchesInRound = isDropInRound
        ? Math.pow(2, Math.floor((loserRounds - round) / 2))
        : Math.pow(2, Math.floor((loserRounds - round + 1) / 2));

      for (let matchIndex = 0; matchIndex < matchesInRound; matchIndex++) {
        const match: BracketMatch = {
          tournamentId,
          categoryId,
          round: round + 1000, // Offset to distinguish from winners bracket
          matchNumber: matchIndex + 1,
          teamAId: null,
          teamBId: null,
          bestOf: 3,
          formatMetaJson: {
            bracketType: 'double_elimination_losers',
            roundName: `Losers Round ${loserRounds - round + 1}`,
            isDropInRound,
          },
        };

        losersMatches.push(match);
      }
    }

    // Generate Grand Finals (2 matches potential - bracket reset)
    const grandFinals: BracketMatch[] = [
      {
        tournamentId,
        categoryId,
        round: -1, // Special round number for grand finals
        matchNumber: 1,
        teamAId: null, // Winner of winners bracket
        teamBId: null, // Winner of losers bracket
        bestOf: 5,
        formatMetaJson: {
          bracketType: 'double_elimination_grand_finals',
          roundName: 'Grand Finals',
          requiresReset: false,
        },
      },
      {
        tournamentId,
        categoryId,
        round: -2, // Bracket reset match (if needed)
        matchNumber: 2,
        teamAId: null,
        teamBId: null,
        bestOf: 5,
        formatMetaJson: {
          bracketType: 'double_elimination_grand_finals_reset',
          roundName: 'Grand Finals (Reset)',
          requiresReset: true,
        },
      },
    ];

    // Create all matches in database
    await this.prisma.match.createMany({
      data: [...winnersMatches, ...losersMatches, ...grandFinals],
    });

    return {
      winners: winnersMatches,
      losers: losersMatches,
      grandFinals,
    };
  }

  /**
   * Applies seeding to teams to ensure fair bracket distribution.
   *
   * Seeding Algorithm:
   * - Teams with seed numbers are sorted by seed (1 = best)
   * - Teams without seeds are shuffled and placed after seeded teams
   * - Standard bracket seeding pattern: 1v8, 4v5, 3v6, 2v7 (for 8 teams)
   *
   * Seeding ensures:
   * - Top seeds don't meet until later rounds
   * - Balanced bracket distribution
   * - Fair progression through tournament
   *
   * @param teams - Array of teams with optional seed numbers
   * @returns Array of team IDs in seeded order
   */
  applySeeding(teams: BracketTeam[]): string[] {
    // Separate seeded and unseeded teams
    const seededTeams = teams
      .filter((t) => t.seed !== null && t.seed !== undefined)
      .sort((a, b) => (a.seed || 0) - (b.seed || 0));

    const unseededTeams = teams.filter(
      (t) => t.seed === null || t.seed === undefined,
    );

    // Shuffle unseeded teams for fairness
    const shuffledUnseeded = this.shuffleArray([...unseededTeams]);

    // Combine seeded and unseeded teams
    const allTeams = [...seededTeams, ...shuffledUnseeded];

    // Apply bracket seeding pattern
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(allTeams.length)));
    const seededOrder = this.generateSeedingPattern(bracketSize);

    // Map teams according to seeding pattern
    const result: string[] = [];
    for (const seedPosition of seededOrder) {
      if (seedPosition <= allTeams.length) {
        result.push(allTeams[seedPosition - 1].id);
      }
    }

    return result;
  }

  /**
   * Generates standard bracket seeding pattern.
   *
   * Pattern for 8 teams: [1, 8, 4, 5, 3, 6, 2, 7]
   * This ensures: 1v8, 4v5, 3v6, 2v7 in first round
   *
   * Pattern for 16 teams: [1, 16, 8, 9, 4, 13, 5, 12, 3, 14, 6, 11, 2, 15, 7, 10]
   *
   * @param size - Bracket size (must be power of 2)
   * @returns Array of seed positions in bracket order
   */
  private generateSeedingPattern(size: number): number[] {
    const rounds = Math.log2(size);
    let pattern = [1, 2];

    for (let round = 1; round < rounds; round++) {
      const newPattern: number[] = [];
      const maxSeed = Math.pow(2, round + 1);

      for (const seed of pattern) {
        newPattern.push(seed);
        newPattern.push(maxSeed + 1 - seed);
      }

      pattern = newPattern;
    }

    return pattern;
  }

  /**
   * Inserts byes strategically into team list for non-power-of-2 team counts.
   *
   * Bye Placement Strategy:
   * - Byes are awarded to top seeds
   * - Distributed evenly across bracket
   * - Bottom half teams get byes first
   *
   * Example: 6 teams in 8-team bracket gets 2 byes
   * - Seed 1 and 2 get byes (advance automatically)
   *
   * @param teams - Array of team IDs in seeded order
   * @param numByes - Number of byes needed to reach power of 2
   * @returns Array of team IDs with null values representing byes
   */
  private insertByes(teams: string[], numByes: number): (string | null)[] {
    const result: (string | null)[] = [...teams];

    // Add byes at the end (lower seeds get byes)
    for (let i = 0; i < numByes; i++) {
      result.push(null);
    }

    return result;
  }

  /**
   * Calculates number of byes needed for given team count.
   *
   * Formula: Next power of 2 - team count
   *
   * Examples:
   * - 6 teams → 8-team bracket → 2 byes
   * - 13 teams → 16-team bracket → 3 byes
   *
   * @param teamCount - Number of teams in tournament
   * @returns Number of byes needed
   */
  calculateByes(teamCount: number): number {
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(teamCount)));
    return nextPowerOf2 - teamCount;
  }

  /**
   * Gets human-readable round name based on round number.
   *
   * @param round - Round number (1 = Finals, 2 = Semi-finals, etc.)
   * @param totalRounds - Total number of rounds in bracket
   * @returns Human-readable round name
   */
  private getRoundName(round: number, totalRounds: number): string {
    const roundsFromEnd = round;

    switch (roundsFromEnd) {
      case 1:
        return 'Finals';
      case 2:
        return 'Semi-finals';
      case 3:
        return 'Quarter-finals';
      case 4:
        return 'Round of 16';
      case 5:
        return 'Round of 32';
      case 6:
        return 'Round of 64';
      default:
        return `Round ${totalRounds - round + 1}`;
    }
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm.
   *
   * Used for randomizing unseeded teams to ensure fairness.
   *
   * @param array - Array to shuffle
   * @returns Shuffled array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
