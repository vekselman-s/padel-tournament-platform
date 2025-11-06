import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Tournament } from '@/lib/api/tournaments';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { ROUTES, TOURNAMENT_STATUS, TOURNAMENT_FORMAT } from '@/lib/constants';
import { Calendar, MapPin, Users } from 'lucide-react';

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const statusText = TOURNAMENT_STATUS[tournament.status];
  const formatText = TOURNAMENT_FORMAT[tournament.format];

  return (
    <Link href={ROUTES.TOURNAMENT(tournament.id)}>
      <Card className="card-hover overflow-hidden">
        {tournament.coverUrl && (
          <div className="aspect-video w-full overflow-hidden bg-gray-100">
            <img
              src={tournament.coverUrl}
              alt={tournament.name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}

        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {tournament.name}
            </h3>
            <Badge variant="secondary" className={getStatusColor(tournament.status)}>
              {statusText}
            </Badge>
          </div>

          {tournament.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {tournament.description}
            </p>
          )}

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(tournament.startAt, 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{tournament.location}</span>
            </div>
            {tournament._count && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{tournament._count.teams} equipos</span>
              </div>
            )}
          </div>

          {tournament.club && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">{tournament.club.name}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatText}</span>
          {tournament.entryFeeCents > 0 && (
            <span className="text-sm font-semibold text-primary-600">
              {formatCurrency(tournament.entryFeeCents, tournament.currency)}
            </span>
          )}
          {tournament.entryFeeCents === 0 && (
            <Badge variant="success" className="text-xs">
              Gratis
            </Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
