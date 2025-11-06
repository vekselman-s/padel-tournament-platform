'use client';

import { use } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTournament } from '@/lib/queries/tournaments';
import { formatDate, formatCurrency, getStatusColor } from '@/lib/utils';
import { TOURNAMENT_STATUS, TOURNAMENT_FORMAT, ROUTES } from '@/lib/constants';
import { Calendar, MapPin, Users, Trophy, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: tournament, isLoading } = useTournament(id);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <Skeleton className="h-64 w-full" />
            <div className="mt-8 space-y-4">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Torneo no encontrado</h2>
            <p className="mt-2 text-gray-600">
              El torneo que buscas no existe o ha sido eliminado
            </p>
            <Link href={ROUTES.TOURNAMENTS}>
              <Button className="mt-4">Ver todos los torneos</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const statusText = TOURNAMENT_STATUS[tournament.status];
  const formatText = TOURNAMENT_FORMAT[tournament.format];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Cover Image */}
        {tournament.coverUrl && (
          <div className="h-64 w-full overflow-hidden bg-gray-200">
            <img
              src={tournament.coverUrl}
              alt={tournament.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Badge className={getStatusColor(tournament.status)}>
                    {statusText}
                  </Badge>
                  <Badge variant="outline">{formatText}</Badge>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {tournament.name}
                </h1>
                {tournament.description && (
                  <p className="mt-2 text-gray-600">{tournament.description}</p>
                )}
              </div>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Compartir
              </Button>
            </div>

            {/* Quick Info */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <Calendar className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Fecha</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(tournament.startAt, 'PPP')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <MapPin className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="font-medium text-gray-900">{tournament.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4">
                <Users className="h-5 w-5 text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Equipos</p>
                  <p className="font-medium text-gray-900">
                    {tournament._count?.teams || 0}
                    {tournament.maxTeams && ` / ${tournament.maxTeams}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Categorías</CardTitle>
                </CardHeader>
                <CardContent>
                  {tournament.categories && tournament.categories.length > 0 ? (
                    <div className="space-y-4">
                      {tournament.categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                        >
                          <div>
                            <h4 className="font-medium text-gray-900">{category.name}</h4>
                            <p className="text-sm text-gray-600">
                              Nivel {category.level} - {category.gender}
                            </p>
                          </div>
                          <Link href={`${ROUTES.TOURNAMENT(id)}/bracket?category=${category.id}`}>
                            <Button size="sm" variant="outline">
                              Ver Bracket
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No hay categorías disponibles
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Organizador</p>
                    <p className="font-medium text-gray-900">
                      {tournament.organizer?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Club</p>
                    <p className="font-medium text-gray-900">{tournament.club?.name}</p>
                  </div>
                  {tournament.entryFeeCents > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Costo de inscripción</p>
                      <p className="text-lg font-semibold text-primary-600">
                        {formatCurrency(tournament.entryFeeCents, tournament.currency)}
                      </p>
                    </div>
                  )}
                  <Button className="w-full" size="lg">
                    Inscribir Equipo
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
