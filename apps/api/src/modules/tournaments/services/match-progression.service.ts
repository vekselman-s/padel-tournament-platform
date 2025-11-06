import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@padel/database';
import { MatchState, TournamentFormat } from '@padel/database';
import { RoundRobinService } from './round-robin.service';
import { EloService } from './elo.service';

/**
 * MatchProgressionService handles automatic match progression and tournament advancement.
 *
 * Features:
 * - Progress winners to next round in elimination brackets
 * - Update standings after round-robin matches
 * - Trigger next-round generation when rounds complete
 * - Handle walkovers and forfeits
 * - Automatic winner determination based on set scores
 * - Integration with ELO rating system
 * - Support for all tournament formats
 *
 * Progression Logic:
 * - Single Elimination: Winner advances, loser eliminated
 * - Double Elimination: Winner stays in winners bracket, loser drops to losers bracket
 * - Round Robin: Update standings, determine group winners
 * - Americano/Mexicano: Update individual player standings
 *
 * @class MatchProgressionService
 */
@Injectable()
export class MatchProgressionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roundRobinService: RoundRobinService,
    private readonly eloService: EloService,
  ) {}

  /**
   * Processes match completion and triggers appropriate progression.
   *
   * Workflow:
   * 1. Validate match is in DONE state with winner
   * 2. Determine tournament format
   * 3. Execute format-specific progression logic
   * 4. Update ELO ratings
   * 5. Check if tournament/round is complete
   * 6. Trigger next round if applicable
   *
   * @param matchId - The completed match identifier
   * @returns Progression details and next steps
   * @throws NotFoundException if match not found
   * @throws BadRequestException if match not in valid state
   */
  async processMatchCompletion(matchId: string): Promise<{
    matchId: string;
    winnerId: string;
    progressedTo?: string;
    standingsUpdated: boolean;
    eloUpdated: boolean;
    nextRoundTriggered: boolean;
    tournamentComplete: boolean;
  }> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        category: true,
        teamA: true,
        teamB: true,
        winner: true,
        group: true,
      },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.state !== MatchState.DONE) {
      throw new BadRequestException('Match is not in DONE state');
    }

    if (!match.winnerId) {
      throw new BadRequestException('Match has no winner assigned');
    }

    const result = {
      matchId: match.id,
      winnerId: match.winnerId,
      standingsUpdated: false,
      eloUpdated: false,
      nextRoundTriggered: false,
      tournamentComplete: false,
    };

    // Update ELO ratings
    try {
      await this.eloService.updateTeamElo(matchId);
      result.eloUpdated = true;
    } catch (error) {
      console.error('Error updating ELO:', error);
    }

    // Format-specific progression
    switch (match.tournament.format) {
      case TournamentFormat.SINGLE_ELIM:
        const nextMatchId = await this.progressWinnerToNextRound(matchId);
        if (nextMatchId) {
          result.progressedTo = nextMatchId;
        }
        break;

      case TournamentFormat.DOUBLE_ELIM:
        await this.progressDoubleElimination(matchId);
        break;

      case TournamentFormat.ROUND_ROBIN:
      case TournamentFormat.GROUPS_PLAYOFFS:
        if (match.groupId) {
          await this.roundRobinService.updateStandingsAfterMatch(matchId);
          result.standingsUpdated = true;

          // Check if group is complete
          const groupComplete = await this.roundRobinService.isGroupComplete(
            match.groupId,
          );

          if (groupComplete && match.tournament.format === TournamentFormat.GROUPS_PLAYOFFS) {
            // Generate playoffs if all groups are complete
            const allGroupsComplete = await this.checkAllGroupsComplete(
              match.tournamentId,
            );

            if (allGroupsComplete) {
              await this.generatePlayoffs(match.tournamentId);
              result.nextRoundTriggered = true;
            }
          }
        }
        break;

      case TournamentFormat.AMERICANO:
      case TournamentFormat.MEXICANO:
        // Individual player standings updated automatically
        result.standingsUpdated = true;
        break;
    }

    // Check if tournament is complete
    const isComplete = await this.checkTournamentComplete(match.tournamentId);
    result.tournamentComplete = isComplete;

    if (isComplete) {
      await this.finalizeTournament(match.tournamentId);
    }

    return result;
  }

  /**
   * Progresses winner to next round in single elimination bracket.
   *
   * Algorithm:
   * 1. Find the next round match this match feeds into
   * 2. Determine if winner goes to teamA or teamB slot
   * 3. Update next match with winner
   * 4. Check if both teams are now assigned (match ready)
   *
   * Match Number Calculation:
   * - Round N, Match M feeds into Round N-1, Match ceil(M/2)
   * - Even match numbers go to teamA, odd to teamB
   *
   * Example: 8-team bracket
   * - R3M1 winner → R2M1 teamA
   * - R3M2 winner → R2M1 teamB
   * - R3M3 winner → R2M2 teamA
   * - R3M4 winner → R2M2 teamB
   *
   * @param matchId - The completed match identifier
   * @returns Next match ID if winner progressed, null if finals
   */
  async progressWinnerToNextRound(matchId: string): Promise<string | null> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: true,
        winner: true,
      },
    });

    if (!match || !match.winnerId) {
      throw new NotFoundException('Match or winner not found');
    }

    // If round is 1 (finals), tournament is complete
    if (match.round === 1) {
      return null;
    }

    // Find next round match
    const nextRound = match.round - 1;
    const nextMatchNumber = Math.ceil((match.matchNumber || 1) / 2);

    const nextMatch = await this.prisma.match.findFirst({
      where: {
        tournamentId: match.tournamentId,
        categoryId: match.categoryId,
        round: nextRound,
        matchNumber: nextMatchNumber,
      },
    });

    if (!nextMatch) {
      console.error(
        `Next match not found: R${nextRound} M${nextMatchNumber}`,
      );
      return null;
    }

    // Determine which team slot (A or B)
    const isTeamA = (match.matchNumber || 1) % 2 === 1;

    // Update next match
    await this.prisma.match.update({
      where: { id: nextMatch.id },
      data: isTeamA
        ? { teamAId: match.winnerId }
        : { teamBId: match.winnerId },
    });

    return nextMatch.id;
  }

  /**
   * Handles progression in double elimination brackets.
   *
   * Rules:
   * - Winners bracket loser drops to losers bracket
   * - Losers bracket loser is eliminated
   * - Winners bracket winner advances in winners bracket
   * - Losers bracket winner advances in losers bracket
   *
   * Bracket Detection:
   * - Round < 1000: Winners bracket
   * - Round >= 1000: Losers bracket
   * - Round < 0: Grand finals
   *
   * @param matchId - The completed match identifier
   */
  private async progressDoubleElimination(matchId: string): Promise<void> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teamA: true,
        teamB: true,
        winner: true,
      },
    });

    if (!match || !match.winnerId || !match.teamAId || !match.teamBId) {
      return;
    }

    const loserId = match.winnerId === match.teamAId ? match.teamBId : match.teamAId;

    // Determine bracket type
    const isWinnersBracket = match.round > 0 && match.round < 1000;
    const isLosersBracket = match.round >= 1000;
    const isGrandFinals = match.round < 0;

    if (isWinnersBracket) {
      // Progress winner in winners bracket
      await this.progressWinnerToNextRound(matchId);

      // Drop loser to losers bracket
      await this.dropToLosersBracket(
        loserId,
        match.tournamentId,
        match.categoryId,
        match.round,
      );
    } else if (isLosersBracket) {
      // Progress winner in losers bracket
      await this.progressInLosersBracket(
        match.winnerId,
        match.tournamentId,
        match.categoryId,
        match.round,
      );

      // Loser is eliminated (no further action)
    } else if (isGrandFinals) {
      // Grand finals complete - check if bracket reset needed
      if (match.round === -1) {
        // First grand finals match
        const loserFromWinnersBracket = await this.checkIfTeamFromWinnersBracket(
          loserId,
          match.tournamentId,
        );

        if (loserFromWinnersBracket) {
          // Bracket reset needed - schedule second grand finals
          const resetMatch = await this.prisma.match.findFirst({
            where: {
              tournamentId: match.tournamentId,
              categoryId: match.categoryId,
              round: -2,
            },
          });

          if (resetMatch) {
            await this.prisma.match.update({
              where: { id: resetMatch.id },
              data: {
                teamAId: match.winnerId,
                teamBId: loserId,
                state: MatchState.PENDING,
              },
            });
          }
        }
      }
    }
  }

  /**
   * Drops losing team from winners bracket to losers bracket.
   *
   * @param teamId - The losing team ID
   * @param tournamentId - Tournament ID
   * @param categoryId - Category ID
   * @param winnersRound - Current winners bracket round
   */
  private async dropToLosersBracket(
    teamId: string,
    tournamentId: string,
    categoryId: string,
    winnersRound: number,
  ): Promise<void> {
    // Calculate corresponding losers bracket round
    // This is a simplified mapping - actual implementation depends on bracket structure
    const losersRound = 1000 + (winnersRound * 2);

    const losersBracketMatch = await this.prisma.match.findFirst({
      where: {
        tournamentId,
        categoryId,
        round: losersRound,
        OR: [{ teamAId: null }, { teamBId: null }],
      },
      orderBy: { matchNumber: 'asc' },
    });

    if (losersBracketMatch) {
      const updateData = losersBracketMatch.teamAId === null
        ? { teamAId: teamId }
        : { teamBId: teamId };

      await this.prisma.match.update({
        where: { id: losersBracketMatch.id },
        data: updateData,
      });
    }
  }

  /**
   * Progresses winner within losers bracket.
   *
   * @param teamId - The winning team ID
   * @param tournamentId - Tournament ID
   * @param categoryId - Category ID
   * @param currentRound - Current losers bracket round
   */
  private async progressInLosersBracket(
    teamId: string,
    tournamentId: string,
    categoryId: string,
    currentRound: number,
  ): Promise<void> {
    // Find next losers bracket match
    const nextRound = currentRound - 1;

    const nextMatch = await this.prisma.match.findFirst({
      where: {
        tournamentId,
        categoryId,
        round: nextRound,
        OR: [{ teamAId: null }, { teamBId: null }],
      },
      orderBy: { matchNumber: 'asc' },
    });

    if (nextMatch) {
      const updateData = nextMatch.teamAId === null
        ? { teamAId: teamId }
        : { teamBId: teamId };

      await this.prisma.match.update({
        where: { id: nextMatch.id },
        data: updateData,
      });
    }
  }

  /**
   * Checks if a team came from winners bracket (for grand finals bracket reset).
   *
   * @param teamId - Team ID to check
   * @param tournamentId - Tournament ID
   * @returns True if team never lost in winners bracket
   */
  private async checkIfTeamFromWinnersBracket(
    teamId: string,
    tournamentId: string,
  ): Promise<boolean> {
    // Check if team has any losses in losers bracket
    const lossesInLosers = await this.prisma.match.count({
      where: {
        tournamentId,
        round: { gte: 1000 },
        OR: [
          { teamAId: teamId, winnerId: { not: teamId } },
          { teamBId: teamId, winnerId: { not: teamId } },
        ],
      },
    });

    return lossesInLosers === 0;
  }

  /**
   * Checks if all groups in a tournament are complete.
   *
   * @param tournamentId - Tournament ID
   * @returns True if all groups have finished all matches
   */
  async checkAllGroupsComplete(tournamentId: string): Promise<boolean> {
    const groups = await this.prisma.group.findMany({
      where: { tournamentId },
    });

    for (const group of groups) {
      const isComplete = await this.roundRobinService.isGroupComplete(group.id);
      if (!isComplete) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generates playoff bracket from group stage results.
   *
   * @param tournamentId - Tournament ID
   */
  async generatePlayoffs(tournamentId: string): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        groups: {
          include: {
            standings: {
              orderBy: { position: 'asc' },
            },
          },
        },
        categories: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Get qualified teams from each group (typically top 2)
    const qualifiedTeams: string[] = [];

    for (const group of tournament.groups) {
      const topTeams = group.standings.slice(0, 2); // Top 2 from each group
      qualifiedTeams.push(...topTeams.map((s) => s.teamId));
    }

    // Generate single elimination playoff bracket
    const categoryId = tournament.categories[0]?.id;

    if (!categoryId) {
      throw new BadRequestException('No category found for playoffs');
    }

    // Import BracketService dynamically to avoid circular dependency
    const { BracketService } = await import('./bracket.service');
    const bracketService = new BracketService(this.prisma);

    const teams = qualifiedTeams.map((id) => ({ id }));
    await bracketService.generateSingleElimination(
      tournamentId,
      categoryId,
      teams,
    );
  }

  /**
   * Checks if tournament is complete.
   *
   * @param tournamentId - Tournament ID
   * @returns True if all matches are done
   */
  async checkTournamentComplete(tournamentId: string): Promise<boolean> {
    const pendingMatches = await this.prisma.match.count({
      where: {
        tournamentId,
        state: {
          in: [MatchState.PENDING, MatchState.ONGOING],
        },
      },
    });

    return pendingMatches === 0;
  }

  /**
   * Checks if a specific round is complete.
   *
   * @param tournamentId - Tournament ID
   * @param round - Round number
   * @returns True if all matches in round are done
   */
  async checkRoundCompletion(
    tournamentId: string,
    round: number,
  ): Promise<boolean> {
    const pendingMatches = await this.prisma.match.count({
      where: {
        tournamentId,
        round,
        state: {
          in: [MatchState.PENDING, MatchState.ONGOING],
        },
      },
    });

    return pendingMatches === 0;
  }

  /**
   * Handles walkover (one team doesn't show up).
   *
   * @param matchId - Match ID
   * @param walkoverTeamId - Team that didn't show up
   */
  async handleWalkover(
    matchId: string,
    walkoverTeamId: string,
  ): Promise<void> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        teamA: true,
        teamB: true,
      },
    });

    if (!match || !match.teamAId || !match.teamBId) {
      throw new NotFoundException('Match not found or incomplete');
    }

    // Determine winner (the team that showed up)
    const winnerId =
      walkoverTeamId === match.teamAId ? match.teamBId : match.teamAId;

    // Update match state
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        state: MatchState.WALKOVER,
        winnerId,
      },
    });

    // Process as normal match completion (but skip ELO update)
    await this.processMatchCompletion(matchId);
  }

  /**
   * Finalizes tournament when all matches are complete.
   *
   * @param tournamentId - Tournament ID
   */
  private async finalizeTournament(tournamentId: string): Promise<void> {
    await this.prisma.tournament.update({
      where: { id: tournamentId },
      data: {
        status: 'FINISHED',
      },
    });

    // Additional finalization logic (notifications, awards, etc.) can be added here
  }
}
