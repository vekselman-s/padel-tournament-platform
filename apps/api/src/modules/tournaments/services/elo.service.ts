import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@padel/database';
import { RankingScope } from '@padel/database';

/**
 * Interface for ELO calculation result
 */
interface EloChange {
  winnerId: string;
  loserId: string;
  winnerOldElo: number;
  winnerNewElo: number;
  loserOldElo: number;
  loserNewElo: number;
  eloChange: number;
  kFactor: number;
}

/**
 * Interface for team ELO calculation
 */
interface TeamEloChange {
  winningTeamId: string;
  losingTeamId: string;
  player1WinnerChange: EloChange;
  player2WinnerChange: EloChange;
  player1LoserChange: EloChange;
  player2LoserChange: EloChange;
  averageChange: number;
}

/**
 * Interface for player ranking
 */
interface PlayerRanking {
  userId: string;
  userName: string;
  elo: number;
  points: number;
  wins: number;
  losses: number;
  rank: number;
  scope: RankingScope;
  tournamentId?: string;
  categoryId?: string;
}

/**
 * EloService handles ELO rating calculations and ranking management.
 *
 * ELO Rating System:
 * - Statistical rating system for calculating relative skill levels
 * - Higher rating = better player
 * - Rating changes based on match outcomes and opponent ratings
 * - Expected score determines rating change magnitude
 *
 * Formula:
 * - Expected Score: E = 1 / (1 + 10^((OpponentElo - PlayerElo) / 400))
 * - New Rating: NewElo = OldElo + K * (ActualScore - ExpectedScore)
 * - ActualScore: 1 for win, 0 for loss
 *
 * K-Factor:
 * - Determines maximum rating change per match
 * - Higher K = more volatile ratings
 * - Common values: 16 (stable), 24 (moderate), 32 (volatile)
 * - Can vary by player level or tournament importance
 *
 * Features:
 * - Individual player ELO tracking
 * - Team ELO (average of both players)
 * - Tournament-scoped and global rankings
 * - Category-specific ratings
 * - Historical rating tracking
 *
 * @class EloService
 */
@Injectable()
export class EloService {
  private readonly DEFAULT_ELO = 1500;
  private readonly DEFAULT_K_FACTOR = 24;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates ELO rating change after a match.
   *
   * ELO Algorithm:
   * 1. Calculate expected score for each player
   * 2. Determine actual score (1 for win, 0 for loss)
   * 3. Calculate rating change: K * (Actual - Expected)
   * 4. Update ratings
   *
   * Example:
   * - Player A (1600 ELO) beats Player B (1500 ELO)
   * - Expected: A = 0.64, B = 0.36
   * - A gains: 24 * (1 - 0.64) = +8.6
   * - B loses: 24 * (0 - 0.36) = -8.6
   *
   * @param winnerElo - Winner's current ELO rating
   * @param loserElo - Loser's current ELO rating
   * @param k - K-factor for rating volatility (default: 24)
   * @returns Object with new ratings and changes
   */
  calculateEloChange(
    winnerElo: number,
    loserElo: number,
    k: number = this.DEFAULT_K_FACTOR,
  ): EloChange {
    // Calculate expected scores
    const expectedWinner = this.calculateExpectedScore(winnerElo, loserElo);
    const expectedLoser = this.calculateExpectedScore(loserElo, winnerElo);

    // Actual scores (1 for win, 0 for loss)
    const actualWinner = 1;
    const actualLoser = 0;

    // Calculate rating changes
    const winnerChange = k * (actualWinner - expectedWinner);
    const loserChange = k * (actualLoser - expectedLoser);

    // Calculate new ratings
    const winnerNewElo = Math.round(winnerElo + winnerChange);
    const loserNewElo = Math.round(loserElo + loserChange);

    return {
      winnerId: '', // Set by caller
      loserId: '', // Set by caller
      winnerOldElo: winnerElo,
      winnerNewElo,
      loserOldElo: loserElo,
      loserNewElo,
      eloChange: Math.round(Math.abs(winnerChange)),
      kFactor: k,
    };
  }

  /**
   * Calculates expected score for ELO formula.
   *
   * Formula: E = 1 / (1 + 10^((OpponentElo - PlayerElo) / 400))
   *
   * Interpretation:
   * - 0.5 = equal skill (50% win probability)
   * - 0.7 = player favored (70% win probability)
   * - 0.3 = opponent favored (30% win probability)
   *
   * Rating Difference Examples:
   * - 0 points: 50% expected
   * - 100 points: 64% expected
   * - 200 points: 76% expected
   * - 400 points: 91% expected
   *
   * @param playerElo - Player's ELO rating
   * @param opponentElo - Opponent's ELO rating
   * @returns Expected score (0 to 1)
   */
  private calculateExpectedScore(playerElo: number, opponentElo: number): number {
    return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  }

  /**
   * Updates team ELO ratings after a match.
   *
   * Team ELO Calculation:
   * - Each player's individual ELO is updated
   * - Match uses average team ELO for expected score
   * - Individual ratings can diverge over time
   *
   * Process:
   * 1. Get current ELO for all 4 players
   * 2. Calculate team averages
   * 3. Calculate expected score based on team averages
   * 4. Update each player's individual ELO
   * 5. Store changes in database
   *
   * Supports multiple ranking scopes:
   * - TOURNAMENT: ELO for this tournament only
   * - GLOBAL: Overall platform ELO
   * - CATEGORY: ELO within category (e.g., men's, women's)
   *
   * @param matchId - The completed match identifier
   * @param kFactor - K-factor for calculation (optional)
   * @returns Team ELO change details
   * @throws NotFoundException if match not found
   */
  async updateTeamElo(
    matchId: string,
    kFactor: number = this.DEFAULT_K_FACTOR,
  ): Promise<TeamEloChange> {
    // Get match details
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teamA: {
          include: {
            player1: true,
            player2: true,
          },
        },
        teamB: {
          include: {
            player1: true,
            player2: true,
          },
        },
        winner: true,
        tournament: true,
        category: true,
      },
    });

    if (!match || !match.teamA || !match.teamB || !match.winnerId) {
      throw new NotFoundException('Match not found or incomplete');
    }

    const isTeamAWinner = match.winnerId === match.teamA.id;
    const winningTeam = isTeamAWinner ? match.teamA : match.teamB;
    const losingTeam = isTeamAWinner ? match.teamB : match.teamA;

    // Get current ELO ratings for all players (tournament scope)
    const winner1Elo = await this.getPlayerElo(
      winningTeam.player1Id,
      RankingScope.TOURNAMENT,
      match.tournamentId,
      match.categoryId,
    );
    const winner2Elo = await this.getPlayerElo(
      winningTeam.player2Id,
      RankingScope.TOURNAMENT,
      match.tournamentId,
      match.categoryId,
    );
    const loser1Elo = await this.getPlayerElo(
      losingTeam.player1Id,
      RankingScope.TOURNAMENT,
      match.tournamentId,
      match.categoryId,
    );
    const loser2Elo = await this.getPlayerElo(
      losingTeam.player2Id,
      RankingScope.TOURNAMENT,
      match.tournamentId,
      match.categoryId,
    );

    // Calculate team average ELOs
    const winningTeamElo = (winner1Elo + winner2Elo) / 2;
    const losingTeamElo = (loser1Elo + loser2Elo) / 2;

    // Calculate ELO changes for each player
    const player1WinnerChange = this.calculateEloChange(
      winner1Elo,
      losingTeamElo,
      kFactor,
    );
    player1WinnerChange.winnerId = winningTeam.player1Id;
    player1WinnerChange.loserId = losingTeam.player1Id;

    const player2WinnerChange = this.calculateEloChange(
      winner2Elo,
      losingTeamElo,
      kFactor,
    );
    player2WinnerChange.winnerId = winningTeam.player2Id;
    player2WinnerChange.loserId = losingTeam.player2Id;

    const player1LoserChange = this.calculateEloChange(
      loser2Elo, // Reversed for loser
      winningTeamElo,
      kFactor,
    );
    player1LoserChange.winnerId = winningTeam.player1Id;
    player1LoserChange.loserId = losingTeam.player1Id;

    const player2LoserChange = this.calculateEloChange(
      loser1Elo, // Reversed for loser
      winningTeamElo,
      kFactor,
    );
    player2LoserChange.winnerId = winningTeam.player2Id;
    player2LoserChange.loserId = losingTeam.player2Id;

    // Update rankings in database (TOURNAMENT scope)
    await this.updatePlayerRanking(
      winningTeam.player1Id,
      player1WinnerChange.winnerNewElo,
      true,
      RankingScope.TOURNAMENT,
      match.tournamentId,
      match.categoryId,
    );

    await this.updatePlayerRanking(
      winningTeam.player2Id,
      player2WinnerChange.winnerNewElo,
      true,
      RankingScope.TOURNAMENT,
      match.tournamentId,
      match.categoryId,
    );

    await this.updatePlayerRanking(
      losingTeam.player1Id,
      player1LoserChange.loserNewElo,
      false,
      RankingScope.TOURNAMENT,
      match.tournamentId,
      match.categoryId,
    );

    await this.updatePlayerRanking(
      losingTeam.player2Id,
      player2LoserChange.loserNewElo,
      false,
      RankingScope.TOURNAMENT,
      match.tournamentId,
      match.categoryId,
    );

    // Also update GLOBAL scope
    await this.updateGlobalElo(
      winningTeam.player1Id,
      player1WinnerChange.eloChange,
      true,
    );
    await this.updateGlobalElo(
      winningTeam.player2Id,
      player2WinnerChange.eloChange,
      true,
    );
    await this.updateGlobalElo(
      losingTeam.player1Id,
      player1LoserChange.eloChange,
      false,
    );
    await this.updateGlobalElo(
      losingTeam.player2Id,
      player2LoserChange.eloChange,
      false,
    );

    const averageChange =
      (player1WinnerChange.eloChange +
        player2WinnerChange.eloChange +
        Math.abs(player1LoserChange.eloChange) +
        Math.abs(player2LoserChange.eloChange)) /
      4;

    return {
      winningTeamId: winningTeam.id,
      losingTeamId: losingTeam.id,
      player1WinnerChange,
      player2WinnerChange,
      player1LoserChange,
      player2LoserChange,
      averageChange: Math.round(averageChange),
    };
  }

  /**
   * Gets a player's current ELO rating.
   *
   * @param userId - The player's user ID
   * @param scope - Ranking scope (TOURNAMENT, GLOBAL, CATEGORY)
   * @param tournamentId - Tournament ID (required for TOURNAMENT scope)
   * @param categoryId - Category ID (required for CATEGORY scope)
   * @returns Current ELO rating (defaults to 1500 if no ranking exists)
   */
  async getPlayerElo(
    userId: string,
    scope: RankingScope,
    tournamentId?: string,
    categoryId?: string,
  ): Promise<number> {
    const where: any = {
      userId,
      scope,
    };

    if (scope === RankingScope.TOURNAMENT && tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (scope === RankingScope.CATEGORY && categoryId) {
      where.categoryId = categoryId;
    }

    const ranking = await this.prisma.ranking.findFirst({
      where,
    });

    return ranking?.elo || this.DEFAULT_ELO;
  }

  /**
   * Updates or creates a player's ranking record.
   *
   * @param userId - The player's user ID
   * @param newElo - New ELO rating
   * @param isWin - Whether this was a win
   * @param scope - Ranking scope
   * @param tournamentId - Tournament ID (optional)
   * @param categoryId - Category ID (optional)
   */
  private async updatePlayerRanking(
    userId: string,
    newElo: number,
    isWin: boolean,
    scope: RankingScope,
    tournamentId?: string,
    categoryId?: string,
  ): Promise<void> {
    const where: any = {
      scope,
      userId,
    };

    if (scope === RankingScope.TOURNAMENT && tournamentId) {
      where.tournamentId = tournamentId;
      where.categoryId = categoryId;
    } else if (scope === RankingScope.CATEGORY && categoryId) {
      where.categoryId = categoryId;
    }

    // Build unique constraint
    const uniqueWhere: any = {
      scope_tournamentId_categoryId_userId: {
        scope,
        userId,
        tournamentId: tournamentId || null,
        categoryId: categoryId || null,
      },
    };

    await this.prisma.ranking.upsert({
      where: uniqueWhere,
      create: {
        userId,
        scope,
        tournamentId,
        categoryId,
        elo: newElo,
        wins: isWin ? 1 : 0,
        losses: isWin ? 0 : 1,
        points: isWin ? 3 : 0, // 3 points per win
      },
      update: {
        elo: newElo,
        wins: {
          increment: isWin ? 1 : 0,
        },
        losses: {
          increment: isWin ? 0 : 1,
        },
        points: {
          increment: isWin ? 3 : 0,
        },
      },
    });
  }

  /**
   * Updates global ELO rating.
   *
   * @param userId - The player's user ID
   * @param eloChange - Amount of ELO change
   * @param isWin - Whether this was a win
   */
  private async updateGlobalElo(
    userId: string,
    eloChange: number,
    isWin: boolean,
  ): Promise<void> {
    const currentElo = await this.getPlayerElo(userId, RankingScope.GLOBAL);
    const newElo = isWin
      ? currentElo + eloChange
      : currentElo - eloChange;

    await this.prisma.ranking.upsert({
      where: {
        scope_tournamentId_categoryId_userId: {
          scope: RankingScope.GLOBAL,
          userId,
          tournamentId: null,
          categoryId: null,
        },
      },
      create: {
        userId,
        scope: RankingScope.GLOBAL,
        elo: newElo,
        wins: isWin ? 1 : 0,
        losses: isWin ? 0 : 1,
        points: isWin ? 3 : 0,
      },
      update: {
        elo: newElo,
        wins: {
          increment: isWin ? 1 : 0,
        },
        losses: {
          increment: isWin ? 0 : 1,
        },
        points: {
          increment: isWin ? 3 : 0,
        },
      },
    });
  }

  /**
   * Gets player ranking with position.
   *
   * @param userId - The player's user ID
   * @param scope - Ranking scope
   * @param tournamentId - Tournament ID (optional)
   * @param categoryId - Category ID (optional)
   * @returns Player ranking with rank position
   */
  async getPlayerRanking(
    userId: string,
    scope: RankingScope,
    tournamentId?: string,
    categoryId?: string,
  ): Promise<PlayerRanking | null> {
    const where: any = { scope };

    if (scope === RankingScope.TOURNAMENT && tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (scope === RankingScope.CATEGORY && categoryId) {
      where.categoryId = categoryId;
    }

    // Get all rankings for this scope
    const rankings = await this.prisma.ranking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [{ elo: 'desc' }, { wins: 'desc' }],
    });

    // Find player's ranking
    const playerRanking = rankings.find((r) => r.userId === userId);

    if (!playerRanking) {
      return null;
    }

    const rank = rankings.findIndex((r) => r.userId === userId) + 1;

    return {
      userId: playerRanking.userId,
      userName: playerRanking.user.name,
      elo: playerRanking.elo,
      points: playerRanking.points,
      wins: playerRanking.wins,
      losses: playerRanking.losses,
      rank,
      scope,
      tournamentId,
      categoryId,
    };
  }

  /**
   * Gets top N players by ELO in a scope.
   *
   * @param scope - Ranking scope
   * @param limit - Number of players to return
   * @param tournamentId - Tournament ID (optional)
   * @param categoryId - Category ID (optional)
   * @returns Array of top players with rankings
   */
  async getTopPlayers(
    scope: RankingScope,
    limit: number = 10,
    tournamentId?: string,
    categoryId?: string,
  ): Promise<PlayerRanking[]> {
    const where: any = { scope };

    if (scope === RankingScope.TOURNAMENT && tournamentId) {
      where.tournamentId = tournamentId;
    }

    if (scope === RankingScope.CATEGORY && categoryId) {
      where.categoryId = categoryId;
    }

    const rankings = await this.prisma.ranking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: [{ elo: 'desc' }, { wins: 'desc' }],
      take: limit,
    });

    return rankings.map((ranking, index) => ({
      userId: ranking.userId,
      userName: ranking.user.name,
      elo: ranking.elo,
      points: ranking.points,
      wins: ranking.wins,
      losses: ranking.losses,
      rank: index + 1,
      scope,
      tournamentId,
      categoryId,
    }));
  }
}
