'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import { ROUTES, SITE_NAME } from '@/lib/constants';
import { Trophy, Menu, User, LogOut } from 'lucide-react';
import { useLogout } from '@/lib/queries/auth';

export function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">{SITE_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href={ROUTES.TOURNAMENTS}
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Torneos
            </Link>
            <Link
              href={ROUTES.CLUBS}
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              Clubes
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href={ROUTES.DASHBOARD}
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Mi Dashboard
                </Link>
                {user?.role === 'ORGANIZER' && (
                  <Link
                    href={ROUTES.ORGANIZER}
                    className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Organizar
                  </Link>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 hidden sm:inline">
                {user?.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout.mutate()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          ) : (
            <>
              <Link href={ROUTES.AUTH_LOGIN}>
                <Button variant="ghost" size="sm">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href={ROUTES.AUTH_REGISTER}>
                <Button size="sm">Registrarse</Button>
              </Link>
            </>
          )}

          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </nav>
    </header>
  );
}
