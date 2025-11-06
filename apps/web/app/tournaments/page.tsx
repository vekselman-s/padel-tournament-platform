'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TournamentCard } from '@/components/tournaments/tournament-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTournaments } from '@/lib/queries/tournaments';
import { Search, Filter } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';

export default function TournamentsPage() {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    page: 1,
  });

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useTournaments({
    search: debouncedSearch || undefined,
    status: filters.status as any,
    page: filters.page,
    limit: 12,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Torneos</h1>
            <p className="mt-2 text-gray-600">
              Encuentra y participa en torneos de pádel
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar torneos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Tournament Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-video w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="text-lg text-gray-500">No se encontraron torneos</p>
              <p className="mt-2 text-sm text-gray-400">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data?.data.map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>

              {/* Pagination */}
              {data && data.meta.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={filters.page === 1}
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    Página {data.meta.page} de {data.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={filters.page === data.meta.totalPages}
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
